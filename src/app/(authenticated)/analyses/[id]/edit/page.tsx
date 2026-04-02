"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchAnalysisById, createAnalysisVersion } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

const versionSchema = z.object({
  resumeText: z.string().min(10, "Resume must be at least 10 characters"),
});

type VersionForm = z.infer<typeof versionSchema>;

const EditAnalysisPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => fetchAnalysisById(id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VersionForm>({
    resolver: zodResolver(versionSchema),
    values: analysis
      ? { resumeText: analysis.versions[0]?.resumeText ?? "" }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: VersionForm) =>
      createAnalysisVersion(id, {
        jobDescription: analysis?.versions[0]?.jobDescription ?? "",
        resumeText: data.resumeText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis", id] });
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      router.push(`/analyses/${id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const currentVersion = analysis?.versions?.length
    ? analysis.versions.length + 1
    : 2;

  if (mutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Re-analyzing your resume...
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          This may take up to a minute
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="reveal-up">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Re-analyze
          </h1>
          {analysis && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              v{currentVersion}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {analysis?.companyName && `${analysis.companyName} · `}
          {analysis?.jobPosition && `${analysis.jobPosition} · `}
          Update your resume and run the analysis again
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="reveal-up-delay space-y-6"
      >
        <div className="card-surface p-5">
          <label
            htmlFor="resumeText"
            className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            Your Resume
            <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="resumeText"
            placeholder="Paste your updated resume text here..."
            rows={16}
            className="min-h-80 resize-y rounded-(--radius-control) border border-border/70 bg-background/70 p-3 text-sm leading-relaxed"
            {...register("resumeText")}
          />
          {errors.resumeText && (
            <p className="mt-2 text-sm text-destructive">
              {errors.resumeText.message}
            </p>
          )}
        </div>

        {mutation.error && (
          <div className="rounded-(--radius-chip) border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {mutation.error.message}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 text-sm font-semibold"
            onClick={() => router.push(`/analyses/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-sm font-semibold sm:w-auto sm:min-w-64"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Analyzing..." : "Re-analyze"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditAnalysisPage;
