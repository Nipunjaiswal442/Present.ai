import React from "react";

import { requireAppSession } from "@/utils/serverAuth";
import { ConfigurationInitializer } from "../ConfigurationInitializer";
import PageTransition from "@/components/pai/PageTransition";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAppSession();
  return (
    <div className="pai-canvas min-h-dvh">
      <ConfigurationInitializer>
        <PageTransition>{children}</PageTransition>
      </ConfigurationInitializer>
    </div>
  );
}
