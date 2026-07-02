"use client";

import { useMemo } from "react";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  completedThisMonth,
  ideaProjects,
} from "@/lib/kiyo-map/computed";
import { projectListTitle } from "@/lib/kiyo-map/labels";

function currentMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function KiyoMapDashboard() {
  const { data, hydrated } = useKiyoMap();
  const month = currentMonth();

  const stats = useMemo(() => {
    const doneThisMonth = completedThisMonth(data.projects, month);
    const ideas = data.projects.filter((p) => p.status === "idea").length;
    const started = data.projects.filter(
      (p) => p.status === "in_progress",
    ).length;
    const totalActive = data.projects.filter((p) => p.status !== "done").length;
    const executionRate =
      totalActive > 0
        ? Math.round((started / totalActive) * 100)
        : 0;

    return { doneThisMonth, executionRate, ideas };
  }, [data.projects, month]);

  const ideas = useMemo(() => ideaProjects(data.projects), [data.projects]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        読み込み中…
      </div>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">今月完了</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {stats.doneThisMonth}件
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">実行率</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {stats.executionRate}%
              </p>
              <p className="text-xs text-muted-foreground">
                進行中 / アクティブ案件（簡易）
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">アイディアストック</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {stats.ideas}件
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">アイディア一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {ideas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                アイディアはありません
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ideas.map((project) => (
                  <Badge key={project.id} variant="secondary">
                    {projectListTitle(project)}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">進行中の案件</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.projects
              .filter((p) => p.status === "in_progress")
              .map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <span className="truncate">{project.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {project.progress}%
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          グラフ・月次トピックス・レポート出力は Phase 1 後半〜Phase 2 で追加予定です。
          データは Google ログインごとにブラウザの localStorage に保存されています。
        </p>
      </div>
    </ScrollArea>
  );
}
