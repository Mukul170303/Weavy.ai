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

// --- Algorithm: Layered Topological Sort ---
function getLayeredExecutionPlan(nodes: NodeData[], edges: EdgeData[]): NodeData[][] {
    const levels = new Map<string, number>();
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    // Init
    nodes.forEach((n) => {
        levels.set(n.id, 0);
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

    // Topological Sort with Level Calculation
    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const topoOrder: string[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        topoOrder.push(u);

        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Level is max(level of all parents) + 1
            levels.set(v, Math.max(levels.get(v) || 0, (levels.get(u) || 0) + 1));
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v) === 0) queue.push(v);
        }
    }

    if (topoOrder.length < nodes.length) {
        throw new Error("Cycle detected or invalid graph.");
    }

    // Group by level
    const layeredPlan: NodeData[][] = [];
    levels.forEach((level, nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            if (!layeredPlan[level]) layeredPlan[level] = [];
            layeredPlan[level].push(node);
        }
    });

    return layeredPlan.filter(Boolean);
}

export const orchestrator = task({
    id: "workflow-orchestrator",
    run: async (payload: { runId: string }): Promise<{ success: boolean }> => {
        console.log(`[Orchestrator] 🚀 Starting workflow run for ID: ${payload.runId}`);

        // 🚀 DB HEALTH CHECK
        try {
            await prisma.$connect();
            const count = await prisma.workflow.count();
            console.log(`[Orchestrator] ✅ Database connected. Workflow count: ${count}`);
        } catch (err) {
            console.error(`[Orchestrator] ❌ DATABASE CONNECTION FAILED:`, err);
            throw new Error("Worker could not connect to database. Check DATABASE_URL.");
        }

        // --- 1. Fetch the Run Record (Resilient Connection) ---
        let run = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                run = await prisma.workflowRun.findUnique({
                    where: { id: payload.runId },
                    include: { workflow: true },
                });
                break; // Success
            } catch (err) {
                attempts++;
                console.error(`📡 [Orchestrator] DB Connection Attempt ${attempts} failed.`, err);
                if (attempts >= maxAttempts) throw err;
                await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
            }
        }

        if (!run) throw new Error(`Workflow run not found: ${payload.runId}`);

        const graph = run.workflow.data as { nodes?: NodeData[]; edges?: EdgeData[] };
        const nodes = graph.nodes || [];
        const edges = graph.edges || [];

        let layeredPlan: NodeData[][];
        try {
            layeredPlan = getLayeredExecutionPlan(nodes, edges);

            // 🚀 NEW: SELECTIVE EXECUTION FILTERING
            if ((run.executionScope === "SELECTED" || run.executionScope === "SINGLE") && run.selectedNodeIds) {
                const targetIds = JSON.parse(run.selectedNodeIds) as string[];
                console.log(`[Orchestrator] Filtering for ${targetIds.length} target nodes: ${targetIds.join(', ')}`);

                // Filter each layer to only include nodes targeted by the user
                layeredPlan = layeredPlan
                    .map((layer) => layer.filter((node) => targetIds.includes(node.id)))
                    .filter((layer) => layer.length > 0);
            }
        } catch (err) {
            await prisma.workflowRun.update({
                where: { id: run.id },
                data: { status: "FAILED", finishedAt: new Date() }
            });
            throw err;
        }

        const context: ExecutionContext = {};

        // 🚀 NEW: CONTEXT SEEDING (Seed context from previous successful executions if this is a selective run)
        if (run.executionScope !== "FULL") {
            const previousExecutions = await prisma.nodeExecution.findMany({
                where: {
                    run: { workflowId: run.workflowId },
                    status: "SUCCESS"
                },
                orderBy: { finishedAt: "desc" }
            });

            // Only keep the LATEST result for each nodeId
            const uniqueResults = new Map<string, any>();
            for (const exec of previousExecutions) {
                if (!uniqueResults.has(exec.nodeId) && exec.outputData) {
                    uniqueResults.set(exec.nodeId, JSON.parse(exec.outputData));
                }
            }

            uniqueResults.forEach((val, id) => {
                context[id] = val;
            });
            console.log(`[Orchestrator] Seeded context with ${uniqueResults.size} historical node results.`);
        }

        // 🚀 NEW: ALWAYS SEED PASSIVE INPUT NODES (Text, Image, Video)
        // This ensures selective runs (like 'Run Crop') always have their source data.
        nodes.forEach(node => {
            if (node.type === "textNode") {
                context[node.id] = { text: node.data.text };
            } else if (node.type === "imageNode") {
                const url = node.data.file?.url || node.data.image;
                if (url) context[node.id] = { imageUrls: [url] };
            } else if (node.type === "videoNode") {
                const url = node.data.file?.url || node.data.videoUrl;
                if (url) context[node.id] = { videoUrl: url };
            }
        });
        console.log(`[Orchestrator] Seeded context with ${nodes.filter(n => ["textNode", "imageNode", "videoNode"].includes(n.type)).length} passive input nodes.`);


        // Execute each phase in sequence, but nodes within each phase in parallel
        for (const phaseNodes of layeredPlan) {
            await Promise.all(phaseNodes.map(async (node) => {
                let nodeResults: any = {};

                if (node.type === "textNode") {
                    nodeResults = { text: node.data.text };
                } else if (node.type === "imageNode") {
                    const url = node.data.file?.url || node.data.image;
                    if (url) nodeResults = { imageUrls: [url] };
                } else if (node.type === "videoNode") {
                    const url = node.data.file?.url || node.data.videoUrl;
                    if (url) nodeResults = { videoUrl: url };
                } else if (node.type === "llmNode") {
                    nodeResults = await executeLLMNode(node, edges, context, run.id);
                } else if (node.type === "extractFrameNode") {
                    nodeResults = await executeExtractFrameNode(node, edges, context, run.id);
                } else if (node.type === "cropImageNode") {
                    nodeResults = await executeCropImageNode(node, edges, context, run.id);
                }

                context[node.id] = nodeResults;
            }));
        }

        await prisma.workflowRun.update({
            where: { id: run.id },
            data: { status: "COMPLETED", finishedAt: new Date() }
        });

        return { success: true };
    },
});

async function executeLLMNode(node: NodeData, edges: EdgeData[], context: ExecutionContext, runId: string) {
    const incomingEdges = edges.filter((e) => e.target === node.id);
    let aggregatedSystemPrompt = node.data.systemPrompt || "";
    let aggregatedUserPrompt = node.data.prompt || "";
    const aggregatedImages: string[] = [];

    for (const edge of incomingEdges) {
        const sourceData = context[edge.source];
        if (!sourceData) continue;

        if (sourceData.text) {
            if (edge.targetHandle === "system-prompt") {
                aggregatedSystemPrompt = (aggregatedSystemPrompt ? `${aggregatedSystemPrompt}\n\n` : "") + sourceData.text;
            } else if (edge.targetHandle === "prompt") {
                aggregatedUserPrompt = (aggregatedUserPrompt ? `${aggregatedUserPrompt}\n\n` : "") + sourceData.text;
            }
        }
        if (sourceData.imageUrls) aggregatedImages.push(...sourceData.imageUrls);
    }
    console.log(`[Orchestrator] Logic triggered for Node: ${node.id} (${node.type})`);

    if (!process.env.DATABASE_URL) {
        console.error("❌ CRITICAL: DATABASE_URL is missing in Worker environment!");
    }

    let executionRecord;
    try {
        console.log(`[Orchestrator] Creating NodeExecution record for ${node.id}...`);
        executionRecord = await prisma.nodeExecution.create({
            data: {
                runId,
                nodeId: node.id,
                nodeType: node.type,
                nodeLabel: node.data.label || "LLM",
                status: "RUNNING",
                startedAt: new Date(),
                inputData: JSON.stringify({ ...node.data, contextInputs: { system: aggregatedSystemPrompt, user: aggregatedUserPrompt, images: aggregatedImages.length } })
            }
        });
        console.log(`[Orchestrator] ✅ NodeExecution created: ${executionRecord.id}`);
    } catch (dbErr) {
        console.error(`[Orchestrator] ❌ Failed to create NodeExecution record in DB:`, dbErr);
        throw dbErr;
    }

    try {
        console.log(`[Orchestrator] Triggering aiGenerator for node ${node.id}...`);
        const result = await aiGenerator.triggerAndWait({
            prompt: aggregatedUserPrompt || "Analyze this input.",
            systemPrompt: aggregatedSystemPrompt,
            imageUrls: aggregatedImages,
            model: node.data.model || "gemini-2.5-flash",
            temperature: node.data.temperature
        });

        if (result.ok) {
            const finishedAt = new Date();
            const duration = Math.round((finishedAt.getTime() - executionRecord.startedAt.getTime()) / 1000); // seconds

            await prisma.nodeExecution.update({
                where: { id: executionRecord.id },
                data: {
                    status: "SUCCESS",
                    finishedAt,
                    duration,
                    outputData: JSON.stringify(result.output)
                }
            });
            return { text: result.output.text };
        } else {
            throw new Error(`AI Task failed: ${result.error}`);
        }
    } catch (error) {
        await handleNodeFailure(executionRecord.id, error);
        throw error;
    }
}

async function executeExtractFrameNode(node: NodeData, edges: EdgeData[], context: ExecutionContext, runId: string) {
    const videoEdge = edges.find(e => e.target === node.id && e.targetHandle === "video-input");
    if (!videoEdge) return {};

    const sourceData = context[videoEdge.source];
    if (!sourceData?.videoUrl) return {};

    // Dynamic Parameter Resolution: Check if 'timestamp' is connected to an output
    const timestampEdge = edges.find(e => e.target === node.id && e.targetHandle === "timestamp");
    let timestamp = node.data.timestamp || "00:00:01";

    if (timestampEdge) {
        const timestampSource = context[timestampEdge.source];
        const resolvedVal = timestampSource?.text || (typeof timestampSource === 'string' ? timestampSource : undefined);
        if (resolvedVal) {
            timestamp = resolvedVal;
            console.log(`[Orchestrator] Resolved timestamp from node ${timestampEdge.source}: ${timestamp}`);
        }
    }

    const executionRecord = await prisma.nodeExecution.create({
        data: {
            runId,
            nodeId: node.id,
            nodeType: node.type,
            nodeLabel: node.data.label || "Extract Frame",
            status: "RUNNING",
            startedAt: new Date(),
            inputData: JSON.stringify({ ...node.data, videoUrl: sourceData.videoUrl, resolvedTimestamp: timestamp })
        }
    });

    try {
        const result = await extractFrameTask.triggerAndWait({
            sourceUrl: sourceData.videoUrl,
            timestamp,
            nodeId: node.id
        });

        if (result.ok && result.output.success) {
            const normalizedOutput = { 
                ...result.output, 
                imageUrls: [result.output.url],
                // Ensure outputUrl is also present for UI consistency
                outputUrl: result.output.url 
            };
            
            await prisma.nodeExecution.update({
                where: { id: executionRecord.id },
                data: {
                    status: "SUCCESS",
                    finishedAt: new Date(),
                    outputData: JSON.stringify(normalizedOutput)
                }
            });
            return normalizedOutput;
        } else {
            throw new Error("Extract Frame failed");
        }
    } catch (error) {
        await handleNodeFailure(executionRecord.id, error);
        throw error;
    }
}

async function executeCropImageNode(node: NodeData, edges: EdgeData[], context: ExecutionContext, runId: string) {
    const imageEdge = edges.find(e => e.target === node.id && e.targetHandle === "image-input");
    if (!imageEdge) return {};

    const sourceData = context[imageEdge.source];
    // Resilient input resolution: check both normalized and raw task outputs
    const sourceUrl = sourceData?.imageUrls?.[0] || sourceData?.url || sourceData?.image;
    if (!sourceUrl) return {};

    // Dynamic Parameter Resolution for Crop
    const paramHandles = ["x", "y", "width", "height"] as const;
    const resolvedParams: any = {
        x: node.data.x ?? 0,
        y: node.data.y ?? 0,
        width: node.data.width ?? 100,
        height: node.data.height ?? 100
    };

    for (const handle of paramHandles) {
        const edge = edges.find(e => e.target === node.id && e.targetHandle === handle);
        if (edge) {
            const paramSource = context[edge.source];
            const rawVal = paramSource?.text || (typeof paramSource === 'string' ? paramSource : undefined);
            if (rawVal) {
                const val = parseFloat(rawVal);
                if (!isNaN(val)) {
                    resolvedParams[handle] = val;
                    console.log(`[Orchestrator] Resolved ${handle} from node ${edge.source}: ${val}`);
                }
            }
        }
    }

    const executionRecord = await prisma.nodeExecution.create({
        data: {
            runId,
            nodeId: node.id,
            nodeType: node.type,
            nodeLabel: node.data.label || "Crop Image",
            status: "RUNNING",
            startedAt: new Date(),
            inputData: JSON.stringify({ ...node.data, imageUrl: sourceUrl, resolvedParams })
        }
    });

    try {
        const result = await cropImageTask.triggerAndWait({
            sourceUrl: sourceUrl,
            ...resolvedParams,
            nodeId: node.id
        });

        if (result.ok && result.output.success) {
            const normalizedOutput = { 
                ...result.output, 
                imageUrls: [result.output.url],
                outputUrl: result.output.url 
            };

            await prisma.nodeExecution.update({
                where: { id: executionRecord.id },
                data: {
                    status: "SUCCESS",
                    finishedAt: new Date(),
                    outputData: JSON.stringify(normalizedOutput)
                }
            });
            return normalizedOutput;
        } else {
            throw new Error("Crop Image failed");
        }
    } catch (error) {
        await handleNodeFailure(executionRecord.id, error);
        throw error;
    }
}

async function handleNodeFailure(executionRecordId: string, error: unknown) {
    await prisma.nodeExecution.update({
        where: { id: executionRecordId },
        data: {
            status: "FAILED",
            finishedAt: new Date(),
            error: String(error)
        }
    });
}
