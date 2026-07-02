"use client";

import { useMemo, useState } from "react";

import { CategoryNav } from "@/components/kiyo-map/CategoryNav";
import { ProjectDetail } from "@/components/kiyo-map/ProjectDetail";
import { ProjectList } from "@/components/kiyo-map/ProjectList";
import { RelatedPanel } from "@/components/kiyo-map/RelatedPanel";
import { useKiyoMap } from "@/components/kiyo-map/KiyoMapProvider";
import { ALL_CATEGORY_ID } from "@/lib/kiyo-map/labels";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function KiyoMapWorkspace() {
  const { data, hydrated } = useKiyoMap();
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORY_ID);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    data.projects[0]?.id ?? null,
  );

  const activeProjectId =
    selectedProjectId &&
    data.projects.some((p) => p.id === selectedProjectId)
      ? selectedProjectId
      : (data.projects[0]?.id ?? null);

  const selectedProject = useMemo(
    () => data.projects.find((p) => p.id === activeProjectId) ?? null,
    [data.projects, activeProjectId],
  );

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        読み込み中…
      </div>
    );
  }

  return (
    <SidebarProvider
      defaultOpen
      className="h-full min-h-0 w-full overflow-hidden bg-background text-foreground"
    >
      <CategoryNav
        workspaceName={data.workspace.name}
        categories={data.categories}
        projects={data.projects}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <SidebarInset className="flex min-h-0 min-w-0 flex-col bg-background">
        <div className="flex min-h-0 flex-1">
          <ProjectList
            projects={data.projects}
            selectedCategoryId={selectedCategoryId}
            selectedProjectId={activeProjectId}
            onSelectProject={setSelectedProjectId}
          />
          <ProjectDetail
            project={selectedProject}
            categories={data.categories}
          />
          <RelatedPanel
            project={selectedProject}
            allProjects={data.projects}
            onSelectProject={setSelectedProjectId}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
