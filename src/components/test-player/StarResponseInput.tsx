'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ============================================
// STAR Marker Constants
// ============================================

const STAR_MARKERS = {
  SITUATION: '[SITUATION]',
  TASK: '[TASK]',
  ACTION: '[ACTION]',
  RESULT: '[RESULT]',
} as const;

type StarSection = 'situation' | 'task' | 'action' | 'result';

interface StarFields {
  situation: string;
  task: string;
  action: string;
  result: string;
}

/** Minimum combined character count across all 4 sections */
export const STAR_MIN_CHARS = 100;

// ============================================
// STAR Section Configuration
// ============================================

interface StarSectionConfig {
  key: StarSection;
  letter: string;
  badgeColor: string;
  rows: number;
}

const STAR_SECTIONS: StarSectionConfig[] = [
  { key: 'situation', letter: 'S', badgeColor: 'bg-blue-500', rows: 3 },
  { key: 'task', letter: 'T', badgeColor: 'bg-amber-500', rows: 3 },
  { key: 'action', letter: 'A', badgeColor: 'bg-emerald-500', rows: 4 },
  { key: 'result', letter: 'R', badgeColor: 'bg-purple-500', rows: 3 },
];

// ============================================
// Serialization Helpers
// ============================================

/**
 * Serialize 4 STAR fields into a single string with section markers.
 * Format: [SITUATION]\n{text}\n[TASK]\n{text}\n[ACTION]\n{text}\n[RESULT]\n{text}
 */
function serializeStarFields(fields: StarFields): string {
  return [
    STAR_MARKERS.SITUATION,
    fields.situation,
    STAR_MARKERS.TASK,
    fields.task,
    STAR_MARKERS.ACTION,
    fields.action,
    STAR_MARKERS.RESULT,
    fields.result,
  ].join('\n');
}

/**
 * Parse a single text string back into 4 STAR fields.
 * Falls back to putting the entire string into the Situation field
 * if no markers are found (backward compatibility with plain text answers).
 */
function parseStarFields(text: string): StarFields {
  const empty: StarFields = { situation: '', task: '', action: '', result: '' };

  if (!text) return empty;

  // Check if the text contains STAR markers
  const hasMarkers = text.includes(STAR_MARKERS.SITUATION);

  if (!hasMarkers) {
    // Fallback: old-format plain text goes into Situation
    return { ...empty, situation: text };
  }

  // Extract each section's content between markers
  const sections: [string, StarSection][] = [
    [STAR_MARKERS.SITUATION, 'situation'],
    [STAR_MARKERS.TASK, 'task'],
    [STAR_MARKERS.ACTION, 'action'],
    [STAR_MARKERS.RESULT, 'result'],
  ];

  const result = { ...empty };

  for (let i = 0; i < sections.length; i++) {
    const [marker, field] = sections[i];
    const markerIndex = text.indexOf(marker);

    if (markerIndex === -1) continue;

    const contentStart = markerIndex + marker.length;
    // Skip the newline after the marker
    const adjustedStart = text[contentStart] === '\n' ? contentStart + 1 : contentStart;

    // Find the end: either the next marker or end of string
    let contentEnd = text.length;
    if (i < sections.length - 1) {
      const nextMarkerIndex = text.indexOf(sections[i + 1][0], adjustedStart);
      if (nextMarkerIndex !== -1) {
        contentEnd = nextMarkerIndex;
      }
    }

    // Trim trailing newline before the next marker
    let extracted = text.slice(adjustedStart, contentEnd);
    if (extracted.endsWith('\n')) {
      extracted = extracted.slice(0, -1);
    }

    result[field] = extracted;
  }

  return result;
}

// ============================================
// Component Props
// ============================================

interface StarResponseInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// ============================================
// StarResponseInput Component
// ============================================

/**
 * STAR-format structured input for BEHAVIORAL_EXAMPLE questions.
 *
 * Renders 4 labeled textareas (Situation, Task, Action, Result) with
 * colored badge indicators. Combines all fields into a single string
 * with section markers for backward-compatible storage.
 */
export function StarResponseInput({ value, onChange, disabled }: StarResponseInputProps) {
  const t = useTranslations('assessment');
  const groupId = useId();

  // Internal state: 4 separate fields
  const [fields, setFields] = useState<StarFields>(() => parseStarFields(value));

  // Track the last value we serialized to avoid re-parsing our own output
  const lastSerializedRef = React.useRef<string>(value);

  // Sync fields when the external value changes (e.g., navigating between questions)
  // but skip if the change came from our own serialization
  useEffect(() => {
    if (value !== lastSerializedRef.current) {
      setFields(parseStarFields(value));
      lastSerializedRef.current = value;
    }
  }, [value]);

  // Handle individual field change
  const handleFieldChange = useCallback(
    (section: StarSection, text: string) => {
      setFields((prev) => {
        const next = { ...prev, [section]: text };
        // Serialize and propagate to parent
        const serialized = serializeStarFields(next);
        lastSerializedRef.current = serialized;
        onChange(serialized);
        return next;
      });
    },
    [onChange],
  );

  // Compute combined character count (raw text only, not markers)
  const totalChars =
    fields.situation.length +
    fields.task.length +
    fields.action.length +
    fields.result.length;

  const meetsMinimum = totalChars >= STAR_MIN_CHARS;

  return (
    <div className="space-y-4">
      {/* STAR Sections */}
      {STAR_SECTIONS.map((section) => {
        const inputId = `${groupId}-star-${section.key}`;

        return (
          <div key={section.key} className="space-y-1.5">
            {/* Label row: badge + label text */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white',
                  section.badgeColor,
                )}
                aria-hidden="true"
              >
                {section.letter}
              </span>
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-neutral-200"
              >
                {t(`star.${section.key}.label` as Parameters<typeof t>[0])}
              </label>
            </div>

            {/* Hint text */}
            <p className="text-xs text-neutral-500 pl-8">
              {t(`star.${section.key}.hint` as Parameters<typeof t>[0])}
            </p>

            {/* Textarea */}
            <div className="pl-8">
              <Textarea
                id={inputId}
                value={fields[section.key]}
                onChange={(e) => handleFieldChange(section.key, e.target.value)}
                disabled={disabled}
                rows={section.rows}
                className={cn(
                  'bg-neutral-800/30 border-neutral-700 text-white placeholder:text-neutral-500',
                  'focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-sm leading-relaxed',
                )}
                aria-label={t(`star.${section.key}.label` as Parameters<typeof t>[0])}
              />
            </div>
          </div>
        );
      })}

      {/* Character count indicator */}
      <div className="flex items-center justify-center pt-1">
        {meetsMinimum ? (
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {t('star.charactersMet')}
          </p>
        ) : (
          <p className="text-xs text-amber-500">
            {t('star.characterCount', {
              current: totalChars,
              minimum: STAR_MIN_CHARS,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
