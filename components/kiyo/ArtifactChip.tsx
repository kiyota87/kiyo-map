import { FileCode2, Presentation } from "lucide-react";
import type { Artifact } from "@/lib/kiyo/types";

type ArtifactChipProps = {
  artifact: Artifact;
  active: boolean;
  onSelect: () => void;
};

export function ArtifactChip({
  artifact,
  active,
  onSelect,
}: ArtifactChipProps) {
  const Icon = artifact.type === "pptx" ? Presentation : FileCode2;
  const label = artifact.type === "pptx" ? "PPTX" : "図解 SVG";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
        active
          ? "kiyo-tab-active"
          : "kiyo-card text-[var(--kiyo-text-secondary)] hover:text-[var(--kiyo-text-primary)]"
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
