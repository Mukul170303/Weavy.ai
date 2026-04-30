import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(req: Request) {
  try {
    const { imageUrl, x, y, width, height } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Handle relative URLs
    let finalImageUrl = imageUrl;
    if (imageUrl.startsWith("/")) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
      finalImageUrl = `${baseUrl}${imageUrl}`;
      console.log(`[API] Resolved relative Image URL: ${finalImageUrl}`);
    }

    const ext = finalImageUrl.startsWith("data:image/png") ? "png" : "jpg";
    const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.${ext}`);
    const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.${ext}`);

    if (finalImageUrl.startsWith("data:")) {
      const base64Data = finalImageUrl.split(",")[1];
      fs.writeFileSync(tempInput, base64Data, "base64");
    } else {
      const res = await fetch(finalImageUrl);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(tempInput, Buffer.from(buffer));
    }

    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .outputOptions(["-frames:v 1", "-q:v 2"])
        .videoFilters(
          `crop=in_w*${width}/100:in_h*${height}/100:in_w*${x}/100:in_h*${y}/100`
        )
        .on("end", resolve)
        .on("error", (err) => {
          console.error("FFmpeg Error:", err);
          reject(err);
        })
        .save(tempOutput);
    });

    const outputBuffer = fs.readFileSync(tempOutput);
    const outputBase64 = `data:image/${ext};base64,${outputBuffer.toString("base64")}`;

    // Clean up
    fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

    return NextResponse.json({ success: true, outputUrl: outputBase64 });
  } catch (error: any) {
    console.error("Crop Failed:", error);
    return NextResponse.json({ error: error.message || "Failed to crop image" }, { status: 500 });
  }
}
