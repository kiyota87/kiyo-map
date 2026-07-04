"use client";

import { useMemo } from "react";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { completedThisMonth, ideaProjects } from "@/lib/kiyo-map/computed";
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
    const started = data.projects.filter((p) => p.status === "in_progress").length;
    const totalActive = data.projects.filter((p) => p.status !== "done").length;
    const executionRate =
      totalActive > 0 ? Math.round((started / totalActive) * 100) : 0;

    return { doneThisMonth, executionRate, ideas };
  }, [data.projects, month]);

  const ideas = useMemo(() => ideaProjects(data.projects), [data.projects]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--kiyo-map-text-muted)]">
        読み込み中…
      </div>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="kiyo-map-card border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
                今月完了
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums text-[var(--kiyo-map-text-primary)]">
                {stats.doneThisMonth}件
              </p>
            </CardContent>
          </Card>
          <Card className="kiyo-map-card border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
                実行率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums text-[var(--kiyo-map-text-primary)]">
                {stats.executionRate}%
              </p>
              <p className="text-xs text-[var(--kiyo-map-text-muted)]">
                進行中 / アクティブ案件（簡易）
              </p>
            </CardContent>
          </Card>
          <Card className="kiyo-map-card border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
                アイディアストック
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums text-[var(--kiyo-map-text-primary)]">
                {stats.ideas}件
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="kiyo-map-card border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
              アイディア一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ideas.length === 0 ? (
              <p className="text-sm text-[var(--kiyo-map-text-muted)]">
                アイディアはありません
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ideas.map((project) => (
                  <span
                    key={project.id}
                    className="kiyo-map-category-badge"
                    data-category={project.category}
                  >
                    {projectListTitle(project)}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="kiyo-map-card border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
              進行中の案件
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.projects
              .filter((p) => p.status === "in_progress")
              .map((project) => (
                <div
                  key={project.id}
                  className="kiyo-map-card flex items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="truncate text-[var(--kiyo-map-text-primary)]">
                    {projectListTitle(project)}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--kiyo-map-text-muted)]">
                    {project.progress}%
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>

        <p className="text-xs text-[var(--kiyo-map-text-muted)]">
          グラフ・月次トピックス・レポート出力は Phase 1 後半〜Phase 2 で追加予定です。
          データは Google ログインごとにブラウザの localStorage に保存されています。
        </p>
      </div>
    </ScrollArea>
  );
}
