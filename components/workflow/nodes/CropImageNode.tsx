"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Crop, Play, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CropImageNodeType, ImageNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/store/workflow-store";
import { runSelectedNodesAction } from "@/app/actions/workflowActions";

export default function CropImageNode({ id, data, isConnectable, selected }: NodeProps<CropImageNodeType>) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
    const deleteNode = useWorkflowStore((state) => state.deleteNode);
    const { getNodes, getEdges } = useReactFlow();

    // Check for connections on parameter handles
    const edges = getEdges();
    const isXConnected = edges.some(e => e.target === id && e.targetHandle === "x");
    const isYConnected = edges.some(e => e.target === id && e.targetHandle === "y");
    const isWidthConnected = edges.some(e => e.target === id && e.targetHandle === "width");
    const isHeightConnected = edges.some(e => e.target === id && e.targetHandle === "height");
    const isImageConnected = edges.some(e => e.target === id && e.targetHandle === "image-input");

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Initial state setup based on defaults
    const x = data.x ?? 0;
    const y = data.y ?? 0;
    const width = data.width ?? 100;
    const height = data.height ?? 100;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (field: 'x' | 'y' | 'width' | 'height', value: number) => {
        updateNodeData(id, { [field]: value });
    };

    const handleRun = useCallback(async () => {
        try {
            updateNodeData(id, { status: "loading", errorMessage: undefined });

            let workflowIdInStore = useWorkflowStore.getState().workflowId;
            if (!workflowIdInStore || isNaN(parseInt(String(workflowIdInStore)))) {
                console.log("[Node] No valid ID found, auto-saving...");
                const savedId = await useWorkflowStore.getState().saveWorkflow();
                if (!savedId) {
                    throw new Error("Failed to auto-save workflow. Please save manually.");
                }
                workflowIdInStore = savedId;
            }

            const result = await runSelectedNodesAction(String(workflowIdInStore), [id]);

            if (!result.success) {
                throw new Error(result.error || "Failed to start processing");
            }

            console.log(`[CropImageNode] Task triggered via orchestrator: ${result.runId}`);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to crop image";
            updateNodeData(id, { status: "error", errorMessage });
        }
    }, [id, updateNodeData]);

    return (
        <div
            className={cn(
                "rounded-xl border bg-[#1a1a1a] min-w-[280px] shadow-xl transition-all duration-200",
                selected ? "border-[#dfff4f] ring-1 ring-[#dfff4f]/50" : "border-white/10 hover:border-white/30",
                data.status === "error" && "border-red-500 ring-1 ring-red-500/50"
            )}>
            {/* Glow effect */}
            {data.status === "loading" && (
                <div className="absolute -inset-[1px] rounded-xl border-2 border-[#dfff4f] shadow-[0_0_30px_rgba(223,255,79,0.3)] animate-pulse pointer-events-none z-50" />
            )}

            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-[#111] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Crop size={14} className="text-white/50" />
                    <span className="text-xs font-semibold text-white/70">{data.label || "Crop Image"}</span>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className={cn("p-1 rounded transition-colors", showMenu ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/50")}>
                        <MoreHorizontal size={14} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-6 w-32 bg-[#222] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNode(id);
                                }}
                                className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors font-medium">
                                <Trash2 size={10} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'X (%)', field: 'x', value: x, connected: isXConnected },
                        { label: 'Y (%)', field: 'y', value: y, connected: isYConnected },
                        { label: 'Width (%)', field: 'width', value: width, connected: isWidthConnected },
                        { label: 'Height (%)', field: 'height', value: height, connected: isHeightConnected }
                    ].map((item) => (
                        <div key={item.field} className="relative group">
                            {/* Handle for each parameter */}
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={item.field}
                                className="!w-1.5 !h-3 !rounded-[1px] !bg-white/20 !border-none -left-[21px] top-[26px] hover:!bg-[#dfff4f] transition-colors"
                            />

                            <label className="block text-[10px] text-white/40 mb-1">{item.label}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={item.connected ? "" : item.value}
                                    placeholder={item.connected ? "Linked" : "0"}
                                    disabled={item.connected}
                                    onChange={(e) => handleChange(item.field as any, Number(e.target.value))}
                                    className={cn(
                                        "w-full bg-[#0a0a0a] text-xs text-white rounded border p-2 focus:outline-none transition-all nodrag",
                                        item.connected
                                            ? "border-white/5 opacity-50 cursor-not-allowed placeholder:text-[#dfff4f]/50"
                                            : "border-white/10 focus:border-[#dfff4f]/30"
                                    )}
                                />
                                {item.connected && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="h-[1px] w-full bg-white/5"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {!isImageConnected && (
                    <div className="py-2 px-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                        <p className="text-[10px] text-yellow-200/70 leading-tight italic">
                            Connect an image source to begin cropping.
                        </p>
                    </div>
                )}

                {data.status === "error" && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                        <span className="text-[10px] text-red-400 font-medium">Error: {data.errorMessage || "Processing failed"}</span>
                    </div>
                )}

                {data.outputUrl && data.status !== "error" && (
                    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/50">
                        <img src={data.outputUrl} alt="Preview" className="w-full h-32 object-contain" />
                    </div>
                )}
            </div>

            <div className="px-4 pb-4">
                <button
                    onClick={handleRun}
                    disabled={data.status === "loading" || !isImageConnected}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all",
                        (data.status === "loading" || !isImageConnected)
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-[#dfff4f] text-black hover:scale-[1.02] active:scale-[0.98]"
                    )}>
                    {data.status === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    {data.status === "loading" ? "PROCESSING..." : "RUN CROP"}
                </button>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                id="image-input"
                isConnectable={isConnectable}
                className="!w-2 !h-4 !rounded-sm !bg-purple-500 !border-none -left-1"
            />

            <Handle
                type="source"
                position={Position.Right}
                id="output"
                isConnectable={isConnectable}
                className="!w-2 !h-4 !rounded-sm !bg-purple-500 !border-none -right-1"
            />
        </div>
    );
}
