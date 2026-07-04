"use client";

import { useState, type FormEvent } from "react";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { InboxTriageSheet } from "@/components/kiyo-map/InboxTriageSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IDEA_CATEGORY } from "@/lib/kiyo-map/labels";

export function QuickMemoBar() {
  const { unresolvedInboxCount, addIdeaProject } = useKiyoMap();
  const [text, setText] = useState("");
  const [inboxOpen, setInboxOpen] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addIdeaProject(text);
    setText("");
    toast.success(`「${IDEA_CATEGORY}」に保存しました`);
  };

  return (
    <>
      <div className="kiyo-map-panel flex shrink-0 items-center gap-2 px-3 py-2">
        <Lightbulb className="size-4 shrink-0 text-[var(--kiyo-map-accent)]" />
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ふと思ったアイディアを入力…"
            aria-label="アイディア入力"
            className="kiyo-map-input h-8 min-w-0 flex-1"
          />
          <Button type="submit" size="sm" className="kiyo-map-btn-primary h-8 shrink-0">
            保存
          </Button>
        </form>
        <Button
          type="button"
          size="sm"
          className="kiyo-map-btn-primary h-8 shrink-0"
          onClick={() => setInboxOpen(true)}
        >
          未整理
          {unresolvedInboxCount > 0 ? (
            <span className="kiyo-map-badge ml-1.5 tabular-nums">
              {unresolvedInboxCount}
            </span>
          ) : null}
        </Button>
      </div>
      <InboxTriageSheet open={inboxOpen} onOpenChange={setInboxOpen} />
    </>
  );
}
