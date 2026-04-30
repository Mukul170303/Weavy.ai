import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "assets.weavy.ai",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "nrhlbmrdkmazxuphgbdj.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  serverExternalPackages: [
    "ffmpeg-static",
    "ffprobe-static",
    "@ffmpeg-installer/ffmpeg",
    "fluent-ffmpeg",
    "sharp",
    "transloadit"
  ],
};

export default nextConfig;
