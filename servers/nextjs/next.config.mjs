import path from "node:path";
import { fileURLToPath } from "node:url";

const nextjsRoot = path.dirname(fileURLToPath(import.meta.url));
const isElectronBuild = process.env.PRESENTON_ELECTRON_BUILD === "true";

const nextConfig = {
  reactStrictMode: false,
  // Docker, Electron and start.js expect .next-build; Vercel's Next.js builder
  // only reads the default .next directory.
  distDir: process.env.VERCEL ? ".next" : ".next-build",
  output: "standalone",
  // Generation and file rendering can exceed Next's 30-second proxy default.
  experimental: { proxyTimeout: 300_000 },
  async headers() {
    return [{
      source: "/sw.js",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    }];
  },
  turbopack: {
    root: nextjsRoot,
  },
  ...(process.env.NODE_ENV !== "production"
    ? {
        allowedDevOrigins: [
          "127.0.0.1",
          "localhost",
        ],
      }
    : {}),

  images: {
    // A packaged Electron app is installed under a read-only directory such as
    // /opt/Presenton. Next's optimizer writes to <distDir>/cache, so emit direct
    // image URLs for that build instead of attempting runtime cache writes.
    unoptimized: isElectronBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-7c765f3726084c52bcd5d180d51f1255.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pptgen-public.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "pptgen-public.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "present-for-me.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "yefhrkuqbjcblofdcpnr.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
    ],
  },
  
};

export default nextConfig;
