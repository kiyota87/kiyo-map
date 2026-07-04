import { IDEA_CATEGORY } from "@/lib/kiyo-map/labels";

/** カテゴリ名 → CSS 変数名（kiyo-map-theme.css と同期） */
export const CATEGORY_COLOR_VARS: Record<string, string> = {
  [IDEA_CATEGORY]: "--kiyo-map-cat-idea",
  "HR/労務": "--kiyo-map-cat-hr",
  "AI推進": "--kiyo-map-cat-ai",
  "ブランディング": "--kiyo-map-cat-brand",
  "IT/セキュリティ": "--kiyo-map-cat-it",
  "総務": "--kiyo-map-cat-admin",
} as const;

export const DEFAULT_CATEGORY_COLOR_VAR = "--kiyo-map-cat-default";

export function categoryColorVar(category: string): string {
  return CATEGORY_COLOR_VARS[category] ?? DEFAULT_CATEGORY_COLOR_VAR;
}

/** 大分類ナビ用 data-category（「すべて」は __all__） */
export const ALL_CATEGORY_NAV_ID = "__all__";
