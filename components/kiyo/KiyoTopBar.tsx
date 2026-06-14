import { signOut } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type KiyoTopBarProps = {
  userEmail: string;
};

export function KiyoTopBar({ userEmail }: KiyoTopBarProps) {
  return (
    <header className="kiyo-panel flex h-12 shrink-0 items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Sparkles className="size-5 text-[var(--kiyo-accent-yellow)]" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--kiyo-text-primary)]">
            AIオーケストレーション・kiyoワークスペース
          </span>
          <span className="text-xs text-[var(--kiyo-text-muted)]">
            Research → Output
          </span>
        </div>
        <span className="kiyo-badge px-2 py-0.5 text-xs">Phase 1</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-[var(--kiyo-text-muted)] sm:inline">
          {userEmail}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-[var(--kiyo-text-secondary)] hover:bg-[var(--kiyo-bg-card)] hover:text-[var(--kiyo-text-primary)]"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          ログアウト
        </Button>
      </div>
    </header>
  );
}
