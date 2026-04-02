"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ScoreRing from "@/components/score-ring";
import StatusBadge from "@/components/status-badge";
import { deleteAnalysis, fetchAnalyses, updateAnalysisStatus } from "@/lib/api";
import {
  ANALYSIS_STATUSES,
  AnalysesQueryParams,
  AnalysisStatus,
  STATUS_LABELS,
} from "@/lib/types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const LIMIT = 10;

const AnalysisHistoryPage = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<AnalysesQueryParams["sort"]>("created_at");
  const [order, setOrder] = useState<AnalysesQueryParams["order"]>("desc");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const params: AnalysesQueryParams = {
    page,
    limit: LIMIT,
    sort,
    order,
    ...(appliedSearch && { company: appliedSearch, position: appliedSearch }),
    ...(statusFilter && { status: statusFilter }),
  };

  const {
    data: result,
    isLoading,
    error,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["analyses", params] as const,
    queryFn: () => fetchAnalyses(params),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AnalysisStatus }) =>
      updateAnalysisStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  };

  const clearAllFilters = () => {
    clearSearch();
    setStatusFilter("");
  };

  const toggleSort = (column: AnalysesQueryParams["sort"]) => {
    if (sort === column) {
      setOrder(order === "desc" ? "asc" : "desc");
    } else {
      setSort(column);
      setOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ column }: { column: AnalysesQueryParams["sort"] }) => {
    if (sort !== column) return <ChevronUpDownIcon className="size-4" />;
    return order === "desc" ? (
      <ChevronDownIcon className="size-4" />
    ) : (
      <ChevronUpIcon className="size-4" />
    );
  };

  const analyses = result?.data ?? [];
  const totalCount = result?.totalCount ?? 0;
  const totalPages = result?.totalPages ?? 1;
  const hasFilters = !!(appliedSearch || statusFilter);

  const header = (
    <div className="reveal-up flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="size-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">
            Analysis History
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse previous analyses and open details.
        </p>
      </div>
      <Link href="/new">
        <Button>
          <PlusIcon className="size-4" />
          Analyze
        </Button>
      </Link>
    </div>
  );

  if (isLoading && !result) {
    return (
      <div className="space-y-6">
        {header}
        <div className="card-surface flex items-center justify-center py-32 text-center">
          <p className="text-sm text-muted-foreground">Loading analyses...</p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="space-y-6">
        {header}
        <div className="card-surface flex items-center justify-center py-32 text-center">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      </div>
    );
  }

  if (totalCount === 0 && !hasFilters) {
    return (
      <div className="space-y-6">
        <div className="reveal-up">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight">
              Analysis History
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse previous analyses and open details.
          </p>
        </div>
        <div className="card-surface reveal-up-delay p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-(--radius-control) bg-primary/10 text-primary">
            <SparklesIcon className="size-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-foreground">
            No analyses yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first analysis.
          </p>
          <Link href="/new" className="mt-6 inline-block">
            <Button size="lg" className="min-w-56">
              <PlusIcon className="size-4" />
              Start Analyzing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      {/* Search / Filter / Sort */}
      <div className="card-surface flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex-1"
        >
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-(--radius-control) border border-border/60 bg-background pl-9 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="size-4" />
            </button>
          )}
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-(--radius-control) border border-border/60 bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {ANALYSIS_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleSort("created_at")}
            className={`flex h-9 items-center gap-1 rounded-(--radius-control) border px-3 text-sm transition-colors ${
              sort === "created_at"
                ? "border-primary/40 bg-primary/10 font-medium text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Date
            <SortIcon column="created_at" />
          </button>
          <button
            type="button"
            onClick={() => toggleSort("status")}
            className={`flex h-9 items-center gap-1 rounded-(--radius-control) border px-3 text-sm transition-colors ${
              sort === "status"
                ? "border-primary/40 bg-primary/10 font-medium text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Status
            <SortIcon column="status" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {totalCount} result{totalCount !== 1 ? "s" : ""}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-2 text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </p>

      {/* Analysis list */}
      <div className={`grid gap-4 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
        {analyses.length === 0 ? (
          <div className="card-surface py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No analyses match your filters.
            </p>
          </div>
        ) : (
          analyses.map((analysis) => (
            <Link key={analysis.id} href={`/analyses/${analysis.id}`}>
              <article className="card-surface group relative flex items-center gap-4 px-5 py-4 transition-shadow hover:shadow-[0_28px_56px_-36px_oklch(0.2_0.03_250/0.7)] sm:gap-5 sm:px-6 sm:py-5">
                <ScoreRing
                  score={analysis.versions[0]?.matchScore ?? 0}
                  size={48}
                  strokeWidth={4}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {analysis.companyName || "Untitled"}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {analysis.jobPosition && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {analysis.jobPosition}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {analysis.versions[0]?.matchedKeywords?.length || 0} matched,{" "}
                    {analysis.versions[0]?.missingKeywords?.length || 0} missing
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-8">
                  <StatusBadge
                    status={analysis.status ?? "not_applied"}
                    onChange={(status) =>
                      statusMutation.mutate({ id: analysis.id, status })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm("Delete this analysis?")) {
                        deleteMutation.mutate(analysis.id);
                      }
                    }}
                  >
                    <TrashIcon className="size-5" />
                  </Button>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="min-w-24 text-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistoryPage;
