'use client';

import React, { useState, useId, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen } from 'lucide-react';
import { SessionQuestion, AnswerValue, QuestionType } from '@/types/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { StarResponseInput, STAR_MIN_CHARS } from '@/components/test-player/StarResponseInput';

interface QuestionCardProps {
  question: SessionQuestion;
  selectedValue: AnswerValue | undefined;
  onAnswer: (value: AnswerValue) => void;
  questionNumber: number;
  validationError?: string;
}

/**
 * QuestionCard - Displays a question with personalized UI for each question type
 *
 * Supported question types:
 * - LIKERT/LIKERT_SCALE/FREQUENCY_SCALE: Horizontal rating scale (1-5)
 * - SJT/SITUATIONAL_JUDGMENT: Single choice with scenario context
 * - MCQ/MULTIPLE_CHOICE: Single choice options
 * - BEHAVIORAL_EXAMPLE: Text area for behavioral descriptions
 * - OPEN_TEXT: Text area for free-form responses
 *
 * WCAG AA Accessibility Features:
 * - Native radio/checkbox inputs for proper screen reader support
 * - aria-live regions for selection announcements
 * - Proper focus management and indicators
 * - Keyboard navigation with arrow keys
 * - fieldset/legend structure for semantic grouping
 * - Mobile-responsive with proper touch targets (min 44x44px)
 */
// Validation constants (exported for use in ImmersivePlayer)
export const MIN_CHARS_OPEN_TEXT = 20;
export const MIN_CHARS_BEHAVIORAL = STAR_MIN_CHARS;

export function QuestionCard({
  question,
  selectedValue,
  onAnswer,
  questionNumber,
  validationError,
}: QuestionCardProps) {
  const t = useTranslations('assessment');
  const groupId = useId();

  // Local state for text input types
  const [textInput, setTextInput] = useState<string>((selectedValue as string) || '');

  // State for screen reader announcements
  const [announcement, setAnnouncement] = useState<string>('');

  // Handle answer selection with announcement
  const handleAnswerSelect = useCallback((value: AnswerValue, optionLabel?: string) => {
    onAnswer(value);
    if (optionLabel) {
      setAnnouncement(t('optionSelected', { option: optionLabel }));
    }
  }, [onAnswer, t]);

  // Question type classification
  const isLikertType = question.questionType === QuestionType.LIKERT ||
                       question.questionType === QuestionType.LIKERT_SCALE ||
                       question.questionType === QuestionType.FREQUENCY_SCALE;

  const isSJT = question.questionType === QuestionType.SJT ||
                question.questionType === QuestionType.SITUATIONAL_JUDGMENT;

  const isMCQ = question.questionType === QuestionType.MCQ ||
                question.questionType === QuestionType.MULTIPLE_CHOICE ||
                question.questionType === QuestionType.SINGLE_CHOICE;

  const isOpenText = question.questionType === QuestionType.OPEN_TEXT;

  const isBehavioralExample = question.questionType === QuestionType.BEHAVIORAL_EXAMPLE;

  const isTextInput = isOpenText;
  // Note: isBehavioralExample is handled separately by StarResponseInput

  // Debounce timer ref for text input
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle text input change with immediate callback + debounced save
  const handleTextChange = (value: string) => {
    setTextInput(value);

    // Immediately notify parent for validation
    onAnswer(value);

    // Clear previous timeout for debounced operations
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Sync textInput with selectedValue when question changes
  React.useEffect(() => {
    if (isTextInput && typeof selectedValue === 'string') {
      setTextInput(selectedValue);
    } else if (isTextInput) {
      setTextInput('');
    }
  }, [question.id, selectedValue, isTextInput]);

  // Render text input (OPEN_TEXT only)
  const renderTextInput = () => {
    const placeholder = t('enterAnswer');
    const hint = t('writeDetailedAnswer');
    const minChars = MIN_CHARS_OPEN_TEXT;
    const charCount = textInput.length;
    const isValid = charCount >= minChars;
    const charsRemaining = minChars - charCount;

    return (
      <div className="space-y-3">
        <div className="relative">
          <Textarea
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              // Reduced min-height on mobile for better fit
              "min-h-[120px] sm:min-h-[160px] bg-neutral-800/30 border-neutral-700 text-white placeholder:text-neutral-500",
              "focus:ring-emerald-500/20 resize-none text-sm sm:text-base leading-relaxed",
              validationError
                ? "border-red-500/50 focus:border-red-500"
                : "focus:border-emerald-500"
            )}
            aria-label={question.questionText}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? "answer-error" : "answer-hint"}
            autoFocus
          />

          {/* Character counter */}
          <div className={cn(
            "absolute bottom-3 right-3 text-xs font-mono px-2 py-1 rounded",
            isValid
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-neutral-500 bg-neutral-800/50"
          )}>
            {charCount} / {minChars}
          </div>
        </div>

        {/* Validation error or hint */}
        {validationError ? (
          <p id="answer-error" className="text-xs text-red-400 text-center bg-red-500/10 py-2 px-3 rounded border border-red-500/30">
            {validationError}
          </p>
        ) : !isValid ? (
          <p id="answer-hint" className="text-xs text-neutral-500 text-center">
            {hint} ({t('moreChars', { count: charsRemaining })})
          </p>
        ) : (
          <p id="answer-hint" className="text-xs text-emerald-400 text-center flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {hint}
          </p>
        )}
      </div>
    );
  };

  // Render Likert scale (responsive grid with native radio inputs)
  const renderLikertScale = () => {
    if (!question.answerOptions || question.answerOptions.length === 0) return null;

    const totalOptions = question.answerOptions.length;
    const scaleHintId = `${groupId}-scale-hint`;

    return (
      <fieldset className="space-y-4" lang="ru">
        {/* Screen reader legend with full context */}
        <legend className="sr-only">
          {question.questionText}. {t('selectScaleValue', {
            min: question.answerOptions[0]?.value || 1,
            max: question.answerOptions[totalOptions - 1]?.value || 5,
          })}. {t('useNumberKeys', { max: totalOptions })}
        </legend>

        {/* Mobile: vertical stack for 5+ options, Tablet+: horizontal grid */}
        <div
          className={cn(
            "grid gap-3",
            // Responsive grid: vertical on mobile for 5+ options, horizontal on larger screens
            totalOptions <= 3 && "grid-cols-1 sm:grid-cols-3",
            totalOptions === 4 && "grid-cols-2 sm:grid-cols-4",
            // Changed: use single column on mobile for 5+ options to avoid cramped layout
            totalOptions >= 5 && "grid-cols-1 sm:grid-cols-3 md:grid-cols-5"
          )}
          role="radiogroup"
          aria-describedby={scaleHintId}
        >
          {question.answerOptions.map((option, index) => {
            const optionId = option.id || String(option.value);
            const inputId = `${groupId}-likert-${optionId}`;
            const optionNumber = option.value ?? (index + 1);
            const isSelected = selectedValue === optionNumber ||
                              selectedValue === Number(optionNumber) ||
                              (Array.isArray(selectedValue) && selectedValue.includes(String(optionNumber)));
            const optionLabel = option.text || option.label || String(optionNumber);

            return (
              <label
                key={optionId}
                htmlFor={inputId}
                className={cn(
                  // Responsive touch targets and box sizing:
                  // - Mobile (1-col): 64px height, full width - room for larger text
                  // - Tablet (3-col): 80px height, moderate width
                  // - Desktop (5-col): 88px height, constrained width - taller for text
                  "flex flex-col items-center justify-center",
                  "min-h-[64px] sm:min-h-[80px] md:min-h-[88px]",
                  "p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                  "hover:border-neutral-600 hover:bg-neutral-800/50 active:scale-95",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500/50 has-[:focus-visible]:border-emerald-500",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "border-neutral-700 bg-neutral-800/30 text-neutral-400"
                )}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={`${groupId}-likert`}
                  value={String(optionNumber)}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(optionNumber, optionLabel)}
                  className="sr-only peer"
                  aria-label={t('likertOptionLabel', {
                    value: optionNumber,
                    total: totalOptions,
                    label: optionLabel,
                  })}
                  aria-keyshortcuts={String(optionNumber)}
                />
                {/* Always show numeric value - either option.value or index-based number */}
                <span className="text-lg sm:text-xl font-bold" aria-hidden="true">
                  {optionNumber}
                </span>
                {/* Label text - responsive sizing for accessibility:
                    - Mobile (1-col): 14px (text-sm) - plenty of horizontal space
                    - Tablet (3-col): 12px (text-xs) - meets WCAG AA minimum
                    - Desktop (5-col): 11px - most constrained, number is primary indicator */}
                {(option.label || option.text) && (
                  <span
                    className={cn(
                      "mt-1 sm:mt-1.5 text-center max-w-full px-0.5",
                      // Responsive text sizing - larger on mobile where we have more space
                      "text-sm sm:text-xs md:text-[11px]",
                      // Responsive line height - relaxed on mobile for readability
                      "leading-normal sm:leading-tight",
                      // Responsive line clamping - more lines where we have vertical space
                      "line-clamp-2 sm:line-clamp-3 md:line-clamp-2",
                      // Ensure proper text wrapping for Cyrillic
                      "break-words hyphens-auto",
                      // Good contrast - no opacity reduction
                      isSelected ? "text-emerald-300" : "text-neutral-300"
                    )}
                    aria-hidden="true"
                  >
                    {option.label || option.text}
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {/* Scale hint - accessible to screen readers via aria-describedby */}
        <p
          id={scaleHintId}
          className="text-xs text-neutral-400 text-center"
        >
          {t('selectScaleValue', {
            min: question.answerOptions[0]?.value || 1,
            max: question.answerOptions[totalOptions - 1]?.value || 5,
          })}
        </p>
      </fieldset>
    );
  };

  // Render standard options (MCQ, SJT) with native radio inputs
  // SJT uses blue accent, MCQ uses emerald accent
  const renderStandardOptions = () => {
    if (!question.answerOptions || question.answerOptions.length === 0) return null;

    // SJT uses blue accent colors, MCQ keeps emerald
    const accentSelected = isSJT
      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
      : 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10';
    const accentFocus = isSJT
      ? 'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500/50 has-[:focus-visible]:border-blue-500'
      : 'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500/50 has-[:focus-visible]:border-emerald-500';
    const accentIndicator = isSJT
      ? 'border-blue-500 bg-blue-500 text-white scale-110'
      : 'border-emerald-500 bg-emerald-500 text-white scale-110';

    return (
      <fieldset className="space-y-3">
        <legend className="sr-only">{question.questionText}</legend>

        <div role="radiogroup" aria-label={t('multipleChoice')}>
          {question.answerOptions.map((option, index) => {
            const optionId = option.id || `option-${index}`;
            const inputId = `${groupId}-option-${optionId}`;
            // Fix: Only compare option.value when it's defined to avoid undefined === undefined matching all options
            const isSelected = selectedValue === optionId ||
                              (option.value != null && selectedValue === option.value) ||
                              (Array.isArray(selectedValue) && selectedValue.includes(optionId));
            const optionLabel = option.label || String.fromCharCode(65 + index);
            const optionText = option.text || `Option ${optionLabel}`;

            return (
              <label
                key={optionId}
                htmlFor={inputId}
                className={cn(
                  "w-full flex items-start text-left min-h-[56px] p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                  "hover:border-neutral-600 hover:bg-neutral-800/50 active:scale-[0.99]",
                  accentFocus,
                  isSelected
                    ? accentSelected
                    : "border-neutral-700 bg-neutral-800/30"
                )}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={`${groupId}-options`}
                  value={optionId}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(optionId, optionText)}
                  className="sr-only peer"
                  aria-describedby={`${inputId}-text`}
                />

                <div className="flex items-start gap-3 w-full">
                  {/* Option indicator */}
                  <span
                    className={cn(
                      "shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                      isSelected
                        ? accentIndicator
                        : "border-neutral-600 text-neutral-500"
                    )}
                    aria-hidden="true"
                  >
                    {optionLabel}
                  </span>

                  {/* Option text */}
                  <span
                    id={`${inputId}-text`}
                    className={cn(
                      "text-sm sm:text-base leading-relaxed flex-1",
                      isSelected ? "text-white font-medium" : "text-neutral-300"
                    )}
                  >
                    {optionText}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  };

  // Determine which renderer to use
  let answerContent = null;
  if (isBehavioralExample) {
    answerContent = (
      <StarResponseInput
        value={(selectedValue as string) || ''}
        onChange={(val) => onAnswer(val)}
      />
    );
  } else if (isTextInput) {
    answerContent = renderTextInput();
  } else if (isLikertType) {
    answerContent = renderLikertScale();
  } else {
    answerContent = renderStandardOptions();
  }

  return (
    <Card className={cn(
      "bg-neutral-900/50 border-neutral-800 shadow-2xl",
      isSJT && "border-l-4 border-l-blue-500"
    )}>
      <CardContent className="p-6 sm:p-8">
        {/* Live region for selection announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        {/* Question header - single DOM structure, responsive via CSS only */}
        <div className="space-y-4 mb-6">
          {/* Question number + badge row (stacks on mobile, inline on desktop) */}
          <div className="flex items-center sm:items-start gap-3 sm:gap-4">
            <span
              className="shrink-0 w-9 h-9 rounded-full bg-neutral-800 text-neutral-400 text-sm font-bold flex items-center justify-center"
              aria-label={`Question ${questionNumber}`}
            >
              {questionNumber}
            </span>

            <div className="flex-1 space-y-3 min-w-0">
              {/* Mobile: question label text shown inline beside number */}
              <span className="text-sm font-medium text-neutral-500 sm:hidden">
                {t('question')} {questionNumber}
              </span>

              {/* Enhanced scenario block (for SJT questions) */}
              {isSJT && question.scenario && (
                <div
                  className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
                  role="note"
                  aria-label={t('sjt.scenarioLabel')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {t('sjt.scenarioLabel')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100/80">
                    {question.scenario}
                  </p>
                </div>
              )}

              {/* Non-SJT scenario fallback (other question types with scenario) */}
              {!isSJT && question.scenario && (
                <div
                  className="text-neutral-400 text-sm leading-relaxed italic border-l-2 border-neutral-700 pl-3 sm:pl-4 py-2 bg-neutral-800/20 rounded-r"
                  role="note"
                  aria-label="Scenario context"
                >
                  {question.scenario}
                </div>
              )}

              {/* Question text - single instance, responsive sizing */}
              <h2 className="text-base sm:text-xl text-white font-medium leading-relaxed">
                {question.questionText}
              </h2>

              {/* Question type badge - responsive text, aria-hidden to avoid double-reading */}
              <span
                className={cn(
                  "inline-block text-[10px] sm:text-xs px-2 py-1 rounded whitespace-nowrap",
                  isSJT
                    ? "text-blue-300 bg-blue-500/20 font-medium"
                    : "text-neutral-500 bg-neutral-800/50"
                )}
                aria-hidden="true"
              >
                {isSJT && (<><span className="sm:hidden">{t('situational')}</span><span className="hidden sm:inline">{t('situationalQuestion')}</span></>)}
                {isMCQ && (<><span className="sm:hidden">{t('choice')}</span><span className="hidden sm:inline">{t('multipleChoice')}</span></>)}
                {isLikertType && (<><span className="sm:hidden">{t('scale')}</span><span className="hidden sm:inline">{t('ratingScale')}</span></>)}
                {isBehavioralExample && (<><span className="sm:hidden">{t('behavioral')}</span><span className="hidden sm:inline">{t('behavioralExample')}</span></>)}
                {isOpenText && (<><span className="sm:hidden">{t('open')}</span><span className="hidden sm:inline">{t('openQuestion')}</span></>)}
              </span>
            </div>
          </div>
        </div>

        {/* Vertical connector line + response prompt for SJT */}
        {isSJT && question.scenario && (
          <div className="mb-4">
            <div className="border-l-2 border-blue-300 dark:border-blue-700 ml-4 h-4" aria-hidden="true" />
            <p className="text-sm text-blue-400 dark:text-blue-300 font-medium ml-4 pl-3">
              {t('sjt.responsePrompt')}
            </p>
          </div>
        )}

        {/* Answer section */}
        <div className="mt-6">
          {answerContent}
        </div>

        {/* Question type hint */}
        {isSJT && (
          <p className="mt-6 text-xs text-blue-400/70 text-center bg-blue-500/5 py-3 rounded border border-blue-500/20">
            {t('selectBestOption')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
