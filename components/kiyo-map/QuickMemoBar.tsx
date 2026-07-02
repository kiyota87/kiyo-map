"use client";

import { useState, type FormEvent } from "react";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { IDEA_CATEGORY } from "@/lib/kiyo-map/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InboxTriageSheet } from "@/components/kiyo-map/InboxTriageSheet";

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
      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-card px-3 py-2">
        <Lightbulb className="size-4 shrink-0 text-muted-foreground" />
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ふと思ったアイディアを入力…"
            aria-label="アイディア入力"
            className="h-8 min-w-0 flex-1 bg-background"
          />
          <Button type="submit" size="sm" variant="secondary" className="shrink-0">
            保存
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setInboxOpen(true)}
          className="shrink-0"
        >
          未整理
          {unresolvedInboxCount > 0 ? (
            <Badge variant="default" className="ml-1.5">
              {unresolvedInboxCount}
            </Badge>
          ) : null}
        </Button>
      </div>
      <InboxTriageSheet open={inboxOpen} onOpenChange={setInboxOpen} />
    </>
  );
}
