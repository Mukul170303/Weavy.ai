import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL: GEMINI_API_KEY is missing from environment variables!");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

export async function POST(req: Request) {
  console.log("🚀 [API] Received LLM Execution Request");
  try {
    const body = await req.json();
    console.log("📦 [API] Request Body:", JSON.stringify(body, null, 2));
    const { prompt, systemPrompt, imageUrls, model: modelName = "gemini-2.5-flash", temperature = 0.7 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
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
          // For remote URLs, we'd need to fetch them here, but for simplicity we'll skip 
          // as the client should send base64 for local/connected nodes.
          // If we need remote fetch, we can add it later.
          console.warn("[API] Remote URL provided but fetch skipped in sync route.");
        }
      }
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error("LLM Execution Failed:", error);
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 });
  }
}
