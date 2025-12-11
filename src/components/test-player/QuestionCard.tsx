'use client';

import React from 'react';
import { SessionQuestion, AnswerValue, QuestionType } from '@/types/domain';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: SessionQuestion;
  selectedValue: AnswerValue | undefined;
  onAnswer: (value: AnswerValue) => void;
  questionNumber: number;
}

/**
 * QuestionCard - Displays a question with answer options
 * Supports Likert scale, multiple choice, and situational judgment questions
 */
export function QuestionCard({
  question,
  selectedValue,
  onAnswer,
  questionNumber,
}: QuestionCardProps) {
  const isLikertType = question.questionType === QuestionType.LIKERT ||
                       question.questionType === QuestionType.LIKERT_SCALE ||
                       question.questionType === QuestionType.FREQUENCY_SCALE;

  const isSJT = question.questionType === QuestionType.SJT ||
                question.questionType === QuestionType.SITUATIONAL_JUDGMENT;

  return (
    <Card className="bg-slate-900/50 border-slate-800 shadow-2xl">
      <CardContent className="p-6 sm:p-8">
        {/* Question number badge */}
        <div className="flex items-start gap-4 mb-6">
          <span className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-sm font-semibold flex items-center justify-center">
            {questionNumber}
          </span>
          <div className="space-y-3 flex-1">
            {/* Scenario (for SJT questions) */}
            {question.scenario && (
              <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-slate-700 pl-4">
                {question.scenario}
              </p>
            )}

            {/* Question text */}
            <h2 className="text-lg sm:text-xl text-white font-medium leading-relaxed">
              {question.questionText}
            </h2>
          </div>
        </div>

        {/* Answer options */}
        <div className={cn(
          "space-y-3",
          isLikertType && "grid grid-cols-5 gap-2 space-y-0"
        )}>
          {question.options?.map((option) => {
            const isSelected = selectedValue === option.id ||
                              selectedValue === option.value ||
                              (Array.isArray(selectedValue) && selectedValue.includes(option.id));

            if (isLikertType) {
              // Likert scale - compact horizontal layout
              return (
                <button
                  key={option.id}
                  onClick={() => onAnswer(option.value ?? option.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200",
                    "hover:border-slate-600 hover:bg-slate-800/50",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-700 bg-slate-800/30 text-slate-400"
                  )}
                >
                  <span className="text-lg font-semibold">{option.value ?? option.label}</span>
                  {option.label && option.value !== undefined && (
                    <span className="text-xs mt-1 text-center leading-tight opacity-75">
                      {option.label}
                    </span>
                  )}
                </button>
              );
            }

            // Standard option (MCQ, SJT)
            return (
              <button
                key={option.id}
                onClick={() => onAnswer(option.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                  "hover:border-slate-600 hover:bg-slate-800/50",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-800/30"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Option indicator */}
                  <span className={cn(
                    "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-600 text-slate-500"
                  )}>
                    {option.label || String.fromCharCode(65 + (question.options?.indexOf(option) ?? 0))}
                  </span>

                  {/* Option text */}
                  <span className={cn(
                    "text-sm sm:text-base leading-relaxed",
                    isSelected ? "text-white" : "text-slate-300"
                  )}>
                    {option.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Question type hint */}
        {isSJT && (
          <p className="mt-6 text-xs text-slate-500 text-center">
            Choose the best response for this situation
          </p>
        )}
      </CardContent>
    </Card>
  );
}
