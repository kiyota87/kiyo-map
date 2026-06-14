import { Plus } from "lucide-react";
import type { KiyoSession } from "@/lib/kiyo/types";
import { Button } from "@/components/ui/button";

type KiyoSidebarProps = {
  sessions: KiyoSession[];
  activeSessionId: string;
  onSelect: (sessionId: string) => void;
  onCreate: () => void;
};

export function KiyoSidebar({
  sessions,
  activeSessionId,
  onSelect,
  onCreate,
}: KiyoSidebarProps) {
  return (
    <aside className="kiyo-panel flex w-[180px] shrink-0 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--kiyo-accent-purple)] px-3 py-2">
        <span className="text-xs text-[var(--kiyo-text-muted)]">セッション</span>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-[var(--kiyo-accent-yellow)] hover:bg-[var(--kiyo-bg-card)]"
          onClick={onCreate}
          aria-label="新規セッション"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {sessions.map((session) => {
          const active = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelect(session.id)}
              className={`flex flex-col gap-0.5 rounded px-2 py-2 text-left transition-colors ${
                active
                  ? "bg-[var(--kiyo-bg-card)] text-[var(--kiyo-text-primary)]"
                  : "text-[var(--kiyo-text-secondary)] hover:bg-[var(--kiyo-bg-card)]/60"
              }`}
            >
              <span className="line-clamp-2 text-sm">{session.title}</span>
              <span className="text-[10px] text-[var(--kiyo-text-faint)]">
                {new Date(session.updatedAt).toLocaleDateString("ja-JP")}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
