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
        className="flex h-screen w-full flex-col overflow-hidden"
      >
        <KiyoMapHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <KiyoMapFooter />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#392171",
              border: "0.5px solid #523099",
              color: "#f8f4ff",
            },
          }}
        />
      </div>
    </KiyoMapProvider>
  );
}
