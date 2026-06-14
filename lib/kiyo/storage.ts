import type { KiyoSession } from "@/lib/kiyo/types";

const STORAGE_KEY = "kiyo-sessions-v1";

export function loadSessions(): KiyoSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KiyoSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: KiyoSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function createSession(): KiyoSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "新規セッション",
    createdAt: now,
    updatedAt: now,
    researchMessages: [],
    claudeMessages: [],
    artifacts: [],
    researchSummary: null,
    researchAttachedAt: null,
    titleGenerated: false,
  };
}

export function truncateTitle(text: string, max = 24): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}
