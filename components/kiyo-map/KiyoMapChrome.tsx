"use client";

import { PageTabs } from "@/components/kiyo-map/PageTabs";
import { KiyoMapTitle } from "@/components/kiyo-map/CategoryNav";
import { QuickMemoBar } from "@/components/kiyo-map/QuickMemoBar";
import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";

export function KiyoMapHeader() {
  const { data, hydrated } = useKiyoMap();

  return (
    <header className="kiyo-map-panel flex h-12 shrink-0 items-center justify-between gap-3 px-3">
      {hydrated ? (
        <KiyoMapTitle name={data.workspace.name} />
      ) : (
        <span className="text-sm text-[var(--kiyo-map-text-muted)]">読み込み中…</span>
      )}
      <PageTabs />
    </header>
  );
}

export function KiyoMapFooter() {
  return <QuickMemoBar />;
}
