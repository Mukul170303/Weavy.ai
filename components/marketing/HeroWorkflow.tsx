"use client"


import { useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import type { HeroNode, HeroNodeData } from "@/lib/types";

// --- 1. CUSTOM NODE ---
const MarketingCardNode = ({ data }: { data: HeroNodeData }) => {
  const width = data.width || "w-64";
  const height = data.height || "aspect-[4/5]";

  return (
    <div className={`${width} flex flex-col gap-3 group transition-all duration-500`}>
      {/* Label */}
      {data.label && (
        <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 group-hover:text-black/80 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-black/10 group-hover:bg-[#dfff4f] transition-colors" />
          <span className="flex items-center gap-2">
            <span className="opacity-50">{data.type}</span>
            <span className="text-black/70">{data.label}</span>
          </span>
        </div>
      )}
      {!data.label && data.type && (
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/30 ml-4">{data.type}</div>
      )}

      {/* Node Content */}
      <div className={`${height} w-full rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md border border-black/[0.03] relative shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:border-black/[0.08] transition-all duration-300`}>
        
        {/* 3D Model Viewer */}
        {data.type === "3D" ? (
          <div className="w-full h-full relative group/3d">
             <img 
              src={data.image} 
              className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover/3d:opacity-0 transition-opacity duration-500" 
              alt="3D preview"
            />
            {/* @ts-ignore */}
            <model-viewer
              src="https://cdn.jsdelivr.net/gh/kshach/nbd/3D%20Model%20First%20Fold.glb"
              camera-controls
              auto-rotate
              disable-zoom
              disable-pan
              disable-tap
              field-of-view="37.5deg"
              exposure="0.7"
              auto-rotate-delay="0"
              rotation-per-second="-16deg"
              interaction-prompt="none"
              shadow-intensity="1"
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              class="w-full h-full"
            />
          </div>
        ) : data.type === "Video" ? (
          <div className="w-full h-full relative">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            >
              <source src="https://assets.weavy.ai/homepage/hero/hero_video.mp4" type="video/mp4" />
            </video>
          </div>
        ) : data.image ? (
          <img src={data.image} alt={data.label || "node"} className="w-full h-full object-cover" />
        ) : data.text ? (
          <div className="p-5 h-full flex items-start bg-white/50 border border-black/[0.02] rounded-2xl">
            <p className="text-[11px] leading-relaxed text-black/60 font-medium">"{data.text}"</p>
          </div>
        ) : (
          <div className={`w-full h-full ${data.gradientClass || "bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"}`} />
        )}

        {/* Subtle Gloss Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/20 to-transparent opacity-30" />
      </div>

      {/* Connection Handles */}
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-black/10 !border-black/[0.05] hover:!bg-[#dfff4f] !transition-colors" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-black/10 !border-black/[0.05] hover:!bg-[#dfff4f] !transition-colors" />
    </div>
  );
};

// --- 2. CUSTOM EDGE ---
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY }: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    curvature: 0.5,
  });

  return (
    <g className="react-flow__edge">
      <path
        id={id}
        className="react-flow__edge-path transition-all duration-500"
        d={edgePath}
        stroke="#cbd5e1"
        strokeWidth={1.5}
        fill="none"
        style={{ opacity: 0.4 }}
      />
      <circle r="2" fill="#94a3b8">
        <animateMotion dur="6s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </g>
  );
};

const nodeTypes = { marketingCard: MarketingCardNode };
const edgeTypes = { custom: CustomEdge };

// --- 3. NODE LAYOUT (Based on User's Snippet) ---
const initialNodes: HeroNode[] = [
  {
    id: "node1",
    type: "marketingCard",
    position: { x: -350, y: -50 },
    data: {
      type: "3D",
      label: "3D Generation",
      image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd65ba87c69df161752e5_3d_card.avif",
      width: "w-[180px]",
      height: "aspect-square",
    },
  },
  {
    id: "node2",
    type: "marketingCard",
    position: { x: -350, y: 250 },
    data: {
      type: "Reference",
      label: "Color Difference",
      image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd77722078ff43fe428f3_hcard-color%20reference.avif",
      width: "w-[220px]",
      height: "h-[120px]",
    },
  },
  {
    id: "node3",
    type: "marketingCard",
    position: { x: 50, y: 20 },
    data: {
      type: "Generation",
      label: "Stable Diffusion",
      image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681cd7cbc22419b32bb9d8d8_hcard%20-%20STABLE%20DIFFUSION.avif",
      width: "w-[300px]",
      height: "aspect-[4/5]",
    },
  },
  {
    id: "node4",
    type: "marketingCard",
    position: { x: 500, y: -50 },
    data: {
      type: "Text",
      label: "Prompt Input",
      text: "A Great-Tailed Grackle bird is flying from the background and seating on the model's shoulder slowly...",
      width: "w-[220px]",
      height: "h-auto",
    },
  },
  {
    id: "node5",
    type: "marketingCard",
    position: { x: 500, y: 150 },
    data: {
      type: "Model",
      label: "Flux 2.1",
      image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6837510acbe777269734b387_bird_desktop.avif",
      width: "w-[220px]",
      height: "aspect-square",
    },
  },
  {
    id: "node6",
    type: "marketingCard",
    position: { x: 850, y: -20 },
    data: {
      type: "Video",
      label: "Minimax Output",
      width: "w-[320px]",
      height: "aspect-[4/5]",
    },
  },
];

const initialEdges = [
  { id: "e1-3", source: "node1", target: "node3", type: "custom" },
  { id: "e2-3", source: "node2", target: "node3", type: "custom" },
  { id: "e3-4", source: "node3", target: "node4", type: "custom" },
  { id: "e3-5", source: "node3", target: "node5", type: "custom" },
  { id: "e4-6", source: "node4", target: "node6", type: "custom" },
  { id: "e5-6", source: "node5", target: "node6", type: "custom" },
];

export default function HeroWorkflow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    // Load model-viewer script if not already present
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-full">
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#dfff4f" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}