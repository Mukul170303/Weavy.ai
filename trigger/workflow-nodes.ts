import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ CRITICAL: GEMINI_API_KEY is missing from environment variables!");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

// 1. Define the Input Payload Type strictly
interface AIJobPayload {
    prompt: string;
    systemPrompt?: string;
    imageUrls?: string[]; // Array of Base64 strings or URLs
    model?: string;       // e.g., "gemini-2.5-flash"
    temperature?: number;
}

// --- Helpers ---

/**
 * Resilient fetch that handles localhost/127.0.0.1 fallbacks
 * crucial for Windows/Dev environments where localhost might be isolated.
 */
async function resilientFetch(url: string): Promise<Response> {
    try {
        const resp = await fetch(url);
        if (resp.ok) return resp;
        throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
    } catch (e) {
        if (url.includes("localhost")) {
            const fallbackUrl = url.replace("localhost", "127.0.0.1");
            console.log(`   📡 [Worker] Localhost fetch failed. Retrying with 127.0.0.1: ${fallbackUrl}`);
            return await fetch(fallbackUrl);
        }
        if (url.includes("127.0.0.1")) {
            const fallbackUrl = url.replace("127.0.0.1", "localhost");
            console.log(`   📡 [Worker] 127.0.0.1 fetch failed. Retrying with localhost: ${fallbackUrl}`);
            return await fetch(fallbackUrl);
        }
        throw e;
    }
}

export const aiGenerator = task({
    id: "generate-text",
    run: async (payload: AIJobPayload) => {
        // Hardening: Resolve common model name issues
        let modelName = payload.model || "gemini-2.5-flash";

        // Strict Model Whitelist (ensures success even if UI is stale/custom)
        const validModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3.1-flash-lite-preview", "gemini-3.1-pro-preview"];
        if (!validModels.includes(modelName)) {
            console.log(`⚠️ [Worker] Redirecting unknown/futuristic model '${modelName}' to stable 'gemini-2.5-flash'.`);
            modelName = "gemini-2.5-flash";
        }

        console.log(`🤖 [Worker] Starting AI Task using model: ${modelName}`);

        const apiVersion = modelName.includes("1.5") || modelName.includes("2.") || modelName.includes("3.") ? "v1beta" : "v1";
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });

        try {
            const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];

            let fullText = payload.prompt;
            if (payload.systemPrompt) {
                fullText = `System Instructions: ${payload.systemPrompt}\n\nUser Request: ${payload.prompt}`;
            }
            parts.push({ text: fullText });

            if (payload.imageUrls && payload.imageUrls.length > 0) {
                for (const url of payload.imageUrls) {
                    if (url.startsWith("data:")) {
                        const base64Data = url.split(",")[1];
                        const mimeType = url.substring(url.indexOf(":") + 1, url.indexOf(";"));
                        parts.push({ inlineData: { data: base64Data, mimeType } });
                    } else {
                        console.log(`📡 [Worker] Fetching remote asset: ${url}`);
                        const resp = await resilientFetch(url);
                        if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.statusText}`);

                        const buf = await resp.arrayBuffer();
                        parts.push({
                            inlineData: {
                                data: Buffer.from(buf).toString("base64"),
                                mimeType: "image/jpeg"
                            }
                        });
                    }
                }
            }

            console.log(`🚀 [Worker] Sending request to Gemini (${parts.length} parts)...`);
            const startTime = Date.now();

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ [Worker] Gemini Response Received in ${duration}s`);

            return { success: true, text: text, duration: duration };

        } catch (error: any) {
            console.error(`❌ [Worker] Gemini Execution Failed:`, error);
            let userMessage = "AI Generation failed.";
            if (error.message?.includes("fetch failed")) {
                userMessage = "Network error: Worker could not reach Google AI servers.";
            } else if (error.status === 429) {
                userMessage = "Quota Exceeded: Your Gemini API key is hitting limits.";
            } else if (error.status === 404) {
                userMessage = `Model Not Found: The model '${modelName}' is not available for your key or region.`;
            }

            return { success: false, error: userMessage, details: error.message };
        }
    },
});

import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const cropImageTask = task({
    id: "crop-image",
    run: async (payload: { sourceUrl: string, x: number, y: number, width: number, height: number, nodeId: string }) => {
        const { sourceUrl, x, y, width, height } = payload;

        console.log(`✂️ [Worker] Starting Crop Task for Node: ${payload.nodeId}`);
        const ext = sourceUrl.startsWith('data:image/png') ? 'png' : 'jpg';
        const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.${ext}`);
        const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.${ext}`);

        if (sourceUrl.startsWith('data:')) {
            const base64Data = sourceUrl.split(",")[1];
            fs.writeFileSync(tempInput, base64Data, 'base64');
        } else {
            console.log(`📡 [Worker] Fetching source image: ${sourceUrl}`);
            const res = await resilientFetch(sourceUrl);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(tempInput, Buffer.from(buffer));
        }

        await new Promise((resolve, reject) => {
            ffmpeg(tempInput)
                .videoFilters(`crop=in_w*${width}/100:in_h*${height}/100:in_w*${x}/100:in_h*${y}/100`)
                .on('end', resolve)
                .on('error', (err) => {
                    console.error("FFmpeg Error:", err);
                    reject(err);
                })
                .save(tempOutput);
        });

        const outputBuffer = fs.readFileSync(tempOutput);
        const fileName = `cropped_${Date.now()}.${ext}`;

        let finalUrl = "";
        try {
            const { uploadToTransloadit } = await import("../lib/transloadit");
            finalUrl = await uploadToTransloadit(outputBuffer, fileName);
        } catch (err) {
            console.error("Transloadit Upload Failed, falling back to base64", err);
            finalUrl = `data:image/${ext};base64,${outputBuffer.toString('base64')}`;
        }

        fs.unlinkSync(tempInput);
        if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

        return { success: true, url: finalUrl };
    }
});

export const extractFrameTask = task({
    id: "extract-frame",
    run: async (payload: { sourceUrl: string, timestamp: string, nodeId: string }) => {
        const { sourceUrl, timestamp } = payload;

        console.log(`🎞️ [Worker] Starting Extract Frame Task for Node: ${payload.nodeId} at ${timestamp}`);

        const tempInput = path.join(os.tmpdir(), `input_vid_${Date.now()}.mp4`);
        const tempOutput = path.join(os.tmpdir(), `output_frame_${Date.now()}.jpg`);

        if (sourceUrl.startsWith('data:')) {
            const base64Data = sourceUrl.split(",")[1];
            fs.writeFileSync(tempInput, base64Data, 'base64');
        } else {
            console.log(`📡 [Worker] Fetching source video: ${sourceUrl}`);
            const res = await resilientFetch(sourceUrl);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(tempInput, Buffer.from(buffer));
        }

        await new Promise((resolve, reject) => {
            ffmpeg(tempInput)
                .screenshots({
                    timestamps: [timestamp],
                    filename: path.basename(tempOutput),
                    folder: path.dirname(tempOutput),
                    size: '100%x100%'
                })
                .on('end', resolve)
                .on('error', (err) => {
                    console.error("FFmpeg Extract Error:", err);
                    reject(err);
                });
        });

        const outputBuffer = fs.readFileSync(tempOutput);

        let finalUrl = "";
        try {
            const { uploadToTransloadit } = await import("../lib/transloadit");
            finalUrl = await uploadToTransloadit(outputBuffer, `frame_${Date.now()}.jpg`);
        } catch (err) {
            console.error("Transloadit Upload Failed, falling back to base64", err);
            finalUrl = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
        }

        if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
        if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

        return {
            success: true,
            url: finalUrl
        };
    }
});