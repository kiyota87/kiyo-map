"use client";

import { useMemo, useState } from "react";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import {
  InlineFieldRow,
  InlineSelectField,
  InlineTextField,
} from "@/components/primitives";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/lib/kiyo-map/labels";
import type { ProjectPriority, ProjectStatus } from "@/lib/kiyo-map/schema";

type InboxTriageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type DraftState = {
  title: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
};

export function InboxTriageSheet({
  open,
  onOpenChange,
}: InboxTriageSheetProps) {
  const { data, resolveInboxItem } = useKiyoMap();
  const pending = useMemo(
    () => data.inbox.filter((item) => !item.resolved),
    [data.inbox],
  );
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});

  const getDraft = (id: string, text: string): DraftState => {
    const existing = drafts[id];
    if (existing) return existing;
    return {
      title: text.slice(0, 48),
      category: data.categories[0] ?? "総務",
      status: "idea",
      priority: "B",
    };
  };

  const updateDraft = (id: string, patch: Partial<DraftState>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...getDraft(id, pending.find((p) => p.id === id)?.text ?? ""), ...patch },
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>未整理メモ</SheetTitle>
          <SheetDescription>
            メモを案件に振り分けて確定します。AI 仮提案は Phase 1 後半で追加予定です。
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              未整理のメモはありません。
            </p>
          ) : (
            pending.map((item) => {
              const draft = getDraft(item.id, item.text);
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <p className="text-sm">{item.text}</p>
                  <InlineFieldRow label="タイトル">
                    <InlineTextField
                      value={draft.title}
                      onSave={(title) => updateDraft(item.id, { title })}
                      ariaLabel="案件タイトル"
                    />
                  </InlineFieldRow>
                  <InlineFieldRow label="カテゴリ">
                    <InlineSelectField
                      value={draft.category}
                      options={data.categories}
                      onSave={(category) => updateDraft(item.id, { category })}
                      ariaLabel="カテゴリ"
                    />
                  </InlineFieldRow>
                  <InlineFieldRow label="状態">
                    <InlineSelectField
                      value={PROJECT_STATUS_LABELS[draft.status]}
                      options={Object.values(PROJECT_STATUS_LABELS)}
                      onSave={(label) => {
                        const status = (
                          Object.entries(PROJECT_STATUS_LABELS) as [
                            ProjectStatus,
                            string,
                          ][]
                        ).find(([, v]) => v === label)?.[0];
                        if (status) updateDraft(item.id, { status });
                      }}
                      ariaLabel="状態"
                    />
                  </InlineFieldRow>
                  <InlineFieldRow label="優先度">
                    <InlineSelectField
                      value={draft.priority}
                      options={Object.values(PROJECT_PRIORITY_LABELS)}
                      onSave={(priority) =>
                        updateDraft(item.id, {
                          priority: priority as ProjectPriority,
                        })
                      }
                      ariaLabel="優先度"
                    />
                  </InlineFieldRow>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      resolveInboxItem(item.id, draft);
                      setDrafts((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      });
                    }}
                  >
                    案件として確定
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
