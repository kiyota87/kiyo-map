import type { ApiChatMessage, OutputType } from "@/lib/kiyo/types";

export async function streamResearch(
  messages: ApiChatMessage[],
  onChunk: (chunk: string) => void,
): Promise<void> {
  const response = await fetch("/api/kiyo/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "Research request failed");
  }

  if (!response.body) {
    throw new Error("Streaming response body is missing");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export async function runGeminiTask(
  task: "summarize" | "title",
  messages: ApiChatMessage[],
): Promise<{ summary?: string; title?: string }> {
  const response = await fetch("/api/kiyo/gemini-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, messages }),
  });

  const data = (await response.json()) as {
    summary?: string;
    title?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Gemini task failed");
  }

  return data;
}

export async function requestClaude(params: {
  messages: ApiChatMessage[];
  outputType: OutputType;
  researchSummary: string | null;
}): Promise<{
  content: string;
  artifact?: { type: OutputType; rawContent: string };
}> {
  const response = await fetch("/api/kiyo/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = (await response.json()) as {
    content?: string;
    artifact?: { type: OutputType; rawContent: string };
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Claude request failed");
  }

  return {
    content: data.content ?? "",
    artifact: data.artifact,
  };
}
