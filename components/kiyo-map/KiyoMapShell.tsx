"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { KiyoMapProvider } from "@/components/kiyo-map/KiyoMapProvider";
import { KiyoMapFooter, KiyoMapHeader } from "@/components/kiyo-map/KiyoMapChrome";

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
        <KiyoMapHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <KiyoMapFooter />
        <Toaster richColors closeButton />
      </div>
    </KiyoMapProvider>
  );
}
