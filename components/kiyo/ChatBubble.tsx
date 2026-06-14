import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/kiyo/types";

type ChatBubbleProps = {
  message: ChatMessage;
  align?: "left" | "right";
};

export function ChatBubble({ message, align = "left" }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div
      className={cn(
        "flex",
        isUser || align === "right" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap",
          isError
            ? "kiyo-error-bubble"
            : isUser
              ? "kiyo-user-bubble"
              : "kiyo-ai-bubble",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
