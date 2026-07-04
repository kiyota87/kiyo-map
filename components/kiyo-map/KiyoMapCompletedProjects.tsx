"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CategoryBadge } from "@/components/kiyo-map/CategoryBadge";
import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { completedProjects } from "@/lib/kiyo-map/computed";
import { projectListTitle, statusLabel } from "@/lib/kiyo-map/labels";
import type { Project } from "@/lib/kiyo-map/schema";

function formatCompletedAt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "yyyy/MM/dd", { locale: ja });
  } catch {
    return iso;
  }
}

function CompletedProjectCard({ project }: { project: Project }) {
  const { reopenProject } = useKiyoMap();
  const router = useRouter();

  const handleReopen = () => {
    reopenProject(project.id);
    toast.success("進行中に戻しました");
    router.push("/kiyo-map/map");
  };

  return (
    <Card className="kiyo-map-card border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <CardTitle className="text-base text-[var(--kiyo-map-text-primary)]">
              {projectListTitle(project)}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={project.category} />
              <span className="kiyo-map-status-badge">{statusLabel(project.status)}</span>
              <span className="text-xs text-[var(--kiyo-map-text-muted)]">
                完了日 {formatCompletedAt(project.completedAt)}
              </span>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="kiyo-map-btn-primary shrink-0"
            onClick={handleReopen}
          >
            <RotateCcw className="size-4" />
            進行中に戻す
          </Button>
        </div>
      </CardHeader>
      {project.memo.trim() ? (
        <CardContent>
          <p className="text-sm whitespace-pre-wrap text-[var(--kiyo-map-text-muted)]">
            {project.memo}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function KiyoMapCompletedProjects() {
  const { data, hydrated } = useKiyoMap();
  const completed = completedProjects(data.projects);

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
        <p className="text-sm text-[var(--kiyo-map-text-muted)]">
          完了した案件の一覧です。「進行中に戻す」で案件マップに戻して再開できます。
        </p>
        {completed.length === 0 ? (
          <Card className="kiyo-map-card border-0 shadow-none">
            <CardContent className="py-8 text-center text-sm text-[var(--kiyo-map-text-muted)]">
              完了した案件はまだありません
            </CardContent>
          </Card>
        ) : (
          completed.map((project) => (
            <CompletedProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
