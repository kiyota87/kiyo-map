import type { Project, ProjectStatus } from "@/lib/kiyo-map/schema";

const MS_PER_DAY = 86_400_000;

export function isDeadlineNear(
  deadline: string | null,
  progress: number,
  withinDays = 7,
): boolean {
  if (!deadline || progress >= 100) return false;
  const due = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  const diff = due.getTime() - Date.now();
  return diff >= 0 && diff <= withinDays * MS_PER_DAY;
}

export function statusDotClass(
  status: ProjectStatus,
  deadline: string | null,
  progress: number,
): string {
  if (isDeadlineNear(deadline, progress)) {
    return "bg-destructive";
  }
  switch (status) {
    case "in_progress":
      return "bg-primary";
    case "idea":
      return "bg-muted-foreground/50";
    case "on_hold":
      return "bg-muted-foreground";
    case "done":
      return "bg-muted-foreground/30";
    default:
      return "bg-muted-foreground/50";
  }
}

export function filterProjectsByCategory(
  projects: Project[],
  categoryId: string,
  allCategoryId: string,
): Project[] {
  if (categoryId === allCategoryId) return projects;
  return projects.filter((p) => p.category === categoryId);
}

export function countByCategory(
  projects: Project[],
  categories: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of categories) {
    counts[category] = projects.filter((p) => p.category === category).length;
  }
  return counts;
}

export function completedThisMonth(projects: Project[], month: string): number {
  return projects.filter(
    (p) =>
      p.status === "done" &&
      p.completedAt != null &&
      p.completedAt.startsWith(month),
  ).length;
}

export function ideaProjects(projects: Project[]): Project[] {
  return projects.filter((p) => p.status === "idea");
}
