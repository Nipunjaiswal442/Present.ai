"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Re-mounts children on route change so every interface page settles in from the top.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="pai-page min-h-dvh">
      {children}
    </div>
  );
}
