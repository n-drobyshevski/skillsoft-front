'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface QualityGradeProps {
  /** Letter grade: 'A', 'B', 'C', 'D', or 'F' */
  grade: string;
  /** Tailwind text color class, e.g. 'text-emerald-400' */
  color: string;
  /** Human-readable label, e.g. 'Отличное' */
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

function tailwindTextToSvgColor(twClass: string): string {
  const paletteMatch = /^text-([a-z]+)-(\d+)$/.exec(twClass);
  if (paletteMatch) {
    return `var(--color-${paletteMatch[1]}-${paletteMatch[2]})`;
  }
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
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--zen-track)]"
        />
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
      <span className={cn('font-medium text-[var(--zen-text-secondary)]', labelClass, color)}>
        {label}
      </span>
    </div>
  );
}
