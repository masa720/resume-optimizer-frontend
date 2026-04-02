"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAnalysis } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  BuildingOffice2Icon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

const analysisSchema = z.object({
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters"),
  resumeText: z.string().min(10, "Resume must be at least 10 characters"),
  companyName: z.string().optional(),
  jobPosition: z.string().optional(),
});

type AnalysisForm = z.infer<typeof analysisSchema>;

const NewAnalysisPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalysisForm>({
    resolver: zodResolver(analysisSchema),
  });

  const mutation = useMutation({
    mutationFn: createAnalysis,
    onSuccess: (data) => {
      router.push(`/analyses/${data.id}`);
    },
  });

  const onSubmit = (data: AnalysisForm) => {
    mutation.mutate({
      jobDescription: data.jobDescription,
      resumeText: data.resumeText,
      companyName: data.companyName || "",
      jobPosition: data.jobPosition || "",
    });
  };

  if (mutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Analyzing your resume...
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Analyze Resume
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="reveal-up-delay space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card-surface p-5">
            <label
              htmlFor="companyName"
              className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              <BuildingOffice2Icon className="size-3.5" />
              Company Name
            </label>
            <Input
              id="companyName"
              placeholder="ex. Stripe"
              className="h-11 rounded-(--radius-control) border border-border/70 bg-background/70 text-sm"
              {...register("companyName")}
            />
          </div>
          <div className="card-surface p-5">
            <label
              htmlFor="jobPosition"
              className="mb-2 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              <BriefcaseIcon className="size-3.5" />
              Target Role
            </label>
            <Input
              id="jobPosition"
              placeholder="ex. Product Engineer"
              className="h-11 rounded-(--radius-control) border border-border/70 bg-background/70 text-sm"
              {...register("jobPosition")}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card-surface p-5">
            <label
              htmlFor="jobDescription"
              className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              Job Description
              <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description here..."
              rows={16}
              className="min-h-80 resize-y rounded-(--radius-control) border border-border/70 bg-background/70 p-3 text-sm leading-relaxed"
              {...register("jobDescription")}
            />
            {errors.jobDescription && (
              <p className="mt-2 text-sm text-destructive">
                {errors.jobDescription.message}
              </p>
            )}
          </div>

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
              placeholder="Paste your resume text here..."
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
        </div>

        {mutation.error && (
          <div className="rounded-(--radius-chip) border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {mutation.error.message}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-sm font-semibold sm:w-auto sm:min-w-64"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewAnalysisPage;
