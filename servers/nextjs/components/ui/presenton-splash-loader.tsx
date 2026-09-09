"use client";

import { cn } from "@/lib/utils";

interface PresentonSplashLoaderProps {
  message?: string;
  className?: string;
}

/** Minimum time the splash stays visible so the wordmark settles before the app appears. */
export const PRESENTON_SPLASH_MIN_DURATION_MS = 1400;

/**
 * Monochrome splash: the Present.ai wordmark settles in from above while a thin
 * progress line draws downward beneath it.
 */
export function PresentonSplashLoader({
  message = "Preparing your workspace",
  className,
}: PresentonSplashLoaderProps) {
  return (
    <main
      aria-busy="true"
      aria-label={message}
      role="status"
      className={cn(
        "pai-canvas fixed inset-0 z-[2147483000] flex min-h-screen flex-col items-center justify-center overflow-hidden",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="pai-orb left-[20%] top-[-10%] h-[520px] w-[520px] bg-black/[0.06]" />
        <div className="pai-orb right-[10%] bottom-[-10%] h-[420px] w-[420px] bg-black/[0.05]" style={{ animationDelay: "-9s" }} />
      </div>
      <div className="pai-fall relative flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-black text-[22px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.7)]">
          P
        </span>
        <span className="text-[34px] font-semibold tracking-[-0.04em] text-black">
          Present<span className="text-black/45">.ai</span>
        </span>
      </div>
      <div className="pai-fall pai-delay-2 relative mt-8 h-8 w-px overflow-hidden">
        <span className="pai-drop-line absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
      </div>
      <p className="pai-fall pai-delay-3 mt-3 text-[13px] text-black/45">{message}</p>
    </main>
  );
}
