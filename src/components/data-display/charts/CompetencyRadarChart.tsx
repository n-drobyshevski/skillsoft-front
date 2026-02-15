"use client";

import { memo, useMemo, useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/**
 * Hook to get computed CSS color values from CSS custom properties.
 * This is necessary because SVG gradients don't properly resolve CSS variables
 * with oklch() values in some browsers.
 */
function useComputedColors() {
  const [colors, setColors] = useState({
    primary: "#3b82f6", // fallback blue
    border: "#e5e7eb", // fallback gray
    foreground: "#1f2937", // fallback dark gray
    mutedForeground: "#6b7280", // fallback muted gray
  });

  useEffect(() => {
    const computeColors = () => {
      if (typeof window === "undefined") return;

      // Create a temporary element to compute colors
      const tempEl = document.createElement("div");
      tempEl.style.display = "none";
      document.body.appendChild(tempEl);

      // Helper to get computed color
      const getColor = (cssVar: string, fallback: string): string => {
        tempEl.style.color = `var(${cssVar})`;
        const computed = getComputedStyle(tempEl).color;
        // If computed is valid (not empty or "inherit"), return it
        if (computed && computed !== "inherit" && computed !== "") {
          return computed;
        }
        return fallback;
      };

      setColors({
        primary: getColor("--primary", "#3b82f6"),
        border: getColor("--border", "#e5e7eb"),
        foreground: getColor("--foreground", "#1f2937"),
        mutedForeground: getColor("--muted-foreground", "#6b7280"),
      });

      document.body.removeChild(tempEl);
    };

    computeColors();

    // Re-compute on theme change (dark mode toggle)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class" || mutation.attributeName === "data-theme") {
          computeColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // Also listen for media query changes (system dark mode)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => computeColors();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return colors;
}

export interface CompetencyRadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
  /** 95% CI lower bound (optional - renders confidence band when present) */
  ciLower?: number;
  /** 95% CI upper bound (optional - renders confidence band when present) */
  ciUpper?: number;
}

interface CompetencyRadarChartProps {
  data: CompetencyRadarDataPoint[];
  /** Passing score threshold to show as reference (default: 70) */
  passingScore?: number;
  /** Whether to show animations (default: true) */
  animated?: boolean;
  /** Custom class name for the container */
  className?: string;
}

/** Minimum items required for a meaningful radar chart */
const MIN_DATA_POINTS = 3;

/** Maximum label length before truncation - aggressive on mobile for cleaner layout */
const MAX_LABEL_LENGTH_MOBILE = 8;
const MAX_LABEL_LENGTH_DESKTOP = 18;

/**
 * Truncates text with ellipsis if it exceeds max length
 */
function truncateLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Empty state component when insufficient data
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * CompetencyRadarChart - Displays competency scores in a radar/spider chart
 *
 * Features:
 * - Responsive sizing for mobile/desktop
 * - Automatic label truncation for long competency names
 * - Reference line for passing score threshold
 * - Accessible with ARIA labels and screen reader support
 * - Graceful empty state handling
 */
function CompetencyRadarChartComponent({
  data,
  passingScore = 70,
  animated = true,
  className
}: CompetencyRadarChartProps) {
  const isMobile = useIsMobile();
  const colors = useComputedColors();

  // Responsive configuration - optimized for mobile readability
  const config = useMemo(() => ({
    height: isMobile ? 260 : 340,
    fontSize: isMobile ? 10 : 13,
    outerRadius: isMobile ? "65%" : "78%", // Smaller on mobile = more label space
    innerRadius: isMobile ? 15 : 25,
    maxLabelLength: isMobile ? MAX_LABEL_LENGTH_MOBILE : MAX_LABEL_LENGTH_DESKTOP,
    gridStrokeWidth: isMobile ? 0.5 : 1,
    radarStrokeWidth: isMobile ? 1.5 : 2,
    tickFontSize: isMobile ? 8 : 11,
  }), [isMobile]);

  // Calculate stats for accessibility (must be called before early returns to follow hooks rules)
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    const scores = data.map(d => d.A);
    return {
      min: Math.min(...scores),
      max: Math.max(...scores),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: data.length,
    };
  }, [data]);

  // Validate data - early returns after all hooks
  if (!data || data.length === 0) {
    return <EmptyState message="Нет данных для отображения" />;
  }

  if (data.length < MIN_DATA_POINTS) {
    return (
      <EmptyState
        message={`Недостаточно данных для диаграммы (минимум ${MIN_DATA_POINTS} компетенции)`}
      />
    );
  }

  // Generate accessible description
  const ariaLabel = `Радарная диаграмма с ${stats.count} компетенциями. Диапазон оценок: от ${stats.min}% до ${stats.max}%. Средний балл: ${stats.avg}%.`;

  return (
    <div
      className={cn("w-full", className)}
      style={{ height: config.height }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius={config.outerRadius}
          data={data}
          margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 8 } : { top: 16, right: 16, bottom: 16, left: 16 }}
        >
          {/* Gradient definition for filled area - using computed colors for SVG compatibility */}
          <defs>
            <radialGradient id="competencyRadarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity={0.5} />
              <stop offset="100%" stopColor={colors.primary} stopOpacity={0.1} />
            </radialGradient>
            {/* Subtle glow effect */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background grid - cleaner polygon style */}
          <PolarGrid
            stroke={colors.border}
            strokeOpacity={0.4}
            strokeWidth={config.gridStrokeWidth}
            gridType="polygon"
          />

          {/* Competency labels - with improved mobile styling */}
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload, textAnchor }) => {
              const label = truncateLabel(payload.value, config.maxLabelLength);
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  fill={colors.foreground}
                  fontSize={config.fontSize}
                  fontWeight={500}
                  className="select-none"
                >
                  {label}
                </text>
              );
            }}
            tickLine={false}
          />

          {/* Score axis - simplified for mobile */}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: colors.mutedForeground,
              fontSize: config.tickFontSize,
            }}
            tickCount={isMobile ? 3 : 5}
            tickFormatter={(value) => {
              const numValue = Number(value);
              // On mobile, only show key values
              if (isMobile && numValue !== 0 && numValue !== 50 && numValue !== 100) {
                return '';
              }
              return `${numValue}`;
            }}
            axisLine={false}
          />

          {/* Confidence interval band (rendered behind main radar) */}
          {data.some(d => d.ciLower != null && d.ciUpper != null) && (
            <>
              <Radar
                name="CI Upper"
                dataKey="ciUpper"
                stroke={colors.primary}
                strokeWidth={0}
                fill={colors.primary}
                fillOpacity={0.08}
                isAnimationActive={animated}
                animationDuration={600}
                dot={false}
              />
              <Radar
                name="CI Lower"
                dataKey="ciLower"
                stroke={colors.primary}
                strokeWidth={0.5}
                strokeDasharray="4 4"
                strokeOpacity={0.3}
                fill="none"
                isAnimationActive={animated}
                animationDuration={600}
                dot={false}
              />
            </>
          )}

          {/* Data area with subtle glow */}
          <Radar
            name="Оценка"
            dataKey="A"
            stroke={colors.primary}
            strokeWidth={config.radarStrokeWidth}
            fill="url(#competencyRadarGradient)"
            fillOpacity={1}
            isAnimationActive={animated}
            animationDuration={600}
            animationEasing="ease-out"
            filter={isMobile ? undefined : "url(#glow)"}
          />

          {/* Interactive tooltip */}
          <Tooltip
            cursor={{
              stroke: colors.primary,
              strokeWidth: 1.5,
              strokeDasharray: "3 3",
              fill: colors.primary,
              fillOpacity: 0.05,
            }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload[0]) return null;
              const item = payload[0].payload as CompetencyRadarDataPoint;
              const score = item.A;
              const isPassing = score >= passingScore;

              return (
                <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-3 min-w-[140px] sm:min-w-[160px]">
                  <p className="font-medium text-xs sm:text-sm text-foreground mb-1.5 line-clamp-2">
                    {item.subject}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Результат:</span>
                    <span className={cn(
                      "text-base sm:text-lg font-bold tabular-nums",
                      isPassing
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}>
                      {score}%
                    </span>
                  </div>
                  {item.ciLower != null && item.ciUpper != null && (
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">95% ДИ:</span>
                      <span className="text-[10px] sm:text-xs font-medium tabular-nums text-foreground">
                        {Math.round(item.ciLower)}&ndash;{Math.round(item.ciUpper)}%
                      </span>
                    </div>
                  )}
                  {!isPassing && passingScore > 0 && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-border/50">
                      До цели: +{passingScore - score}%
                    </p>
                  )}
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Screen reader only: detailed data */}
      <div className="sr-only">
        <h3>Детальные результаты по компетенциям:</h3>
        <ul>
          {data.map((item, idx) => (
            <li key={idx}>
              {item.subject}: {item.A}%
              {item.A >= passingScore ? " (пройдено)" : " (не пройдено)"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
const CompetencyRadarChart = memo(CompetencyRadarChartComponent);

export default CompetencyRadarChart;
