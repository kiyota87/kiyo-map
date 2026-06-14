import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/kiyo/gemini-server";
import {
  buildSummaryPrompt,
  buildTitlePrompt,
  formatResearchLog,
} from "@/lib/kiyo/prompts";
import { requireAuth } from "@/lib/kiyo/require-auth";
import type { ApiChatMessage } from "@/lib/kiyo/types";

type GeminiTask = "summarize" | "title";

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  let body: { task?: GeminiTask; messages?: ApiChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { task, messages = [] } = body;
  if (!task || !["summarize", "title"].includes(task)) {
    return NextResponse.json({ error: "Invalid task" }, { status: 400 });
  }
  if (messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const researchLog = formatResearchLog(messages);
  const prompt =
    task === "summarize"
      ? buildSummaryPrompt(researchLog)
      : buildTitlePrompt(researchLog);

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text) {
      return NextResponse.json({ error: "Empty Gemini response" }, { status: 500 });
    }

    if (task === "summarize") {
      return NextResponse.json({ summary: text });
    }

    return NextResponse.json({ title: text.replace(/^["'「]|["'」]$/g, "") });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini task failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
