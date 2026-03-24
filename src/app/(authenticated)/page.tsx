"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAnalysis } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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

const Home = () => {
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

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>New Analysis</CardTitle>
          <CardDescription>
            Paste a job description and your resume to get optimization
            suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  placeholder="e.g. Google"
                  {...register("companyName")}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="jobPosition" className="text-sm font-medium">
                  Job Position
                </label>
                <Input
                  id="jobPosition"
                  placeholder="e.g. Software Engineer"
                  {...register("jobPosition")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="jobDescription" className="text-sm font-medium">
                Job Description *
              </label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                rows={8}
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="resumeText" className="text-sm font-medium">
                Resume *
              </label>
              <Textarea
                id="resumeText"
                placeholder="Paste your resume text here..."
                rows={8}
                {...register("resumeText")}
              />
              {errors.resumeText && (
                <p className="text-sm text-red-500">
                  {errors.resumeText.message}
                </p>
              )}
            </div>

            {mutation.error && (
              <p className="text-sm text-red-500">{mutation.error.message}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
