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
  createdAt: string;
  updatedAt: string;
};
