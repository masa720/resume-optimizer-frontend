"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalysisById } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import type {
  Analysis,
  FormatCheck,
  RewriteSuggestion,
  SectionFeedback,
  StructuredSkill,
} from "@/lib/types";

// --- Score Section ---
const ScoreSection = ({ analysis }: { analysis: Analysis }) => {
  const breakdown = analysis.scoreBreakdown;
  const overallScore = breakdown?.overall ?? analysis.matchScore;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Score</CardTitle>
        <CardDescription>
          How well your resume matches the job description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold">{overallScore}%</span>
        </div>
        <Progress value={overallScore} />

        {breakdown && (
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Hard Skills (Required)
              </p>
              <p className="text-lg font-semibold">
                {breakdown.hardSkillRequired}%
              </p>
              <Progress value={breakdown.hardSkillRequired} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Hard Skills (Preferred)
              </p>
              <p className="text-lg font-semibold">
                {breakdown.hardSkillPreferred}%
              </p>
              <Progress value={breakdown.hardSkillPreferred} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Soft Skills</p>
              <p className="text-lg font-semibold">{breakdown.softSkill}%</p>
              <Progress value={breakdown.softSkill} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// --- Skills Section ---
const SkillsSection = ({ skills }: { skills: StructuredSkill[] }) => {
  const matched = skills.filter((s) => s.matched);
  const missing = skills.filter((s) => !s.matched);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Match Details</CardTitle>
        <CardDescription>
          {matched.length} matched, {missing.length} missing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className={`flex items-center justify-between rounded-md border p-3 ${
                skill.matched ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={skill.matched ? "text-green-600" : "text-red-600"}>
                  {skill.matched ? "\u2713" : "\u2717"}
                </span>
                <span className="font-medium">{skill.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {skill.category}
                </Badge>
                <Badge
                  variant={skill.importance === "required" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {skill.importance}
                </Badge>
              </div>
              {skill.resumeEvidence && (
                <p className="max-w-md text-sm text-muted-foreground">
                  {skill.resumeEvidence}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Legacy Keywords Fallback ---
const KeywordsFallback = ({
  matchedKeywords,
  missingKeywords,
}: {
  matchedKeywords: string[];
  missingKeywords: string[];
}) => (
  <div className="grid grid-cols-2 gap-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-green-600">
          Matched Keywords ({matchedKeywords?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {matchedKeywords?.map((keyword) => (
          <Badge
            key={keyword}
            variant="secondary"
            className="bg-green-100 text-green-800"
          >
            {keyword}
          </Badge>
        ))}
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">
          Missing Keywords ({missingKeywords?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {missingKeywords?.map((keyword) => (
          <Badge
            key={keyword}
            variant="secondary"
            className="bg-red-100 text-red-800"
          >
            {keyword}
          </Badge>
        ))}
      </CardContent>
    </Card>
  </div>
);

// --- Section Feedback ---
const SectionFeedbackList = ({
  feedback,
}: {
  feedback: SectionFeedback[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Resume Section Analysis</CardTitle>
      <CardDescription>
        How each section of your resume performs
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {feedback.map((item) => (
        <div key={item.section} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.section}</span>
            {item.score === 0 ? (
              <Badge variant="destructive">Missing</Badge>
            ) : (
              <span className="text-sm font-semibold">{item.score}%</span>
            )}
          </div>
          {item.score > 0 && <Progress value={item.score} />}
          <p className="text-sm text-muted-foreground">{item.feedback}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);

// --- Format Checks ---
const FormatCheckList = ({ checks }: { checks: FormatCheck[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>ATS Format Checks</CardTitle>
      <CardDescription>
        Formatting best practices for applicant tracking systems
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {checks.map((check) => (
          <li key={check.item} className="flex items-start gap-3">
            <span
              className={`mt-0.5 text-lg ${
                check.status === "pass" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {check.status === "pass" ? "\u2713" : "\u26A0"}
            </span>
            <div>
              <p className="font-medium">{check.item}</p>
              <p className="text-sm text-muted-foreground">{check.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// --- Rewrite Suggestions ---
const RewriteList = ({ rewrites }: { rewrites: RewriteSuggestion[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Rewrite Suggestions</CardTitle>
      <CardDescription>
        Concrete improvements with missing keywords incorporated
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {rewrites.map((rewrite, index) => (
        <div key={index} className="space-y-2">
          <Badge variant="secondary">{rewrite.section}</Badge>
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-muted-foreground">Before</p>
            <p className="line-through">{rewrite.before}</p>
          </div>
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-medium text-muted-foreground">After</p>
            <p>{rewrite.after}</p>
          </div>
          <p className="text-sm text-muted-foreground">{rewrite.reason}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);

// --- Suggestions Fallback ---
const SuggestionsFallback = ({ suggestions }: { suggestions: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Suggestions</CardTitle>
      <CardDescription>
        AI-powered recommendations to improve your resume
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {suggestions?.map((suggestion, index) => (
          <li key={index} className="flex gap-3">
            <span className="font-medium text-muted-foreground">
              {index + 1}.
            </span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// --- Main Page ---
const AnalysisResultPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);

  const {
    data: analysis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => fetchAnalysisById(id),
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading analysis...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">
          {error?.message || "Analysis not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {analysis.companyName || "Analysis Result"}
          </h1>
          {analysis.jobPosition && (
            <p className="text-muted-foreground">{analysis.jobPosition}</p>
          )}
        </div>
        <Link href="/">
          <Button variant="outline">New Analysis</Button>
        </Link>
      </div>

      <ScoreSection analysis={analysis} />

      {analysis.structuredSkills ? (
        <SkillsSection skills={analysis.structuredSkills} />
      ) : (
        <KeywordsFallback
          matchedKeywords={analysis.matchedKeywords}
          missingKeywords={analysis.missingKeywords}
        />
      )}

      {analysis.sectionFeedback && (
        <SectionFeedbackList feedback={analysis.sectionFeedback} />
      )}

      {analysis.formatChecks && (
        <FormatCheckList checks={analysis.formatChecks} />
      )}

      {analysis.rewrites ? (
        <RewriteList rewrites={analysis.rewrites} />
      ) : (
        <SuggestionsFallback suggestions={analysis.suggestions} />
      )}
    </div>
  );
};

export default AnalysisResultPage;
