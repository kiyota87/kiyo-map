const MAP_FOCUS_KEY = "kiyo-map-map-focus-v1";

export function persistMapFocus(projectId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MAP_FOCUS_KEY, projectId);
}

export function consumeMapFocus(): string | null {
  if (typeof window === "undefined") return null;
  const id = sessionStorage.getItem(MAP_FOCUS_KEY);
  if (id) sessionStorage.removeItem(MAP_FOCUS_KEY);
  return id;
}
