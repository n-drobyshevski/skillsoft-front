'use client';

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SessionQuestion, AnswerValue, QuestionType } from '@/types/domain';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuestionCardProps {
  question: SessionQuestion;
  selectedValue?: AnswerValue;
  onAnswer: (value: AnswerValue) => void;
  questionNumber: number;
}

/**
 * QuestionCard - Renders different question types
 * 
 * Supports:
 * - SINGLE_CHOICE: Vertical stack of selectable options
 * - LIKERT_SCALE: Horizontal 1-5 scale with labels
 * - SJT: Scenario text with ranked options
 */
export function QuestionCard({
  question,
  selectedValue,
  onAnswer,
  questionNumber,
}: QuestionCardProps) {
  const { questionType, questionText, options, scenario } = question;

  // Keyboard shortcuts for options (1-9)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        if (questionType === 'LIKERT_SCALE' && num <= 5) {
          onAnswer(num);
        } else if (options && num <= options.length) {
          onAnswer(options[num - 1].id);
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [questionType, options, onAnswer]);

  return (
    <div className="space-y-8">
      {/* Question Number Badge */}
      <div className="flex justify-center">
        <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 font-medium">
          Question {questionNumber}
        </span>
      </div>

      {/* Scenario (for SJT questions) */}
      {scenario && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
            {scenario}
          </p>
        </div>
      )}

      {/* Question Text */}
      <h2 className="text-2xl md:text-3xl font-medium text-white text-center leading-relaxed px-4">
        {questionText}
      </h2>

      {/* Answer Options */}
      <div className="pt-4">
        {questionType === 'LIKERT_SCALE' ? (
          <LikertScale
            value={selectedValue as number | undefined}
            onChange={onAnswer}
          />
        ) : (
          <SingleChoiceOptions
            options={options || []}
            selectedId={selectedValue as string | undefined}
            onSelect={onAnswer}
            isSJT={questionType === 'SJT' || questionType === 'SITUATIONAL_JUDGMENT'}
          />
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-slate-600 text-sm">
        Press <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-xs">1-{questionType === 'LIKERT_SCALE' ? '5' : Math.min(options?.length || 4, 9)}</kbd> to select • <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-xs">Enter</kbd> to continue
      </p>
    </div>
  );
}

/**
 * Single Choice Options - Vertical stack of selectable cards
 */
interface SingleChoiceOptionsProps {
  options: Array<{ id: string; text: string; label?: string }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  isSJT?: boolean;
}

function SingleChoiceOptions({ options, selectedId, onSelect, isSJT }: SingleChoiceOptionsProps) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedId === option.id;
        const shortcutKey = index + 1;

        return (
          <motion.button
            key={option.id}
            onClick={() => onSelect(option.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "w-full min-h-[56px] p-4 rounded-xl border-2 text-left transition-all duration-200",
              "flex items-center gap-4",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
              isSelected
                ? "border-emerald-500 bg-emerald-500/10 text-white"
                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
            )}
          >
            {/* Shortcut indicator / Selection check */}
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                isSelected
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-400"
              )}
            >
              {isSelected ? (
                <Check className="w-4 h-4" />
              ) : (
                shortcutKey <= 9 ? shortcutKey : ''
              )}
            </div>

            {/* Option text */}
            <span className={cn(
              "flex-1 text-base md:text-lg",
              isSJT && "text-sm md:text-base"
            )}>
              {option.label && (
                <span className="font-medium text-slate-400 mr-2">
                  {option.label}:
                </span>
              )}
              {option.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Likert Scale - Horizontal 1-5 scale with labels
 */
interface LikertScaleProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function LikertScale({ value, onChange, min = 1, max = 5 }: LikertScaleProps) {
  const labels: Record<number, string> = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree',
  };

  const scale = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-4">
      {/* Scale buttons - horizontal on desktop, vertical on mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-2">
        {scale.map((num) => {
          const isSelected = value === num;
          
          return (
            <motion.button
              key={num}
              onClick={() => onChange(num)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex sm:flex-col items-center justify-center gap-3 sm:gap-2",
                "min-h-[56px] sm:min-h-[80px] px-4 sm:px-3 py-3 rounded-xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
              )}
            >
              {/* Number circle */}
              <div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors",
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-700 text-slate-300"
                )}
              >
                {num}
              </div>

              {/* Label - visible on all sizes */}
              <span
                className={cn(
                  "text-xs sm:text-[10px] font-medium text-center whitespace-nowrap sm:whitespace-normal transition-colors",
                  isSelected ? "text-emerald-400" : "text-slate-500"
                )}
              >
                {labels[num]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Desktop labels (below scale) */}
      <div className="hidden sm:flex justify-between px-4 text-xs text-slate-500">
        <span>Disagree</span>
        <span>Agree</span>
      </div>
    </div>
  );
}