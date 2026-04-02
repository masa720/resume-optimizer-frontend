"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchProfile } from "@/lib/api";
import { PlusIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const Home = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((profile) => setUsername(profile.username))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-8">
      <section className="card-surface reveal-up px-6 py-9 sm:px-8 sm:py-10">
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:whitespace-nowrap">
          {!loaded
            ? "\u00A0"
            : username
              ? `Welcome back, ${username}!`
              : "Make Your Resume Match the Job."}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Paste a job description and your resume to see match score, missing
          skills, and rewrite suggestions you can apply immediately.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/new">
            <Button size="lg" className="w-full sm:w-auto">
              <PlusIcon className="size-4" />
              Start Analyzing
            </Button>
          </Link>
          <Link href="/analyses">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-transparent bg-slate-200 text-slate-800 hover:bg-slate-300 sm:w-auto"
            >
              <ClockIcon className="size-4" />
              View History
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card-surface p-5">
          <p className="text-sm font-semibold text-foreground">1. Compare</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze your resume directly against the target job posting.
          </p>
        </article>
        <article className="card-surface p-5">
          <p className="text-sm font-semibold text-foreground">
            2. Identify Gaps
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            See missing keywords and skill mismatches at a glance.
          </p>
        </article>
        <article className="card-surface p-5">
          <p className="text-sm font-semibold text-foreground">
            3. Rewrite Fast
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Apply concrete rewrite suggestions to improve interview readiness.
          </p>
        </article>
      </section>
    </div>
  );
};

export default Home;
