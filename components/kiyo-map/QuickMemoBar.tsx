"use client";

import { useState, type FormEvent } from "react";
import { Lightbulb } from "lucide-react";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InboxTriageSheet } from "@/components/kiyo-map/InboxTriageSheet";

export function QuickMemoBar() {
  const { unresolvedInboxCount, addInboxMemo } = useKiyoMap();
  const [text, setText] = useState("");
  const [inboxOpen, setInboxOpen] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addInboxMemo(text);
    setText("");
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2">
        <Lightbulb className="size-4 shrink-0 text-muted-foreground" />
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ふと思ったことを入力…"
            aria-label="クイックメモ"
            className="h-8 bg-background"
          />
          <Button type="submit" size="sm" variant="secondary">
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
