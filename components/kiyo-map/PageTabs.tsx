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
    <nav
      aria-label="画面切替"
      className="flex shrink-0 gap-1 border-b border-border bg-background px-3"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
