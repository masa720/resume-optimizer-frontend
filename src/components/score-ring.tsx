"use client";

import { useEffect, useRef, useState } from "react";

const ScoreRing = ({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  className,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const animatedScoreRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const clampedScore = Math.max(0, Math.min(100, score));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const startValue = animatedScoreRef.current;
    const endValue = clampedScore;
    const duration = 900;
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const nextValue = startValue + (endValue - startValue) * eased;

      animatedScoreRef.current = nextValue;
      setAnimatedScore(nextValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [clampedScore]);

  const getColor = (value: number) => {
    if (value >= 70) return { stroke: "#10b981", bg: "rgba(16,185,129,0.08)" };
    if (value >= 40) return { stroke: "#f59e0b", bg: "rgba(245,158,11,0.08)" };
    return { stroke: "#ef4444", bg: "rgba(239,68,68,0.08)" };
  };

  const color = getColor(clampedScore);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}>
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color.bg,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-border/50"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={targetOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-semibold tabular-nums leading-none tracking-tight text-foreground"
            style={{ fontSize: size * 0.24 }}
          >
            {Math.round(animatedScore)}
          </span>
          {size >= 80 && (
            <span
              className="mt-0.5 text-muted-foreground"
              style={{ fontSize: size * 0.1 }}
            >
              / 100
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="max-w-30 text-center text-[11px] leading-tight text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;
