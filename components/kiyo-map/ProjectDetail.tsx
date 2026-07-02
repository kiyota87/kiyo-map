"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";
import {
  InlineDateField,
  InlineFieldRow,
  InlineSelectField,
  InlineTextareaField,
  InlineTextField,
} from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
  statusLabel,
} from "@/lib/kiyo-map/labels";
import type { Project, ProjectPriority, ProjectStatus } from "@/lib/kiyo-map/schema";

type ProjectDetailProps = {
  project: Project | null;
  categories: string[];
  onDeleted?: (projectId: string) => void;
};

function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), "yyyy/MM/dd HH:mm", { locale: ja });
  } catch {
    return iso;
  }
}

export function ProjectDetail({
  project,
  categories,
  onDeleted,
}: ProjectDetailProps) {
  const { updateProject, deleteProject } = useKiyoMap();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!project) {
    return (
      <section className="flex min-w-0 flex-1 flex-col border-r border-border bg-background">
        <div className="flex h-12 shrink-0 items-center border-b border-border px-3">
          <h3 className="text-sm font-medium">詳細</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          案件を選択してください
        </div>
      </section>
    );
  }

  const patch = (fields: Partial<Project>, note?: string) => {
    updateProject(project.id, fields, note);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    onDeleted?.(project.id);
    setDeleteOpen(false);
    toast.success("案件を削除しました");
  };

  return (
    <>
      <section className="flex min-w-0 flex-1 flex-col border-r border-border bg-background">
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
          <h3 className="text-sm font-medium">詳細</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="案件を削除"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{project.category}</Badge>
              <Badge variant="secondary">{statusLabel(project.status)}</Badge>
              <Badge variant="outline">優先度 {project.priority}</Badge>
            </div>

            <InlineFieldRow label="タイトル">
              <InlineTextField
                value={project.title}
                onSave={(title) => patch({ title }, "タイトルを更新")}
                ariaLabel="案件タイトル"
              />
            </InlineFieldRow>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">進捗</span>
              <div className="flex items-center gap-2">
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {project.progress}%
                </span>
              </div>
              <InlineTextField
                value={String(project.progress)}
                inputType="number"
                onSave={(raw) => {
                  const n = Math.min(100, Math.max(0, Number(raw) || 0));
                  patch({ progress: n }, `進捗を ${n}% に更新`);
                }}
                ariaLabel="進捗率"
                className="max-w-24"
              />
            </div>

            <InlineFieldRow label="締切">
              <InlineDateField
                value={project.deadline ?? ""}
                onSave={(deadline) =>
                  patch({ deadline: deadline || null }, "締切を更新")
                }
                ariaLabel="締切"
              />
            </InlineFieldRow>

            <InlineFieldRow label="次のアクション">
              <InlineTextField
                value={project.nextAction}
                onSave={(nextAction) =>
                  patch({ nextAction }, "次のアクションを更新")
                }
                ariaLabel="次のアクション"
              />
            </InlineFieldRow>

            <InlineFieldRow label="状態">
              <InlineSelectField
                value={statusLabel(project.status)}
                options={Object.values(PROJECT_STATUS_LABELS)}
                onSave={(label) => {
                  const status = (
                    Object.entries(PROJECT_STATUS_LABELS) as [
                      ProjectStatus,
                      string,
                    ][]
                  ).find(([, v]) => v === label)?.[0];
                  if (status) patch({ status }, `状態を ${label} に変更`);
                }}
                ariaLabel="状態"
              />
            </InlineFieldRow>

            <InlineFieldRow label="カテゴリ">
              <InlineSelectField
                value={project.category}
                options={categories}
                onSave={(category) => patch({ category }, "カテゴリを変更")}
                ariaLabel="カテゴリ"
              />
            </InlineFieldRow>

            <InlineFieldRow label="優先度">
              <InlineSelectField
                value={project.priority}
                options={Object.values(PROJECT_PRIORITY_LABELS)}
                onSave={(priority) =>
                  patch(
                    { priority: priority as ProjectPriority },
                    `優先度を ${priority} に変更`,
                  )
                }
                ariaLabel="優先度"
              />
            </InlineFieldRow>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">メモ</CardTitle>
              </CardHeader>
              <CardContent>
                <InlineTextareaField
                  value={project.memo}
                  onSave={(memo) => patch({ memo }, "メモを更新")}
                  ariaLabel="メモ"
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium">更新履歴</h4>
              {project.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">履歴はありません</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {project.history.map((entry, index) => (
                    <li
                      key={`${entry.date}-${index}`}
                      className="flex flex-col gap-0.5 rounded-lg border border-border bg-card p-2"
                    >
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(entry.date)}
                      </span>
                      <span className="text-sm">{entry.content}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </ScrollArea>
      </section>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="案件を削除"
        itemName={project.title}
        onConfirm={handleDelete}
      />
    </>
  );
}
