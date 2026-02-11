'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useCurrentQuestionData } from '@/store/test-drive-store';
import { cn } from '@/lib/utils';
import {
  Tag,
  Hash,
  Clock,
  FileCode,
  Info,
  Database,
  Fingerprint,
} from 'lucide-react';

/**
 * MetadataTab - Displays question metadata and technical information
 *
 * Shows:
 * - Question ID
 * - Tags (context markers like GENERAL, IT, SALES, etc.)
 * - Time limit
 * - Behavioral indicator ID
 * - Competency ID
 * - Additional metadata fields
 */

/**
 * Format ID for display (show last 8 characters)
 */
function formatId(id: string | undefined) {
  if (!id) return 'N/A';
  if (id.length <= 12) return id;
  return `...${id.slice(-8)}`;
}

/**
 * Get tag color based on tag type
 */
function getTagColor(tag: string) {
  const tagLower = tag.toLowerCase();

  // Context tags
  if (tagLower === 'general' || tagLower === 'universal') {
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  }

  // Domain tags
  if (['it', 'tech', 'engineering'].some(t => tagLower.includes(t))) {
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
  if (['sales', 'marketing'].some(t => tagLower.includes(t))) {
    return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
  if (['finance', 'accounting'].some(t => tagLower.includes(t))) {
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
  if (['medical', 'healthcare'].some(t => tagLower.includes(t))) {
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  }

  // Complexity tags
  if (tagLower === 'junior' || tagLower === 'entry') {
    return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
  }
  if (tagLower === 'mid' || tagLower === 'intermediate') {
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }
  if (tagLower === 'senior' || tagLower === 'advanced') {
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  }

  // Default
  return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
}

/**
 * Metadata row component
 */
function MetadataRow({
  icon: Icon,
  label,
  value,
  copyable = false,
  fullValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  fullValue?: string;
}) {
  const handleCopy = () => {
    if (fullValue) {
      navigator.clipboard.writeText(fullValue);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-b-0">
      <div className="flex items-center gap-2 text-neutral-400">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {typeof value === 'string' ? (
          <span className="text-sm font-mono text-white">{value}</span>
        ) : (
          value
        )}
        {copyable && fullValue && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-neutral-700 transition-colors"
            title="Скопировать"
          >
            <FileCode className="h-3 w-3 text-neutral-500" />
          </button>
        )}
      </div>
    </div>
  );
}

export function MetadataTab() {
  const questionData = useCurrentQuestionData();

  if (!questionData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Database className="h-12 w-12 text-neutral-600 mb-4" />
        <p className="text-neutral-400">
          Загрузка метаданных...
        </p>
      </div>
    );
  }

  const { question, competency, behavioralIndicator } = questionData;

  // Extract tags from question metadata
  const tags = (question as { metadata?: { tags?: string[] } }).metadata?.tags || [];

  return (
    <div className="space-y-6 p-1">
      {/* Question Tags */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Теги и контекст
        </h4>
        <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn('text-xs', getTagColor(tag))}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-500">
              <Tag className="h-4 w-4" />
              <span className="text-sm">Теги не указаны</span>
            </div>
          )}
          <p className="text-xs text-neutral-500 mt-3">
            Теги определяют контекст применения вопроса и уровень сложности
          </p>
        </div>
      </div>

      {/* Identifiers */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Идентификаторы
        </h4>
        <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700">
          <MetadataRow
            icon={Fingerprint}
            label="ID вопроса"
            value={formatId(question.id)}
            copyable
            fullValue={question.id}
          />
          <MetadataRow
            icon={Hash}
            label="ID индикатора"
            value={formatId(question.behavioralIndicatorId)}
            copyable
            fullValue={question.behavioralIndicatorId}
          />
          <MetadataRow
            icon={Hash}
            label="ID компетенции"
            value={formatId(competency?.id)}
            copyable
            fullValue={competency?.id}
          />
        </div>
      </div>

      {/* Time Configuration */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Временные параметры
        </h4>
        <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700">
          <MetadataRow
            icon={Clock}
            label="Лимит времени"
            value={
              question.timeLimit
                ? `${question.timeLimit} сек`
                : 'Не ограничен'
            }
          />
        </div>
      </div>

      {/* Additional Metadata */}
      {(() => {
        const questionWithMeta = question as unknown as { metadata?: Record<string, unknown> };
        if (!questionWithMeta.metadata) return null;

        const metadataEntries = Object.entries(questionWithMeta.metadata).filter(
          ([key]) => key !== 'tags'
        );

        if (metadataEntries.length === 0) return null;

        return (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Дополнительные метаданные
            </h4>
            <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700">
              {metadataEntries.map(([key, value]) => (
                <MetadataRow
                  key={key}
                  icon={Info}
                  label={key.replace(/_/g, ' ')}
                  value={
                    typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)
                  }
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Behavioral Indicator Details */}
      {behavioralIndicator && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Детали индикатора
          </h4>
          <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700 space-y-3">
            <div>
              <span className="text-xs text-neutral-500">Название</span>
              <p className="text-sm text-white">{behavioralIndicator.title}</p>
            </div>
            {behavioralIndicator.description && (
              <div>
                <span className="text-xs text-neutral-500">Описание</span>
                <p className="text-sm text-neutral-300">{behavioralIndicator.description}</p>
              </div>
            )}
            <div className="flex gap-4">
              <div>
                <span className="text-xs text-neutral-500">Вес</span>
                <p className="text-sm font-mono text-amber-300">
                  {(behavioralIndicator.weight * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <span className="text-xs text-neutral-500">Тип измерения</span>
                <p className="text-sm text-white">{behavioralIndicator.measurementType}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info Box */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <Database className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-neutral-300">
            <p className="font-medium text-amber-300 mb-1">Техническая информация</p>
            <p className="text-neutral-400">
              Эти данные помогают при отладке и анализе тестов.
              Идентификаторы можно использовать для поиска в базе данных.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
