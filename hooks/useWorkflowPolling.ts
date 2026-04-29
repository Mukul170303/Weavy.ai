import { useEffect, useRef } from "react";
import { useWorkflowStore } from "@/store/workflow-store";
import { getWorkflowHistoryAction } from "@/app/actions/historyActions";

/**
 * Global hook to poll for workflow run results and sync them to the canvas nodes.
 * - Only polls when workflowId is a real numeric DB id (not a demo slug)
 * - Stops automatically when no nodes are in 'loading' state
 * - Uses stable refs so the effect NEVER re-runs due to state changes
 * - Hard stops after MAX_POLLS to prevent infinite loops on stuck runs
 */
export function useWorkflowPolling() {
    const workflowId = useWorkflowStore((s) => s.workflowId);
    const nodes = useWorkflowStore((s) => s.nodes);
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

    // Stable refs — prevent effect dependency churn
    const nodesRef = useRef(nodes);
    const updateNodeDataRef = useRef(updateNodeData);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollCountRef = useRef(0);

    // Keep refs in sync on every render (no effect re-runs needed)
    nodesRef.current = nodes;
    updateNodeDataRef.current = updateNodeData;

    useEffect(() => {
        // Only poll if we have a real numeric DB workflow ID
        // Demo slugs like "demo-product-listing" are NOT valid IDs for direct polling
        if (!workflowId || isNaN(parseInt(workflowId))) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Reset counter whenever workflowId changes (new run started)
        pollCountRef.current = 0;

        const MAX_POLLS = 24; // 24 × 5 s = 2-minute maximum polling window

        const fetchUpdates = async () => {
            const currentNodes = nodesRef.current;
            const loadingNodes = currentNodes.filter(node => node.data.status === 'loading');
            const needsPolling = loadingNodes.length > 0;

            // Auto-stop when nothing is loading
            if (!needsPolling) {
                if (intervalRef.current) {
                    console.log("[Polling] Stopping — no nodes in loading state.");
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                pollCountRef.current = 0;
                return;
            }

            // Hard stop after MAX_POLLS to prevent infinite polling on stuck runs
            pollCountRef.current += 1;
            if (pollCountRef.current > MAX_POLLS) {
                console.warn(`[Polling] Max polls (${MAX_POLLS}) reached — forcing stuck nodes to idle.`);
                clearInterval(intervalRef.current!);
                intervalRef.current = null;
                pollCountRef.current = 0;
                // Force any still-loading nodes to an error/idle state
                loadingNodes.forEach((node) => {
                    updateNodeDataRef.current(node.id, {
                        status: "idle",
                        errorMessage: "Execution timed out. Please try running again.",
                    });
                });
                return;
            }

            try {
                const res = await getWorkflowHistoryAction(workflowId);

                if (res.success && res.runs && res.runs.length > 0) {
                    const latestRun = res.runs[0];
                    if (!latestRun.nodes || latestRun.nodes.length === 0) return;

                    latestRun.nodes.forEach((execNode: any) => {
                        const node = currentNodes.find(n => n.id === execNode.nodeId);
                        if (!node) return;

                        if (execNode.status === "SUCCESS" && node.data.status === "loading") {
                            const parsedOutput = execNode.output || {};
                            const resultUrl = parsedOutput.url || parsedOutput.imageUrls?.[0] || parsedOutput.videoUrl;
                            const resultContent = parsedOutput.text
                                || (typeof parsedOutput === 'string' ? parsedOutput : JSON.stringify(parsedOutput));

                            updateNodeDataRef.current(execNode.nodeId, {
                                status: "success",
                                output: resultContent,
                                outputUrl: resultUrl,
                                outputs: [{
                                    id: execNode.id,
                                    type: "text",
                                    content: resultContent,
                                    timestamp: Date.now()
                                }]
                            });
                        } else if (execNode.status === "FAILED" && node.data.status === "loading") {
                            updateNodeDataRef.current(execNode.nodeId, {
                                status: "idle",
                                errorMessage: execNode.error
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("[Polling] Error:", error);
            }
        };

        // Start interval only once per workflowId change
        if (!intervalRef.current) {
            intervalRef.current = setInterval(fetchUpdates, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            pollCountRef.current = 0;
        };
    }, [workflowId]); // ONLY workflowId — never updateNodeData/nodes
}
