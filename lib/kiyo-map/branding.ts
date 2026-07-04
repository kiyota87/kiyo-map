export const KIYO_MAP_WORKSPACE_NAME = "きよた案件管理・アイディアマップ";

export const KIYO_MAP_LEGACY_WORKSPACE_NAMES = [
  "きよたアイディア実行マップ",
  "きよた案件管理・アイディア実行マップ",
] as const;

export function normalizeWorkspaceName(name: string): string {
  if (
    KIYO_MAP_LEGACY_WORKSPACE_NAMES.includes(
      name as (typeof KIYO_MAP_LEGACY_WORKSPACE_NAMES)[number],
    )
  ) {
    return KIYO_MAP_WORKSPACE_NAME;
  }
  return name;
}
