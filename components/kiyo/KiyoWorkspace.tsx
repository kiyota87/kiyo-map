"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { KiyoBottomBar } from "@/components/kiyo/KiyoBottomBar";
import { KiyoClaudePanel } from "@/components/kiyo/KiyoClaudePanel";
import { KiyoResearchPanel } from "@/components/kiyo/KiyoResearchPanel";
import { KiyoSidebar } from "@/components/kiyo/KiyoSidebar";
import { KiyoTopBar } from "@/components/kiyo/KiyoTopBar";
import {
  requestClaude,
  runGeminiTask,
  streamResearch,
} from "@/lib/kiyo/client-api";
import {
  createSession,
  loadSessions,
  saveSessions,
  truncateTitle,
} from "@/lib/kiyo/storage";
import type {
  ApiChatMessage,
  Artifact,
  ChatMessage,
  KiyoSession,
  OutputType,
} from "@/lib/kiyo/types";

type KiyoWorkspaceProps = {
  userEmail: string;
};

function nowIso() {
  return new Date().toISOString();
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: nowIso(),
  };
}

function toApiMessages(messages: ChatMessage[]): ApiChatMessage[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));
}

export function KiyoWorkspace({ userEmail }: KiyoWorkspaceProps) {
  const [sessions, setSessions] = useState<KiyoSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [outputType, setOutputType] = useState<OutputType>("pptx");
  const [previewMode, setPreviewMode] = useState<"preview" | "code">("preview");
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [attachingResearch, setAttachingResearch] = useState(false);
  const [showUnattachedWarning, setShowUnattachedWarning] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadSessions();
    if (stored.length > 0) {
      // localStorage からの復元はクライアント初回マウント時のみ
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted sessions
      setSessions(stored);
      setActiveSessionId(stored[0].id);
    } else {
      const initial = createSession();
      setSessions([initial]);
      setActiveSessionId(initial.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSessions(sessions);
  }, [sessions, hydrated]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const updateSession = useCallback(
    (sessionId: string, updater: (session: KiyoSession) => KiyoSession) => {
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId ? updater(session) : session,
        ),
      );
    },
    [],
  );

  const handleCreateSession = () => {
    const session = createSession();
    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
    setInputText("");
    setActiveArtifactId(null);
    setShowUnattachedWarning(false);
  };

  const maybeGenerateTitle = async (
    sessionId: string,
    researchMessages: ChatMessage[],
    titleGenerated: boolean,
  ) => {
    if (titleGenerated) return;

    const apiMessages = toApiMessages(researchMessages);
    if (apiMessages.length < 2) return;

    try {
      const { title } = await runGeminiTask("title", apiMessages);
      updateSession(sessionId, (current) => ({
        ...current,
        title: title ? truncateTitle(title, 24) : truncateTitle(apiMessages[0].content),
        titleGenerated: true,
        updatedAt: nowIso(),
      }));
    } catch {
      updateSession(sessionId, (current) => ({
        ...current,
        title: truncateTitle(apiMessages[0]?.content ?? "新規セッション"),
        titleGenerated: true,
        updatedAt: nowIso(),
      }));
    }
  };

  const handleSendResearch = async () => {
    if (!activeSession || !inputText.trim() || researchLoading) return;

    const userMessage = createMessage("user", inputText.trim());
    const assistantMessage = createMessage("assistant", "");
    const nextResearchMessages = [
      ...activeSession.researchMessages,
      userMessage,
    ];

    updateSession(activeSession.id, (session) => ({
      ...session,
      researchMessages: [...session.researchMessages, userMessage, assistantMessage],
      updatedAt: nowIso(),
    }));
    setInputText("");
    setResearchLoading(true);

    try {
      let streamed = "";
      await streamResearch(
        toApiMessages([...nextResearchMessages]),
        (chunk) => {
          streamed += chunk;
          updateSession(activeSession.id, (session) => ({
            ...session,
            researchMessages: session.researchMessages.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: streamed }
                : message,
            ),
            updatedAt: nowIso(),
          }));
        },
      );

      const finalMessages = [
        ...nextResearchMessages,
        { ...assistantMessage, content: streamed },
      ];
      await maybeGenerateTitle(
        activeSession.id,
        finalMessages,
        activeSession.titleGenerated,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Research request failed";
      toast.error(message);
      updateSession(activeSession.id, (session) => ({
        ...session,
        researchMessages: [
          ...session.researchMessages.filter(
            (item) => item.id !== assistantMessage.id,
          ),
          createMessage("error", message),
        ],
        updatedAt: nowIso(),
      }));
    } finally {
      setResearchLoading(false);
    }
  };

  const handleAttachResearch = async () => {
    if (!activeSession || attachingResearch) return;
    if (activeSession.researchMessages.length === 0) {
      toast.error("Research 履歴がありません。");
      return;
    }

    setAttachingResearch(true);
    try {
      const { summary } = await runGeminiTask(
        "summarize",
        toApiMessages(activeSession.researchMessages),
      );
      updateSession(activeSession.id, (session) => ({
        ...session,
        researchSummary: summary ?? null,
        researchAttachedAt: nowIso(),
        updatedAt: nowIso(),
      }));
      setShowUnattachedWarning(false);
      toast.success("Research 要約を Claude に添付しました。");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Research summary failed";
      toast.error(message);
    } finally {
      setAttachingResearch(false);
    }
  };

  const handleSendClaude = async () => {
    if (!activeSession || !inputText.trim() || claudeLoading) return;

    if (!activeSession.researchSummary) {
      setShowUnattachedWarning(true);
    }

    const userMessage = createMessage("user", inputText.trim());
    const apiMessages = toApiMessages([
      ...activeSession.claudeMessages,
      userMessage,
    ]);

    updateSession(activeSession.id, (session) => ({
      ...session,
      claudeMessages: [...session.claudeMessages, userMessage],
      updatedAt: nowIso(),
    }));
    setInputText("");
    setClaudeLoading(true);

    try {
      const result = await requestClaude({
        messages: apiMessages,
        outputType,
        researchSummary: activeSession.researchSummary,
      });

      let artifact: Artifact | null = null;
      if (result.artifact) {
        artifact = {
          id: crypto.randomUUID(),
          type: result.artifact.type,
          rawContent: result.artifact.rawContent,
          createdAt: nowIso(),
        };
      }

      const assistantMessage = createMessage("assistant", result.content);

      updateSession(activeSession.id, (session) => ({
        ...session,
        claudeMessages: [...session.claudeMessages, assistantMessage],
        artifacts: artifact ? [...session.artifacts, artifact] : session.artifacts,
        updatedAt: nowIso(),
      }));

      if (artifact) {
        setActiveArtifactId(artifact.id);
        setPreviewMode("preview");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Claude request failed";
      toast.error(message);
      updateSession(activeSession.id, (session) => ({
        ...session,
        claudeMessages: [
          ...session.claudeMessages,
          createMessage("error", message),
        ],
        updatedAt: nowIso(),
      }));
    } finally {
      setClaudeLoading(false);
    }
  };

  if (!hydrated || !activeSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--kiyo-text-muted)]">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-[1200px] flex-col">
      <KiyoTopBar userEmail={userEmail} />
      <div className="flex min-h-0 flex-1">
        <KiyoSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={(sessionId) => {
            setActiveSessionId(sessionId);
            setActiveArtifactId(null);
            setShowUnattachedWarning(false);
          }}
          onCreate={handleCreateSession}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            <KiyoResearchPanel
              messages={activeSession.researchMessages}
              loading={researchLoading}
            />
            <KiyoClaudePanel
              messages={activeSession.claudeMessages}
              artifacts={activeSession.artifacts}
              outputType={outputType}
              previewMode={previewMode}
              activeArtifactId={activeArtifactId}
              researchSummary={activeSession.researchSummary}
              researchAttachedAt={activeSession.researchAttachedAt}
              unattachedWarning={showUnattachedWarning}
              loading={claudeLoading}
              attachingResearch={attachingResearch}
              onOutputTypeChange={setOutputType}
              onPreviewModeChange={setPreviewMode}
              onAttachResearch={handleAttachResearch}
              onSelectArtifact={setActiveArtifactId}
            />
          </div>
          <KiyoBottomBar
            value={inputText}
            onChange={setInputText}
            onSendResearch={handleSendResearch}
            onSendClaude={handleSendClaude}
            researchLoading={researchLoading}
            claudeLoading={claudeLoading}
          />
        </div>
      </div>
    </div>
  );
}
