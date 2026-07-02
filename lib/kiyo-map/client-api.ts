import type { ShapeIdeasResponse } from "@/lib/kiyo-map/prompts";

type ShapeIdeasRequest = {
  ideas: {
    id: string;
    title: string;
    memo: string;
    createdAt: string;
  }[];
  categories: string[];
};

export async function requestShapeIdeas(
  payload: ShapeIdeasRequest,
): Promise<ShapeIdeasResponse> {
  const response = await fetch("/api/kiyo-map/shape-ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ShapeIdeasResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "アイディアの提案に失敗しました");
  }

  return data;
}
