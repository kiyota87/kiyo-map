"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { requestShapeIdeas } from "@/lib/kiyo-map/client-api";
import type { ShapeIdeaPick } from "@/lib/kiyo-map/prompts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryBadge } from "@/components/kiyo-map/CategoryBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projectListTitle } from "@/lib/kiyo-map/labels";
import type { Project } from "@/lib/kiyo-map/schema";

type ShapeIdeasDialogProps = {
  ideas: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShapeIdeasDialog({
  ideas,
  open,
  onOpenChange,
}: ShapeIdeasDialogProps) {
  const { data, applyShapePick } = useKiyoMap();
  const [loading, setLoading] = useState(false);
  const [picks, setPicks] = useState<ShapeIdeaPick[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => new Set());

  const ideaIds = useMemo(
    () => ideas.map((idea) => idea.id).join(","),
    [ideas],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setPicks([]);
        setSummary(null);
        setAppliedIds(new Set());
        setLoading(false);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!open || ideas.length === 0) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on dialog open
    setLoading(true);

    requestShapeIdeas({
      ideas: ideas.map((idea) => ({
        id: idea.id,
        title: idea.title.trim() || idea.memo.slice(0, 48),
        memo: idea.memo,
        createdAt: idea.createdAt,
      })),
      categories: data.categories,
    })
      .then((result) => {
        if (cancelled) return;
        setPicks(result.picks);
        setSummary(result.summary ?? null);
        if (result.picks.length === 0) {
          toast.message("今すぐ形にする候補は見つかりませんでした");
        }
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(
          error instanceof Error ? error.message : "提案の取得に失敗しました",
        );
        handleOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, ideaIds, ideas, data.categories, handleOpenChange]);

  const handleApply = (pick: ShapeIdeaPick) => {
    applyShapePick(pick);
    setAppliedIds((prev) => new Set(prev).add(pick.projectId));
    toast.success("案件として進行中に移しました");
  };

  const titleById = useMemo(
    () =>
      new Map(
        ideas.map((idea) => [
          idea.id,
          idea.title.trim() ? idea.title : projectListTitle(idea),
        ]),
      ),
    [ideas],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-4">
        <DialogHeader>
          <DialogTitle>アイディアをかたちにする</DialogTitle>
          <DialogDescription>
            貯めたアイディアの中から、今動き出すとよいものをピックアップし、進め方を提案します。
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">考え中…</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {summary ? (
              <p className="text-sm text-muted-foreground">{summary}</p>
            ) : null}
            {picks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                提案はありません。アイディアを追加してから再度お試しください。
              </p>
            ) : (
              picks.map((pick) => {
                const applied = appliedIds.has(pick.projectId);
                return (
                  <Card key={pick.projectId}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-sm">
                          {titleById.get(pick.projectId) ?? pick.projectId}
                        </CardTitle>
                        <CategoryBadge category={pick.suggestedCategory} />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 text-sm">
                      <p>{pick.reason}</p>
                      <p>
                        <span className="text-muted-foreground">次: </span>
                        {pick.nextAction}
                      </p>
                      <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-2 text-xs">
                        {pick.plan}
                      </pre>
                      <Button
                        type="button"
                        size="sm"
                        disabled={applied}
                        onClick={() => handleApply(pick)}
                      >
                        {applied ? "反映済み" : "この案で進める"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type ShapeIdeasTriggerProps = {
  ideas: Project[];
};

export function ShapeIdeasTrigger({ ideas }: ShapeIdeasTriggerProps) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (ideas.length === 0) {
      toast.message("アイディアがまだありません");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        className="kiyo-map-btn-primary w-full"
        onClick={handleClick}
      >
        <Sparkles className="size-4" />
        アイディアをかたちにしよう
      </Button>
      <ShapeIdeasDialog ideas={ideas} open={open} onOpenChange={setOpen} />
    </>
  );
}
