"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  appendProjectHistory,
  loadKiyoMapData,
  saveKiyoMapData,
} from "@/lib/kiyo-map/storage";
import type {
  InboxItem,
  KiyoMapData,
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/lib/kiyo-map/schema";

type KiyoMapContextValue = {
  data: KiyoMapData;
  hydrated: boolean;
  unresolvedInboxCount: number;
  addInboxMemo: (text: string) => void;
  resolveInboxItem: (
    inboxId: string,
    input: {
      title: string;
      category: string;
      status: ProjectStatus;
      priority: ProjectPriority;
    },
  ) => void;
  updateProject: (
    projectId: string,
    patch: Partial<Project>,
    historyNote?: string,
  ) => void;
  selectRelatedProject: (projectId: string) => string;
};

const KiyoMapContext = createContext<KiyoMapContextValue | null>(null);

type KiyoMapProviderProps = {
  userEmail: string;
  children: ReactNode;
};

export function KiyoMapProvider({ userEmail, children }: KiyoMapProviderProps) {
  const [data, setData] = useState<KiyoMapData>(() => loadKiyoMapData(userEmail));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage からの復元はクライアント初回マウント時のみ
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted data
    setData(loadKiyoMapData(userEmail));
    setHydrated(true);
  }, [userEmail]);

  useEffect(() => {
    if (!hydrated) return;
    saveKiyoMapData(userEmail, data);
  }, [data, hydrated, userEmail]);

  const unresolvedInboxCount = useMemo(
    () => data.inbox.filter((item) => !item.resolved).length,
    [data.inbox],
  );

  const addInboxMemo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: InboxItem = {
      id: crypto.randomUUID(),
      text: trimmed,
      createdAt: new Date().toISOString(),
      aiSuggestedCategory: null,
      aiSuggestedStatus: null,
      resolved: false,
    };
    setData((prev) => ({
      ...prev,
      inbox: [item, ...prev.inbox],
    }));
  }, []);

  const resolveInboxItem = useCallback(
    (
      inboxId: string,
      input: {
        title: string;
        category: string;
        status: ProjectStatus;
        priority: ProjectPriority;
      },
    ) => {
      const now = new Date().toISOString();
      const project: Project = {
        id: crypto.randomUUID(),
        title: input.title.trim(),
        status: input.status,
        category: input.category,
        priority: input.priority,
        progress: input.status === "idea" ? 0 : 10,
        deadline: null,
        nextAction: "",
        memo: "",
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        history: [
          {
            date: now,
            content: "未整理メモから案件化",
          },
        ],
        relatedProjectIds: [],
        relatedNotes: "",
        relatedAiKnowledge: null,
      };

      setData((prev) => ({
        ...prev,
        projects: [project, ...prev.projects],
        inbox: prev.inbox.map((item) =>
          item.id === inboxId
            ? { ...item, resolved: true }
            : item,
        ),
        categories: prev.categories.includes(input.category)
          ? prev.categories
          : [...prev.categories, input.category],
      }));
    },
    [],
  );

  const updateProject = useCallback(
    (projectId: string, patch: Partial<Project>, historyNote?: string) => {
      setData((prev) => ({
        ...prev,
        projects: prev.projects.map((project) => {
          if (project.id !== projectId) return project;
          const now = new Date().toISOString();
          let next: Project = {
            ...project,
            ...patch,
            updatedAt: now,
          };
          if (patch.status === "done" && project.status !== "done") {
            next.completedAt = now;
          }
          if (patch.status && patch.status !== "done" && project.status === "done") {
            next.completedAt = null;
          }
          if (historyNote) {
            next = appendProjectHistory(next, historyNote);
          }
          return next;
        }),
      }));
    },
    [],
  );

  const selectRelatedProject = useCallback((projectId: string) => projectId, []);

  const value = useMemo<KiyoMapContextValue>(
    () => ({
      data,
      hydrated,
      unresolvedInboxCount,
      addInboxMemo,
      resolveInboxItem,
      updateProject,
      selectRelatedProject,
    }),
    [
      data,
      hydrated,
      unresolvedInboxCount,
      addInboxMemo,
      resolveInboxItem,
      updateProject,
      selectRelatedProject,
    ],
  );

  return (
    <KiyoMapContext.Provider value={value}>{children}</KiyoMapContext.Provider>
  );
}

export function useKiyoMap(): KiyoMapContextValue {
  const ctx = useContext(KiyoMapContext);
  if (!ctx) {
    throw new Error("useKiyoMap must be used within KiyoMapProvider");
  }
  return ctx;
}
