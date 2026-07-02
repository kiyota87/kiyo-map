import { z } from "zod";

export const projectStatusSchema = z.enum([
  "idea",
  "in_progress",
  "on_hold",
  "done",
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectPrioritySchema = z.enum(["S", "A", "B", "C"]);
export type ProjectPriority = z.infer<typeof projectPrioritySchema>;

export const projectHistoryEntrySchema = z.object({
  date: z.string(),
  content: z.string(),
});
export type ProjectHistoryEntry = z.infer<typeof projectHistoryEntrySchema>;

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: projectStatusSchema,
  category: z.string(),
  priority: projectPrioritySchema,
  progress: z.number().min(0).max(100),
  deadline: z.string().nullable(),
  nextAction: z.string(),
  memo: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
  history: z.array(projectHistoryEntrySchema),
  relatedProjectIds: z.array(z.string()),
  relatedNotes: z.string(),
  relatedAiKnowledge: z.string().nullable(),
});
export type Project = z.infer<typeof projectSchema>;

export const inboxItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  aiSuggestedCategory: z.string().nullable(),
  aiSuggestedStatus: projectStatusSchema.nullable(),
  resolved: z.boolean(),
});
export type InboxItem = z.infer<typeof inboxItemSchema>;

export const monthlyTopicTypeSchema = z.enum([
  "completed",
  "started",
  "blocked",
]);
export type MonthlyTopicType = z.infer<typeof monthlyTopicTypeSchema>;

export const monthlyTopicSchema = z.object({
  id: z.string(),
  month: z.string(),
  type: monthlyTopicTypeSchema,
  relatedProjectId: z.string(),
  draftText: z.string(),
  finalText: z.string(),
  confirmed: z.boolean(),
});
export type MonthlyTopic = z.infer<typeof monthlyTopicSchema>;

export const kiyoMapDataSchema = z.object({
  version: z.literal(1),
  workspace: z.object({
    name: z.string(),
    icon: z.string(),
  }),
  categories: z.array(z.string()),
  projects: z.array(projectSchema),
  inbox: z.array(inboxItemSchema),
  monthlyTopics: z.array(monthlyTopicSchema),
});
export type KiyoMapData = z.infer<typeof kiyoMapDataSchema>;
