'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCurrentQuestionData } from '@/store/test-drive-store';
import { DifficultyLevel, QuestionType } from '@/types/domain';
import { cn } from '@/lib/utils';
import {
  Gauge,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
} from 'lucide-react';

/**
 * PsychometricsTab - Displays psychometric properties of the current question
 *
 * Shows:
 * - Difficulty level with visual gauge
 * - Discrimination index with interpretation
 * - Question type classification
 * - Time limit information
 */

/**
 * Get difficulty level configuration
 */
function getDifficultyConfig(level: DifficultyLevel | undefined) {
  switch (level) {
    case DifficultyLevel.FOUNDATIONAL:
      return {
        label: 'Базовый',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        value: 20,
      };
    case DifficultyLevel.INTERMEDIATE:
      return {
        label: 'Средний',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        value: 40,
      };
    case DifficultyLevel.ADVANCED:
      return {
        label: 'Продвинутый',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        value: 60,
      };
    case DifficultyLevel.EXPERT:
      return {
        label: 'Экспертный',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30',
        value: 80,
      };
    case DifficultyLevel.SPECIALIZED:
      return {
        label: 'Специализированный',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        value: 95,
      };
    default:
      return {
        label: 'Не указан',
        color: 'text-neutral-400',
        bgColor: 'bg-neutral-500/20',
        borderColor: 'border-neutral-500/30',
        value: 0,
      };
  }
}

/**
 * Get question type display information
 */
function getQuestionTypeInfo(type: QuestionType | undefined) {
  switch (type) {
    case QuestionType.LIKERT:
    case QuestionType.LIKERT_SCALE:
      return { label: 'Шкала Лайкерта', description: 'Оценка по шкале согласия' };
    case QuestionType.FREQUENCY_SCALE:
      return { label: 'Шкала частоты', description: 'Оценка частоты проявления' };
    case QuestionType.SJT:
    case QuestionType.SITUATIONAL_JUDGMENT:
      return { label: 'Ситуационный', description: 'Оценка реакции на ситуацию' };
    case QuestionType.MCQ:
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.SINGLE_CHOICE:
      return { label: 'Выбор варианта', description: 'Выбор правильного ответа' };
    case QuestionType.BEHAVIORAL_EXAMPLE:
      return { label: 'Поведенческий', description: 'Описание опыта' };
    case QuestionType.OPEN_TEXT:
      return { label: 'Открытый', description: 'Свободный текстовый ответ' };
    default:
      return { label: 'Не указан', description: '' };
  }
}

/**
 * Get discrimination index interpretation
 */
function getDiscriminationInterpretation(value: number | undefined) {
  if (value === undefined) {
    return { label: 'Не рассчитан', status: 'neutral' as const };
  }
  if (value >= 0.4) {
    return { label: 'Отличный', status: 'excellent' as const };
  }
  if (value >= 0.3) {
    return { label: 'Хороший', status: 'good' as const };
  }
  if (value >= 0.2) {
    return { label: 'Приемлемый', status: 'acceptable' as const };
  }
  return { label: 'Требует пересмотра', status: 'poor' as const };
}

/**
 * Gauge component for displaying metrics
 */
function MetricGauge({
  label,
  value,
  maxValue = 100,
  icon: Icon,
  description,
  status,
}: {
  label: string;
  value: number;
  maxValue?: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  status?: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral';
}) {
  const percentage = (value / maxValue) * 100;

  // Get status color based on status value (avoiding object injection)
  const getStatusColor = (s: typeof status): string => {
    switch (s) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'acceptable': return 'bg-amber-500';
      case 'poor': return 'bg-red-500';
      case 'neutral': return 'bg-neutral-500';
      default: return 'bg-amber-500';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const progressColor = status ? getStatusColor(status) : 'bg-amber-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <span className="text-sm font-mono text-amber-300">
          {value.toFixed(2)}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2 bg-neutral-800"
      />
      {description && (
        <p className="text-xs text-neutral-400">{description}</p>
      )}
    </div>
  );
}

export function PsychometricsTab() {
  const questionData = useCurrentQuestionData();

  if (!questionData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Brain className="h-12 w-12 text-neutral-600 mb-4" />
        <p className="text-neutral-400">
          Загрузка психометрических данных...
        </p>
      </div>
    );
  }

  const { question, psychometrics } = questionData;
  const difficultyConfig = getDifficultyConfig(question.difficultyLevel);
  const questionTypeInfo = getQuestionTypeInfo(question.questionType);
  const discriminationInterp = getDiscriminationInterpretation(
    psychometrics?.discriminationIndex
  );

  // Estimate difficulty index from level if not provided
  const difficultyIndex = psychometrics?.difficultyIndex ?? difficultyConfig.value / 100;

  return (
    <div className="space-y-6 p-1">
      {/* Question Type */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Тип вопроса
        </h4>
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-lg border',
          'bg-amber-500/5 border-amber-500/20'
        )}>
          <Brain className="h-5 w-5 text-amber-400" />
          <div>
            <p className="font-medium text-white">{questionTypeInfo.label}</p>
            <p className="text-xs text-neutral-400">{questionTypeInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Уровень сложности
        </h4>
        <div className={cn(
          'p-4 rounded-lg border',
          difficultyConfig.bgColor,
          difficultyConfig.borderColor
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge className={cn('h-5 w-5', difficultyConfig.color)} />
              <span className={cn('font-semibold', difficultyConfig.color)}>
                {difficultyConfig.label}
              </span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'font-mono',
                difficultyConfig.borderColor,
                difficultyConfig.color
              )}
            >
              {(difficultyIndex * 100).toFixed(0)}%
            </Badge>
          </div>
          <Progress
            value={difficultyConfig.value}
            className="h-2 bg-neutral-800"
          />
          <p className="text-xs text-neutral-400 mt-2">
            Индекс сложности показывает долю правильных ответов среди респондентов
          </p>
        </div>
      </div>

      {/* Discrimination Index */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Индекс дискриминативности
        </h4>
        <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700">
          <MetricGauge
            label="Дискриминативность"
            value={psychometrics?.discriminationIndex ?? 0.35}
            maxValue={1}
            icon={TrendingUp}
            status={discriminationInterp.status}
          />
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-700">
            {discriminationInterp.status === 'excellent' && (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            )}
            {discriminationInterp.status === 'good' && (
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
            )}
            {discriminationInterp.status === 'acceptable' && (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )}
            {discriminationInterp.status === 'poor' && (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-neutral-300">
              {discriminationInterp.label}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Показывает способность вопроса различать сильных и слабых респондентов.
            Значение 0.30+ считается хорошим.
          </p>
        </div>
      </div>

      {/* Time Limit */}
      {question.timeLimit && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Лимит времени
          </h4>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-neutral-800/50 border-neutral-700">
            <Clock className="h-5 w-5 text-amber-400" />
            <div>
              <p className="font-medium text-white">
                {question.timeLimit} секунд
              </p>
              <p className="text-xs text-neutral-400">
                Рекомендуемое время на ответ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reliability (if available) */}
      {psychometrics?.reliabilityCoefficient && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Надежность
          </h4>
          <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700">
            <MetricGauge
              label="Коэффициент надежности"
              value={psychometrics.reliabilityCoefficient}
              maxValue={1}
              icon={CheckCircle2}
              description="Cronbach's alpha - согласованность измерений"
              status={
                psychometrics.reliabilityCoefficient >= 0.8
                  ? 'excellent'
                  : psychometrics.reliabilityCoefficient >= 0.7
                  ? 'good'
                  : 'acceptable'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
