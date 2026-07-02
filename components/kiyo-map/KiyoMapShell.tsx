"use client";

import type { ReactNode } from "react";

import { KiyoMapProvider } from "@/components/kiyo-map/KiyoMapProvider";
import { PageTabs } from "@/components/kiyo-map/PageTabs";
import { QuickMemoBar } from "@/components/kiyo-map/QuickMemoBar";

type KiyoMapShellProps = {
  userEmail: string;
  children: ReactNode;
};

export function KiyoMapShell({ userEmail, children }: KiyoMapShellProps) {
  return (
    <KiyoMapProvider userEmail={userEmail}>
      <div
        data-workspace="kiyo-map"
        className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground"
      >
        <QuickMemoBar />
        <PageTabs />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </KiyoMapProvider>
  );
}
