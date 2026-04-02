"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

const signupSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setServerError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    try {
      await updateProfile(data.username);
    } catch {
      // Profile save failed — user can set it later
    }

    router.push("/");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px]">
          <div className="mb-10">
            <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                R
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Get started with Resume Optimizer
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-[13px] font-medium text-foreground"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                className="h-10"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-[13px] text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-10"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[13px] text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-[13px] font-medium text-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-10"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-[13px] text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-[13px] font-medium text-foreground"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-10"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-[13px] text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-2xl bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="h-10 w-full text-[13px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-center bg-muted/40 lg:flex">
        <div className="max-w-md space-y-4 px-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="text-primary"
            >
              <path
                d="M12 4.5v15m7.5-7.5h-15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            Start optimizing in seconds
          </h2>
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Paste a job description and your resume to get instant, actionable
            feedback. Our analysis helps you tailor your resume for maximum
            impact.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
