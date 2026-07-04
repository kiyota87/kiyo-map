"use client";

import { Map } from "lucide-react";

import { CategoryDot } from "@/components/kiyo-map/CategoryBadge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countByCategory } from "@/lib/kiyo-map/computed";
import { ALL_CATEGORY_NAV_ID } from "@/lib/kiyo-map/category-colors";
import { ALL_CATEGORY_ID } from "@/lib/kiyo-map/labels";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/kiyo-map/schema";

type CategoryNavProps = {
  categories: string[];
  projects: Project[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
};

function NavCount({ count }: { count: number }) {
  return <span className="kiyo-map-cat-nav-count">{count}</span>;
}

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
        "kiyo-map-panel flex w-36 shrink-0 grow-0 flex-col",
        className,
      )}
    >
      <div className="kiyo-map-pane-header flex h-12 shrink-0 items-center px-3">
        <h3 className="text-sm font-medium text-[var(--kiyo-map-text-primary)]">
          ???
        </h3>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-0.5 p-2">
          <li>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-category={ALL_CATEGORY_NAV_ID}
              data-selected={selectedCategoryId === ALL_CATEGORY_ID ? "true" : "false"}
              className={cn(
                "kiyo-map-cat-nav-item h-auto w-full justify-between px-2 py-2",
                selectedCategoryId === ALL_CATEGORY_ID
                  ? "kiyo-map-tab-active"
                  : "kiyo-map-tab text-[var(--kiyo-map-text-secondary)] hover:bg-[var(--kiyo-map-bg-card)]",
              )}
              onClick={() => onSelectCategory(ALL_CATEGORY_ID)}
            >
              <span className="truncate">???</span>
              <NavCount count={projects.length} />
            </Button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-category={category}
                data-selected={selectedCategoryId === category ? "true" : "false"}
                className={cn(
                  "kiyo-map-cat-nav-item h-auto w-full justify-between gap-2 px-2 py-2",
                  selectedCategoryId === category
                    ? "text-[var(--kiyo-map-text-primary)]"
                    : "kiyo-map-tab text-[var(--kiyo-map-text-secondary)] hover:bg-[var(--kiyo-map-bg-card)]",
                )}
                onClick={() => onSelectCategory(category)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CategoryDot category={category} />
                  <span className="truncate">{category}</span>
                </span>
                <NavCount count={counts[category] ?? 0} />
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
      <Map className="size-4 shrink-0 text-[var(--kiyo-map-accent)]" />
      <h1 className="truncate text-sm font-semibold text-[var(--kiyo-map-text-primary)]">
        {name}
      </h1>
    </div>
  );
}
