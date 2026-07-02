"use client";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import {
  InlineTextareaField,
} from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
      <aside className="flex min-w-0 flex-1 flex-col bg-muted/20">
        <div className="flex h-12 shrink-0 items-center border-b border-border px-3">
          <h3 className="text-sm font-medium">関連情報</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
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
    <aside className="flex min-w-0 flex-1 flex-col bg-muted/20">
      <div className="flex h-12 shrink-0 items-center border-b border-border px-3">
        <h3 className="text-sm font-medium">関連情報</h3>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">関連案件</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {related.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  関連案件はありません
                </p>
              ) : (
                related.map((rel) => (
                  <Button
                    key={rel.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start px-2 py-1.5 text-left"
                    onClick={() => onSelectProject(rel.id)}
                  >
                    {rel.title}
                  </Button>
                ))
              )}
              {linkable.length > 0 ? (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground">リンクを追加</p>
                  {linkable.slice(0, 5).map((candidate) => (
                    <Button
                      key={candidate.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto justify-start px-2 py-1.5 text-left"
                      onClick={() =>
                        updateProject(
                          project.id,
                          {
                            relatedProjectIds: [
                              ...project.relatedProjectIds,
                              candidate.id,
                            ],
                          },
                          `関連案件「${candidate.title}」を追加`,
                        )
                      }
                    >
                      + {candidate.title}
                    </Button>
                  ))}
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">社内メモ</CardTitle>
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AIナレッジ</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {project.relatedAiKnowledge ? (
                <p className="text-sm whitespace-pre-wrap">
                  {project.relatedAiKnowledge}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
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
