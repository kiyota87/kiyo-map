import type { PptxPayload } from "@/lib/kiyo/types";

export function extractFencedBlock(
  content: string,
  language: string,
): string | null {
  const pattern = new RegExp(
    `\`\`\`${language}\\s*([\\s\\S]*?)\\s*\`\`\``,
    "i",
  );
  const match = content.match(pattern);
  return match?.[1]?.trim() ?? null;
}

export function extractJsonPayload(content: string): PptxPayload | null {
  const raw =
    extractFencedBlock(content, "json") ??
    extractFencedBlock(content, "JSON") ??
    content.trim();

  try {
    const parsed = JSON.parse(raw) as PptxPayload;
    if (!parsed?.slides || !Array.isArray(parsed.slides)) return null;
    return {
      slides: parsed.slides.map((slide) => ({
        title: String(slide.title ?? ""),
        bullets: Array.isArray(slide.bullets)
          ? slide.bullets.map((item) => String(item))
          : [],
      })),
    };
  } catch {
    return null;
  }
}

export function extractSvg(content: string): string | null {
  const fenced =
    extractFencedBlock(content, "svg") ?? extractFencedBlock(content, "SVG");
  if (fenced) return fenced;
  const inline = content.match(/<svg[\s\S]*<\/svg>/i);
  return inline?.[0]?.trim() ?? null;
}
