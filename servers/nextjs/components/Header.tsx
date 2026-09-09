"use client";

import React from "react";
import Link from "next/link";
import { Layout, Plus } from "lucide-react";
import Wordmark from "@/components/pai/Wordmark";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4">
      <div className="glass pai-fall-soft mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full pl-5 pr-2">
        <Wordmark href="/dashboard" />
        <nav className="flex items-center gap-1">
          <Link href="/custom-layout" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.05] hover:text-black">
            <Plus className="h-4 w-4" />
            <span>Create template</span>
          </Link>
          <Link href="/template-preview" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-black/70 transition-colors hover:bg-black/[0.05] hover:text-black">
            <Layout className="h-4 w-4" />
            <span>Templates</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
