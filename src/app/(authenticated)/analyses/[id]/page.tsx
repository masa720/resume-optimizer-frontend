"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAnalysisById, updateAnalysisStatus } from "@/lib/api";
import type { AnalysisStatus } from "@/lib/types";
import StatusBadge from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ScoreRing from "@/components/score-ring";
import {
  ArrowPathIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import type {
  Analysis,
  AnalysisVersion,
  FormatCheck,
  RewriteSuggestion,
  SectionFeedback,
  StructuredSkill,
} from "@/lib/types";

// ── Types for version-aware display ────────────────────────────────
type VersionData = {
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
};

type ScoreBreakdown = {
  hardSkillRequired: number;
  hardSkillPreferred: number;
  softSkill: number;
  overall: number;
};

// ── Version Switcher ───────────────────────────────────────────────
const VersionSwitcher = ({
  versions,
  currentIndex,
  onChange,
}: {
  versions: { version: number; score: number; createdAt: string }[];
  currentIndex: number;
  onChange: (index: number) => void;
}) => (
  <div className="card-surface p-6">
    <h2 className="text-base font-bold text-foreground">Version History</h2>
    <p className="mt-1 text-sm text-muted-foreground">
      Compare how your resume improved across versions
    </p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {versions.map((v, i) => {
        const isActive = i === currentIndex;
        const prevScore = i > 0 ? versions[i - 1].score : null;
        const diff = prevScore !== null ? v.score - prevScore : null;

        return (
          <button
            key={v.version}
            onClick={() => onChange(i)}
            className={`flex items-center gap-4 rounded-(--radius-surface) border px-4 py-3.5 text-left transition-all ${
              isActive
                ? "border-primary bg-primary/8 shadow-sm"
                : "border-border/60 bg-card hover:border-border hover:shadow-sm"
            }`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              v{v.version}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tabular-nums text-foreground">
                  {v.score}
                </span>
                {diff !== null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                      diff > 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : diff < 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : diff === 0 ? "±0" : diff}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(v.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// ── Text Modal ─────────────────────────────────────────────────────
const TextModal = ({
  icon,
  title,
  content,
  open,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      setCopied(false);
    };
  }, [open, onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-(--radius-surface) border border-border/60 bg-popover shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
          {icon}
          <h2 className="flex-1 text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-(--radius-control) px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="size-4 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <ClipboardIcon className="size-4" />
                Copy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-(--radius-control) p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>
        <div
          className="overflow-y-auto px-6 py-5"
          style={{ maxHeight: "calc(80vh - 65px)" }}
        >
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ── Score Hero ──────────────────────────────────────────────────────
const ScoreSection = ({ data }: { data: VersionData }) => {
  const breakdown = data.scoreBreakdown;
  const overallScore = breakdown?.overall ?? data.matchScore;

  return (
    <div className="rounded-2xl bg-card p-8 shadow-md">
      <div className="flex flex-col items-center">
        <ScoreRing score={overallScore} size={180} strokeWidth={12} />
        <h2 className="mt-4 text-lg font-bold">Resume Match Score</h2>
        <p className="text-sm text-muted-foreground">
          How well your resume matches this job
        </p>
      </div>

      {breakdown && (
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 place-items-center gap-6 border-t pt-8">
          <ScoreRing
            score={breakdown.hardSkillRequired}
            size={80}
            strokeWidth={6}
            label="Hard Skills (Required)"
          />
          <ScoreRing
            score={breakdown.hardSkillPreferred}
            size={80}
            strokeWidth={6}
            label="Hard Skills (Preferred)"
          />
          <ScoreRing
            score={breakdown.softSkill}
            size={80}
            strokeWidth={6}
            label="Soft Skills"
          />
        </div>
      )}
    </div>
  );
};

// ── Skills ──────────────────────────────────────────────────────────
const SkillsSection = ({ skills }: { skills: StructuredSkill[] }) => {
  const matched = skills.filter((s) => s.matched);
  const missing = skills.filter((s) => !s.matched);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-md">
      <h2 className="text-lg font-bold">🎯 Skill Match</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {matched.length} matched · {missing.length} missing
      </p>

      <div className="mt-5 space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              skill.matched ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            <span className="text-base">{skill.matched ? "✅" : "❌"}</span>

            <span className="w-44 shrink-0 text-sm font-medium">
              {skill.name}
            </span>

            <Badge
              variant="outline"
              className={`inline-flex w-24 justify-center text-xs font-medium ${
                skill.category.toLowerCase().includes("hard")
                  ? "border-violet-200 bg-violet-100 text-violet-900"
                  : skill.category.toLowerCase().includes("soft")
                    ? "border-cyan-200 bg-cyan-100 text-cyan-900"
                    : "border-zinc-200 bg-zinc-100 text-zinc-800"
              }`}
            >
              {skill.category}
            </Badge>
            <Badge
              variant="outline"
              className={`inline-flex w-24 justify-center text-xs font-medium ${
                skill.importance === "required"
                  ? "border-rose-200 bg-rose-100 text-rose-900"
                  : "border-emerald-200 bg-emerald-100 text-emerald-900"
              }`}
            >
              {skill.importance}
            </Badge>

            {skill.resumeEvidence && (
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {skill.resumeEvidence}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Section Feedback ────────────────────────────────────────────────
const SectionFeedbackList = ({ feedback }: { feedback: SectionFeedback[] }) => (
  <div className="rounded-2xl bg-card p-6 shadow-md">
    <h2 className="text-lg font-bold">📊 Section Analysis</h2>
    <p className="mt-1 text-sm text-muted-foreground">
      How each section of your resume performs
    </p>

    <div className="mt-5 space-y-5">
      {feedback.map((item) => (
        <div key={item.section}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{item.section}</span>
            {item.score === 0 ? (
              <Badge variant="destructive">Missing</Badge>
            ) : (
              <span className="text-sm font-bold tabular-nums">
                {item.score}%
              </span>
            )}
          </div>
          {item.score > 0 && (
            <div className="mt-2">
              <Progress value={item.score} className="h-2" />
            </div>
          )}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.feedback}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// ── Format Checks ───────────────────────────────────────────────────
const FormatCheckList = ({ checks }: { checks: FormatCheck[] }) => (
  <div className="rounded-2xl bg-card p-6 shadow-md">
    <h2 className="text-lg font-bold">📋 ATS Format Checks</h2>
    <p className="mt-1 text-sm text-muted-foreground">
      Formatting best practices for applicant tracking systems
    </p>

    <div className="mt-5 space-y-3">
      {checks.map((check) => (
        <div
          key={check.item}
          className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${
            check.status === "pass" ? "bg-emerald-50" : "bg-amber-50"
          }`}
        >
          <span className="text-base">
            {check.status === "pass" ? "✅" : "⚠️"}
          </span>
          <div>
            <p className="text-sm font-semibold">{check.item}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {check.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Rewrite Suggestions ─────────────────────────────────────────────
const RewriteList = ({ rewrites }: { rewrites: RewriteSuggestion[] }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="rounded-2xl bg-card p-6 shadow-md">
      <h2 className="text-lg font-bold">✍️ Rewrite Suggestions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Concrete improvements with missing keywords incorporated
      </p>

      <div className="mt-5 space-y-6">
        {rewrites.map((rewrite, index) => (
          <div key={index}>
            <Badge variant="secondary" className="mb-3">
              {rewrite.section}
            </Badge>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
                  ❌ Before
                </p>
                <p className="text-sm leading-relaxed text-red-900 line-through decoration-red-300">
                  {rewrite.before}
                </p>
              </div>
              <div className="relative rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    ✅ After
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(rewrite.after, index)}
                    className="flex items-center gap-1 rounded-(--radius-control) px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                  >
                    {copiedIndex === index ? (
                      <>
                        <ClipboardDocumentCheckIcon className="size-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="size-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-emerald-900">
                  {rewrite.after}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              💡 {rewrite.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Helper: extract version data from Analysis or AnalysisVersion ──
const getVersionData = (
  analysis: Analysis,
  version: AnalysisVersion | null,
): VersionData => {
  const source = version ?? analysis.versions[analysis.versions.length - 1];
  return {
    jobDescription: source.jobDescription,
    resumeText: source.resumeText,
    matchScore: source.matchScore,
    matchedKeywords: source.matchedKeywords,
    missingKeywords: source.missingKeywords,
    suggestions: source.suggestions,
    structuredSkills: source.structuredSkills,
    sectionFeedback: source.sectionFeedback,
    formatChecks: source.formatChecks,
    rewrites: source.rewrites,
    scoreBreakdown: source.scoreBreakdown,
  };
};

// ── Main Page ───────────────────────────────────────────────────────
const AnalysisResultPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(-1);
  const [textModal, setTextModal] = useState<"jd" | "resume" | null>(null);

  const queryClient = useQueryClient();

  const {
    data: analysis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => fetchAnalysisById(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: AnalysisStatus }) =>
      updateAnalysisStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis", id] });
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });

  const versions = useMemo(
    () => analysis?.versions ?? [],
    [analysis?.versions],
  );
  const hasVersions = versions.length > 1;

  // Build summary list for the version switcher
  const versionList = useMemo(
    () =>
      versions.map((v) => ({
        version: v.version,
        score: v.scoreBreakdown?.overall ?? v.matchScore,
        createdAt: v.createdAt,
      })),
    [versions],
  );

  // -1 means "latest" (top-level data on Analysis)
  const activeData = useMemo(() => {
    if (!analysis) return null;
    if (selectedVersionIndex === -1) {
      return getVersionData(analysis, null);
    }
    return getVersionData(analysis, versions[selectedVersionIndex]);
  }, [analysis, versions, selectedVersionIndex]);

  const handleVersionChange = (index: number) => {
    // Last version = latest = same as top-level data
    if (index === versions.length - 1) {
      setSelectedVersionIndex(-1);
    } else {
      setSelectedVersionIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !analysis || !activeData) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-destructive">
          {error?.message || "Analysis not found"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="flex items-center gap-10">
          <h1 className="text-3xl font-bold tracking-tight">
            {analysis.companyName || "Analysis Result"}
          </h1>
          <StatusBadge
            status={analysis.status ?? "not_applied"}
            onChange={(status) => statusMutation.mutate({ status })}
          />
          {hasVersions && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {versionList.length} versions
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3">
          {analysis.jobPosition && (
            <p className="text-base text-muted-foreground">
              {analysis.jobPosition}
            </p>
          )}
          <Link
            href={`/analyses/${id}/edit`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                "gap-2 border-primary/40 text-primary hover:bg-primary/10",
            })}
          >
            <ArrowPathIcon className="size-4" />
            Re-analyze
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8">
        {hasVersions && (
          <VersionSwitcher
            versions={versionList}
            currentIndex={
              selectedVersionIndex === -1
                ? versionList.length - 1
                : selectedVersionIndex
            }
            onChange={handleVersionChange}
          />
        )}

        <ScoreSection data={activeData} />

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTextModal("jd")}
            className="card-surface flex items-center gap-3 px-6 py-4 text-left shadow-md transition-colors hover:bg-muted/30"
          >
            <BriefcaseIcon className="size-5 text-muted-foreground" />
            <span className="flex-1 text-lg font-bold text-foreground">
              Job Description
            </span>
            <span className="text-sm text-muted-foreground">Click to view</span>
          </button>
          <button
            type="button"
            onClick={() => setTextModal("resume")}
            className="card-surface flex items-center gap-3 px-6 py-4 text-left shadow-md transition-colors hover:bg-muted/30"
          >
            <DocumentTextIcon className="size-5 text-muted-foreground" />
            <span className="flex-1 text-lg font-bold text-foreground">
              Resume
            </span>
            <span className="text-sm text-muted-foreground">Click to view</span>
          </button>
        </div>

        <TextModal
          icon={<BriefcaseIcon className="size-5 text-muted-foreground" />}
          title="Job Description"
          content={activeData.jobDescription}
          open={textModal === "jd"}
          onClose={() => setTextModal(null)}
        />
        <TextModal
          icon={<DocumentTextIcon className="size-5 text-muted-foreground" />}
          title="Resume"
          content={activeData.resumeText}
          open={textModal === "resume"}
          onClose={() => setTextModal(null)}
        />

        {activeData.structuredSkills && (
          <SkillsSection skills={activeData.structuredSkills} />
        )}

        {activeData.sectionFeedback && (
          <SectionFeedbackList feedback={activeData.sectionFeedback} />
        )}

        {activeData.formatChecks && (
          <FormatCheckList checks={activeData.formatChecks} />
        )}

        {activeData.rewrites && <RewriteList rewrites={activeData.rewrites} />}
      </div>
    </div>
  );
};

export default AnalysisResultPage;
