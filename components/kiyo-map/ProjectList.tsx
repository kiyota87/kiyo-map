"use client";

import { CategoryDot } from "@/components/kiyo-map/CategoryBadge";
import { ShapeIdeasTrigger } from "@/components/kiyo-map/ShapeIdeasDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  filterProjectsByCategory,
  isDeadlineNear,
} from "@/lib/kiyo-map/computed";
import { ALL_CATEGORY_ID, IDEA_CATEGORY, projectListTitle } from "@/lib/kiyo-map/labels";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/kiyo-map/schema";

type ProjectListProps = {
  projects: Project[];
  selectedCategoryId: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
};

function ProjectRow({
  project,
  active,
  onSelect,
}: {
  project: Project;
  active: boolean;
  onSelect: () => void;
}) {
  const urgent = isDeadlineNear(project.deadline, project.progress);

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
          active
            ? "kiyo-map-tab-active font-medium"
            : "text-[var(--kiyo-map-text-secondary)] hover:bg-[var(--kiyo-map-bg-card)]",
        )}
      >
        <CategoryDot category={project.category} urgent={urgent} />
        <span className="truncate">{projectListTitle(project)}</span>
      </button>
    </li>
  );
}

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
  const isIdeaCategory = selectedCategoryId === IDEA_CATEGORY;
  const ideaPool = isIdeaCategory
    ? filtered.filter((project) => project.status === "idea")
    : [];

  return (
    <aside className="kiyo-map-panel flex w-44 shrink-0 grow-0 flex-col">
      <div className="kiyo-map-pane-header flex h-12 shrink-0 items-center px-3">
        <h3 className="text-sm font-medium text-[var(--kiyo-map-text-primary)]">
          ????
        </h3>
      </div>
      {isIdeaCategory ? (
        <div className="shrink-0 border-b border-[color:var(--kiyo-map-border)] p-2">
          <ShapeIdeasTrigger ideas={ideaPool} />
        </div>
      ) : null}
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-0.5 p-2">
          {filtered.length === 0 ? (
            <li className="px-2 py-4 text-sm text-[var(--kiyo-map-text-muted)]">
              {isIdeaCategory
                ? "???????????????????"
                : "????????"}
            </li>
          ) : (
            filtered.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                active={project.id === selectedProjectId}
                onSelect={() => onSelectProject(project.id)}
              />
            ))
          )}
        </ul>
      </ScrollArea>
    </aside>
  );
}
