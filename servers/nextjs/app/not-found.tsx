import type { Metadata } from "next";
import Link from "next/link";
import Wordmark from "@/components/pai/Wordmark";

export const metadata: Metadata = {
  title: "Page not found | Present.ai",
};

export default function NotFound() {
  return (
    <main className="pai-canvas flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="glass-strong pai-fall w-full max-w-md rounded-[28px] p-9">
        <div className="flex justify-center">
          <Wordmark href="/" />
        </div>
        <p className="pai-eyebrow mt-8">404</p>
        <h1 className="pai-display mt-3 text-[34px] text-black">Nothing here.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-black/55">
          That page does not exist. Every great presentation starts with a blank slide, though.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="pai-btn pai-btn-black">Go to dashboard</Link>
          <Link href="/" className="pai-btn pai-btn-ghost">Back to start</Link>
        </div>
      </div>
    </main>
  );
}
