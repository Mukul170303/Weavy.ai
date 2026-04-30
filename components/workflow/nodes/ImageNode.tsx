"use client";

import React, {useCallback, useRef, useState, useEffect} from "react";
import {Handle, Position, NodeProps} from "@xyflow/react";
import {ImageIcon, Upload, X, Loader2, AlertCircle, MoreHorizontal, Trash2} from "lucide-react";
import {cn} from "@/lib/utils";
import {ImageNodeType} from "@/lib/types"; // Ensure this matches your types definition
import {useWorkflowStore} from "@/store/workflow-store";

export default function ImageNode({id, data, isConnectable, selected}: NodeProps<ImageNodeType>) {
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
	const deleteNode = useWorkflowStore((state) => state.deleteNode);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// 1. Resolve the Image Source (User Upload OR Demo Pre-load)
	const imageSrc = (typeof data.file?.url === "string" && data.file.url) || (typeof data.image === "string" && data.image) || undefined;

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Helper: Convert File to Base64
	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	};

    const onFileChange = useCallback(
        async (evt: React.ChangeEvent<HTMLInputElement>) => {
            const file = evt.target.files?.[0];
            if (!file) return;

            try {
                // 1. Show Instant Local Preview
                const localUrl = URL.createObjectURL(file);
                updateNodeData(id, { 
                    status: "loading",
                    file: { url: localUrl, name: file.name, type: file.type }
                });
                
                // 2. Perform Cloud Upload
                const { uploadToTransloadit } = await import("@/lib/transloadit");
                const cloudUrl = await uploadToTransloadit(file);
                
                // 3. Swap with permanent Cloud URL
                updateNodeData(id, {
                    file: {
                        url: cloudUrl,
                        name: file.name,
                        type: file.type,
                    },
                    status: "success",
                    image: undefined,
                    outputUrl: cloudUrl, // Standardized output
                });
            } catch (err: any) {
                console.error("Image Processing Error:", err);
                updateNodeData(id, {
                    status: "error",
                    errorMessage: err?.message || "Failed to process image",
                });
            }
        },
        [id, updateNodeData]
    );

    const clearImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            updateNodeData(id, { file: undefined, image: undefined, status: "idle" });
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [id, updateNodeData]
    );

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
                    <ImageIcon size={14} className="text-white/50" />
                    <span className="text-xs font-semibold text-white/70">{data.label || "Image Source"}</span>
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

            <div className="p-3">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" id={`file-upload-${id}`} />

                {imageSrc ? (
                    <div className="relative group">
                        <img 
                            src={imageSrc} 
                            alt="source" 
                            className="w-full h-auto max-h-48 object-contain rounded-lg border border-white/10 shadow-inner" 
                        />

                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500/80 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10">
                            <X size={14} />
                        </button>

                        <div className="mt-2 text-[10px] text-white/40 truncate italic">
                            {data.file?.name || "uploaded_asset.png"}
                        </div>
                    </div>
                ) : (
                    <label
                        htmlFor={`file-upload-${id}`}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                            data.status === "loading" ? "border-white/20 bg-white/5" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                        )}>
                        {data.status === "loading" ? (
                            <Loader2 size={24} className="animate-spin text-white/20" />
                        ) : data.status === "error" ? (
                            <>
                                <AlertCircle size={20} className="text-red-500/50 mb-2" />
                                <span className="text-[10px] text-red-400/80 text-center px-4">{data.errorMessage}</span>
                            </>
                        ) : (
                            <>
                                <Upload size={24} className="text-white/20 mb-2" />
                                <span className="text-xs text-white/30 font-medium">Click to upload image</span>
                            </>
                        )}
                    </label>
                )}
            </div>

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