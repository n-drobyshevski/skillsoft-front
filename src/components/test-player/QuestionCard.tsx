'use client';

import React, { useState, useId, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SessionQuestion, AnswerValue, QuestionType } from '@/types/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
export const MIN_CHARS_BEHAVIORAL = 50;

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

  const isTextInput = isOpenText || isBehavioralExample;

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

  // Render text input (OPEN_TEXT, BEHAVIORAL_EXAMPLE)
  const renderTextInput = () => {
    const placeholder = isBehavioralExample
      ? t('describeSituation')
      : t('enterAnswer');

    const hint = isBehavioralExample
      ? t('describeSituationHint')
      : t('writeDetailedAnswer');

    const minChars = isBehavioralExample ? MIN_CHARS_BEHAVIORAL : MIN_CHARS_OPEN_TEXT;
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

    return (
      <fieldset className="space-y-4">
        <legend className="sr-only">
          {question.questionText}. {t('selectScaleValue', {
            min: question.answerOptions[0]?.value || 1,
            max: question.answerOptions[question.answerOptions.length - 1]?.value || 5,
          })}
        </legend>

        {/* Mobile: vertical stack for 5+ options, Tablet+: horizontal grid */}
        <div
          className={cn(
            "grid gap-3",
            // Responsive grid: vertical on mobile for 5+ options, horizontal on larger screens
            question.answerOptions.length <= 3 && "grid-cols-1 sm:grid-cols-3",
            question.answerOptions.length === 4 && "grid-cols-2 sm:grid-cols-4",
            // Changed: use single column on mobile for 5+ options to avoid cramped layout
            question.answerOptions.length >= 5 && "grid-cols-1 sm:grid-cols-3 md:grid-cols-5"
          )}
          role="radiogroup"
          aria-label={t('likertScaleLabel', {
            min: question.answerOptions[0]?.text ?? question.answerOptions[0]?.value ?? '',
            max: question.answerOptions[question.answerOptions.length - 1]?.text ?? question.answerOptions[question.answerOptions.length - 1]?.value ?? '',
          })}
        >
          {question.answerOptions.map((option) => {
            const optionId = option.id || String(option.value);
            const inputId = `${groupId}-likert-${optionId}`;
            const optionValue = option.value ?? optionId;
            const isSelected = selectedValue === optionValue ||
                              selectedValue === Number(optionValue) ||
                              (Array.isArray(selectedValue) && selectedValue.includes(String(optionValue)));
            const optionLabel = option.text || option.label || String(option.value);

            return (
              <label
                key={optionId}
                htmlFor={inputId}
                className={cn(
                  // Ensure minimum touch target size: 56px on mobile, 64px on desktop
                  "flex flex-col items-center justify-center min-h-[56px] sm:min-h-[64px] p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
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
                  value={String(optionValue)}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(optionValue, optionLabel)}
                  className="sr-only peer"
                  aria-label={`${option.value ?? option.label}: ${optionLabel}`}
                />
                <span className="text-xl sm:text-2xl font-bold" aria-hidden="true">
                  {option.value ?? option.label}
                </span>
                {option.label && option.value !== undefined && (
                  <span className="text-xs sm:text-sm mt-1.5 sm:mt-2 text-center leading-tight opacity-80 line-clamp-2" aria-hidden="true">
                    {option.label}
                  </span>
                )}
                {option.text && !option.label && (
                  <span className="text-xs sm:text-sm mt-1.5 sm:mt-2 text-center leading-tight opacity-80 line-clamp-2" aria-hidden="true">
                    {option.text}
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {/* Scale hint */}
        <p className="text-xs text-neutral-500 text-center" aria-hidden="true">
          {t('selectScaleValue', {
            min: question.answerOptions[0]?.value || 1,
            max: question.answerOptions[question.answerOptions.length - 1]?.value || 5,
          })}
        </p>
      </fieldset>
    );
  };

  // Render standard options (MCQ, SJT) with native radio inputs
  const renderStandardOptions = () => {
    if (!question.answerOptions || question.answerOptions.length === 0) return null;

    return (
      <fieldset className="space-y-3">
        <legend className="sr-only">{question.questionText}</legend>

        <div role="radiogroup" aria-label={t('multipleChoice')}>
          {question.answerOptions.map((option, index) => {
            const optionId = option.id || `option-${index}`;
            const inputId = `${groupId}-option-${optionId}`;
            const isSelected = selectedValue === optionId ||
                              selectedValue === option.value ||
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
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500/50 has-[:focus-visible]:border-emerald-500",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
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
                        ? "border-emerald-500 bg-emerald-500 text-white scale-110"
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
  if (isTextInput) {
    answerContent = renderTextInput();
  } else if (isLikertType) {
    answerContent = renderLikertScale();
  } else {
    answerContent = renderStandardOptions();
  }

  return (
    <Card className="bg-neutral-900/50 border-neutral-800 shadow-2xl">
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

        {/* Question header */}
        <div className="space-y-4 mb-6">
          {/* Mobile: Question number on separate line */}
          <div className="flex items-center gap-3 sm:hidden">
            <span
              className="shrink-0 w-9 h-9 rounded-full bg-neutral-800 text-neutral-400 text-sm font-bold flex items-center justify-center"
              aria-label={`Question ${questionNumber}`}
            >
              {questionNumber}
            </span>
            <span className="text-sm font-medium text-neutral-500">
              {t('question')} {questionNumber}
            </span>
            {/* Question type badge (mobile) */}
            <span className="ml-auto inline-block text-[10px] text-neutral-500 bg-neutral-800/50 px-2 py-1 rounded whitespace-nowrap">
              {isSJT && t('situational')}
              {isMCQ && t('choice')}
              {isLikertType && t('scale')}
              {isBehavioralExample && t('behavioral')}
              {isOpenText && t('open')}
            </span>
          </div>

          {/* Desktop: Question number beside text (original layout) */}
          <div className="hidden sm:flex items-start gap-4">
            <span
              className="shrink-0 w-9 h-9 rounded-full bg-neutral-800 text-neutral-400 text-sm font-bold flex items-center justify-center"
              aria-label={`Question ${questionNumber}`}
            >
              {questionNumber}
            </span>
            <div className="space-y-3 flex-1">
              {/* Scenario (for SJT questions) */}
              {question.scenario && (
                <div
                  className="text-neutral-400 text-sm leading-relaxed italic border-l-2 border-neutral-700 pl-4 py-2 bg-neutral-800/20 rounded-r"
                  role="note"
                  aria-label="Scenario context"
                >
                  {question.scenario}
                </div>
              )}

              {/* Question text */}
              <h2 className="text-lg sm:text-xl text-white font-medium leading-relaxed">
                {question.questionText}
              </h2>

              {/* Question type badge (desktop) */}
              <span className="inline-block text-xs text-neutral-500 bg-neutral-800/50 px-2 py-1 rounded">
                {isSJT && t('situationalQuestion')}
                {isMCQ && t('multipleChoice')}
                {isLikertType && t('ratingScale')}
                {isBehavioralExample && t('behavioralExample')}
                {isOpenText && t('openQuestion')}
              </span>
            </div>
          </div>

          {/* Mobile: Question content (scenario and text) */}
          <div className="space-y-3 sm:hidden">
            {/* Scenario (for SJT questions) */}
            {question.scenario && (
              <div
                className="text-neutral-400 text-sm leading-relaxed italic border-l-2 border-neutral-700 pl-3 py-2 bg-neutral-800/20 rounded-r"
                role="note"
                aria-label="Scenario context"
              >
                {question.scenario}
              </div>
            )}

            {/* Question text */}
            <h2 className="text-base sm:text-xl text-white font-medium leading-relaxed">
              {question.questionText}
            </h2>
          </div>
        </div>

        {/* Answer section */}
        <div className="mt-6">
          {answerContent}
        </div>

        {/* Question type hint */}
        {isSJT && (
          <p className="mt-6 text-xs text-neutral-500 text-center bg-neutral-800/30 py-3 rounded border border-neutral-700/50">
            {t('selectBestOption')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
