import { AppNode } from "./types";
import { Edge } from "@xyflow/react";

export const DEMO_WORKFLOWS = [
    {
        id: "demo-product-listing",
        name: "Product Listing Generator",
        description: "Generate SEO, Social, and Description from product images.",
        thumbnail: "🛍️",
        getGraph: (): { nodes: AppNode[], edges: Edge[] } => {
            const nodes: AppNode[] = [
                {
                    id: 'img-1',
                    type: 'imageNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'Front View',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/shoe-front.jpg'
                    }
                },
                {
                    id: 'img-2',
                    type: 'imageNode',
                    position: { x: 0, y: 350 },
                    data: {
                        label: 'Side View',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/shoe-side.jpg'
                    }
                },
                {
                    id: 'img-3',
                    type: 'imageNode',
                    position: { x: 0, y: 700 },
                    data: {
                        label: 'Detail View',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/shoe-detail.jpg'
                    }
                },
                {
                    id: 'prompt-merger',
                    type: 'textNode',
                    position: { x: 250, y: 150 },
                    data: {
                        label: 'Analyst Instructions',
                        status: 'idle',
                        text: `You are a Senior Product Analyst. Analyze these 3 product images.`
                    }
                },
                {
                    id: 'llm-merger',
                    type: 'llmNode',
                    position: { x: 500, y: 300 },
                    data: {
                        label: 'Vision Analyst',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        imageHandleCount: 3,
                        outputs: [],
                        temperature: 0.4,
                        viewMode: 'single',
                        systemPrompt: ""
                    }
                }
            ];

            const edges: Edge[] = [
                { id: 'e1', source: 'img-1', target: 'llm-merger', targetHandle: 'image-0', type: 'animatedEdge', animated: true },
                { id: 'e2', source: 'img-2', target: 'llm-merger', targetHandle: 'image-1', type: 'animatedEdge', animated: true },
                { id: 'e3', source: 'img-3', target: 'llm-merger', targetHandle: 'image-2', type: 'animatedEdge', animated: true },
                { id: 'p1', source: 'prompt-merger', target: 'llm-merger', targetHandle: 'system-prompt', type: 'default' }
            ];

            return { nodes, edges };
        }
    },
    {
        id: "demo-marketing-kit",
        name: "Product Marketing Kit",
        description: "Advanced workflow using Video, Frame extraction, and Image cropping.",
        thumbnail: "🎬",
        getGraph: (): { nodes: AppNode[], edges: Edge[] } => {
            const nodes: AppNode[] = [
                {
                    id: 'video-src',
                    type: 'videoNode',
                    position: { x: 0, y: 100 },
                    data: {
                        label: 'Raw Demo Video',
                        status: 'success',
                        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
                    }
                },
                {
                    id: 'img-src',
                    type: 'imageNode',
                    position: { x: 0, y: 400 },
                    data: {
                        label: 'Hero Product Image',
                        status: 'success',
                        image: '/demo/shoe-front.jpg'
                    }
                },
                {
                    id: 'extract-node',
                    type: 'extractFrameNode',
                    position: { x: 300, y: 0 },
                    data: {
                        label: 'Extract Key Frame',
                        status: 'idle',
                        timestamp: '00:00:02'
                    }
                },
                {
                    id: 'crop-node',
                    type: 'cropImageNode',
                    position: { x: 300, y: 300 },
                    data: {
                        label: 'Portrait Crop (9:16)',
                        status: 'idle',
                        x: 25, y: 0, width: 50, height: 100
                    }
                },
                {
                    id: 'prompt-node',
                    type: 'textNode',
                    position: { x: 300, y: 600 },
                    data: {
                        label: 'Creative Directive',
                        status: 'idle',
                        text: 'Analyze the extracted video frame and product image to create a high-converting ad copy.'
                    }
                },
                {
                    id: 'llm-worker',
                    type: 'llmNode',
                    position: { x: 700, y: 300 },
                    data: {
                        label: 'Creative Director AI',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        imageHandleCount: 2,
                        outputs: [],
                        temperature: 0.8,
                        viewMode: 'single',
                        systemPrompt: 'Senior Copywriter'
                    }
                }
            ];

            const edges: Edge[] = [
                { id: 'e-v-ext', source: 'video-src', target: 'extract-node', targetHandle: 'video-input', type: 'animatedEdge', animated: true },
                { id: 'e-i-crop', source: 'img-src', target: 'crop-node', targetHandle: 'image-input', type: 'animatedEdge', animated: true },
                { id: 'e-ext-llm', source: 'extract-node', target: 'llm-worker', targetHandle: 'image-0', type: 'animatedEdge', animated: true },
                { id: 'e-crop-llm', source: 'crop-node', target: 'llm-worker', targetHandle: 'image-1', type: 'animatedEdge', animated: true },
                { id: 'e-prompt-llm', source: 'prompt-node', target: 'llm-worker', targetHandle: 'system-prompt', type: 'default' }
            ];

            return { nodes, edges };
        }
    }
];