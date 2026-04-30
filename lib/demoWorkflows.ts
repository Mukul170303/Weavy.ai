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
                        label: 'Headphones - Front',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/headphones.png'
                    }
                },
                {
                    id: 'img-2',
                    type: 'imageNode',
                    position: { x: 0, y: 350 },
                    data: {
                        label: 'Headphones - Side',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/headphones-side.png'
                    }
                },
                {
                    id: 'img-3',
                    type: 'imageNode',
                    position: { x: 0, y: 700 },
                    data: {
                        label: 'Headphones - Detail',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/headphones-detail.png'
                    }
                },
                {
                    id: 'prompt-merger',
                    type: 'textNode',
                    position: { x: 250, y: 150 },
                    data: {
                        label: 'Analyst Instructions',
                        status: 'idle',
                        text: `You are a Senior Product Analyst. Analyze these 3 headphone images.`
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
        id: "demo-marketing-suite",
        name: "Product Marketing Kit Generator",
        description: "Advanced workflow with parallel Image & Video processing converged into a final marketing post.",
        thumbnail: "🚀",
        getGraph: (): { nodes: AppNode[], edges: Edge[] } => {
            const nodes: AppNode[] = [
                // BRANCH A: Image & Product Details
                {
                    id: 'upload-image',
                    type: 'imageNode',
                    position: { x: 0, y: 350 },
                    data: {
                        label: 'Product Hero Shot',
                        status: 'success',
                        inputType: 'upload',
                        image: '/demo/headphones.png'
                    }
                },
                {
                    id: 'crop-image',
                    type: 'cropImageNode',
                    position: { x: 300, y: 350 },
                    data: {
                        label: 'Crop Center (80%)',
                        status: 'idle',
                        x: 10, y: 10, width: 80, height: 80
                    }
                },
                {
                    id: 'text-sys-1',
                    type: 'textNode',
                    position: { x: 300, y: 650 },
                    data: {
                        label: 'Copywriter Role',
                        status: 'idle',
                        text: 'You are a professional marketing copywriter. Generate a compelling one-paragraph product description.'
                    }
                },
                {
                    id: 'text-details',
                    type: 'textNode',
                    position: { x: 300, y: 800 },
                    data: {
                        label: 'Product Details',
                        status: 'idle',
                        text: 'Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.'
                    }
                },
                {
                    id: 'llm-node-1',
                    type: 'llmNode',
                    position: { x: 700, y: 500 },
                    data: {
                        label: 'Description Generator',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        imageHandleCount: 1,
                        outputs: [],
                        temperature: 0.7,
                        viewMode: 'single'
                    }
                },
                // BRANCH B: Video Processing
                {
                    id: 'upload-video',
                    type: 'videoNode',
                    position: { x: 0, y: 0 },
                    data: {
                        label: 'Product Demo Video',
                        status: 'success',
                        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
                    }
                },
                {
                    id: 'extract-frame',
                    type: 'extractFrameNode',
                    position: { x: 300, y: 0 },
                    data: {
                        label: 'Extract Middle Frame',
                        status: 'idle',
                        timestamp: '50%'
                    }
                },
                // CONVERGENCE: Final Marketing Generator
                {
                    id: 'text-sys-2',
                    type: 'textNode',
                    position: { x: 700, y: 100 },
                    data: {
                        label: 'Social Media Manager',
                        status: 'idle',
                        text: 'You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.'
                    }
                },
                {
                    id: 'llm-node-2',
                    type: 'llmNode',
                    position: { x: 1100, y: 300 },
                    data: {
                        label: 'Final Marketing Kit',
                        status: 'idle',
                        model: 'gemini-2.5-flash',
                        imageHandleCount: 2,
                        outputs: [],
                        temperature: 0.8,
                        viewMode: 'single'
                    }
                }
            ];

            const edges: Edge[] = [
                // Branch A Connections
                { id: 'e-i-crop', source: 'upload-image', target: 'crop-image', targetHandle: 'image-input', type: 'animatedEdge', animated: true },
                { id: 'e-c-llm1', source: 'crop-image', target: 'llm-node-1', targetHandle: 'image-0', type: 'animatedEdge', animated: true },
                { id: 'e-ts1-llm1', source: 'text-sys-1', target: 'llm-node-1', targetHandle: 'system-prompt', type: 'default' },
                { id: 'e-tp1-llm1', source: 'text-details', target: 'llm-node-1', targetHandle: 'prompt', type: 'default' },
                
                // Branch B Connections
                { id: 'e-v-ext', source: 'upload-video', target: 'extract-frame', targetHandle: 'video-input', type: 'animatedEdge', animated: true },
                
                // Convergence Connections
                { id: 'e-ts2-llm2', source: 'text-sys-2', target: 'llm-node-2', targetHandle: 'system-prompt', type: 'default' },
                { id: 'e-llm1-llm2', source: 'llm-node-1', target: 'llm-node-2', targetHandle: 'prompt', type: 'default' },
                { id: 'e-c1-llm2', source: 'crop-image', target: 'llm-node-2', targetHandle: 'image-0', type: 'animatedEdge', animated: true },
                { id: 'e-ext1-llm2', source: 'extract-frame', target: 'llm-node-2', targetHandle: 'image-1', type: 'animatedEdge', animated: true }
            ];

            return { nodes, edges };
        }
    }
];