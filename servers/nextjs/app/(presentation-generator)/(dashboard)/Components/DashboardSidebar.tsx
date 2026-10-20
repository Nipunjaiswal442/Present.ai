"use client";

import React from "react";
import { LayoutDashboard, LayoutTemplate, Settings, HelpCircle, UsersRound, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/community", label: "Community", icon: UsersRound },
];

function NavItem({
    href,
    label,
    icon: Icon,
    active,
    external,
}: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active?: boolean;
    external?: boolean;
}) {
    return (
        <Link
            prefetch={false}
            href={href}
            target={external ? "_blank" : undefined}
            aria-label={label}
            title={label}
            aria-current={active ? "page" : undefined}
            className={cn(
                "group flex w-full flex-col items-center gap-1.5 rounded-2xl px-2 py-2.5 text-[11px] font-medium transition-all duration-300",
                active
                    ? "bg-black text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                    : "text-black/55 hover:bg-black/[0.05] hover:text-black"
            )}
        >
            <Icon className="h-[18px] w-[18px]" />
            <span>{label}</span>
        </Link>
    );
}

const DashboardSidebar = () => {
    const pathname = usePathname();

    return (
        <>
        <nav aria-label="Mobile navigation" className="glass-strong fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-black/10 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden">
            <NavItem href="/dashboard" label="Home" icon={LayoutDashboard} active={pathname === "/dashboard"} />
            <NavItem href="/upload" label="New" icon={Plus} />
            <NavItem href="/templates" label="Templates" icon={LayoutTemplate} active={pathname?.startsWith("/templates")} />
            <NavItem href="/community" label="Community" icon={UsersRound} active={pathname?.startsWith("/community")} />
            <NavItem href="/settings" label="Settings" icon={Settings} active={pathname?.startsWith("/settings")} />
        </nav>
        <aside
            className="glass sticky top-0 z-40 m-3 mr-0 hidden h-[calc(100dvh-1.5rem)] w-[96px] shrink-0 flex-col justify-between rounded-[28px] px-3 py-5 md:flex"
            aria-label="Dashboard sidebar"
        >
            <div className="flex flex-col items-center gap-4">
                <Link href="/dashboard" aria-label="Present.ai home" className="grid h-10 w-10 place-items-center rounded-[13px] bg-black text-[15px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)]">
                    P
                </Link>
                <Link
                    href="/upload"
                    prefetch={false}
                    aria-label="New presentation"
                    title="New presentation"
                    className="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-black/[0.08] bg-white/70 px-2 py-2.5 text-[11px] font-medium text-black transition-all hover:bg-white"
                >
                    <Plus className="h-[18px] w-[18px]" />
                    <span>New</span>
                </Link>
                <nav className="w-full space-y-1 border-t border-black/[0.06] pt-3" aria-label="Dashboard sections">
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.href}
                            {...item}
                            active={pathname === item.href || pathname?.startsWith(`${item.href}/`)}
                        />
                    ))}
                </nav>
            </div>

            <div className="w-full space-y-1 border-t border-black/[0.06] pt-3">
                <NavItem href="/settings" label="Settings" icon={Settings} active={pathname?.startsWith("/settings")} />
                <NavItem href="https://docs.presenton.ai/help" label="Help" icon={HelpCircle} external />
            </div>
        </aside>
        </>
    );
};

export default DashboardSidebar;
