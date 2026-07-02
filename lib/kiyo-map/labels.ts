import type { ProjectStatus, ProjectPriority, Project } from "@/lib/kiyo-map/schema";

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

/** クイックメモで貯めるアイディア置き場（大分類） */
export const IDEA_CATEGORY = "アイディア";

export function statusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status];
}

/** 未設定フィールドの表示ラベル */
export const UNSET_LABEL = "未入力";

export function projectListTitle(project: Pick<Project, "title">): string {
  return project.title.trim() || UNSET_LABEL;
}

/** クイックメモ直後など、詳細未入力のアイディア */
export function isIdeaDraft(
  project: Pick<Project, "status" | "title">,
): boolean {
  return project.status === "idea" && !project.title.trim();
}
