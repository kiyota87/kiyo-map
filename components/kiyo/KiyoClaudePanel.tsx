import { ScrollArea } from "@/components/ui/scroll-area";
import { ArtifactChip } from "@/components/kiyo/ArtifactChip";
import { ChatBubble } from "@/components/kiyo/ChatBubble";
import { KiyoPreviewPane } from "@/components/kiyo/KiyoPreviewPane";
import type { Artifact, ChatMessage, OutputType } from "@/lib/kiyo/types";
import { Button } from "@/components/ui/button";

type KiyoClaudePanelProps = {
  messages: ChatMessage[];
  artifacts: Artifact[];
  outputType: OutputType;
  previewMode: "preview" | "code";
  activeArtifactId: string | null;
  researchSummary: string | null;
  researchAttachedAt: string | null;
  unattachedWarning: boolean;
  loading: boolean;
  attachingResearch: boolean;
  onOutputTypeChange: (type: OutputType) => void;
  onPreviewModeChange: (mode: "preview" | "code") => void;
  onAttachResearch: () => void;
  onSelectArtifact: (artifactId: string) => void;
};

export function KiyoClaudePanel({
  messages,
  artifacts,
  outputType,
  previewMode,
  activeArtifactId,
  researchSummary,
  researchAttachedAt,
  unattachedWarning,
  loading,
  attachingResearch,
  onOutputTypeChange,
  onPreviewModeChange,
  onAttachResearch,
  onSelectArtifact,
}: KiyoClaudePanelProps) {
  const activeArtifact =
    artifacts.find((artifact) => artifact.id === activeArtifactId) ?? null;

  return (
    <section className="kiyo-panel flex min-w-0 flex-[1.4] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--kiyo-accent-purple)] px-4 py-2">
        <span className="text-sm font-medium text-[var(--kiyo-accent-yellow)]">
          Claude
        </span>
        <span className="kiyo-badge px-2 py-0.5 text-[10px]">
          UI only · 出力 Gemini
        </span>
        <div className="flex gap-1">
          {(["pptx", "svg"] as OutputType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onOutputTypeChange(type)}
              className={`px-2 py-1 text-xs ${
                outputType === type ? "kiyo-tab-active" : "kiyo-tab"
              }`}
            >
              {type === "pptx" ? "PPTX" : "図解"}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto border-[var(--kiyo-accent-purple)] bg-[var(--kiyo-bg-card)] text-[var(--kiyo-text-primary)] hover:bg-[var(--kiyo-accent-purple)]/40"
          onClick={onAttachResearch}
          disabled={attachingResearch}
        >
          {attachingResearch
            ? "要約中…"
            : researchSummary
              ? "Research 添付済み ✓"
              : "Researchを渡す"}
        </Button>
      </div>

      {unattachedWarning ? (
        <div className="border-b border-[var(--kiyo-accent-purple)] bg-[var(--kiyo-bg-card)] px-4 py-2 text-xs text-[var(--kiyo-accent-yellow)]">
          Research 未添付 — 必要なら「Researchを渡す」を押してください。
        </div>
      ) : null}

      {researchSummary ? (
        <div className="border-b border-[var(--kiyo-accent-purple)] px-4 py-2">
          <p className="mb-1 text-xs text-[var(--kiyo-text-muted)]">
            添付済み Research 要約
            {researchAttachedAt
              ? `（${new Date(researchAttachedAt).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}）`
              : ""}
          </p>
          <pre className="max-h-24 overflow-auto text-xs whitespace-pre-wrap text-[var(--kiyo-text-secondary)]">
            {researchSummary}
          </pre>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-2">
        <div className="flex min-h-0 flex-col border-r border-[var(--kiyo-accent-purple)]">
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-3">
              {messages.length === 0 ? (
                <p className="text-sm text-[var(--kiyo-text-muted)]">
                  Claude パネル（UI）で PPTX / 図解を生成します。実際の生成は Gemini
                  が担当します。
                </p>
              ) : null}
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-2">
                  <ChatBubble
                    message={message}
                    align={message.role === "user" ? "right" : "left"}
                  />
                </div>
              ))}
              {artifacts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {artifacts.map((artifact) => (
                    <ArtifactChip
                      key={artifact.id}
                      artifact={artifact}
                      active={artifact.id === activeArtifactId}
                      onSelect={() => onSelectArtifact(artifact.id)}
                    />
                  ))}
                </div>
              ) : null}
              {loading ? (
                <p className="text-sm text-[var(--kiyo-text-muted)]">
                  生成中…
                </p>
              ) : null}
            </div>
          </ScrollArea>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex gap-1 border-b border-[var(--kiyo-accent-purple)] px-3 py-2">
            {(["preview", "code"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onPreviewModeChange(mode)}
                className={`px-2 py-1 text-xs ${
                  previewMode === mode ? "kiyo-tab-active" : "kiyo-tab"
                }`}
              >
                {mode === "preview" ? "プレビュー" : "コード"}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            <KiyoPreviewPane
              artifact={activeArtifact}
              outputType={outputType}
              viewMode={previewMode}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
