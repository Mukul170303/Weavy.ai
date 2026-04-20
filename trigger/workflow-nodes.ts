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
    model?: string;       // e.g., "gemini-1.5-flash"
    temperature?: number;
}

export const aiGenerator = task({
    id: "generate-text",
    run: async (payload: AIJobPayload) => {
        // Default to 1.5-flash if model is missing or invalid
        const modelName = payload.model || "gemini-1.5-flash";

        console.log(`🤖 [Worker] Starting AI Task using model: ${modelName}`);
        console.log(`   - Prompt length: ${payload.prompt.length}`);
        console.log(`   - Images: ${payload.imageUrls?.length || 0}`);

        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            // Prepare Content Parts for Multimodal Input
            const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];

            // Add System Prompt if exists (prepend to text)
            let fullText = payload.prompt;
            if (payload.systemPrompt) {
                fullText = `System Instructions: ${payload.systemPrompt}\n\nUser Request: ${payload.prompt}`;
            }
            parts.push({ text: fullText });

            // Add Images
            if (payload.imageUrls && payload.imageUrls.length > 0) {
                for (const url of payload.imageUrls) {
                    // Handle Base64
                    if (url.startsWith("data:")) {
                        const base64Data = url.split(",")[1];
                        const mimeType = url.substring(url.indexOf(":") + 1, url.indexOf(";"));
                        parts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        });
                    }
                    // Handle Remote URLs (fetch them)
                    else {
                        const resp = await fetch(url);
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

            // Execute Gemini
            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                text: text,
            };

        } catch (error) {
            console.error(`[Worker] Gemini Failed:`, error);
            throw error; // Throwing allows Trigger.dev to show it as "Failed" in dashboard
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
    run: async (payload: { imageUrl: string, params: { x: number, y: number, width: number, height: number } }) => {
        const { imageUrl, params } = payload;

        // 1. Download image
        const ext = imageUrl.startsWith('data:image/png') ? 'png' : 'jpg';
        const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.${ext}`);
        const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.${ext}`);

        if (imageUrl.startsWith('data:')) {
            const base64Data = imageUrl.split(",")[1];
            fs.writeFileSync(tempInput, base64Data, 'base64');
        } else {
            const res = await fetch(imageUrl);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(tempInput, Buffer.from(buffer));
        }

        // 2. Process with FFmpeg (crop=width:height:x:y)
        // Note: fluent-ffmpeg crop takes x, y, width, height but the user gave percentages.
        // Assuming the UI gives absolute values or we handle it here. 
        // For simplicity, using them as percentages width=w*percent/100

        await new Promise((resolve, reject) => {
            // Using a basic scale for now or actual crop if they are percentages
            // A true percentage crop requires getting the dimensions first.
            ffmpeg(tempInput)
                .videoFilters(`crop=in_w*${params.width}/100:in_h*${params.height}/100:in_w*${params.x}/100:in_h*${params.y}/100`)
                .on('end', resolve)
                .on('error', reject)
                .save(tempOutput);
        });

        // 3. Convert back to base64
        const outputBuffer = fs.readFileSync(tempOutput);
        const outputBase64 = `data:image/${ext};base64,${outputBuffer.toString('base64')}`;

        // Cleanup
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);

        return {
            success: true,
            url: outputBase64
        };
    }
});

export const extractFrameTask = task({
    id: "extract-frame",
    run: async (payload: { videoUrl: string, params: { timestamp: string } }) => {
        const { videoUrl, params } = payload;

        const tempInput = path.join(os.tmpdir(), `input_vid_${Date.now()}.mp4`);
        const tempOutput = path.join(os.tmpdir(), `output_frame_${Date.now()}.jpg`);

        if (videoUrl.startsWith('data:')) {
            const base64Data = videoUrl.split(",")[1];
            fs.writeFileSync(tempInput, base64Data, 'base64');
        } else {
            const res = await fetch(videoUrl);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(tempInput, Buffer.from(buffer));
        }

        await new Promise((resolve, reject) => {
            const timestamp = params.timestamp;
            // if it's a percentage, use it, else use the time string directly
            ffmpeg(tempInput)
                .screenshots({
                    timestamps: [timestamp],
                    filename: path.basename(tempOutput),
                    folder: path.dirname(tempOutput),
                    size: '100x100%'
                })
                .on('end', resolve)
                .on('error', reject);
        });

        const outputBuffer = fs.readFileSync(tempOutput);
        const outputBase64 = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;

        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);

        return {
            success: true,
            url: outputBase64
        };
    }
});