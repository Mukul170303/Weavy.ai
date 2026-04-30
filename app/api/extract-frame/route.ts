import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobe from "ffprobe-static";
import fs from "fs";
import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobe.path);

export async function POST(req: Request) {
  console.log("🎞️ [API] Extract Frame Request Received");
  try {
    const body = await req.json();
    const sourceUrl = body.sourceUrl || body.videoUrl;
    const { timestamp } = body;

    if (!sourceUrl) {
      return NextResponse.json({ error: "Source URL is required" }, { status: 400 });
    }

    // Handle relative URLs
    let finalSourceUrl = sourceUrl;
    if (sourceUrl.startsWith("/")) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
      finalSourceUrl = `${baseUrl}${sourceUrl}`;
      console.log(`[API] Resolved relative Video URL: ${finalSourceUrl}`);
    }

    const inputExt = finalSourceUrl.includes(".webm") ? "webm" : "mp4";
    const tempInput = path.join(os.tmpdir(), `input_vid_${Date.now()}.${inputExt}`);
    const tempOutput = path.join(os.tmpdir(), `output_frame_${Date.now()}.jpg`);

    if (finalSourceUrl.startsWith("data:")) {
      const base64Data = finalSourceUrl.split(",")[1];
      fs.writeFileSync(tempInput, base64Data, "base64");
    } else {
      const res = await fetch(finalSourceUrl);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(tempInput, Buffer.from(buffer));
    }

    // Handle percentage-based timestamps
    let finalTimestamp = timestamp || "00:00:01";
    if (finalTimestamp.endsWith("%")) {
      const percentage = parseFloat(finalTimestamp.replace("%", ""));
      if (!isNaN(percentage)) {
        const duration = await new Promise<number>((resolve, reject) => {
          ffmpeg.ffprobe(tempInput, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration || 0);
          });
        });
        if (duration > 0) {
          finalTimestamp = ((duration * percentage) / 100).toString();
        }
      }
    }

    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .screenshots({
          timestamps: [finalTimestamp],
          filename: path.basename(tempOutput),
          folder: path.dirname(tempOutput),
        })
        .on("end", resolve)
        .on("error", (err) => {
          console.error("FFmpeg Error:", err);
          reject(err);
        });
    });

    const outputBuffer = fs.readFileSync(tempOutput);
    const outputBase64 = `data:image/jpeg;base64,${outputBuffer.toString("base64")}`;

    // Clean up
    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

    return NextResponse.json({ success: true, outputUrl: outputBase64 });
  } catch (error: any) {
    console.error("Extract Frame Failed:", error);
    return NextResponse.json({ error: error.message || "Failed to extract frame" }, { status: 500 });
  }
}
