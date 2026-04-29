"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getWorkflowHistoryAction(workflowId: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        let numericId = parseInt(workflowId);

        // If not numeric, resolve via demo slug map or name search
        if (isNaN(numericId)) {
            // Strict mapping for known demo slugs — prevents wrong-workflow matches
            const DEMO_MAP: Record<string, string> = {
                "demo-product-listing": "Product Listing Generator",
                "demo-marketing-kit": "Product Marketing Kit",
            };

            const targetName = DEMO_MAP[workflowId] || workflowId.replace(/-/g, " ");

            const dbWorkflow = await prisma.workflow.findFirst({
                where: { name: { equals: targetName, mode: 'insensitive' } }
            });

            console.log(`[History] Slug ${workflowId} -> "${targetName}" -> DB id: ${dbWorkflow?.id}`);
            if (!dbWorkflow) return { success: true, runs: [] };
            numericId = dbWorkflow.id;
        }

        // Fetch runs with detailed node executions
        const runs = await prisma.workflowRun.findMany({
            where: {
                workflowId: numericId,
            },
            include: {
                nodeExecutions: {
                    orderBy: { startedAt: "asc" },
                },
            },
            orderBy: { startedAt: "desc" },
            take: 20,
        });

        console.log(`[History] Found ${runs.length} runs for Workflow ${numericId}`);

        // Format for Frontend
        const formattedRuns = runs.map((run) => ({
            id: run.id,
            status: run.status,
            triggerType: run.triggerType,
            startedAt: run.startedAt.toISOString(),
            finishedAt: run.finishedAt?.toISOString() || null,
            duration: run.finishedAt
                ? Math.round((run.finishedAt.getTime() - run.startedAt.getTime()) / 1000) + "s"
                : "...",
            nodes: run.nodeExecutions.map((node) => {
                let parsedOutput = null;
                try {
                    parsedOutput = node.outputData ? JSON.parse(node.outputData) : null;
                } catch (e) {
                    parsedOutput = node.outputData;
                }

                return {
                    id: node.id,
                    nodeId: node.nodeId,
                    type: node.nodeType,
                    status: node.status,
                    input: node.inputData,
                    output: parsedOutput, // Send as object if possible
                    error: node.error,
                    duration: node.finishedAt
                        ? ((node.finishedAt.getTime() - node.startedAt.getTime()) / 1000).toFixed(2) + "s"
                        : null
                };
            }),
        }));

        return { success: true, runs: formattedRuns };

    } catch (error) {
        console.error("Fetch History Error:", error);
        return { success: false, error: "Failed to fetch history" };
    }
}