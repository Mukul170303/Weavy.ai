import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { temporal } from "zundo";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Connection,
    Edge,
    EdgeChange,
    NodeChange,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
} from "@xyflow/react";

import { AppNode } from '@/lib/types';
import { DEMO_WORKFLOWS } from "@/lib/demoWorkflows";

type WorkflowState = {
    userId: string | null;
    nodes: AppNode[];
    edges: Edge[];
    workflowId: string | null;
    workflowName: string;
    isHistoryOpen: boolean;



    // Actions
    setUserId: (userId: string | null) => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    updateNodeData: (id: string, data: Partial<AppNode['data']>) => void;
    resetWorkflow: () => void;
    addNode: (node: AppNode) => void;
    deleteNode: (id: string) => void;
    setWorkflowId: (id: string) => void;
    setWorkflowName: (name: string) => void;
    clearUserData: () => void;
    exportWorkflow: () => void;
    importWorkflow: (json: string) => void;
    loadSample: () => void;
    setHistoryOpen: (open: boolean) => void;
    saveWorkflow: () => Promise<string | null>;
};

// Initial Data - Empty canvas
const initialNodesData: AppNode[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>()(
    temporal(
        persist(
            (set, get) => ({
                userId: null,
                workflowId: null,
                nodes: initialNodesData,
                edges: initialEdges,
                workflowName: "Untitled Workflow",
                isHistoryOpen: false,

                setUserId: (userId: string | null) => {
                    const currentUserId = get().userId;

                    // If switching users, clear the workflow data
                    if (currentUserId !== userId) {
                        set({
                            userId,
                            nodes: initialNodesData,
                            edges: initialEdges,
                            workflowId: null,
                            workflowName: "Untitled Workflow",
                        });
                    } else {
                        set({ userId });
                    }
                },

                onNodesChange: (changes: NodeChange[]) => {
                    set({
                        nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
                    });
                },

                onEdgesChange: (changes: EdgeChange[]) => {
                    set({
                        edges: applyEdgeChanges(changes, get().edges),
                    });
                },

                onConnect: (connection: Connection) => {
                    // Force the new connection to use our custom type
                    const edge = {
                        ...connection,
                        type: 'animatedEdge',
                        animated: true,
                        style: { stroke: '#a855f7', strokeWidth: 3 },
                    };

                    set({
                        edges: addEdge(edge, get().edges),
                    });
                },

                updateNodeData: (id: string, newData: Partial<AppNode['data']>) => {
                    set({
                        nodes: get().nodes.map((node) => {
                            if (node.id === id) {
                                return {
                                    ...node,
                                    data: { ...node.data, ...newData },
                                };
                            }
                            return node;
                        }),
                    });
                },

                resetWorkflow: () => {
                    set({
                        nodes: initialNodesData,
                        edges: initialEdges,
                        workflowId: null,
                        workflowName: "Untitled Workflow",
                    });
                },

                addNode: (node: AppNode) => {
                    set({
                        nodes: [...get().nodes, node],
                    });
                },

                deleteNode: (id: string) => {
                    set((state) => ({
                        // 1. Remove the node
                        nodes: state.nodes.filter((node) => node.id !== id),
                        // 2. Remove any edges connected to this node
                        edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
                    }));
                },
                setWorkflowId: (id: string) => {
                    set({ workflowId: id });
                },
                setWorkflowName: (name: string) => {
                    set({ workflowName: name });
                },

                clearUserData: () => {
                    set({
                        userId: null,
                        nodes: initialNodesData,
                        edges: initialEdges,
                        workflowId: null,
                        workflowName: "Untitled Workflow",
                    });
                },

                exportWorkflow: () => {
                    const { nodes, edges, workflowName } = get();
                    const exportData = {
                        name: workflowName,
                        nodes,
                        edges,
                        exportedAt: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${workflowName.replace(/\s+/g, '_')}_export.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },

                importWorkflow: (json: string) => {
                    try {
                        const data = JSON.parse(json);
                        if (!data.nodes || !data.edges) throw new Error("Invalid workflow format");
                        set({
                            nodes: data.nodes,
                            edges: data.edges,
                            workflowName: data.name || "Imported Workflow",
                            workflowId: null, // New imported workflow doesn't have a DB ID yet
                        });
                    } catch (error) {
                        console.error("Import failed:", error);
                        alert("Failed to import workflow. Please check the JSON file.");
                    }
                },

                loadSample: () => {
                    const { nodes, edges } = DEMO_WORKFLOWS.find(d => d.id === 'demo-marketing-kit')!.getGraph();
                    set({
                        nodes,
                        edges,
                        workflowName: "Product Marketing Kit (Demo)",
                        workflowId: null,
                    });
                },
                setHistoryOpen: (open: boolean) => set({ isHistoryOpen: open }),

                saveWorkflow: async (): Promise<string | null> => {
                    const { nodes, edges, workflowId, workflowName, setWorkflowId } = get();
                    if (nodes.length === 0) {
                        return null;
                    }

                    try {
                        const { saveWorkflowAction } = await import("@/app/actions/workflowActions");
                        const res = await saveWorkflowAction({
                            id: workflowId,
                            name: workflowName,
                            nodes,
                            edges,
                        });

                        if (res.success && res.id) {
                            setWorkflowId(res.id);
                            return res.id;
                        }
                        return null;
                    } catch (error) {
                        console.error("Store Save Error:", error);
                        return null;
                    }
                },
            }),
            {
                name: 'workflow-storage',
                version: 5, // Bumped: strip runtime node state on persist to prevent infinite-loader on reload

                // Persist nodes but strip ALL runtime execution state so nodes never
                // wake up in a 'loading' state after a page refresh.
                partialize: (state) => ({
                    userId: state.userId,
                    nodes: state.nodes.map((node) => ({
                        ...node,
                        data: {
                            ...node.data,
                            // Always reset execution state to idle before saving
                            status: 'idle' as const,
                            output: undefined,
                            outputUrl: undefined,
                            outputs: undefined,
                            errorMessage: undefined,
                        },
                    })),
                    edges: state.edges,
                    workflowId: state.workflowId,
                    workflowName: state.workflowName,
                } as unknown as WorkflowState),

                migrate: (persistedState: unknown, version: number) => {
                    // Any version older than 5: wipe and start fresh to avoid stale loading states
                    if (version < 5) {
                        return {
                            userId: null,
                            nodes: initialNodesData,
                            edges: initialEdges,
                            workflowId: null,
                            workflowName: "Untitled Workflow",
                        } as WorkflowState;
                    }
                    return persistedState as WorkflowState;
                },

                // Fix: getItem must return the FULL serialised object {state, version}
                // so that the migrate() callback and version checks work correctly.
                storage: {
                    getItem: (name: string) => {
                        // Try user-specific key first (written by setItem below)
                        // We don't know the userId here, so fall back to the generic key.
                        const str = localStorage.getItem(name);
                        if (!str) return null;
                        // Return the full object — NOT just .state — so Zustand can
                        // read the version field and run migrate() when needed.
                        return JSON.parse(str);
                    },
                    setItem: (name: string, value: any) => {
                        // Zustand's persist wraps the state in { state: ..., version: ... }
                        const userId = value.state?.userId;
                        // Store with user-specific key if user is logged in
                        const key = userId ? `${name}-${userId}` : name;
                        localStorage.setItem(key, JSON.stringify(value));
                    },
                    removeItem: (name: string) => {
                        // Remove both generic and user-specific keys
                        localStorage.removeItem(name);
                        const keys = Object.keys(localStorage);
                        keys.forEach(key => {
                            if (key.startsWith(name)) {
                                localStorage.removeItem(key);
                            }
                        });
                    },
                },
            }
        ),
        {
            limit: 100,
            partialize: (state) => {
                const { nodes, edges, workflowId } = state;
                return { nodes, edges, workflowId };
            },
            // Equality: THIS is where we exclude position from TRIGGERING a save.
            // If the only difference between 'past' and 'current' is position/selection, we say "They are Equal" -> No Save.
            equality: (pastState, currentState) => {
                // Helper to strip out volatile properties (position, selection, dimensions)
                const stripVolatile = (state: Partial<WorkflowState>) => {
                    if (!state.nodes || !state.edges) return {};
                    return {
                        edges: state.edges, // Edges rarely change randomly, so we keep them full
                        nodes: state.nodes.map((node) => {
                            // Destructure out the fields we want to IGNORE during comparison
                            const { position: _p, measured: _m, selected: _s, dragging: _d, ...stableData } = node;
                            return stableData;
                        }),
                    };
                };

                // Compare the "Cleaned" versions
                return JSON.stringify(stripVolatile(pastState)) === JSON.stringify(stripVolatile(currentState));
            },
        }
    )
);
