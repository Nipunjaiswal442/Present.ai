"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms before the element settles in once it enters the viewport. */
  delay?: number;
  as?: ElementType;
  once?: boolean;
  style?: CSSProperties;
}

/**
 * Scroll-triggered "fall in" reveal. Elements start slightly above their resting
 * position and settle down into place when they enter the viewport.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  once = true,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add("is-in");
            if (once) observer.unobserve(node);
          } else if (!once) {
            node.classList.remove("is-in");
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const Component = Tag as ElementType;
  return (
    <Component
      ref={ref}
      className={cn("pai-reveal", className)}
      style={{ ...style, ["--pai-reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}
