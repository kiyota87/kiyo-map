"use client";

import { useMemo, useState } from "react";

import { CategoryNav } from "@/components/kiyo-map/CategoryNav";

import { ProjectDetail } from "@/components/kiyo-map/ProjectDetail";

import { ProjectList } from "@/components/kiyo-map/ProjectList";

import { RelatedPanel } from "@/components/kiyo-map/RelatedPanel";

import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";

import {
  filterProjectsByCategory,
  partitionProjectsForList,
} from "@/lib/kiyo-map/computed";

import { ALL_CATEGORY_ID } from "@/lib/kiyo-map/labels";

function pickDefaultProjectId(
  projects: ReturnType<typeof useKiyoMap>["data"]["projects"],

  categoryId: string,
): string | null {
  const filtered = filterProjectsByCategory(
    projects,

    categoryId,

    ALL_CATEGORY_ID,
  );

  const { active, completed } = partitionProjectsForList(filtered);

  return active[0]?.id ?? completed[0]?.id ?? null;
}

export function KiyoMapWorkspace() {
  const { data, hydrated } = useKiyoMap();

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORY_ID);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => pickDefaultProjectId(data.projects, ALL_CATEGORY_ID),
  );

  const activeProjectId = useMemo(() => {
    if (
      selectedProjectId &&
      data.projects.some((p) => p.id === selectedProjectId)
    ) {
      return selectedProjectId;
    }

    return pickDefaultProjectId(data.projects, selectedCategoryId);
  }, [data.projects, selectedCategoryId, selectedProjectId]);

  const selectedProject = useMemo(
    () => data.projects.find((p) => p.id === activeProjectId) ?? null,

    [data.projects, activeProjectId],
  );

  const handleDeleteProject = (projectId: string) => {
    const remaining = data.projects.filter((p) => p.id !== projectId);

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
        projects={data.projects}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <ProjectList
        projects={data.projects}
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
        allProjects={data.projects}
        onSelectProject={setSelectedProjectId}
      />
    </div>
  );
}
