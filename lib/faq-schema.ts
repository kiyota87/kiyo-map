/**
 * 社内FAQ 4ペイン用の Zod スキーマ。
 * 採用ワークスペースの `lib/schema.ts` とは分離（ドメインが異なるため）。
 */

import { z } from "zod";

export const faqDomainSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type FaqDomain = z.infer<typeof faqDomainSchema>;

export const faqManualLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const faqEntrySchema = z.object({
  id: z.string(),
  primaryDomainId: z.string(),
  tags: z.array(z.string()),
  question: z.string(),
  answer: z.string(),
  relatedEntryIds: z.array(z.string()),
  manualLinks: z.array(faqManualLinkSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string().optional(),
  viewCount: z.number(),
  askedCount: z.number(),
});
export type FaqEntry = z.infer<typeof faqEntrySchema>;

export const faqDataSchema = z.object({
  workspace: z.object({
    name: z.string(),
    icon: z.string(),
  }),
  domains: z.array(faqDomainSchema),
  entries: z.array(faqEntrySchema),
});
export type FaqData = z.infer<typeof faqDataSchema>;
