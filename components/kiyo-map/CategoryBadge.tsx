import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  category: string;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn("kiyo-map-category-badge", className)}
      data-category={category}
    >
      {category}
    </span>
  );
}

type CategoryDotProps = {
  category: string;
  urgent?: boolean;
  className?: string;
};

export function CategoryDot({ category, urgent = false, className }: CategoryDotProps) {
  return (
    <span
      className={cn("kiyo-map-category-dot size-2 shrink-0 rounded-full", className)}
      data-category={category}
      data-urgent={urgent ? "true" : undefined}
      aria-hidden
    />
  );
}
