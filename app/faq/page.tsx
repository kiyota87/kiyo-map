import type { Metadata } from "next";

import { FaqWorkspace } from "@/components/faq/FaqWorkspace";
import faqData from "@/data/faq.json";
import { faqDataSchema } from "@/lib/faq-schema";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "社内FAQ（試作・非メンテ）",
  description:
    "社内FAQ の試作。本開発は company-faq-ui リポジトリで継続します。",
};

/**
 * 採用テンプレ repo 上の試作ルート。社内 FAQ の本開発は `company-faq-ui`（別 repo）。
 * このページは更新しない。
 */
export default function FaqPage() {
  const parsed = faqDataSchema.safeParse(faqData);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "不明な検証エラー";
    throw new Error(`FAQ データの形式が正しくありません: ${msg}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="mx-4 mt-4 border-border bg-muted/40">
        <CardContent className="pt-4 text-sm text-muted-foreground">
          社内 FAQ の本開発は{" "}
          <strong className="text-foreground">company-faq-ui</strong>{" "}
          リポジトリ（ルート `/`）で進めています。本 `/faq` は試作の名残で更新しません。
        </CardContent>
      </Card>
      <FaqWorkspace initialData={parsed.data} />
    </div>
  );
}
