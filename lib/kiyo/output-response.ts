import { extractJsonPayload, extractSvg } from "@/lib/kiyo/parsers";
import type { OutputType } from "@/lib/kiyo/types";

type OutputSuccess = {
  content: string;
  provider: "gemini" | "claude";
  artifact: {
    type: OutputType;
    rawContent: string;
  };
};

type OutputFailure = {
  error: string;
  content?: string;
  status: number;
};

export function parseOutputContent(
  content: string,
  outputType: OutputType,
  provider: OutputSuccess["provider"],
): OutputSuccess | OutputFailure {
  if (!content) {
    return { error: "Empty model response", status: 500 };
  }

  if (outputType === "pptx") {
    const payload = extractJsonPayload(content);
    if (!payload) {
      return {
        error: "Failed to parse PPTX JSON from model response",
        content,
        status: 422,
      };
    }

    return {
      content,
      provider,
      artifact: {
        type: "pptx",
        rawContent: JSON.stringify(payload),
      },
    };
  }

  const svg = extractSvg(content);
  if (!svg) {
    return {
      error: "Failed to parse SVG from model response",
      content,
      status: 422,
    };
  }

  return {
    content,
    provider,
    artifact: {
      type: "svg",
      rawContent: svg,
    },
  };
}
