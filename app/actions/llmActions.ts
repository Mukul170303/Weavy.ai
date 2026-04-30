"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL: GEMINI_API_KEY is missing from environment variables!");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

export async function executeLLMAction({
  prompt,
  systemPrompt,
  imageUrls,
  model: modelName = "gemini-2.5-flash",
  temperature = 0.7,
}: {
  prompt: string;
  systemPrompt?: string;
  imageUrls?: string[];
  model?: string;
  temperature?: number;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!prompt) {
      return { success: false, error: "Prompt is required" };
    }

    // Strict Model Whitelist
    const validModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3.1-flash-lite-preview", "gemini-3.1-pro-preview"];
    let finalModelName = modelName;
    if (!validModels.includes(finalModelName)) {
      finalModelName = "gemini-2.5-flash";
    }

    const apiVersion = finalModelName.includes("1.5") || finalModelName.includes("2.") || finalModelName.includes("3.") ? "v1beta" : "v1";
    const model = genAI.getGenerativeModel({ model: finalModelName }, { apiVersion });

    const parts: any[] = [];
    let fullText = prompt;
    if (systemPrompt) {
      fullText = `System Instructions: ${systemPrompt}\n\nUser Request: ${prompt}`;
    }
    parts.push({ text: fullText });

    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        if (url.startsWith("data:")) {
          const base64Data = url.split(",")[1];
          const mimeType = url.substring(url.indexOf(":") + 1, url.indexOf(";"));
          parts.push({ inlineData: { data: base64Data, mimeType } });
        } else {
          // Note: In server actions, fetching remote URLs is fine
          try {
            let finalUrl = url;
            if (url.startsWith("/")) {
              const headersList = await headers();
              const host = headersList.get("host");
              const protocol = host?.includes("localhost") ? "http" : "https";
              const baseUrl = `${protocol}://${host}`;
              finalUrl = `${baseUrl}${url}`;
            }

            const resp = await fetch(finalUrl);
            const buf = await resp.arrayBuffer();
            parts.push({
              inlineData: {
                data: Buffer.from(buf).toString("base64"),
                mimeType: "image/jpeg", 
              },
            });
          } catch (e) {
            console.error(`[LLM Action] Failed to fetch image: ${url}`, e);
          }
        }
      }
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return { success: true, text };
  } catch (error: any) {
    console.error("LLM Action Failed:", error);
    return { success: false, error: error.message || "Failed to generate content" };
  }
}
