import type { OutputType } from "@/lib/kiyo/types";

export const RESEARCH_SUMMARY_TEMPLATE = `# Research まとめ

## 論点

## 根拠・引用

## 未解決
`;

export function buildSummaryPrompt(researchLog: string): string {
  return `以下の Research 会話ログを、次の Markdown テンプレートに沿って日本語で要約してください。
見出しはテンプレートどおり維持し、箇条書きで簡潔にまとめてください。

${RESEARCH_SUMMARY_TEMPLATE}

--- Research ログ ---
${researchLog}`;
}

export function buildTitlePrompt(researchLog: string): string {
  return `以下の Research 会話から、サイドバー用の短いセッションタイトルを1行だけ生成してください。
20文字以内、引用符なし、説明なしでタイトルのみ返してください。

--- Research ログ ---
${researchLog}`;
}

export function buildOutputSystemPrompt(outputType: OutputType): string {
  if (outputType === "pptx") {
    return `You are an output assistant for slide decks.
Return ONLY a fenced JSON code block with this schema:
\`\`\`json
{
  "slides": [
    { "title": "string", "bullets": ["string"] }
  ]
}
\`\`\`
Rules:
- Use Japanese unless the user asks otherwise.
- First slide can have empty bullets for a cover slide.
- Do not include markdown outside the JSON code block.`;
  }

  return `You are an output assistant for diagrams.
Return ONLY a fenced SVG code block:
\`\`\`svg
<svg ...>...</svg>
\`\`\`
Rules:
- Use Japanese labels unless the user asks otherwise.
- SVG must be self-contained with xmlns.
- Do not include markdown outside the SVG code block.`;
}

/** @deprecated Phase 2 Claude API 用。ローカル検証は buildOutputSystemPrompt + /api/kiyo/output */
export const buildClaudeSystemPrompt = buildOutputSystemPrompt;

export function formatResearchLog(
  messages: { role: string; content: string }[],
): string {
  return messages
    .map((message) => `[${message.role}] ${message.content}`)
    .join("\n\n");
}
