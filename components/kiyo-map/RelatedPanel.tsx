"use client";

import { CategoryDot } from "@/components/kiyo-map/CategoryBadge";
import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { InlineTextareaField } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { projectListTitle } from "@/lib/kiyo-map/labels";
import type { Project } from "@/lib/kiyo-map/schema";

type RelatedPanelProps = {
  project: Project | null;
  allProjects: Project[];
  onSelectProject: (id: string) => void;
};

export function RelatedPanel({
  project,
  allProjects,
  onSelectProject,
}: RelatedPanelProps) {
  const { updateProject } = useKiyoMap();

  if (!project) {
    return (
      <aside className="kiyo-map-panel flex min-w-0 flex-[2] flex-col">
        <div className="kiyo-map-pane-header flex h-12 shrink-0 items-center px-3">
          <h3 className="text-sm font-medium text-[var(--kiyo-map-text-primary)]">
            関連情報
          </h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-[var(--kiyo-map-text-muted)]">
          案件を選択してください
        </div>
      </aside>
    );
  }

  const related = project.relatedProjectIds
    .map((id) => allProjects.find((p) => p.id === id))
    .filter((p): p is Project => p != null);

  const linkable = allProjects.filter(
    (p) => p.id !== project.id && !project.relatedProjectIds.includes(p.id),
  );

  return (
    <aside className="kiyo-map-panel flex min-w-0 flex-[2] flex-col">
      <div className="kiyo-map-pane-header flex h-12 shrink-0 items-center px-3">
        <h3 className="text-sm font-medium text-[var(--kiyo-map-text-primary)]">
          関連情報
        </h3>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3">
          <Card className="kiyo-map-card border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
                関連案件
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {related.length === 0 ? (
                <p className="text-sm text-[var(--kiyo-map-text-muted)]">
                  関連案件はありません
                </p>
              ) : (
                related.map((rel) => (
                  <Button
                    key={rel.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start gap-2 px-2 py-1.5 text-left text-[var(--kiyo-map-text-secondary)] hover:bg-[var(--kiyo-map-bg-card)] hover:text-[var(--kiyo-map-text-primary)]"
                    onClick={() => onSelectProject(rel.id)}
                  >
                    <CategoryDot category={rel.category} />
                    {projectListTitle(rel)}
                  </Button>
                ))
              )}
              {linkable.length > 0 ? (
                <>
                  <Separator className="bg-[var(--kiyo-map-border)]" />
                  <p className="text-xs text-[var(--kiyo-map-text-muted)]">リンクを追加</p>
                  {linkable.slice(0, 5).map((candidate) => (
                    <Button
                      key={candidate.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto justify-start gap-2 px-2 py-1.5 text-left text-[var(--kiyo-map-text-secondary)] hover:bg-[var(--kiyo-map-bg-card)]"
                      onClick={() =>
                        updateProject(
                          project.id,
                          {
                            relatedProjectIds: [
                              ...project.relatedProjectIds,
                              candidate.id,
                            ],
                          },
                          `関連案件「${projectListTitle(candidate)}」を追加`,
                        )
                      }
                    >
                      <CategoryDot category={candidate.category} />
                      + {projectListTitle(candidate)}
                    </Button>
                  ))}
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="kiyo-map-card border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
                社内メモ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InlineTextareaField
                value={project.relatedNotes}
                onSave={(relatedNotes) =>
                  updateProject(project.id, { relatedNotes }, "社内メモを更新")
                }
                ariaLabel="社内メモ"
              />
            </CardContent>
          </Card>

          <Card className="kiyo-map-card border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--kiyo-map-text-primary)]">
                AIナレッジ
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {project.relatedAiKnowledge ? (
                <p className="text-sm whitespace-pre-wrap text-[var(--kiyo-map-text-secondary)]">
                  {project.relatedAiKnowledge}
                </p>
              ) : (
                <p className="text-sm text-[var(--kiyo-map-text-muted)]">
                  未生成です。API 連携は Phase 1 後半で追加予定です。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </aside>
  );
}
