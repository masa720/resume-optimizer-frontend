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

export type AnalysisVersion = {
  version: number;
  jobDescription: string;
  resumeText: string;
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
};

export const ANALYSIS_STATUSES = [
  "not_applied",
  "applied",
  "phone_screen",
  "assessment",
  "interview_1",
  "interview_2",
  "final_interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type PresetStatus = (typeof ANALYSIS_STATUSES)[number];
export type AnalysisStatus = PresetStatus | (string & {});

export const STATUS_LABELS: Record<PresetStatus, string> = {
  not_applied: "Not Applied",
  applied: "Applied",
  phone_screen: "Phone Screen",
  assessment: "Assessment",
  interview_1: "1st Interview",
  interview_2: "2nd Interview",
  final_interview: "Final Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export type Profile = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export type Analysis = {
  id: string;
  userId: string;
  companyName: string;
  jobPosition: string;
  status: AnalysisStatus;
  versions: AnalysisVersion[];
  createdAt: string;
  updatedAt: string;
};

export type AnalysesQueryParams = {
  page?: number;
  limit?: number;
  sort?: "created_at" | "updated_at" | "status";
  order?: "asc" | "desc";
  company?: string;
  position?: string;
  status?: string;
};

export type PaginatedAnalyses = {
  data: Analysis[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};
