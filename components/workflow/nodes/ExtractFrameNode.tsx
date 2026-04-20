"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { ImagePlay, Play, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExtractFrameNodeType, VideoNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/store/workflow-store";

export default function ExtractFrameNode({ id, data, isConnectable, selected }: NodeProps<ExtractFrameNodeType>) {
    const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
    const deleteNode = useWorkflowStore((state) => state.deleteNode);
    const { getNodes, getEdges } = useReactFlow();

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

    const timestamp = data.timestamp ?? "00:00:01";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (value: string) => {
        updateNodeData(id, { timestamp: value });
    };

    const handleRun = useCallback(async () => {
        try {
            updateNodeData(id, { status: "loading", errorMessage: undefined });
            const allNodes = getNodes();
            const allEdges = getEdges();
            const incomingEdge = allEdges.find((e) => e.target === id && e.targetHandle === "video-input");

            if (!incomingEdge) {
                throw new Error("No video connected to input");
            }

            const sourceNode = allNodes.find((n) => n.id === incomingEdge.source);
            if (sourceNode?.type !== "videoNode") {
                throw new Error("Connected input is not a video");
            }

            const videoData = sourceNode.data as VideoNodeData;
            const videoUrl = videoData.file?.url || videoData.videoUrl;

            if (!videoUrl || typeof videoUrl !== "string") {
                throw new Error("No video data available from connected node");
            }

            const response = await fetch('/api/trigger/ffmpeg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'extract-frame',
                    videoUrl,
                    params: {
                        timestamp: data.timestamp ?? "00:00:01"
                    }
                })
            });

            if (!response.ok) {
                throw new Error("Failed to start processing");
            }

            const { runId } = await response.json();

            const pollRunStatus = async (runId: string) => {
                const maxAttempts = 30;
                let attempts = 0;

                while (attempts < maxAttempts) {
                    const statusRes = await fetch(`/api/trigger/status?runId=${runId}`);
                    const statusData = await statusRes.json();

                    if (statusData.status === "SUCCESS") {
                        updateNodeData(id, {
                            status: "success",
                            outputUrl: statusData.output.url
                        });
                        return;
                    } else if (statusData.status === "FAILED" || statusData.status === "CANCELED") {
                        throw new Error("Task failed during processing");
                    }

                    attempts++;
                    await new Promise(r => setTimeout(r, 2000));
                }
                throw new Error("Task timeout");
            };

            await pollRunStatus(runId);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to extract frame";
            updateNodeData(id, { status: "error", errorMessage });
        }
    }, [id, updateNodeData, getNodes, getEdges, data.timestamp]);

    return (
        <div
            className={cn(
                "rounded-xl border bg-[#1a1a1a] min-w-[280px] shadow-xl transition-all duration-200",
                selected ? "border-[#dfff4f] ring-1 ring-[#dfff4f]/50" : "border-white/10 hover:border-white/30",
                data.status === "error" && "border-red-500 ring-1 ring-red-500/50"
            )}>
            {data.status === "loading" && (
                <div className="absolute -inset-[1px] rounded-xl border-2 border-[#dfff4f] shadow-[0_0_30px_rgba(223,255,79,0.3)] animate-pulse pointer-events-none z-50" />
            )}

            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-[#111] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <ImagePlay size={14} className="text-white/50" />
                    <span className="text-xs font-semibold text-white/70">{data.label || "Extract Frame"}</span>
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
                                Delete Node
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col space-y-4">
                <div>
                    <label className="block text-[10px] text-white/60 mb-1">Timestamp (e.g. 00:00:01 or 10%)</label>
                    <input type="text" value={timestamp} onChange={(e) => handleChange(e.target.value)} className="w-full bg-[#0a0a0a] text-xs text-white rounded-lg border border-white/10 p-2 focus:outline-none focus:border-[#dfff4f]/50 nodrag" placeholder="00:00:01" />
                </div>

                {data.status === "error" && (
                    <div className="flex flex-col items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                        <span className="text-[10px] text-red-400 font-medium">Extraction Failed</span>
                        <span className="text-[9px] text-red-300/60 mt-0.5 line-clamp-2 leading-tight">{data.errorMessage || "Unknown Error"}</span>
                    </div>
                )}

                {data.outputUrl && data.status !== "error" && (
                    <div className="relative group">
                        <img src={data.outputUrl} alt="Extracted Frame" className="w-full h-32 object-contain rounded-lg border border-white/10 bg-black/50" />
                    </div>
                )}
            </div>

            <div className="px-4 pb-4">
                <button
                    onClick={handleRun}
                    disabled={data.status === "loading"}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-all",
                        data.status === "loading" ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white/90 text-black hover:bg-white active:scale-95"
                    )}>
                    {data.status === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Run Extraction
                </button>
            </div>

            {/* Input Handle */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="video-input"
                    isConnectable={isConnectable}
                    onMouseEnter={() => setHoveredHandle("video-input")}
                    onMouseLeave={() => setHoveredHandle(null)}
                    className="!w-2.5 !h-2.5 !bg-[#1a1a1a] !border-2 !border-blue-400"
                />
                {hoveredHandle === "video-input" && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/90 text-blue-400 text-[10px] px-2 py-1 rounded z-50 pointer-events-none whitespace-nowrap">
                        Video Input
                    </div>
                )}
            </div>

            {/* Output Handle */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-50">
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    isConnectable={isConnectable}
                    className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-purple-400 hover:!bg-purple-400 transition-colors"
                />
            </div>
        </div>
    );
}
