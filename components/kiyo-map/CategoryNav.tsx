"use client";

import { Map } from "lucide-react";

import { ALL_CATEGORY_ID } from "@/lib/kiyo-map/labels";
import { countByCategory } from "@/lib/kiyo-map/computed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/kiyo-map/schema";

type CategoryNavProps = {
  categories: string[];
  projects: Project[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
};

export function CategoryNav({
  categories,
  projects,
  selectedCategoryId,
  onSelectCategory,
  className,
}: CategoryNavProps) {
  const counts = countByCategory(projects, categories);

  return (
    <aside
      className={cn(
        "flex min-w-0 flex-1 flex-col border-r border-border bg-muted/30",
        className,
      )}
    >
      <div className="flex h-12 shrink-0 items-center border-b border-border px-3">
        <h3 className="text-sm font-medium">大分類</h3>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-0.5 p-2">
          <li>
            <Button
              type="button"
              variant={selectedCategoryId === ALL_CATEGORY_ID ? "secondary" : "ghost"}
              size="sm"
              className="h-auto w-full justify-between px-2 py-2"
              onClick={() => onSelectCategory(ALL_CATEGORY_ID)}
            >
              <span className="truncate">すべて</span>
              <Badge variant="secondary" className="tabular-nums">
                {projects.length}
              </Badge>
            </Button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <Button
                type="button"
                variant={selectedCategoryId === category ? "secondary" : "ghost"}
                size="sm"
                className="h-auto w-full justify-between px-2 py-2"
                onClick={() => onSelectCategory(category)}
              >
                <span className="truncate">{category}</span>
                <Badge variant="secondary" className="tabular-nums">
                  {counts[category] ?? 0}
                </Badge>
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}

export function KiyoMapTitle({ name }: { name: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Map className="size-4 shrink-0 text-muted-foreground" />
      <h1 className="truncate text-sm font-semibold">{name}</h1>
    </div>
  );
}
