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
import { CategoryBadge } from "@/components/kiyo-map/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
  UNSET_LABEL,
  isIdeaDraft,
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
      <section className="kiyo-map-detail-pane flex min-w-0 flex-[3] flex-col">
        <div className="kiyo-map-pane-header flex h-12 shrink-0 items-center px-3">
          <h3 className="text-sm font-medium text-[var(--kiyo-map-text-primary)]">??</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--kiyo-map-text-muted)]">
          ???????????
        </div>
      </section>
    );
  }

  const draftIdea = isIdeaDraft(project);

  const patch = (fields: Partial<Project>, note?: string) => {
    updateProject(project.id, fields, note);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    onDeleted?.(project.id);
    setDeleteOpen(false);
    toast.success("?????????");
  };

  return (
    <>
      <section className="kiyo-map-detail-pane flex min-w-0 flex-[3] flex-col">
        <div className="kiyo-map-pane-header flex h-12 shrink-0 items-center justify-between gap-2 px-3">
          <h3 className="text-sm font-medium text-[var(--kiyo-map-text-primary)]">??</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="?????"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4">
            {draftIdea ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="kiyo-map-status-badge">{statusLabel(project.status)}</span>
                </div>

                <Card className="kiyo-map-card border-0 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">??</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InlineTextareaField
                      value={project.memo}
                      onSave={(memo) => patch({ memo }, "?????")}
                      ariaLabel="??"
                    />
                  </CardContent>
                </Card>

                <p className="text-xs text-[var(--kiyo-map-text-muted)]">
                  ????????????????????????????????
                </p>

                <Separator />

                <div className="flex flex-col gap-4">
                  <h4 className="text-sm font-medium">?????????</h4>

                  <InlineFieldRow label="????">
                    <InlineTextField
                      value={project.title}
                      onSave={(title) => patch({ title }, "???????")}
                      ariaLabel="??????"
                      placeholder={UNSET_LABEL}
                    />
                  </InlineFieldRow>

                  <InlineFieldRow label="??">
                    <InlineDateField
                      value={project.deadline ?? ""}
                      onSave={(deadline) =>
                        patch({ deadline: deadline || null }, "?????")
                      }
                      ariaLabel="??"
                    />
                  </InlineFieldRow>

                  <InlineFieldRow label="???????">
                    <InlineTextField
                      value={project.nextAction}
                      onSave={(nextAction) =>
                        patch({ nextAction }, "??????????")
                      }
                      ariaLabel="???????"
                      placeholder={UNSET_LABEL}
                    />
                  </InlineFieldRow>

                  <InlineFieldRow label="???">
                    <InlineSelectField
                      value=""
                      options={Object.values(PROJECT_PRIORITY_LABELS)}
                      onSave={(priority) =>
                        patch(
                          { priority: priority as ProjectPriority },
                          `???? ${priority} ???`,
                        )
                      }
                      ariaLabel="???"
                      placeholder={UNSET_LABEL}
                    />
                  </InlineFieldRow>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={project.category} />
                  <span className="kiyo-map-status-badge">{statusLabel(project.status)}</span>
                  <span className="kiyo-map-status-badge">??? {project.priority}</span>
                </div>

                <InlineFieldRow label="????">
                  <InlineTextField
                    value={project.title}
                    onSave={(title) => patch({ title }, "???????")}
                    ariaLabel="??????"
                  />
                </InlineFieldRow>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--kiyo-map-text-muted)]">??</span>
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
                      patch({ progress: n }, `??? ${n}% ???`);
                    }}
                    ariaLabel="???"
                    className="max-w-24"
                  />
                </div>

                <InlineFieldRow label="??">
                  <InlineDateField
                    value={project.deadline ?? ""}
                    onSave={(deadline) =>
                      patch({ deadline: deadline || null }, "?????")
                    }
                    ariaLabel="??"
                  />
                </InlineFieldRow>

                <InlineFieldRow label="???????">
                  <InlineTextField
                    value={project.nextAction}
                    onSave={(nextAction) =>
                      patch({ nextAction }, "??????????")
                    }
                    ariaLabel="???????"
                  />
                </InlineFieldRow>

                <InlineFieldRow label="??">
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
                      if (status) patch({ status }, `??? ${label} ???`);
                    }}
                    ariaLabel="??"
                  />
                </InlineFieldRow>

                <InlineFieldRow label="????">
                  <InlineSelectField
                    value={project.category}
                    options={categories}
                    onSave={(category) => patch({ category }, "???????")}
                    ariaLabel="????"
                  />
                </InlineFieldRow>

                <InlineFieldRow label="???">
                  <InlineSelectField
                    value={project.priority}
                    options={Object.values(PROJECT_PRIORITY_LABELS)}
                    onSave={(priority) =>
                      patch(
                        { priority: priority as ProjectPriority },
                        `???? ${priority} ???`,
                      )
                    }
                    ariaLabel="???"
                  />
                </InlineFieldRow>

                <Card className="kiyo-map-card border-0 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">??</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InlineTextareaField
                      value={project.memo}
                      onSave={(memo) => patch({ memo }, "?????")}
                      ariaLabel="??"
                    />
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium">????</h4>
              {project.history.length === 0 ? (
                <p className="text-sm text-[var(--kiyo-map-text-muted)]">????????</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {project.history.map((entry, index) => (
                    <li
                      key={`${entry.date}-${index}`}
                      className="kiyo-map-card flex flex-col gap-0.5 p-2"
                    >
                      <span className="text-xs text-[var(--kiyo-map-text-muted)]">
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
        title="?????"
        itemName={project.title.trim() || UNSET_LABEL}
        onConfirm={handleDelete}
      />
    </>
  );
}
