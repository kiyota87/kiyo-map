import type { ProjectStatus, ProjectPriority } from "@/lib/kiyo-map/schema";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: "アイディア",
  in_progress: "進行中",
  on_hold: "保留",
  done: "完了",
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  S: "S",
  A: "A",
  B: "B",
  C: "C",
};

export const ALL_CATEGORY_ID = "__all__";

export function statusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status];
}
