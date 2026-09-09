"use client";
import { LayoutDashboard, Settings, Upload } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const HeaderNav = () => {

  const canChangeKeys = useSelector((state: RootState) => state.userConfig.can_change_keys);
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">

      <Link
        href="/dashboard"
        prefetch={false}
        className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.05] hover:text-black outline-none"
        role="menuitem"
        onClick={() => trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/dashboard" })}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span>
          Dashboard
        </span>
      </Link>
      {canChangeKeys && (
        <Link
          href="/settings"
          prefetch={false}
          className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.05] hover:text-black outline-none"
          role="menuitem"
          onClick={() => trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/settings" })}
        >
          <Settings className="h-4 w-4" />
          <span>
            Settings
          </span>
        </Link>
      )}
    </div>
  );
};

export default HeaderNav;
