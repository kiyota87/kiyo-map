import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/kiyo/gemini-server";
import { parseOutputContent } from "@/lib/kiyo/output-response";
import { buildOutputSystemPrompt } from "@/lib/kiyo/prompts";
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

  const userInstruction = messages[messages.length - 1]?.content ?? "";
  const userSections = [
    researchSummary ? `# Research まとめ\n\n${researchSummary}` : null,
    `# ユーザー指示\n\n${userInstruction}`,
  ].filter(Boolean);

  const prompt = `${buildOutputSystemPrompt(outputType)}

---
${userSections.join("\n\n---\n\n")}`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    const parsed = parseOutputContent(content, outputType, "gemini");

    if ("error" in parsed) {
      return NextResponse.json(
        { error: parsed.error, content: parsed.content },
        { status: parsed.status },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Output request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
