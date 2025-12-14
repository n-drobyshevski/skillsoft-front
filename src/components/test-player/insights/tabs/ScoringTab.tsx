'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useCurrentQuestionData } from '@/store/test-drive-store';
import { QuestionType } from '@/types/domain';
import { cn } from '@/lib/utils';
import {
  Calculator,
  FileText,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  Hash,
} from 'lucide-react';

/**
 * ScoringTab - Displays scoring rubric and answer option scores
 *
 * Shows:
 * - Scoring rubric text
 * - Answer options with their scores/weights
 * - Maximum possible score
 * - Scoring method explanation
 */

/**
 * Get score color based on value
 */
function getScoreColor(score: number, maxScore: number) {
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 'text-green-400 bg-green-500/20 border-green-500/30';
  if (ratio >= 0.6) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  if (ratio >= 0.4) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  if (ratio >= 0.2) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  return 'text-red-400 bg-red-500/20 border-red-500/30';
}

/**
 * Get scoring method description based on question type
 */
function getScoringMethod(type: QuestionType | undefined) {
  switch (type) {
    case QuestionType.LIKERT:
    case QuestionType.LIKERT_SCALE:
    case QuestionType.FREQUENCY_SCALE:
      return {
        name: 'Прямое шкалирование',
        description: 'Баллы присваиваются напрямую на основе выбранного значения шкалы',
        icon: Star,
      };
    case QuestionType.SJT:
    case QuestionType.SITUATIONAL_JUDGMENT:
      return {
        name: 'Взвешенные веса',
        description: 'Каждый вариант ответа имеет предопределенный балл эффективности',
        icon: Award,
      };
    case QuestionType.MCQ:
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.SINGLE_CHOICE:
      return {
        name: 'Бинарная оценка',
        description: 'Правильный ответ получает полный балл, неправильный - ноль',
        icon: CheckCircle2,
      };
    case QuestionType.BEHAVIORAL_EXAMPLE:
    case QuestionType.OPEN_TEXT:
      return {
        name: 'Рубричная оценка',
        description: 'Оценка по критериям качества текстового ответа',
        icon: FileText,
      };
    default:
      return {
        name: 'Стандартная оценка',
        description: 'Базовый метод подсчета баллов',
        icon: Calculator,
      };
  }
}

export function ScoringTab() {
  const questionData = useCurrentQuestionData();

  if (!questionData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calculator className="h-12 w-12 text-neutral-600 mb-4" />
        <p className="text-neutral-400">
          Загрузка данных о скоринге...
        </p>
      </div>
    );
  }

  const { question, scoring } = questionData;
  const scoringMethod = getScoringMethod(question.questionType);
  const ScoringIcon = scoringMethod.icon;

  // Calculate max score from options or use provided value
  const maxScore = scoring?.maxScore ??
    (question.answerOptions?.reduce((max, opt) =>
      Math.max(max, opt.score ?? opt.value ?? 0), 0) ?? 5);

  return (
    <div className="space-y-6 p-1">
      {/* Scoring Method */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Метод оценивания
        </h4>
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
          <ScoringIcon className="h-5 w-5 text-amber-400" />
          <div>
            <p className="font-medium text-white">{scoringMethod.name}</p>
            <p className="text-xs text-neutral-400">{scoringMethod.description}</p>
          </div>
        </div>
      </div>

      {/* Maximum Score */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Максимальный балл
        </h4>
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-neutral-800/50 border-neutral-700">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Hash className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-300">{maxScore}</p>
            <p className="text-xs text-neutral-400">баллов за вопрос</p>
          </div>
        </div>
      </div>

      {/* Answer Options with Scores */}
      {question.answerOptions && question.answerOptions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Варианты ответов и баллы
          </h4>
          <div className="space-y-2">
            {question.answerOptions.map((option, index) => {
              const optionId = option.id || `option-${index}`;
              // Get option score safely (avoiding object injection vulnerability)
              // eslint-disable-next-line security/detect-object-injection
              const optionScoreFromScoring = scoring?.optionScores?.[optionId];
              const optionScore = optionScoreFromScoring ?? option.score ?? option.value ?? 0;
              const isHighest = optionScore === maxScore;
              const isLowest = optionScore === 0;
              const scoreColorClass = getScoreColor(optionScore, maxScore);

              // Check for extended option type with weights (for SJT questions)
              const extendedOption = option as typeof option & { weights?: Record<string, number> };

              return (
                <div
                  key={optionId}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    'bg-neutral-800/50 border-neutral-700',
                    isHighest && 'ring-1 ring-green-500/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300">
                        {option.label || String.fromCharCode(65 + index)}
                      </span>
                      <p className="text-sm text-neutral-200 flex-1">
                        {option.text || `Значение ${option.value}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isHighest && (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      )}
                      {isLowest && optionScore === 0 && (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <Badge
                        variant="outline"
                        className={cn('font-mono text-xs', scoreColorClass)}
                      >
                        {optionScore} б.
                      </Badge>
                    </div>
                  </div>

                  {/* Option weights for SJT questions */}
                  {extendedOption.weights && Object.keys(extendedOption.weights).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-neutral-700">
                      <p className="text-xs text-neutral-500 mb-1">Веса по измерениям:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(extendedOption.weights).map(([key, weight]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-[10px] bg-neutral-700/50"
                          >
                            {key}: {weight.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scoring Rubric */}
      {scoring?.scoringRubric && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Рубрика оценивания
          </h4>
          <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                {scoring.scoringRubric}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Info Box */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Calculator className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-neutral-300">
            <p className="font-medium text-amber-300 mb-1">Как считаются баллы</p>
            <p className="text-neutral-400">
              Итоговый балл за компетенцию рассчитывается как взвешенное среднее
              баллов за все вопросы, относящиеся к соответствующим поведенческим
              индикаторам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
