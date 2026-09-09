import React from "react";

import UploadPage from "./components/UploadPage";
import Header from "@/app/(presentation-generator)/(dashboard)/dashboard/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New presentation | Present.ai",
  description:
    "Open-source AI presentation generator with custom layouts, multi-model support (OpenAI, Gemini, Ollama), and PDF/PPTX export. A free Gamma alternative.",
  alternates: {
    canonical: "https://present-ai.vercel.app/upload",
  },
  keywords: [
    "presentation generator",
    "AI presentations",
    "data visualization",
    "automatic presentation maker",
    "professional slides",
    "data-driven presentations",
    "document to presentation",
    "presentation automation",
    "smart presentation tool",
    "business presentations",
  ],
  openGraph: {
    title: "New presentation | Present.ai",
    description:
      "Open-source AI presentation generator with custom layouts, multi-model support (OpenAI, Gemini, Ollama), and PDF/PPTX export. A free Gamma alternative.",
    type: "website",
    url: "https://present-ai.vercel.app/upload",
    siteName: "Present.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "New presentation | Present.ai",
    description:
      "Open-source AI presentation generator with custom layouts, multi-model support (OpenAI, Gemini, Ollama), and PDF/PPTX export. A free Gamma alternative.",
  },
};

const page = () => {
  return (
    <div className="relative min-h-dvh pb-10">
      <Header />
      <div className="mb-10 mt-10 flex flex-col items-center justify-center px-4 text-center sm:mt-14">
        <p className="pai-fall pai-eyebrow">New presentation</p>
        <h1 className="pai-fall pai-delay-1 pai-display mt-4 text-[40px] text-black sm:text-[56px] lg:text-[68px]">
          What are we presenting?
        </h1>
        <p className="pai-fall pai-delay-2 mt-4 max-w-xl text-[16px] text-black/55 sm:text-[18px]">
          Describe the talk or drop a document. Present.ai writes the outline, then the deck.
        </p>
      </div>

      <UploadPage />
    </div>
  );
};

export default page;
