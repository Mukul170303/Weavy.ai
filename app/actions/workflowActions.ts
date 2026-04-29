"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk/v3";
import type { SaveWorkflowParams } from "@/lib/types";

// Helper to ensure User exists in our DB before acting
async function ensureUserExists(userId: string) {
    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!dbUser) {
        console.log(`[Action] User ${userId} not in DB. Mirroring from Clerk...`);
        const clerkUser = await currentUser();
        if (!clerkUser) {
            console.error(`[Action] Clerk user not found for ID: ${userId}`);
            throw new Error("User not found in Clerk");
        }

        try {
            await prisma.user.create({
                data: {
                    id: userId,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                },
            });
            console.log(`[Action] User ${userId} mirrored successfully.`);
        } catch (err) {
            console.error(`[Action] Failed to create user in DB:`, err);
            throw err;
        }
    }
}

// ------------------------------------------------------------------
// SAVE ACTION
// ------------------------------------------------------------------
export async function saveWorkflowAction({ id, name, nodes, edges }: SaveWorkflowParams) {
    try {
        const { userId } = await auth();
        console.log(`[Action] Save Workflow: userId = ${userId}`);
        if (!userId) return { success: false, error: "Unauthorized" };

        await ensureUserExists(userId);

        // Prepare JSON data
        // We cast to 'any' because Prisma's InputJsonValue is stricter than 
        // our complex Node types, even though they are valid JSON at runtime.
        const workflowData = { nodes, edges };

        const numericId = typeof id === "string" ? parseInt(id) : id;
        
        if (numericId && !isNaN(numericId as number)) {
            // UPDATE Existing
            console.log(`Updating Workflow ID: ${numericId}`);

            const workflow = await prisma.workflow.update({
                where: {
                    id: numericId,
                    userId: userId,
                },
                data: {
                    name,
                    data: JSON.stringify(workflowData),
                },
            });

            revalidatePath("/workflows");
            return { success: true, id: workflow.id.toString() };
        } else {
            // CREATE New
            console.log(`Creating New Workflow for: ${userId}`);

            const workflow = await prisma.workflow.create({
                data: {
                    name,
                    data: JSON.stringify(workflowData),
                    userId,
                },
            });

            revalidatePath("/workflows");
            return { success: true, id: workflow.id.toString() };
        }
    } catch (error) {
        console.error("Database Error [saveWorkflowAction]:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save workflow.";
        return { success: false, error: errorMessage };
    }
}

// ------------------------------------------------------------------
// LOAD ACTION
// ------------------------------------------------------------------
export async function loadWorkflowAction(id: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const workflow = await prisma.workflow.findUnique({
            where: {
                id: parseInt(id),
                userId: userId,
            },
        });

        if (!workflow) return { success: false, error: "Workflow not found" };

        // Define a type for workflow data if not already defined
        type WorkflowData = {
            nodes: unknown[];
            edges: unknown[];
        };

        return {
            success: true,
            data: JSON.parse(workflow.data) as WorkflowData,
            name: workflow.name,
        };
    } catch (error) {
        console.error("Load Error:", error);
        return { success: false, error: "Failed to load workflow." };
    }
}

// ------------------------------------------------------------------
// GET ALL ACTION
// ------------------------------------------------------------------
export async function getAllWorkflowsAction() {
    try {
        const { userId } = await auth();
        console.log(`[Action] Fetch Workflows: userId = ${userId}`);
        if (!userId) return { success: false, error: "Unauthorized", workflows: [] };

        const workflows = await prisma.workflow.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                updatedAt: true,
                createdAt: true,
            },
        });

        interface WorkflowSummary {
            id: string;
            name: string;
            created_at: string;
            updated_at: string;
        }

        interface PrismaWorkflow {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        }

        const formattedWorkflows: WorkflowSummary[] = (workflows as PrismaWorkflow[]).map((wf: PrismaWorkflow) => ({
            id: wf.id.toString(),
            name: wf.name,
            created_at: wf.createdAt.toISOString(),
            updated_at: wf.updatedAt.toISOString(),
        }));

        return { success: true, workflows: formattedWorkflows };
    } catch (error) {
        console.error("Fetch Workflows Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch workflows.";
        return { success: false, error: errorMessage, workflows: [] };
    }
}

// ------------------------------------------------------------------
// DELETE ACTION
// ------------------------------------------------------------------
export async function deleteWorkflowAction(id: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await prisma.workflow.delete({
            where: {
                id: parseInt(id),
                userId: userId,
            },
        });

        revalidatePath("/workflows");
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, error: "Failed to delete workflow." };
    }
}

// ------------------------------------------------------------------
// RUN ACTION (Trigger.dev)
// ------------------------------------------------------------------
export async function runWorkflowAction(workflowId: string) {
    console.log(`[Action] Attempting to run workflow: "${workflowId}"`);

    try {
        const { userId } = await auth();
        if (!userId) {
            console.error("[Action] User not found");
            return { success: false, error: "Unauthorized" };
        }

        // 1. Validate ID
        const numericId = parseInt(workflowId);
        if (isNaN(numericId)) {
            console.error(`[Action] Invalid Workflow ID: ${workflowId}`);
            return { success: false, error: "Invalid Workflow ID. Please save the file first." };
        }

        // 2. Create the PENDING record
        console.log(`[Action] Creating DB Record for ID: ${numericId}...`);

        const run = await prisma.workflowRun.create({
            data: {
                workflowId: numericId,
                status: "PENDING",
                triggerType: "MANUAL",
                executionScope: "FULL",
            },
        });

        console.log(`[Action] Run Created! Run ID: ${run.id}`);

        // 3. Trigger the Task
        console.log(`[Action] Triggering Orchestrator...`);
        await tasks.trigger("workflow-orchestrator", {
            runId: run.id,
        });

        return { success: true, runId: run.id };

    } catch (error) {
        console.error("[Action] CRITICAL FAILURE:", error);
        return { success: false, error: "Failed to run workflow. Check server logs." };
    }
}

// ------------------------------------------------------------------
// RUN SELECTED NODES ACTION
// ------------------------------------------------------------------
export async function runSelectedNodesAction(workflowId: string, nodeIds: string[]) {
    console.log(`[Action] Running selected nodes (${nodeIds.length}) for workflow: "${workflowId}"`);

    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const numericId = parseInt(workflowId);
        if (isNaN(numericId)) return { success: false, error: "Invalid Workflow ID" };

        // 1. Create the PENDING record with SELECTED scope
        const run = await prisma.workflowRun.create({
            data: {
                workflowId: numericId,
                status: "PENDING",
                triggerType: "MANUAL",
                executionScope: "SELECTED",
                selectedNodeIds: JSON.stringify(nodeIds),
            },
        });

        // 2. Trigger the Orchestrator
        await tasks.trigger("workflow-orchestrator", {
            runId: run.id,
        });

        return { success: true, runId: run.id };
    } catch (error) {
        console.error("[Action] Run Selected Failure:", error);
        return { success: false, error: "Failed to start selective run." };
    }
}
