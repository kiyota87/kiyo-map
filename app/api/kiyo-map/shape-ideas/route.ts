import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import {
  buildShapeIdeasPrompt,
  parseShapeIdeasResponse,
} from "@/lib/kiyo-map/prompts";
import { requireAuth } from "@/lib/kiyo/require-auth";

const requestSchema = z.object({
  ideas: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      memo: z.string(),
      createdAt: z.string(),
    }),
  ),
  categories: z.array(z.string()),
});

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = requestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { ideas, categories } = parsedBody.data;
  if (ideas.length === 0) {
    return NextResponse.json(
      { error: "アイディアが1件もありません" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 503 },
    );
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  const client = new Anthropic({ apiKey });
  const prompt = buildShapeIdeasPrompt(ideas, categories);

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const result = parseShapeIdeasResponse(content);
    if (!result) {
      return NextResponse.json(
        { error: "AI response could not be parsed", content },
        { status: 502 },
      );
    }

    const validIds = new Set(ideas.map((idea) => idea.id));
    const picks = result.picks.filter((pick) => validIds.has(pick.projectId));

    return NextResponse.json({ ...result, picks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Shape ideas request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
