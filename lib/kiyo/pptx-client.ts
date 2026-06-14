import PptxGenJS from "pptxgenjs";
import type { PptxPayload } from "@/lib/kiyo/types";

export async function downloadPptx(payload: PptxPayload, fileName: string) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";

  for (const slide of payload.slides) {
    const page = pptx.addSlide();
    page.addText(slide.title, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: "221E42",
    });

    if (slide.bullets.length > 0) {
      page.addText(
        slide.bullets.map((bullet) => ({
          text: bullet,
          options: { bullet: true, breakLine: true },
        })),
        {
          x: 0.7,
          y: 1.5,
          w: 8.5,
          h: 4.5,
          fontSize: 18,
          color: "392171",
        },
      );
    }
  }

  await pptx.writeFile({ fileName });
}
