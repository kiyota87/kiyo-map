import { z } from "zod";

export const shapeIdeaPickSchema = z.object({
  projectId: z.string(),
  reason: z.string(),
  suggestedCategory: z.string(),
  nextAction: z.string(),
  plan: z.string(),
});

export const shapeIdeasResponseSchema = z.object({
  picks: z.array(shapeIdeaPickSchema),
  summary: z.string().optional(),
});

export type ShapeIdeaPick = z.infer<typeof shapeIdeaPickSchema>;
export type ShapeIdeasResponse = z.infer<typeof shapeIdeasResponseSchema>;

export type ShapeIdeasProjectInput = {
  id: string;
  title: string;
  memo: string;
  createdAt: string;
};

export function buildShapeIdeasPrompt(
  ideas: ShapeIdeasProjectInput[],
  categories: string[],
): string {
  const ideaList = ideas
    .map(
      (idea, index) =>
        `${index + 1}. id=${idea.id}\n   タイトル: ${idea.title}\n   メモ: ${idea.memo || "（なし）"}\n   作成: ${idea.createdAt}`,
    )
    .join("\n\n");

  const categoryList = categories.filter((c) => c !== "アイディア").join("、");

  return `あなたは業務アイディアの実行コーチです。
「アイディア」カテゴリに貯まったメモのうち、今カタチにすると効果が高いものを選び、進め方を提案してください。

## 貯まっているアイディア
${ideaList || "（なし）"}

## 振り分け先カテゴリ候補（アイディア以外）
${categoryList || "HR/労務、AI推進、ブランディング、IT/セキュリティ、総務"}

## 出力ルール
- 必ず JSON のみを返す（Markdown コードブロック不要）
- picks は 1〜3 件。今すぐ動き出せるものを優先
- plan は 3〜5 行の箇条書き風テキスト（改行区切り）。ざっくりした進め方
- suggestedCategory は上記候補から選ぶ
- projectId は入力 id をそのまま使う

## JSON スキーマ
{
  "summary": "全体所感（1文）",
  "picks": [
    {
      "projectId": "string",
      "reason": "なぜ今これを形にすべきか（1〜2文）",
      "suggestedCategory": "string",
      "nextAction": "最初の1アクション（短く）",
      "plan": "ステップ1\\nステップ2\\n..."
    }
  ]
}`;
}

export function parseShapeIdeasResponse(raw: string): ShapeIdeasResponse | null {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    : trimmed;

  try {
    const parsed = shapeIdeasResponseSchema.safeParse(JSON.parse(jsonText));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
