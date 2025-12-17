'use client';

import * as React from 'react';
import { HelpCircle, Info, BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type HelpVariant = 'help' | 'info' | 'learn';

interface HelpTooltipProps {
  /** The help text content - can be string or ReactNode for complex content */
  children: React.ReactNode;
  /** Visual variant of the icon */
  variant?: HelpVariant;
  /** Size of the icon */
  size?: 'xs' | 'sm' | 'md';
  /** Side of the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Additional className for the trigger */
  className?: string;
  /** Whether to show as inline (next to text) */
  inline?: boolean;
  /** Optional title for the tooltip */
  title?: string;
}

const iconMap = {
  help: HelpCircle,
  info: Info,
  learn: BookOpen,
};

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

const colorMap = {
  help: 'text-muted-foreground/70 hover:text-muted-foreground',
  info: 'text-blue-500/70 hover:text-blue-500',
  learn: 'text-amber-500/70 hover:text-amber-500',
};

/**
 * HelpTooltip - Help icon with tooltip for explaining technical psychometric terms
 */
export function HelpTooltip({
  children,
  variant = 'help',
  size = 'sm',
  side = 'top',
  className,
  inline = true,
  title,
}: HelpTooltipProps) {
  const Icon = iconMap[variant];

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          'transition-colors cursor-help focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm',
          colorMap[variant],
          inline && 'inline-flex items-center align-middle ml-0.5',
          className
        )}
        onClick={(e) => e.preventDefault()}
      >
        <Icon className={sizeMap[size]} />
        <span className="sr-only">Справка</span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-xs text-xs leading-relaxed"
      >
        {title && (
          <p className="font-semibold mb-1">{title}</p>
        )}
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * LabelWithHelp - Combines a label with an inline help tooltip
 */
interface LabelWithHelpProps {
  label: string;
  help: React.ReactNode;
  helpTitle?: string;
  variant?: HelpVariant;
  className?: string;
  labelClassName?: string;
}

export function LabelWithHelp({
  label,
  help,
  helpTitle,
  variant = 'help',
  className,
  labelClassName,
}: LabelWithHelpProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <span className={labelClassName}>{label}</span>
      <HelpTooltip variant={variant} title={helpTitle}>
        {help}
      </HelpTooltip>
    </span>
  );
}

/**
 * Pre-defined psychometric help content for common terms
 */
export const psychometricHelp = {
  // Difficulty (p-value)
  difficulty: {
    title: 'Индекс сложности (p)',
    content: (
      <div className="space-y-1">
        <p>Доля респондентов, правильно ответивших на вопрос.</p>
        <p className="text-muted-foreground">
          p = 0.5 означает, что 50% ответили правильно
        </p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>p &lt; 0.2 - слишком сложный</li>
          <li>0.2-0.8 - оптимально</li>
          <li>p &gt; 0.9 - слишком легкий</li>
        </ul>
      </div>
    ),
  },

  // Discrimination (rpb)
  discrimination: {
    title: 'Индекс дискриминации (rpb)',
    content: (
      <div className="space-y-1">
        <p>Показывает, насколько хорошо вопрос различает сильных и слабых респондентов.</p>
        <p className="text-muted-foreground">
          Point-biserial корреляция между ответом и общим баллом
        </p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>rpb &lt; 0 - токсичный (требует удаления)</li>
          <li>0-0.1 - критично низкий</li>
          <li>0.1-0.25 - пограничный</li>
          <li>rpb &gt;= 0.25 - хороший</li>
        </ul>
      </div>
    ),
  },

  // Cronbach's Alpha
  cronbachAlpha: {
    title: "Альфа Кронбаха (α)",
    content: (
      <div className="space-y-1">
        <p>Мера внутренней согласованности теста.</p>
        <p className="text-muted-foreground">
          Показывает, измеряют ли все вопросы одну и ту же характеристику
        </p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>α &lt; 0.6 - ненадежно</li>
          <li>0.6-0.7 - приемлемо</li>
          <li>α &gt;= 0.7 - надежно</li>
        </ul>
      </div>
    ),
  },

  // Validity Status
  validityStatus: {
    title: 'Статус валидности',
    content: (
      <div className="space-y-1">
        <p>Текущий статус элемента в системе психометрического контроля.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Активный - прошел проверку качества</li>
          <li>Пробационный - собирает данные (&lt; 50 ответов)</li>
          <li>На проверке - требует ручной проверки</li>
          <li>Отключен - исключен из использования</li>
        </ul>
      </div>
    ),
  },

  // Response Count
  responseCount: {
    title: 'Количество ответов',
    content: (
      <div className="space-y-1">
        <p>Общее число ответов, использованных для расчета метрик.</p>
        <p className="text-muted-foreground">
          Минимум 50 ответов требуется для надежного расчета психометрических показателей
        </p>
      </div>
    ),
  },

  // Alpha If Deleted
  alphaIfDeleted: {
    title: 'Альфа без элемента',
    content: (
      <div className="space-y-1">
        <p>Значение альфы Кронбаха, если удалить этот вопрос из теста.</p>
        <p className="text-muted-foreground">
          Если альфа увеличивается при удалении вопроса, он может снижать надежность теста
        </p>
      </div>
    ),
  },

  // Distractor Efficiency
  distractorEfficiency: {
    title: 'Эффективность дистракторов',
    content: (
      <div className="space-y-1">
        <p>Показывает, как часто выбирается каждый вариант ответа.</p>
        <p className="text-muted-foreground">
          Хорошие дистракторы выбираются достаточно часто (минимум 5% респондентов)
        </p>
      </div>
    ),
  },

  // Big Five Traits
  bigFive: {
    title: 'Большая пятерка',
    content: (
      <div className="space-y-1">
        <p>Пятифакторная модель личности - научно обоснованная классификация личностных черт.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>O - Открытость опыту</li>
          <li>C - Добросовестность</li>
          <li>E - Экстраверсия</li>
          <li>A - Доброжелательность</li>
          <li>N - Эмоциональная стабильность</li>
        </ul>
      </div>
    ),
  },

  // Sample Size
  sampleSize: {
    title: 'Размер выборки',
    content: (
      <p>Количество уникальных респондентов, ответивших на вопросы данной компетенции или черты.</p>
    ),
  },

  // Item Count
  itemCount: {
    title: 'Количество элементов',
    content: (
      <p>Число вопросов, использованных для расчета надежности шкалы.</p>
    ),
  },
} as const;

/**
 * Pre-built help tooltips for common psychometric terms
 */
export function DifficultyHelp({ className }: { className?: string }) {
  return (
    <HelpTooltip className={className} title={psychometricHelp.difficulty.title}>
      {psychometricHelp.difficulty.content}
    </HelpTooltip>
  );
}

export function DiscriminationHelp({ className }: { className?: string }) {
  return (
    <HelpTooltip className={className} title={psychometricHelp.discrimination.title}>
      {psychometricHelp.discrimination.content}
    </HelpTooltip>
  );
}

export function CronbachAlphaHelp({ className }: { className?: string }) {
  return (
    <HelpTooltip className={className} title={psychometricHelp.cronbachAlpha.title}>
      {psychometricHelp.cronbachAlpha.content}
    </HelpTooltip>
  );
}

export function ValidityStatusHelp({ className }: { className?: string }) {
  return (
    <HelpTooltip className={className} title={psychometricHelp.validityStatus.title}>
      {psychometricHelp.validityStatus.content}
    </HelpTooltip>
  );
}

export function ResponseCountHelp({ className }: { className?: string }) {
  return (
    <HelpTooltip className={className} title={psychometricHelp.responseCount.title}>
      {psychometricHelp.responseCount.content}
    </HelpTooltip>
  );
}

export function BigFiveHelp({ className }: { className?: string }) {
  return (
    <HelpTooltip className={className} title={psychometricHelp.bigFive.title}>
      {psychometricHelp.bigFive.content}
    </HelpTooltip>
  );
}

/**
 * Table header with help tooltip
 */
interface TableHeaderWithHelpProps {
  label: string;
  helpKey: keyof typeof psychometricHelp;
  className?: string;
}

export function TableHeaderWithHelp({
  label,
  helpKey,
  className,
}: TableHeaderWithHelpProps) {
  const help = psychometricHelp[helpKey];

  return (
    <LabelWithHelp
      label={label}
      help={help.content}
      helpTitle={help.title}
      className={className}
    />
  );
}

export default HelpTooltip;
