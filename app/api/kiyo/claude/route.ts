import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildClaudeSystemPrompt } from "@/lib/kiyo/prompts";
import { extractJsonPayload, extractSvg } from "@/lib/kiyo/parsers";
import { requireAuth } from "@/lib/kiyo/require-auth";
import type { ApiChatMessage, OutputType } from "@/lib/kiyo/types";

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  let body: {
    messages?: ApiChatMessage[];
    outputType?: OutputType;
    researchSummary?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages = [], outputType, researchSummary } = body;
  if (!outputType || !["pptx", "svg"].includes(outputType)) {
    return NextResponse.json({ error: "Invalid outputType" }, { status: 400 });
  }
  if (messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  const client = new Anthropic({ apiKey });

  const anthropicMessages = messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const userSections = [
    researchSummary
      ? `# Research まとめ\n\n${researchSummary}`
      : null,
    `# ユーザー指示\n\n${messages[messages.length - 1]?.content ?? ""}`,
  ].filter(Boolean);

  anthropicMessages[anthropicMessages.length - 1] = {
    role: "user",
    content: userSections.join("\n\n---\n\n"),
  };

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 8192,
      system: buildClaudeSystemPrompt(outputType),
      messages: anthropicMessages.slice(-20),
    });

    const content = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    if (!content) {
      return NextResponse.json({ error: "Empty Claude response" }, { status: 500 });
    }

    if (outputType === "pptx") {
      const payload = extractJsonPayload(content);
      if (!payload) {
        return NextResponse.json(
          { error: "Failed to parse PPTX JSON from Claude response", content },
          { status: 422 },
        );
      }
      return NextResponse.json({
        content,
        artifact: {
          type: "pptx",
          rawContent: JSON.stringify(payload),
        },
      });
    }

    const svg = extractSvg(content);
    if (!svg) {
      return NextResponse.json(
        { error: "Failed to parse SVG from Claude response", content },
        { status: 422 },
      );
    }

    return NextResponse.json({
      content,
      artifact: {
        type: "svg",
        rawContent: svg,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Claude request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
