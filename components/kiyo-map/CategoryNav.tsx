"use client";

import { Map } from "lucide-react";

import { ALL_CATEGORY_ID } from "@/lib/kiyo-map/labels";
import { countByCategory } from "@/lib/kiyo-map/computed";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { Project } from "@/lib/kiyo-map/schema";

type CategoryNavProps = {
  workspaceName: string;
  categories: string[];
  projects: Project[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
};

export function CategoryNav({
  workspaceName,
  categories,
  projects,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  const counts = countByCategory(projects, categories);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <div className="flex h-12 items-center justify-between gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[state=expanded]:px-5">
          <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Map className="size-4 shrink-0 text-sidebar-foreground" />
            <h2 className="truncate text-sm font-semibold text-sidebar-foreground">
              {workspaceName}
            </h2>
          </div>
          <Pane1Toggle />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1 py-3 group-data-[collapsible=icon]:hidden">
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
            大分類
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedCategoryId === ALL_CATEGORY_ID}
                  onClick={() => onSelectCategory(ALL_CATEGORY_ID)}
                >
                  <span className="truncate">すべて</span>
                  <Badge
                    variant="secondary"
                    className="ml-auto tabular-nums"
                  >
                    {projects.length}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {categories.map((category) => (
                <SidebarMenuItem key={category}>
                  <SidebarMenuButton
                    isActive={selectedCategoryId === category}
                    onClick={() => onSelectCategory(category)}
                  >
                    <span className="truncate">{category}</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto tabular-nums"
                    >
                      {counts[category] ?? 0}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
