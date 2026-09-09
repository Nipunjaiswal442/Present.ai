import type { Metadata } from "next";
import localFont from "next/font/local";
import { Manrope, Syne, Unbounded } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";
import MixpanelInitializer from "./MixpanelInitializer";
import { Toaster } from "@/components/ui/sonner";
import TailwindBrowserRuntime from "@/components/runtime/TailwindBrowserRuntime";
import JsonBodyGuard from "@/components/runtime/JsonBodyGuard";
const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  preload: false,
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://present-ai.vercel.app"),
  title: "Present.ai — Open source AI presentation generator",
  description:
    "Present.ai turns a prompt or a document into a finished, fully editable deck. Open source, self-hosted, works with OpenAI, Gemini, Anthropic, Ollama and more. PPTX and PDF export.",
  keywords: [
    "AI presentation generator",
    "data storytelling",
    "data visualization tool",
    "AI data presentation",
    "presentation generator",
    "data to presentation",
    "interactive presentations",
    "professional slides",
  ],
  openGraph: {
    title: "Present.ai — Open source AI presentation generator",
    description:
      "Present.ai turns a prompt or a document into a finished, fully editable deck. Open source, self-hosted, works with OpenAI, Gemini, Anthropic, Ollama and more. PPTX and PDF export.",
    url: "https://present-ai.vercel.app",
    siteName: "Present.ai",
    images: [],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://present-ai.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Present.ai — Open source AI presentation generator",
    description:
      "Present.ai turns a prompt or a document into a finished, fully editable deck. Open source, self-hosted, works with OpenAI, Gemini, Anthropic, Ollama and more. PPTX and PDF export.",
    
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${syne.variable} ${manrope.variable} ${unbounded.variable} antialiased`}
      >
        <JsonBodyGuard />
        <Providers>
          <MixpanelInitializer>

            {children}

          </MixpanelInitializer>
        </Providers>
        <TailwindBrowserRuntime />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
