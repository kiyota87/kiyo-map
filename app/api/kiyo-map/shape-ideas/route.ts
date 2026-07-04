import { NextResponse } from "next/server";
import { z } from "zod";

import { getGeminiModel } from "@/lib/kiyo/gemini-server";
import { requireAuth } from "@/lib/kiyo/require-auth";
import {
  buildShapeIdeasPrompt,
  parseShapeIdeasResponse,
} from "@/lib/kiyo-map/prompts";

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

  const prompt = buildShapeIdeasPrompt(ideas, categories);

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    if (!content) {
      return NextResponse.json({ error: "Empty Gemini response" }, { status: 500 });
    }

    const parsed = parseShapeIdeasResponse(content);
    if (!parsed) {
      return NextResponse.json(
        { error: "AI response could not be parsed", content },
        { status: 502 },
      );
    }

    const validIds = new Set(ideas.map((idea) => idea.id));
    const picks = parsed.picks.filter((pick) => validIds.has(pick.projectId));

    return NextResponse.json({ ...parsed, picks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Shape ideas request failed";
    const status = message.includes("GOOGLE_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
