export type WritingCategory = "academic" | "research" | "blog" | "business";

export interface WritingSettings {
  category: WritingCategory;
  formality: "casual" | "conversational" | "professional" | "formal";
  humanizationLevel: number; // 0 to 100
  criticalThinkingLevel: number; // 0 to 100
  hedgingStyle: "minimal" | "moderate" | "balanced" | "pronounced";
  examplesWeight: "theoretical" | "balanced" | "anecdotal" | "empirical";
  citationStyle: "none" | "APA" | "MLA" | "Harvard" | "Chicago" | "IEEE" | "OSCOLA" | "Bluebook" | "AGLC";
  modelName?: "gemini-3.5-flash" | "gemini-3.1-flash-lite";
}

export interface AgentStepResult {
  step: "planner" | "sources" | "writer" | "humanizer" | "reviewer" | "editor";
  title: string;
  status: "idle" | "running" | "completed" | "failed";
  output: string;
  timestamp: string;
  isOfflineFallback?: boolean;
}

export interface FlaggedItem {
  id: string;
  phrase: string;
  type: "academic_buzzword" | "robotic_transition" | "vague_example" | "overcertainty" | "phrase_repetition" | "grand_abstract" | "polished_analogy" | "smooth_progression" | "dense_vocab";
  explanation: string;
  replacement: string;
  severity: "low" | "medium" | "high";
}

export interface SentenceAnalysis {
  text: string;
  length: number; // word count
  opener: string; // first word / couple words
  burstinessType: "short" | "medium" | "long";
}

export interface WritingMetrics {
  overallScore: number;
  burstinessScore: number; // variation of sentence length
  openingDiversityScore: number;
  transitionScore: number; // avoiding AI transitions
  certaintyScore: number; // healthy level of doubts / hedging
  exampleQualityScore: number; // concrete vs abstract
  repetitionScore: number; // vocabulary variety
  
  // Backing datasets
  sentenceLengths: number[];
  flaggedItems: FlaggedItem[];
  sentences: SentenceAnalysis[];
  wordCount: number;
  averageSentenceLength: number;
}

export interface DocumentVersion {
  id: string;
  timestamp: string;
  prompt: string;
  settings: WritingSettings;
  outputs: {
    outline: string;
    sources: string;
    rawDraft: string;
    humanizedDraft: string;
    critique: string;
    finalVersion: string;
  };
  metrics: {
    raw: WritingMetrics;
    final: WritingMetrics;
  };
}

export interface ScrapedLink {
  id: string;
  url: string;
  title: string;
  content: string;
  charCount: number;
  status: "idle" | "scraping" | "success" | "error";
  error?: string;
}

