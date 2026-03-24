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
        <p className="text-red-500">{error?.message || "Analysis not found"}</p>
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

      {/* Match Score */}
      <Card>
        <CardHeader>
          <CardTitle>Match Score</CardTitle>
          <CardDescription>
            How well your resume matches the job description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{analysis.matchScore}%</span>
          </div>
          <Progress value={analysis.matchScore} />
        </CardContent>
      </Card>

      {/* Keywords */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Matched Keywords ({analysis.matchedKeywords?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.matchedKeywords?.map((keyword) => (
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
              Missing Keywords ({analysis.missingKeywords?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.missingKeywords?.map((keyword) => (
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

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
          <CardDescription>
            AI-powered recommendations to improve your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.suggestions?.map((suggestion, index) => (
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
    </div>
  );
};

export default AnalysisResultPage;
