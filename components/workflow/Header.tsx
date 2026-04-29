"use client";

import React, { useState, useCallback } from "react";
import { Save, Loader2, Share2, FolderOpen, Play } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow-store";
import { saveWorkflowAction, runWorkflowAction, runSelectedNodesAction } from "@/app/actions/workflowActions";
import LoadWorkflowModal from "./LoadWorkflowModal";
import { useRouter } from "next/navigation";

export default function Header() {
	const router = useRouter();
	const { nodes, edges, workflowId, workflowName, setWorkflowId, setWorkflowName, exportWorkflow, importWorkflow, loadSample } = useWorkflowStore();
	const [isSaving, setIsSaving] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [isLoadOpen, setIsLoadOpen] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);

	const selectedNodes = nodes.filter((n) => n.selected);
	const needsPolling = nodes.some(node => node.data?.status === 'loading');

	// --- HANDLE SAVE ---
	const handleSave = async () => {
		if (nodes.length === 0) {
			alert("Canvas is empty!");
			return null;
		}

		setIsSaving(true);

		try {
			const res = await saveWorkflowAction({
				id: workflowId,
				name: workflowName,
				nodes,
				edges,
			});

			if (res.success && res.id) {
				const isNew = !workflowId || isNaN(parseInt(String(workflowId)));
				setWorkflowId(res.id);

				// Sync URL if this was a new/demo workflow
				if (isNew) {
					router.push(`/workflows/${res.id}`);
				}

				return res.id;
			} else if (res.success) {
				alert("Saved, but no ID returned.");
				return null;
			} else {
				alert(`Error: ${res.error}`);
				return null;
			}
		} catch (error) {
			console.error(error);
			return null;
		} finally {
			setIsSaving(false);
		}
	};

	// --- HANDLE RUN ---
	const handleRun = async () => {
		setIsRunning(true);
		let currentId = workflowId;

		// 1. Force Save First to ensure DB has latest graph
		const savedId = await handleSave();

		// If save failed, abort run
		if (!savedId) {
			setIsRunning(false);
			return;
		}
		currentId = savedId;

		// 2. Run the workflow on the server
		console.log("Running workflow with ID:", currentId);

		try {
			let res;
			if (selectedNodes.length > 0) {
				const selectedIds = selectedNodes.map((n) => n.id);
				res = await runSelectedNodesAction(currentId, selectedIds);
			} else {
				res = await runWorkflowAction(currentId);
			}

			if (res.success) {
				console.log(`Workflow run started! Run ID: ${res.runId}`);

				if (typeof res.runId === "string") {
					localStorage.setItem("lastRunId", res.runId);
				}
				// 🚀 Show feedback: Open history sidebar automatically
				useWorkflowStore.getState().setHistoryOpen(true);
			} else {
				alert("Run Failed: " + res.error);
			}
		} catch (err) {
			console.error(err);
			alert("Error starting run");
		} finally {
			setIsRunning(false);
		}
	};

	// --- HANDLE SHARE (EXPORT) ---
	const handleShare = useCallback(() => {
		exportWorkflow();
	}, [exportWorkflow]);

	// --- HANDLE IMPORT ---
	const handleImport = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "application/json";
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (e) => {
				const json = e.target?.result as string;
				importWorkflow(json);
			};
			reader.readAsText(file);
		};
		input.click();
	};

	return (
		<>
			<header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#111]">
				{/* --- LEFT SIDE (Logo + Name Input) --- */}
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 rounded bg-gradient-to-tr from-pink-500 to-purple-500"></div>

					{/* Editable Workflow Name */}
					{isEditingName ? (
						<input
							type="text"
							value={workflowName}
							onChange={(e) => setWorkflowName(e.target.value)}
							onBlur={() => setIsEditingName(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") setIsEditingName(false);
								if (e.key === "Escape") {
									setIsEditingName(false);
								}
							}}
							autoFocus
							className="bg-[#222] text-sm font-bold text-white px-2 py-1 rounded border border-[#dfff4f] focus:outline-none"
						/>
					) : (
						<h1
							onClick={() => setIsEditingName(true)}
							className="text-sm font-bold text-white tracking-wider cursor-text hover:bg-white/10 px-2 py-1 rounded transition-colors flex items-center gap-2">
							{workflowName}
							{workflowId && <span className="opacity-50 font-normal text-xs">#{workflowId}</span>}
						</h1>
					)}
				</div>

				{/* --- RIGHT SIDE (Buttons) --- */}
				<div className="flex gap-2">
					{/* Open Button */}
					<button
						onClick={() => setIsLoadOpen(true)}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all">
						<FolderOpen size={14} />
						OPEN
					</button>

					{/* Load Sample */}
					<button
						onClick={loadSample}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-[#dfff4f] text-xs font-bold rounded-lg hover:bg-[#dfff4f]/10 transition-all">
						SAMPLE
					</button>

					{/* Clear Button */}
					<button
						onClick={() => {
							if (confirm("Clear current canvas?")) {
								useWorkflowStore.setState({ nodes: [], edges: [], workflowId: null });
							}
						}}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-red-500/80 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-all">
						CLEAR
					</button>

					{/* Import Button */}
					<button
						onClick={handleImport}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all">
						IMPORT
					</button>

					{/* Share (Export) Button */}
					<button
						onClick={handleShare}
						className="flex items-center gap-2 px-3 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all group">
						<Share2 size={14} className="group-hover:text-[#dfff4f] transition-colors" />
						EXPORT
					</button>

					{/* Save Button */}
					<button
						onClick={handleSave}
						disabled={isSaving || isRunning}
						className="flex items-center gap-2 px-4 py-2 bg-[#222] border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all disabled:opacity-50">
						{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
						SAVE
					</button>

					{/* 👇 RUN BUTTON RESTORED */}
					<button
						onClick={handleRun}
						disabled={isSaving || isRunning}
						className="flex items-center gap-2 px-4 py-2 bg-[#dfff4f] text-black text-xs font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(223,255,79,0.2)]">
						{isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
						{isRunning ? "RUNNING..." : selectedNodes.length > 0 ? `RUN SELECTED (${selectedNodes.length})` : "RUN"}
					</button>
				</div>
			</header>

			<LoadWorkflowModal isOpen={isLoadOpen} onClose={() => setIsLoadOpen(false)} />
		</>
	);
}