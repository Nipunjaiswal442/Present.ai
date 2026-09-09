import Link from "next/link";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  href?: string;
  className?: string;
  /** "light" renders white on dark surfaces. */
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-[15px]",
  md: "text-[17px]",
  lg: "text-[22px]",
};

/**
 * Present.ai wordmark: a black rounded mark with a white "P" plus a tight wordmark.
 */
export default function Wordmark({ href = "/", className, tone = "dark", size = "md" }: WordmarkProps) {
  const isLight = tone === "light";
  const content = (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span
        aria-hidden
        className={cn(
          "grid h-7 w-7 place-items-center rounded-[9px] text-[13px] font-bold leading-none",
          isLight ? "bg-white text-black" : "bg-black text-white"
        )}
        style={{ boxShadow: isLight ? "0 6px 18px -8px rgba(255,255,255,.6)" : "0 6px 18px -8px rgba(0,0,0,.7)" }}
      >
        P
      </span>
      <span
        className={cn(
          "font-semibold tracking-[-0.03em]",
          sizes[size],
          isLight ? "text-white" : "text-black"
        )}
      >
        Present<span className={isLight ? "text-white/60" : "text-black/50"}>.ai</span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Present.ai home" className="inline-flex items-center">
      {content}
    </Link>
  );
}
