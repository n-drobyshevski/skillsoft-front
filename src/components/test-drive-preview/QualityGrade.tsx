'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface QualityGradeProps {
  /** Letter grade: 'A', 'B', 'C', 'D', or 'F' */
  grade: string;
  /** Tailwind text color class, e.g. 'text-emerald-400' */
  color: string;
  /** Human-readable label, e.g. 'Excellent' */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Size tokens — ring SVG dimensions and typography scale. */
const SIZE_MAP = {
  sm: { wh: 56, r: 22, strokeWidth: 3, gradeFontSize: 18, labelClass: 'text-[10px]' },
  md: { wh: 80, r: 32, strokeWidth: 4, gradeFontSize: 26, labelClass: 'text-xs' },
  lg: { wh: 112, r: 44, strokeWidth: 5, gradeFontSize: 36, labelClass: 'text-sm' },
} as const;

/**
 * Derive the ring fill percentage (0-1) from the letter grade.
 * Used to compute strokeDashoffset so the ring visually communicates quality.
 */
function gradeFill(grade: string): number {
  switch (grade) {
    case 'A': return 1.0;
    case 'B': return 0.8;
    case 'C': return 0.6;
    case 'D': return 0.4;
    case 'F': return 0.15;
    default:   return 0;
  }
}

/**
 * Convert a Tailwind text color class (e.g. 'text-emerald-400') to an SVG-compatible
 * CSS custom-property reference so the ring stroke picks up the design-token color.
 * Falls back to currentColor if the class pattern is not recognized.
 *
 * Tailwind v4 surfaces color tokens as CSS variables using the pattern:
 *   --color-{palette}-{shade}
 * e.g. text-emerald-400 -> var(--color-emerald-400)
 */
function tailwindTextToSvgColor(twClass: string): string {
  // Match "text-{palette}-{shade}" e.g. text-emerald-400
  const paletteMatch = /^text-([a-z]+)-(\d+)$/.exec(twClass);
  if (paletteMatch) {
    return `var(--color-${paletteMatch[1]}-${paletteMatch[2]})`;
  }
  // Match simple names like "text-white" or "text-black"
  const simpleMatch = /^text-([a-z]+)$/.exec(twClass);
  if (simpleMatch) {
    return `var(--color-${simpleMatch[1]}, currentColor)`;
  }
  return 'currentColor';
}

export function QualityGrade({
  grade,
  color,
  label,
  size = 'md',
  className,
}: QualityGradeProps) {
  const { wh, r, strokeWidth, gradeFontSize, labelClass } = SIZE_MAP[size];

  const center = wh / 2;
  const circumference = 2 * Math.PI * r;
  const fill = gradeFill(grade);
  const dashoffset = circumference * (1 - fill);
  const svgColor = tailwindTextToSvgColor(color);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg
        width={wh}
        height={wh}
        viewBox={`0 0 ${wh} ${wh}`}
        role="img"
        aria-label={`Quality grade ${grade} — ${label}`}
        className="block"
      >
        {/* Background track ring */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-800"
        />

        {/* Progress ring — starts at 12 o'clock via -90 degree rotation */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={svgColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />

        {/* Grade letter */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={gradeFontSize}
          fontWeight="700"
          fill={svgColor}
          style={{ fontFamily: 'inherit' }}
        >
          {grade}
        </text>
      </svg>

      {/* Label below ring */}
      <span className={cn('font-medium text-neutral-400', labelClass, color)}>
        {label}
      </span>
    </div>
  );
}
