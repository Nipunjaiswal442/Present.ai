"use client";

import Wrapper from "@/components/Wrapper";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { ArrowLeft } from "lucide-react";
import Wordmark from "@/components/pai/Wordmark";

const PATHS_WITH_HEADER_BACK = [
  "/upload",
  "/outline",
  "/documents-preview",
  "/template-preview",
] as const;

function pathMatches(pathname: string | null, base: string) {
  return pathname === base || pathname?.startsWith(`${base}/`) === true;
}

const Header = () => {
  const pathname = usePathname();
  const showHeaderBack = PATHS_WITH_HEADER_BACK.some((p) => pathMatches(pathname, p));

  const backToUpload =
    pathMatches(pathname, "/outline") || pathMatches(pathname, "/documents-preview");
  const backToTemplates = pathMatches(pathname, "/template-preview");

  const backHref = backToUpload ? "/upload" : backToTemplates ? "/templates" : "/dashboard";
  const backLabel = backToUpload
    ? "BACK"
    : backToTemplates
      ? "BACK"
      : "BACK";

  return (
    <div className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4">
      <Wrapper className="glass pai-fall-soft flex h-14 items-center justify-between rounded-full pl-5 pr-2">
        <div
          className="flex items-center gap-3"
          onClick={() => trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/dashboard" })}
        >
          <Wordmark href="/dashboard" />
        </div>
        <div className="flex items-center">
          {showHeaderBack ? (
            <Link
              href={backHref}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.05] hover:text-black"
              onClick={() =>
                trackEvent(MixpanelEvent.Navigation, { from: pathname, to: backHref })
              }
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="capitalize">{backLabel.toLowerCase()}</span>
            </Link>
          ) : null}
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;
