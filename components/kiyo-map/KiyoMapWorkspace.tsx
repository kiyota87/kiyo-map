"use client";

import { useEffect, useMemo, useState } from "react";

import { CategoryNav } from "@/components/kiyo-map/CategoryNav";
import { ProjectDetail } from "@/components/kiyo-map/ProjectDetail";
import { ProjectList } from "@/components/kiyo-map/ProjectList";
import { RelatedPanel } from "@/components/kiyo-map/RelatedPanel";
import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import {
  activeMapProjects,
  filterProjectsByCategory,
} from "@/lib/kiyo-map/computed";
import { ALL_CATEGORY_ID, IDEA_CATEGORY } from "@/lib/kiyo-map/labels";
import type { Project } from "@/lib/kiyo-map/schema";

function pickDefaultProjectId(
  projects: Project[],
  categoryId: string,
): string | null {
  const filtered = filterProjectsByCategory(
    projects,
    categoryId,
    ALL_CATEGORY_ID,
  );
  return filtered[0]?.id ?? null;
}

function categoryForProject(project: Project): string {
  return project.category === IDEA_CATEGORY ? IDEA_CATEGORY : project.category;
}

export function KiyoMapWorkspace() {
  const { data, hydrated, mapFocusProjectId, consumeMapFocus } = useKiyoMap();
  const mapProjects = useMemo(
    () => activeMapProjects(data.projects),
    [data.projects],
  );

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORY_ID);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => pickDefaultProjectId(mapProjects, ALL_CATEGORY_ID),
  );

  useEffect(() => {
    if (!hydrated || !mapFocusProjectId) return;

    const project = mapProjects.find((item) => item.id === mapFocusProjectId);
    if (project) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- focus after add/reopen
      setSelectedProjectId(project.id);
      setSelectedCategoryId(categoryForProject(project));
    }
    consumeMapFocus();
  }, [hydrated, mapFocusProjectId, mapProjects, consumeMapFocus]);

  const activeProjectId = useMemo(() => {
    if (
      selectedProjectId &&
      mapProjects.some((project) => project.id === selectedProjectId)
    ) {
      return selectedProjectId;
    }
    return pickDefaultProjectId(mapProjects, selectedCategoryId);
  }, [mapProjects, selectedCategoryId, selectedProjectId]);

  const selectedProject = useMemo(
    () => mapProjects.find((project) => project.id === activeProjectId) ?? null,
    [mapProjects, activeProjectId],
  );

  const handleDeleteProject = (projectId: string) => {
    const remaining = mapProjects.filter((project) => project.id !== projectId);
    const nextId = pickDefaultProjectId(remaining, selectedCategoryId);
    setSelectedProjectId((current) =>
      current === projectId ? nextId : current,
    );
  };

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <CategoryNav
        categories={data.categories}
        projects={mapProjects}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <ProjectList
        projects={mapProjects}
        selectedCategoryId={selectedCategoryId}
        selectedProjectId={activeProjectId}
        onSelectProject={setSelectedProjectId}
      />
      <ProjectDetail
        project={selectedProject}
        categories={data.categories}
        onDeleted={handleDeleteProject}
      />
      <RelatedPanel
        project={selectedProject}
        allProjects={mapProjects}
        onSelectProject={setSelectedProjectId}
      />
    </div>
  );
}
