"use client";

import { cn } from "@/lib/utils";
import {
  filterProjectsByCategory,
  partitionProjectsForList,
  statusDotClass,
} from "@/lib/kiyo-map/computed";
import { ALL_CATEGORY_ID, IDEA_CATEGORY } from "@/lib/kiyo-map/labels";
import type { Project } from "@/lib/kiyo-map/schema";
import { ShapeIdeasTrigger } from "@/components/kiyo-map/ShapeIdeasDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  muted = false,
}: {
  project: Project;
  active: boolean;
  onSelect: () => void;
  muted?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
          active
            ? "bg-card text-foreground"
            : "text-foreground hover:bg-card/60",
          muted && "opacity-70",
        )}
      >
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            statusDotClass(project.status, project.deadline, project.progress),
          )}
          aria-hidden
        />
        <span className="truncate">{project.title}</span>
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
  const { active, completed } = partitionProjectsForList(filtered);
  const isIdeaCategory = selectedCategoryId === IDEA_CATEGORY;
  const ideaPool = isIdeaCategory
    ? filtered.filter((project) => project.status === "idea")
    : [];

  return (
    <aside className="flex min-w-0 flex-1 flex-col border-r border-border bg-muted/30">
      <div className="flex h-12 shrink-0 items-center border-b border-border px-3">
        <h3 className="text-sm font-medium">案件一覧</h3>
      </div>
      {isIdeaCategory ? (
        <div className="shrink-0 border-b border-border p-2">
          <ShapeIdeasTrigger ideas={ideaPool} />
        </div>
      ) : null}
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-0.5 p-2">
          {active.length === 0 && completed.length === 0 ? (
            <li className="px-2 py-4 text-sm text-muted-foreground">
              {isIdeaCategory
                ? "アイディアを下の入力欄から追加できます"
                : "案件がありません"}
            </li>
          ) : (
            <>
              {active.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  active={project.id === selectedProjectId}
                  onSelect={() => onSelectProject(project.id)}
                />
              ))}
              {completed.length > 0 ? (
                <>
                  <li className="px-2 pt-3 pb-1">
                    <Separator />
                    <p className="pt-2 text-xs text-muted-foreground">完了</p>
                  </li>
                  {completed.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      active={project.id === selectedProjectId}
                      onSelect={() => onSelectProject(project.id)}
                      muted
                    />
                  ))}
                </>
              ) : null}
            </>
          )}
        </ul>
      </ScrollArea>
    </aside>
  );
}
