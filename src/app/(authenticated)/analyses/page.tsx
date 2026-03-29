"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAnalysis, fetchAnalyses } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

const AnalysisResultPage = () => {
  const queryClient = useQueryClient();

  const {
    data: analyses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analyses"],
    queryFn: fetchAnalyses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold">Analysis History</h1>
        <p className="text-muted-foreground">No analyses yet.</p>
        <Link href="/">
          <Button>Create your first analysis</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analysis History</h1>
        <Link href="/">
          <Button>New Analysis</Button>
        </Link>
      </div>

      {analyses.map((analysis) => (
        <Link key={analysis.id} href={`/analyses/${analysis.id}`}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {analysis.companyName || "Untitled"}
                  {analysis.jobPosition && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      — {analysis.jobPosition}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      analysis.matchScore >= 70 ? "default" : "secondary"
                    }
                  >
                    {analysis.matchScore}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm("Delete this analysis?")) {
                        deleteMutation.mutate(analysis.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {" · "}
                {analysis.matchedKeywords?.length || 0} matched,{" "}
                {analysis.missingKeywords?.length || 0} missing keywords
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default AnalysisResultPage;
