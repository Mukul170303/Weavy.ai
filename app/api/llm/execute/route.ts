import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

const ExecuteSchema = z.object({
  model: z.string(),
  prompt: z.string().optional(),
  systemPrompt: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  temperature: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    console.log("✅ API HIT");

    const body = await req.json();
    console.log("📦 BODY:", body);

    const data = ExecuteSchema.parse(body);

    let finalPrompt = data.prompt?.trim() || "";

    if (data.systemPrompt?.trim()) {
      finalPrompt = data.systemPrompt + "\n\n" + finalPrompt;
    }

    if (!finalPrompt && (!data.imageUrls || data.imageUrls.length === 0)) {
      return NextResponse.json(
        { success: false, error: "No input provided" },
        { status: 400 }
      );
    }

    if (!finalPrompt) {
      finalPrompt = "Describe the given images in detail.";
    }

    const modelName = data.model || "gemini-2.5-flash";
    const apiVersion = modelName.includes("1.5") || modelName.includes("2.") || modelName.includes("3.") ? "v1beta" : "v1";

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: data.temperature ?? 0.7,
      },
    }, { apiVersion });

    let parts: any[] = [{ text: finalPrompt }];

    if (data.imageUrls?.length) {
      for (const img of data.imageUrls) {
        if (img.startsWith("data:")) {
          const mimeType = img.substring(img.indexOf(":") + 1, img.indexOf(";"));
          const base64 = img.split(",")[1];

          parts.push({
            inlineData: { data: base64, mimeType },
          });
        } else {
          try {
            const response = await fetch(img);
            const buffer = Buffer.from(await response.arrayBuffer());

            parts.push({
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: response.headers.get("content-type") || "image/jpeg",
              },
            });
          } catch (err) {
            console.error("❌ Image fetch failed:", err);
          }
        }
      }
    }

    // ✅ CORRECT Gemini call
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
    });

    const text = result.response.text();

    console.log("✅ LLM RESPONSE:", text);

    return NextResponse.json({
      success: true,
      text,
    });

  } catch (error: any) {
    console.error("❌ API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}