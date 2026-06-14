import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "@/components/kiyo/ChatBubble";
import type { ChatMessage } from "@/lib/kiyo/types";

type KiyoResearchPanelProps = {
  messages: ChatMessage[];
  loading: boolean;
};

export function KiyoResearchPanel({
  messages,
  loading,
}: KiyoResearchPanelProps) {
  return (
    <section className="kiyo-panel flex min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--kiyo-accent-purple)] px-4 py-2">
        <span className="text-sm font-medium text-[var(--kiyo-text-primary)]">
          Research
        </span>
        <Select value="gemini" disabled={false}>
          <SelectTrigger
            size="sm"
            className="w-[160px] border-[var(--kiyo-accent-purple)] bg-[var(--kiyo-bg-card)] text-[var(--kiyo-text-primary)]"
          >
            <SelectValue placeholder="モデル" />
          </SelectTrigger>
          <SelectContent className="border-[var(--kiyo-accent-purple)] bg-[var(--kiyo-bg-card)] text-[var(--kiyo-text-primary)]">
            <SelectItem value="chatgpt" disabled>
              ChatGPT（Phase 2）
            </SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--kiyo-text-muted)]">
              Gemini に調査・リサーチを依頼してください。
            </p>
          ) : null}
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              align={message.role === "user" ? "right" : "left"}
            />
          ))}
          {loading ? (
            <p className="text-sm text-[var(--kiyo-text-muted)]">生成中…</p>
          ) : null}
        </div>
      </ScrollArea>
    </section>
  );
}
