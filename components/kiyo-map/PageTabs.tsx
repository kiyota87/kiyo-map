"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/kiyo-map/map", label: "案件マップ" },
  { href: "/kiyo-map/dashboard", label: "ダッシュボード" },
] as const;

export function PageTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="画面切替" className="flex shrink-0 gap-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
