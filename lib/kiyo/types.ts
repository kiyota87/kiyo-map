export type MessageRole = "user" | "assistant" | "error";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type OutputType = "pptx" | "svg";

export type Artifact = {
  id: string;
  type: OutputType;
  rawContent: string;
  createdAt: string;
};

export type KiyoSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  researchMessages: ChatMessage[];
  claudeMessages: ChatMessage[];
  artifacts: Artifact[];
  researchSummary: string | null;
  researchAttachedAt: string | null;
  titleGenerated: boolean;
};

export type PptxSlide = {
  title: string;
  bullets: string[];
};

export type PptxPayload = {
  slides: PptxSlide[];
};

export type ApiChatMessage = {
  role: "user" | "assistant";
  content: string;
};
