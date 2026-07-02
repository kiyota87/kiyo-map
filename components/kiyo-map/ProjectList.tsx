"use client";

import { cn } from "@/lib/utils";
import {
  filterProjectsByCategory,
  statusDotClass,
} from "@/lib/kiyo-map/computed";
import { ALL_CATEGORY_ID } from "@/lib/kiyo-map/labels";
import type { Project } from "@/lib/kiyo-map/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

type ProjectListProps = {
  projects: Project[];
  selectedCategoryId: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
};

export function ProjectList({
  projects,
  selectedCategoryId,
  selectedProjectId,
  onSelectProject,
}: ProjectListProps) {
  const filtered = filterProjectsByCategory(
    projects,
    selectedCategoryId,
    ALL_CATEGORY_ID,
  );

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30 lg:w-64">
      <div className="flex h-12 shrink-0 items-center border-b border-border px-3">
        <h3 className="text-sm font-medium">案件一覧</h3>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-0.5 p-2">
          {filtered.length === 0 ? (
            <li className="px-2 py-4 text-sm text-muted-foreground">
              案件がありません
            </li>
          ) : (
            filtered.map((project) => {
              const active = project.id === selectedProjectId;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-card text-foreground"
                        : "text-foreground hover:bg-card/60",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        statusDotClass(
                          project.status,
                          project.deadline,
                          project.progress,
                        ),
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{project.title}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </ScrollArea>
    </aside>
  );
}
