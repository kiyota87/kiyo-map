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
import { consumeMapFocus, persistMapFocus } from "@/lib/kiyo-map/map-focus";
import { normalizeWorkspaceName } from "@/lib/kiyo-map/branding";
import { IDEA_CATEGORY } from "@/lib/kiyo-map/labels";
import type { ShapeIdeaPick } from "@/lib/kiyo-map/prompts";
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
  addIdeaProject: (text: string) => void;
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
  applyShapePick: (pick: ShapeIdeaPick) => void;
  updateProject: (
    projectId: string,
    patch: Partial<Project>,
    historyNote?: string,
  ) => void;
  deleteProject: (projectId: string) => void;
  reopenProject: (projectId: string) => void;
  mapFocusProjectId: string | null;
  consumeMapFocus: () => void;
  selectRelatedProject: (projectId: string) => string;
};

const KiyoMapContext = createContext<KiyoMapContextValue | null>(null);

type KiyoMapProviderProps = {
  userEmail: string;
  children: ReactNode;
};

function ensureIdeaCategory(categories: string[]): string[] {
  return categories.includes(IDEA_CATEGORY)
    ? categories
    : [IDEA_CATEGORY, ...categories];
}

export function KiyoMapProvider({ userEmail, children }: KiyoMapProviderProps) {
  const [data, setData] = useState<KiyoMapData>(() => loadKiyoMapData(userEmail));
  const [hydrated, setHydrated] = useState(false);
  const [mapFocusProjectId, setMapFocusProjectId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadKiyoMapData(userEmail);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted data
    setData({
      ...loaded,
      workspace: {
        ...loaded.workspace,
        name: normalizeWorkspaceName(loaded.workspace.name),
      },
      categories: ensureIdeaCategory(loaded.categories),
    });
    setHydrated(true);
  }, [userEmail]);

  useEffect(() => {
    if (!hydrated) return;
    const focusId = consumeMapFocus();
    if (focusId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore cross-page focus
      setMapFocusProjectId(focusId);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveKiyoMapData(userEmail, data);
  }, [data, hydrated, userEmail]);

  const unresolvedInboxCount = useMemo(
    () => data.inbox.filter((item) => !item.resolved).length,
    [data.inbox],
  );

  const addIdeaProject = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      title: "",
      status: "idea",
      category: IDEA_CATEGORY,
      priority: "C",
      progress: 0,
      deadline: null,
      nextAction: "",
      memo: trimmed,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      history: [
        {
          date: now,
          content: "クイックメモからアイディアとして保存",
        },
      ],
      relatedProjectIds: [],
      relatedNotes: "",
      relatedAiKnowledge: null,
    };

    setData((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
      categories: ensureIdeaCategory(prev.categories),
    }));
    setMapFocusProjectId(project.id);
    persistMapFocus(project.id);
  }, []);

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
          item.id === inboxId ? { ...item, resolved: true } : item,
        ),
        categories: prev.categories.includes(input.category)
          ? prev.categories
          : [...prev.categories, input.category],
      }));
    },
    [],
  );

  const applyShapePick = useCallback((pick: ShapeIdeaPick) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => {
        if (project.id !== pick.projectId) return project;
        const now = new Date().toISOString();
        const planBlock = pick.plan ? `\n\n【進め方】\n${pick.plan}` : "";
        let next: Project = {
          ...project,
          title:
            project.title.trim() ||
            pick.nextAction.slice(0, 48) ||
            project.memo.slice(0, 48),
          status: "in_progress",
          category: pick.suggestedCategory,
          nextAction: pick.nextAction,
          memo: `${project.memo}${planBlock}`.trim(),
          progress: project.progress > 0 ? project.progress : 10,
          updatedAt: now,
        };
        next = appendProjectHistory(
          next,
          `アイディアをかたちに: ${pick.suggestedCategory}へ / ${pick.nextAction}`,
        );
        return next;
      }),
      categories: prev.categories.includes(pick.suggestedCategory)
        ? prev.categories
        : [...prev.categories, pick.suggestedCategory],
    }));
  }, []);

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
          if (
            (patch.progress !== undefined && patch.progress >= 100) ||
            patch.status === "done"
          ) {
            next.progress = 100;
            next.status = "done";
            if (!next.completedAt) next.completedAt = now;
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

  const deleteProject = useCallback((projectId: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects
        .filter((project) => project.id !== projectId)
        .map((project) => ({
          ...project,
          relatedProjectIds: project.relatedProjectIds.filter(
            (id) => id !== projectId,
          ),
        })),
    }));
  }, []);

  const reopenProject = useCallback(
    (projectId: string) => {
      setData((prev) => {
        const nextProjects = prev.projects.map((project) => {
          if (project.id !== projectId) return project;
          const now = new Date().toISOString();
          let next: Project = {
            ...project,
            status: "in_progress",
            completedAt: null,
            progress: project.progress >= 100 ? 90 : project.progress,
            updatedAt: now,
          };
          next = appendProjectHistory(next, "完了から進行中に戻しました");
          return next;
        });
        const nextData = { ...prev, projects: nextProjects };
        saveKiyoMapData(userEmail, nextData);
        return nextData;
      });
      persistMapFocus(projectId);
      setMapFocusProjectId(projectId);
    },
    [userEmail],
  );

  const consumeMapFocusCallback = useCallback(() => {
    setMapFocusProjectId(null);
    consumeMapFocus();
  }, []);

  const selectRelatedProject = useCallback((projectId: string) => projectId, []);

  const value = useMemo<KiyoMapContextValue>(
    () => ({
      data,
      hydrated,
      unresolvedInboxCount,
      addIdeaProject,
      addInboxMemo,
      resolveInboxItem,
      applyShapePick,
      updateProject,
      deleteProject,
      reopenProject,
      mapFocusProjectId,
      consumeMapFocus: consumeMapFocusCallback,
      selectRelatedProject,
    }),
    [
      data,
      hydrated,
      unresolvedInboxCount,
      addIdeaProject,
      addInboxMemo,
      resolveInboxItem,
      applyShapePick,
      updateProject,
      deleteProject,
      reopenProject,
      mapFocusProjectId,
      consumeMapFocusCallback,
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
