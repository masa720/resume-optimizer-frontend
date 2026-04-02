"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ANALYSIS_STATUSES,
  AnalysisStatus,
  PresetStatus,
  STATUS_LABELS,
} from "@/lib/types";

const STATUS_COLORS: Record<PresetStatus, string> = {
  not_applied: "bg-muted text-muted-foreground",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  phone_screen:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  assessment:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  interview_1:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  interview_2:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  final_interview:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  offer:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  withdrawn:
    "bg-stone-100 text-stone-500 dark:bg-stone-800/40 dark:text-stone-400",
};

const CUSTOM_COLOR =
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300";

function isPreset(status: string): status is PresetStatus {
  return (ANALYSIS_STATUSES as readonly string[]).includes(status);
}

function getBadgeColor(status: AnalysisStatus): string {
  return isPreset(status) ? STATUS_COLORS[status] : CUSTOM_COLOR;
}

function getBadgeLabel(status: AnalysisStatus): string {
  return isPreset(status) ? STATUS_LABELS[status] : status;
}

const StatusBadge = ({
  status,
  onChange,
}: {
  status: AnalysisStatus;
  onChange: (status: AnalysisStatus) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [pos, setPos] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight ?? 300;
    const gap = 4;
    const spaceBelow = window.innerHeight - triggerRect.bottom - gap;
    const openAbove = spaceBelow < dropdownHeight && triggerRect.top > spaceBelow;

    setPos(
      openAbove
        ? { bottom: window.innerHeight - triggerRect.top + gap, right: window.innerWidth - triggerRect.right }
        : { top: triggerRect.bottom + gap, right: window.innerWidth - triggerRect.right },
    );
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setCustomInput("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const handleCustomSubmit = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setCustomInput("");
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={getBadgeLabel(status)}
        className={`w-40 truncate rounded-(--radius-chip) px-3 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-80 ${getBadgeColor(status)}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {getBadgeLabel(status)}
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-9999 min-w-48 rounded-(--radius-surface) border border-border/60 bg-popover p-1 shadow-lg"
            style={pos}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {ANALYSIS_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`flex w-full items-center gap-2 rounded-(--radius-control) px-2.5 py-1.5 text-xs transition-colors ${
                  s === status
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(s);
                  setOpen(false);
                  setCustomInput("");
                }}
              >
                <span
                  className={`size-2 rounded-full ${STATUS_COLORS[s].split(" ")[0]}`}
                />
                {STATUS_LABELS[s]}
              </button>
            ))}

            <div className="mt-1 border-t border-border/60 pt-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCustomSubmit();
                }}
                className="flex items-center gap-1 px-1"
              >
                <input
                  type="text"
                  placeholder="Custom status..."
                  value={customInput}
                  maxLength={20}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="min-w-0 flex-1 rounded-(--radius-control) border border-border/60 bg-background px-2 py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-(--radius-control) bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
                  disabled={!customInput.trim()}
                >
                  Set
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default StatusBadge;
