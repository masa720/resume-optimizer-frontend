export type StructuredSkill = {
  name: string;
  category: "hard" | "soft";
  importance: "required" | "preferred";
  matched: boolean;
  resumeEvidence: string;
};

export type SectionFeedback = {
  section: string;
  score: number;
  feedback: string;
};

export type FormatCheck = {
  item: string;
  status: "pass" | "warning";
  message: string;
};

export type RewriteSuggestion = {
  section: string;
  before: string;
  after: string;
  reason: string;
};

export type ScoreBreakdown = {
  hardSkillRequired: number;
  hardSkillPreferred: number;
  softSkill: number;
  overall: number;
};

export type Analysis = {
  id: string;
  userId: string;
  jobDescription: string;
  resumeText: string;
  companyName: string;
  jobPosition: string;
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  structuredSkills: StructuredSkill[] | null;
  sectionFeedback: SectionFeedback[] | null;
  formatChecks: FormatCheck[] | null;
  rewrites: RewriteSuggestion[] | null;
  scoreBreakdown: ScoreBreakdown | null;
  createdAt: string;
  updatedAt: string;
};
