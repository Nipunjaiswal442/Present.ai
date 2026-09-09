"use client";

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    templates: "Templates",
    designs: "Smart",
    community: "Community",
    settings: "Settings",
    admin: "Admin",
    theme: "Themes",
};

const DashboardNav = () => {
    const pathname = usePathname();
    const activeTab = pathname.split("?")[0].split("/").pop() ?? "";
    const label = LABELS[activeTab] ?? (activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : "");

    return (
        <div className="pai-fall-soft sticky top-0 right-0 z-40 py-6">
            <div className="flex flex-col items-center justify-between gap-4 xl:flex-row xl:gap-0">
                <h3 className="pai-display text-[30px] text-black">
                    {label}
                </h3>
                <div className="flex gap-2.5 max-sm:w-full max-md:justify-center max-sm:flex-wrap">
                    {activeTab !== "playground" && activeTab !== "theme" && (
                        <Link
                            href="/upload"
                            className="pai-btn pai-btn-black h-11"
                            aria-label="Create new presentation"
                        >
                            <span className="hidden md:inline">New presentation</span>
                            <span className="md:hidden">New</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                    {activeTab === "theme" && (
                        <Link
                            href="/theme?tab=new-theme"
                            className="pai-btn pai-btn-black h-11"
                            aria-label="Create new themes"
                        >
                            <span className="hidden md:inline">New theme</span>
                            <span className="md:hidden">New</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardNav
