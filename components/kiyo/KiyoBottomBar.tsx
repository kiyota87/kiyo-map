import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type KiyoBottomBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSendResearch: () => void;
  onSendClaude: () => void;
  researchLoading: boolean;
  claudeLoading: boolean;
};

export function KiyoBottomBar({
  value,
  onChange,
  onSendResearch,
  onSendClaude,
  researchLoading,
  claudeLoading,
}: KiyoBottomBarProps) {
  return (
    <footer className="kiyo-panel flex shrink-0 flex-col gap-2 px-4 py-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="メッセージを入力…"
        rows={2}
        className="kiyo-input min-h-16 resize-none border-[var(--kiyo-accent-purple)] bg-[var(--kiyo-bg-card)] text-[var(--kiyo-text-primary)]"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
          }
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          className="kiyo-btn-primary"
          disabled={researchLoading || !value.trim()}
          onClick={onSendResearch}
        >
          ▶ Gemini
        </Button>
        <Button
          className="kiyo-btn-accent"
          disabled={claudeLoading || !value.trim()}
          onClick={onSendClaude}
        >
          <Sparkles className="size-4" />
          Claudeへ
        </Button>
      </div>
    </footer>
  );
}
