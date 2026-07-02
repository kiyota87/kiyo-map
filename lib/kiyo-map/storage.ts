import { kiyoMapDataSchema, type KiyoMapData } from "@/lib/kiyo-map/schema";
import { DEFAULT_KIYO_MAP_DATA } from "@/lib/kiyo-map/seed";

const STORAGE_KEY_PREFIX = "kiyo-map-data-v1";

function storageKey(userEmail: string): string {
  const normalized = userEmail.trim().toLowerCase();
  return `${STORAGE_KEY_PREFIX}:${normalized}`;
}

export function loadKiyoMapData(userEmail: string): KiyoMapData {
  if (typeof window === "undefined") {
    return DEFAULT_KIYO_MAP_DATA;
  }

  try {
    const raw = localStorage.getItem(storageKey(userEmail));
    if (!raw) {
      return structuredClone(DEFAULT_KIYO_MAP_DATA);
    }
    const parsed = kiyoMapDataSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return structuredClone(DEFAULT_KIYO_MAP_DATA);
    }
    return parsed.data;
  } catch {
    return structuredClone(DEFAULT_KIYO_MAP_DATA);
  }
}

export function saveKiyoMapData(userEmail: string, data: KiyoMapData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userEmail), JSON.stringify(data));
}

export function appendProjectHistory(
  project: KiyoMapData["projects"][number],
  content: string,
): KiyoMapData["projects"][number] {
  const now = new Date().toISOString();
  return {
    ...project,
    updatedAt: now,
    history: [{ date: now, content }, ...project.history],
  };
}
