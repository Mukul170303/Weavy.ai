import { task } from "@trigger.dev/sdk/v3";
import { aiGenerator, cropImageTask, extractFrameTask } from "./workflow-nodes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- Types ---
interface NodeData {
    id: string;
    type: string;
    data: Record<string, any>;
}

interface EdgeData {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

// Memory to store outputs of previous nodes
interface ExecutionContext {
    [nodeId: string]: {
        text?: string;
        imageUrls?: string[];
        videoUrl?: string;
    };
}

// --- Algorithm: Topological Sort ---
function getTopologicalOrder(nodes: NodeData[], edges: EdgeData[]): NodeData[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    // Init
    nodes.forEach((n) => {
        inDegree.set(n.id, 0);
        adj.set(n.id, []);
    });

    // Build Graph
    edges.forEach((edge) => {
        if (adj.has(edge.source) && adj.has(edge.target)) {
            adj.get(edge.source)!.push(edge.target);
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        }
    });

    // Find Start Nodes (Degree 0)
    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const sorted: NodeData[] = [];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const node = nodes.find((n) => n.id === currentId);
        if (node) sorted.push(node);

        const neighbors = adj.get(currentId) || [];
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
            if (inDegree.get(neighbor) === 0) {
                queue.push(neighbor);
            }
        }
    }

    return sorted;
}

export const orchestrator = task({
    id: "workflow-orchestrator",
    run: async (payload: { runId: string }): Promise<{ success: boolean }> => {
        // 1. Load Workflow
        const run = await prisma.workflowRun.findUnique({
            where: { id: payload.runId },
            include: { workflow: true },
        });
        if (!run) throw new Error("Run not found");

        const graph = run.workflow.data as { nodes?: NodeData[]; edges?: EdgeData[] };
        const nodes: NodeData[] = graph.nodes || [];
        const edges: EdgeData[] = graph.edges || [];

        // 2. Sort Execution Order
        const executionPlan = getTopologicalOrder(nodes, edges);

        if (executionPlan.length < nodes.length) {
            const errorMsg = "Cycle detected in workflow or invalid graph structure.";
            await prisma.workflowRun.update({
                where: { id: run.id },
                data: { status: "FAILED", finishedAt: new Date() }
            });
            throw new Error(errorMsg);
        }

        console.log(`🚀 [Orchestrator] Starting Run: ${run.id}`);

        try {
            // 3. Context (Memory)
            const context: ExecutionContext = {};

            // 4. Execution Loop
            for (const node of executionPlan) {
                console.log(`⚡ [Orchestrator] Processing: ${node.type} (${node.id})`);

                // --- A. PASSIVE NODES (Just Load Data) ---
                if (node.type === "textNode") {
                    context[node.id] = { text: node.data.text };
                    continue;
                }

                if (node.type === "imageNode") {
                    const url = node.data.file?.url || node.data.image;
                    if (url) context[node.id] = { imageUrls: [url] };
                    continue;
                }

                if (node.type === "videoNode") {
                    const url = node.data.file?.url || node.data.videoUrl;
                    if (url) context[node.id] = { videoUrl: url };
                    continue;
                }

                // --- B. ACTIVE NODES (Run Tasks) ---
                
                // Handle AI Node
                if (node.type === "llmNode") {
                    const incomingEdges = edges.filter((e) => e.target === node.id);
                    let aggregatedText = "";
                    const aggregatedImages: string[] = [];

                    for (const edge of incomingEdges) {
                        const sourceData = context[edge.source];
                        if (!sourceData) continue;

                        if (sourceData.text) {
                            if (edge.targetHandle === "system-prompt") {
                                aggregatedText = (aggregatedText ? `${aggregatedText}\n\n` : "") + sourceData.text;
                            } else if (edge.targetHandle === "prompt") {
                                // If multiple prompts are connected, we'll append them
                                if (node.data.prompt) {
                                     // If the node already has a hardcoded prompt, treat incoming as additional context
                                     aggregatedText = (aggregatedText ? `${aggregatedText}\n\n` : "") + `[Additional Context]: ${sourceData.text}`;
                                } else {
                                     // This becomes the primary prompt if not set
                                     node.data.prompt = sourceData.text;
                                }
                            }
                        }
                        if (sourceData.imageUrls) {
                            aggregatedImages.push(...sourceData.imageUrls);
                        }
                    }

                    const executionRecord = await prisma.nodeExecution.create({
                        data: {
                            runId: run.id,
                            nodeId: node.id,
                            nodeType: node.type,
                            nodeLabel: node.data.label || "LLM",
                            status: "RUNNING",
                            startedAt: new Date(),
                            inputData: { ...node.data, contextInputs: aggregatedText }
                        }
                    });

                    try {
                        const result = await aiGenerator.triggerAndWait({
                            prompt: node.data.prompt || "Analyze this input.",
                            systemPrompt: aggregatedText,
                            imageUrls: aggregatedImages,
                            model: node.data.model || "gemini-1.5-flash",
                            temperature: node.data.temperature
                        });

                        if (result.ok) {
                            context[node.id] = { text: result.output.text };
                            await prisma.nodeExecution.update({
                                where: { id: executionRecord.id },
                                data: {
                                    status: "SUCCESS",
                                    finishedAt: new Date(),
                                    outputData: result.output as Record<string, any>
                                }
                            });
                        } else {
                            throw new Error(`AI Task failed: ${result.error}`);
                        }
                    } catch (error) {
                        await handleNodeFailure(executionRecord.id, error);
                        throw error;
                    }
                }

                // Handle Extract Frame
                if (node.type === "extractFrameNode") {
                    const incomingEdges = edges.filter((e) => e.target === node.id);
                    const videoEdge = incomingEdges.find(e => e.targetHandle === "video-input");

                    if (!videoEdge) {
                        console.warn(`[Orchestrator] Missing video input for extractFrameNode ${node.id}`);
                        continue;
                    }

                    const sourceData = context[videoEdge.source];
                    if (!sourceData?.videoUrl) {
                        console.warn(`[Orchestrator] No video URL from source ${videoEdge.source}`);
                        continue;
                    }

                    const executionRecord = await prisma.nodeExecution.create({
                        data: {
                            runId: run.id,
                            nodeId: node.id,
                            nodeType: node.type,
                            nodeLabel: node.data.label || "Extract Frame",
                            status: "RUNNING",
                            startedAt: new Date(),
                            inputData: { ...node.data, videoUrl: sourceData.videoUrl }
                        }
                    });

                    try {
                        const result = await extractFrameTask.triggerAndWait({
                            videoUrl: sourceData.videoUrl,
                            params: { timestamp: node.data.timestamp || "00:00:01" }
                        });

                        if (result.ok && result.output.success) {
                            context[node.id] = { imageUrls: [result.output.url] };
                            await prisma.nodeExecution.update({
                                where: { id: executionRecord.id },
                                data: {
                                    status: "SUCCESS",
                                    finishedAt: new Date(),
                                    outputData: result.output as Record<string, any>
                                }
                            });
                        } else {
                            throw new Error(`Extract Frame failed: ${result.ok ? "Unknown error" : result.error}`);
                        }
                    } catch (error) {
                        await handleNodeFailure(executionRecord.id, error);
                        throw error;
                    }
                }

                // Handle Crop Image
                if (node.type === "cropImageNode") {
                    const incomingEdges = edges.filter((e) => e.target === node.id);
                    const imageEdge = incomingEdges.find(e => e.targetHandle === "image-input");

                    if (!imageEdge) {
                        console.warn(`[Orchestrator] Missing image input for cropImageNode ${node.id}`);
                        continue;
                    }

                    const sourceData = context[imageEdge.source];
                    if (!sourceData?.imageUrls?.[0]) {
                        console.warn(`[Orchestrator] No image URL from source ${imageEdge.source}`);
                        continue;
                    }

                    const executionRecord = await prisma.nodeExecution.create({
                        data: {
                            runId: run.id,
                            nodeId: node.id,
                            nodeType: node.type,
                            nodeLabel: node.data.label || "Crop Image",
                            status: "RUNNING",
                            startedAt: new Date(),
                            inputData: { ...node.data, imageUrl: sourceData.imageUrls[0] }
                        }
                    });

                    try {
                        const result = await cropImageTask.triggerAndWait({
                            imageUrl: sourceData.imageUrls[0],
                            params: {
                                x: node.data.x ?? 0,
                                y: node.data.y ?? 0,
                                width: node.data.width ?? 100,
                                height: node.data.height ?? 100
                            }
                        });

                        if (result.ok && result.output.success) {
                            context[node.id] = { imageUrls: [result.output.url] };
                            await prisma.nodeExecution.update({
                                where: { id: executionRecord.id },
                                data: {
                                    status: "SUCCESS",
                                    finishedAt: new Date(),
                                    outputData: result.output as Record<string, any>
                                }
                            });
                        } else {
                            throw new Error(`Crop Image failed: ${result.ok ? "Unknown error" : result.error}`);
                        }
                    } catch (error) {
                        await handleNodeFailure(executionRecord.id, error);
                        throw error;
                    }
                }
            }

            // 5. Complete Run
            await prisma.workflowRun.update({
                where: { id: run.id },
                data: { status: "COMPLETED", finishedAt: new Date() }
            });

        } catch (error) {
            console.error(`[Orchestrator] Run Failed: ${run.id}`, error);
            await prisma.workflowRun.update({
                where: { id: run.id },
                data: { status: "FAILED", finishedAt: new Date() }
            });
            throw error;
        }

        return { success: true };
    },
});

async function handleNodeFailure(executionRecordId: string, error: unknown) {
    console.error(`❌ Node Execution Failed: ${executionRecordId}`, error);
    await prisma.nodeExecution.update({
        where: { id: executionRecordId },
        data: {
            status: "FAILED",
            finishedAt: new Date(),
            error: String(error)
        }
    });
}
