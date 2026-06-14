"use client";

import DOMPurify from "isomorphic-dompurify";
import { Download } from "lucide-react";
import { useMemo } from "react";
import { downloadPptx } from "@/lib/kiyo/pptx-client";
import type { Artifact, OutputType, PptxPayload } from "@/lib/kiyo/types";
import { Button } from "@/components/ui/button";

type KiyoPreviewPaneProps = {
  artifact: Artifact | null;
  outputType: OutputType;
  viewMode: "preview" | "code";
};

function parsePptx(rawContent: string): PptxPayload | null {
  try {
    return JSON.parse(rawContent) as PptxPayload;
  } catch {
    return null;
  }
}

export function KiyoPreviewPane({
  artifact,
  outputType,
  viewMode,
}: KiyoPreviewPaneProps) {
  const pptxPayload =
    artifact?.type === "pptx" ? parsePptx(artifact.rawContent) : null;

  const sanitizedSvg = useMemo(() => {
    if (artifact?.type !== "svg") return "";
    return DOMPurify.sanitize(artifact.rawContent, {
      USE_PROFILES: { svg: true, svgFilters: true },
    });
  }, [artifact]);

  if (!artifact) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-[var(--kiyo-text-muted)]">
        Artifact を選択するとプレビューが表示されます。
      </div>
    );
  }

  if (viewMode === "code") {
    return (
      <pre className="h-full overflow-auto p-4 text-xs text-[var(--kiyo-text-secondary)]">
        {artifact.rawContent}
      </pre>
    );
  }

  if (artifact.type === "pptx" && pptxPayload) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-auto p-4">
        <div className="flex justify-end">
          <Button
            size="sm"
            className="kiyo-btn-accent"
            onClick={() =>
              downloadPptx(pptxPayload, `kiyo-slides-${Date.now()}.pptx`)
            }
          >
            <Download className="size-4" />
            PPTX をダウンロード
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pptxPayload.slides.map((slide, index) => (
            <div key={`${slide.title}-${index}`} className="kiyo-card p-3">
              <p className="mb-2 text-xs text-[var(--kiyo-text-muted)]">
                Slide {index + 1}
              </p>
              <p className="mb-2 text-sm font-semibold">{slide.title}</p>
              <ul className="flex flex-col gap-1 text-xs text-[var(--kiyo-text-secondary)]">
                {slide.bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artifact.type === "svg") {
    return (
      <div className="flex h-full items-center justify-center overflow-auto p-4">
        <div
          className="max-h-full max-w-full [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-6 text-sm text-[var(--kiyo-text-muted)]">
      {outputType === "pptx"
        ? "PPTX データを解析できませんでした。"
        : "SVG を表示できませんでした。"}
    </div>
  );
}
