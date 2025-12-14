'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useCurrentQuestionData } from '@/store/test-drive-store';
import { cn } from '@/lib/utils';
import {
  GitBranch,
  Target,
  Activity,
  HelpCircle,
  ChevronRight,
  Layers,
  Brain,
} from 'lucide-react';

/**
 * MappingTab - Displays the competency hierarchy for the current question
 *
 * Shows:
 * - Competency (macro level)
 *   - Behavioral Indicator (meso level)
 *     - Current Question (micro level)
 *
 * This helps HR understand how questions map to competencies
 */

// Shared class constant for hierarchy connector
const CONNECTOR_FROM_PARENT_CLASS = "absolute -left-4 top-0 w-4 h-4 border-l-2 border-b-2 border-neutral-700 rounded-bl-lg";

export function MappingTab() {
  const questionData = useCurrentQuestionData();

  if (!questionData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <GitBranch className="h-12 w-12 text-neutral-600 mb-4" />
        <p className="text-neutral-400">
          Загрузка иерархии...
        </p>
      </div>
    );
  }

  const { question, competency, behavioralIndicator } = questionData;

  return (
    <div className="space-y-6 p-1">
      {/* Hierarchy Overview */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Иерархия измерения
        </h4>

        {/* Hierarchy Tree */}
        <div className="space-y-3">
          {/* Competency Level */}
          <div className="relative">
            <div className={cn(
              'p-4 rounded-lg border',
              'bg-emerald-500/10 border-emerald-500/30'
            )}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                  <Target className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    >
                      Компетенция
                    </Badge>
                    <span className="text-[10px] text-neutral-500">Макро-уровень</span>
                  </div>
                  <p className="font-medium text-white truncate">
                    {competency?.name || 'Загрузка...'}
                  </p>
                  {competency?.category && (
                    <p className="text-xs text-neutral-400 mt-1">
                      Категория: {competency.category}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Connector line */}
            <div className="absolute left-7 top-full w-0.5 h-3 bg-neutral-700" />
          </div>

          {/* Behavioral Indicator Level */}
          <div className="relative ml-4">
            {/* Connector from parent */}
            <div className={CONNECTOR_FROM_PARENT_CLASS} />

            <div className={cn(
              'p-4 rounded-lg border',
              'bg-blue-500/10 border-blue-500/30'
            )}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 shrink-0">
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-400"
                    >
                      Индикатор
                    </Badge>
                    <span className="text-[10px] text-neutral-500">Мезо-уровень</span>
                  </div>
                  <p className="font-medium text-white">
                    {behavioralIndicator?.title || 'Загрузка...'}
                  </p>
                  {behavioralIndicator?.weight && (
                    <p className="text-xs text-neutral-400 mt-1">
                      Вес: {(behavioralIndicator.weight * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Connector line */}
            <div className="absolute left-3 top-full w-0.5 h-3 bg-neutral-700" />
          </div>

          {/* Question Level */}
          <div className="relative ml-8">
            {/* Connector from parent */}
            <div className={CONNECTOR_FROM_PARENT_CLASS} />

            <div className={cn(
              'p-4 rounded-lg border',
              'bg-amber-500/10 border-amber-500/30'
            )}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 shrink-0">
                  <HelpCircle className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-400"
                    >
                      Вопрос
                    </Badge>
                    <span className="text-[10px] text-neutral-500">Микро-уровень</span>
                  </div>
                  <p className="text-sm text-white line-clamp-2">
                    {question.questionText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Codes (if available) */}
      {competency?.standardCodes && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Маппинг на стандарты
          </h4>
          <div className="space-y-2">
            {/* O*NET */}
            {competency.standardCodes.onetRef && (
              <div className="flex items-center gap-2 p-2 rounded border bg-neutral-800/50 border-neutral-700">
                <Badge variant="outline" className="text-[10px] bg-orange-500/10 border-orange-500/30 text-orange-400">
                  O*NET
                </Badge>
                <span className="text-xs text-neutral-300 font-mono">
                  {competency.standardCodes.onetRef.code}
                </span>
                {competency.standardCodes.onetRef.title && (
                  <span className="text-xs text-neutral-500 truncate">
                    - {competency.standardCodes.onetRef.title}
                  </span>
                )}
              </div>
            )}

            {/* ESCO */}
            {competency.standardCodes.escoRef && (
              <div className="flex items-center gap-2 p-2 rounded border bg-neutral-800/50 border-neutral-700">
                <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/30 text-purple-400">
                  ESCO
                </Badge>
                <span className="text-xs text-neutral-300 truncate flex-1">
                  {competency.standardCodes.escoRef.title || competency.standardCodes.escoRef.uri}
                </span>
              </div>
            )}

            {/* Big Five */}
            {competency.standardCodes.bigFiveRef && (
              <div className="flex items-center gap-2 p-2 rounded border bg-neutral-800/50 border-neutral-700">
                <Badge variant="outline" className="text-[10px] bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                  Big Five
                </Badge>
                <span className="text-xs text-neutral-300">
                  {competency.standardCodes.bigFiveRef.trait}
                </span>
                {competency.standardCodes.bigFiveRef.facet && (
                  <span className="text-xs text-neutral-500">
                    ({competency.standardCodes.bigFiveRef.facet})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb Summary */}
      <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
        <div className="flex items-center gap-1 text-xs text-neutral-400 flex-wrap">
          <Layers className="h-3 w-3" />
          <span className="text-emerald-400 font-medium">
            {competency?.name || '...'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-blue-400 font-medium truncate max-w-[150px]">
            {behavioralIndicator?.title || '...'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-amber-400 font-medium">
            Q{question.id?.slice(-4) || '...'}
          </span>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Brain className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-neutral-300">
            <p className="font-medium text-amber-300 mb-1">Трехуровневая иерархия</p>
            <p className="text-neutral-400">
              Каждый вопрос измеряет конкретный поведенческий индикатор,
              который является частью более широкой компетенции. Это обеспечивает
              точность и структурированность оценки.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
