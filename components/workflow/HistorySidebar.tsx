"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Clock, ChevronRight, ChevronDown, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getWorkflowHistoryAction } from "@/app/actions/historyActions";
import { useWorkflowStore } from "@/store/workflow-store";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
	workflowId: string;
	isOpen: boolean;
	onClose: () => void;
}

interface WorkflowRun {
	id: string;
	status: string;
	triggerType: string;
	startedAt: string;
	finishedAt: string | null;
	duration: string;
	nodes: any[];
}

export default function HistorySidebar({ workflowId, isOpen, onClose }: HistorySidebarProps) {
	const [runs, setRuns] = useState<WorkflowRun[]>([]);
	const [loading, setLoading] = useState(false);
	const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
	const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Allow polling for both numeric IDs and demo slugs (backend handles slugs)
		if (!isOpen || !workflowId) return;

		let isMounted = true;
		let timer: NodeJS.Timeout | null = null;

		const fetchHistory = async () => {
			if (runs.length === 0) setLoading(true);
			try {
				const res = await getWorkflowHistoryAction(workflowId);
				if (!isMounted) return;
				if (res.success && res.runs) {
					setRuns(res.runs);

					// Stop polling once all runs have reached a terminal state
					const allTerminal = res.runs.length > 0 &&
						res.runs.every((r: WorkflowRun) =>
							r.status === "COMPLETED" || r.status === "FAILED" || r.status === "SUCCESS"
						);
					if (allTerminal && timer) {
						clearInterval(timer);
						timer = null;
					}
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		fetchHistory();

		// Refresh every 5s to show live run entries
		timer = setInterval(fetchHistory, 5000);
		return () => {
			isMounted = false;
			if (timer) clearInterval(timer);
		};
	}, [workflowId, isOpen]); // runs intentionally excluded — would cause infinite re-subscribe


	if (!isOpen) return null;

	return (
		<div className="absolute right-0 top-0 h-full w-[350px] bg-[#0c0c0c] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 flex flex-col">
			{/* Header */}
			<div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0f0f0f]">
				<h2 className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
					<Clock size={14} className="text-[#dfff4f]" /> Execution History
				</h2>
				<button onClick={onClose} className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-all">
					<X size={18} />
				</button>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_top_right,#111,transparent)]">
				{loading && runs.length === 0 && (
					<div className="flex flex-col items-center justify-center py-20 opacity-30">
						<Loader2 size={32} className="animate-spin mb-4" />
						<p className="text-xs font-medium">Fetching history...</p>
					</div>
				)}

				{!loading && runs.length === 0 && (
					<div className="text-white/20 text-xs text-center py-20 border border-dashed border-white/5 rounded-xl">
						<Clock size={40} className="mx-auto mb-4 opacity-10" />
						No runs recorded yet.
						<br />
						<span className="opacity-50">Trigger a workflow to see logs.</span>
					</div>
				)}

				{runs.map((run) => (
					<div
						key={run.id}
						className={cn(
							"group border rounded-xl overflow-hidden transition-all duration-300",
							run.status === "RUNNING"
								? "border-[#dfff4f]/40 bg-[#dfff4f]/[0.02] shadow-[0_0_20px_rgba(223,255,79,0.05)]"
								: "border-white/5 bg-[#121212] hover:border-white/10"
						)}>
						{/* Run Summary Card */}
						<div
							className="p-4 flex items-center justify-between cursor-pointer group-hover:bg-white/[0.02] transition-colors"
							onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}>
							<div className="flex items-center gap-4">
								<div className="relative">
									<StatusIcon status={run.status} />
									{run.status === "RUNNING" && (
										<div className="absolute -inset-1 bg-[#dfff4f]/20 rounded-full animate-ping" />
									)}
								</div>
								<div>
									<div className="text-xs font-bold text-white flex items-center gap-2">
										Run #{run.id.slice(0, 4)}
										<span className={cn(
											"text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
											run.status === "RUNNING" ? "bg-[#dfff4f] text-black" : "bg-white/5 text-white/40"
										)}>
											{run.status}
										</span>
									</div>
									<div className="text-[10px] text-white/40 font-mono mt-1 opacity-60">
										{new Date(run.startedAt).toLocaleDateString()} at {new Date(run.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<span className="text-[10px] text-white/30 font-mono tabular-nums">{run.duration}</span>
								<div className={cn(
									"p-1 rounded-md bg-white/5 transition-transform duration-300",
									expandedRunId === run.id && "rotate-180"
								)}>
									<ChevronDown size={14} className="text-white/40" />
								</div>
							</div>
						</div>

						{/* Expanded Details (Node List) - PIXEL PERFECT TREE VIEW */}
						{expandedRunId === run.id && (
							<div className="bg-black/60 border-t border-white/5 p-4 pt-0">
								<div className="mt-4 space-y-4 relative">
									{/* Tree Line Connector */}
									<div className="absolute left-[11px] top-2 bottom-4 w-[1px] bg-white/5" />

									{run.nodes.length === 0 ? (
										<div className="text-[10px] text-white/20 py-4 pl-8 italic">Initializing node tree...</div>
									) : (
										run.nodes.map((node: any) => (
											<div key={node.id} className="relative pl-8">
												{/* Bullet Point */}
												<div className="absolute left-[9px] top-[7px] w-[5px] h-[5px] rounded-full bg-white/10 border border-white/5 z-10" />

												<div className="flex items-center gap-3 mb-2">
													<StatusIcon status={node.status} size={12} />
													<span className="text-[11px] text-white font-bold opacity-90">{node.nodeLabel || node.type}</span>
													<span className="text-[9px] text-white/20 ml-auto font-mono bg-white/[0.03] px-1.5 py-0.5 rounded leading-none">
														{node.duration || "0s"}
													</span>
												</div>

												{/* Output Preview - Premium styling */}
												{node.status === "SUCCESS" && (
													<div className="ml-0.5 mt-1">
														{node.output ? (
															<div className="bg-white/[0.03] p-2.5 rounded-lg text-[10px] text-emerald-400/80 font-mono border border-emerald-500/10 shadow-inner group/out relative">
																<div className="absolute -left-3 top-3 w-3 h-[1px] bg-white/5" />
																<div className="line-clamp-3 leading-relaxed">
																	{typeof node.output === 'string'
																		? node.output
																		: (node.output.text || JSON.stringify(node.output))
																	}
																</div>
															</div>
														) : (
															<div className="text-[9px] text-white/20 italic pl-2">Task completed</div>
														)}
													</div>
												)}

												{/* Error Message */}
												{node.status === "FAILED" && (
													<div className="bg-red-500/[0.08] p-3 rounded-lg text-[10px] text-red-400/90 border border-red-500/20 font-medium ml-1 leading-relaxed">
														{node.error || "Execution failed unexpectedly"}
													</div>
												)}
											</div>
										))
									)}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}


// --- Icons ---
function StatusIcon({ status, size = 16 }: { status: string; size?: number }) {
	if (status === "SUCCESS" || status === "COMPLETED") return <CheckCircle2 size={size} className="text-emerald-500" />;
	if (status === "FAILED") return <XCircle size={size} className="text-red-500" />;
	if (status === "RUNNING") return <Loader2 size={size} className="text-[#dfff4f] animate-spin" />;
	return <div className={`w-${size / 4} h-${size / 4} rounded-full bg-white/20`} />;
}