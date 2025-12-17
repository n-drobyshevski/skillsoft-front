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

  // Average Discrimination
  averageDiscrimination: {
    title: 'Средняя дискриминация',
    content: (
      <div className="space-y-1">
        <p>Среднее значение индекса дискриминации по всем активным вопросам.</p>
        <p className="text-muted-foreground">
          Показывает общую способность теста различать респондентов
        </p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>rpb &lt; 0.15 — требуется улучшение</li>
          <li>0.15–0.25 — приемлемо</li>
          <li>rpb &ge; 0.25 — хорошо</li>
        </ul>
      </div>
    ),
  },

  // Average Alpha
  averageAlpha: {
    title: 'Средняя альфа',
    content: (
      <div className="space-y-1">
        <p>Среднее значение альфы Кронбаха по всем компетенциям.</p>
        <p className="text-muted-foreground">
          Общий показатель надежности измерений в системе
        </p>
      </div>
    ),
  },

  // Active Items percentage
  activeItemsPercent: {
    title: 'Активные элементы',
    content: (
      <div className="space-y-1">
        <p>Процент вопросов, прошедших психометрическую проверку.</p>
        <p className="text-muted-foreground">
          Высокий процент означает хорошее качество тестовой базы
        </p>
      </div>
    ),
  },

  // Reliable Competencies percentage
  reliableCompetenciesPercent: {
    title: 'Надежные компетенции',
    content: (
      <div className="space-y-1">
        <p>Процент компетенций с альфой Кронбаха &ge; 0.7</p>
        <p className="text-muted-foreground">
          Измерения этих компетенций дают стабильные и воспроизводимые результаты
        </p>
      </div>
    ),
  },

  // Flagged Items
  flaggedItems: {
    title: 'Проблемные элементы',
    content: (
      <div className="space-y-1">
        <p>Вопросы с экстремальными метриками, требующие внимания.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Очень низкая/высокая сложность</li>
          <li>Низкая или отрицательная дискриминация</li>
          <li>Требуют редактирования или удаления</li>
        </ul>
      </div>
    ),
  },

  // Section Headers
  itemStatusSection: {
    title: 'Статус элементов оценки',
    content: (
      <div className="space-y-1">
        <p>Распределение вопросов по статусам психометрической проверки.</p>
        <p className="text-muted-foreground">
          Каждый вопрос проходит валидацию после накопления минимум 50 ответов
        </p>
      </div>
    ),
  },

  competencyReliabilitySection: {
    title: 'Надежность компетенций',
    content: (
      <div className="space-y-1">
        <p>Распределение компетенций по уровню надежности измерений.</p>
        <p className="text-muted-foreground">
          Оценивается по коэффициенту альфа Кронбаха — показателю внутренней согласованности
        </p>
      </div>
    ),
  },

  bigFiveReliabilitySection: {
    title: 'Надежность Big Five',
    content: (
      <div className="space-y-1">
        <p>Оценка надежности измерения пятифакторной модели личности.</p>
        <p className="text-muted-foreground">
          Big Five проецируется из оценок компетенций через O*NET-связи
        </p>
      </div>
    ),
  },

  // Item Validity Statuses
  activeStatus: {
    title: 'Активные элементы',
    content: (
      <div className="space-y-1">
        <p>Вопросы с хорошими психометрическими показателями.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Индекс дискриминации rpb &ge; 0.25</li>
          <li>Индекс сложности p: 0.2 - 0.9</li>
          <li>Минимум 50 ответов</li>
        </ul>
      </div>
    ),
  },

  probationStatus: {
    title: 'Пробационные элементы',
    content: (
      <div className="space-y-1">
        <p>Новые вопросы, накапливающие данные для валидации.</p>
        <p className="text-muted-foreground">
          Требуется минимум 50 ответов для надежного расчета показателей
        </p>
      </div>
    ),
  },

  flaggedForReviewStatus: {
    title: 'Элементы на проверке',
    content: (
      <div className="space-y-1">
        <p>Вопросы с экстремальными метриками.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Критично низкая дискриминация (rpb &lt; 0.1)</li>
          <li>Экстремальная сложность</li>
        </ul>
      </div>
    ),
  },

  retiredStatus: {
    title: 'Отключенные элементы',
    content: (
      <div className="space-y-1">
        <p>Вопросы, исключенные из использования.</p>
        <p className="text-muted-foreground">
          Автоматически отключаются при отрицательной дискриминации (rpb &lt; 0)
        </p>
      </div>
    ),
  },

  // Competency Reliability Statuses
  reliableCompetencyStatus: {
    title: 'Надежные компетенции',
    content: (
      <div className="space-y-1">
        <p>Альфа Кронбаха &ge; 0.7</p>
        <p className="text-muted-foreground">
          Измерения дают стабильные и воспроизводимые результаты
        </p>
      </div>
    ),
  },

  acceptableCompetencyStatus: {
    title: 'Приемлемые компетенции',
    content: (
      <div className="space-y-1">
        <p>Альфа Кронбаха 0.6 - 0.7</p>
        <p className="text-muted-foreground">
          Приемлемо для исследований, но требует осторожности в интерпретации
        </p>
      </div>
    ),
  },

  unreliableCompetencyStatus: {
    title: 'Ненадежные компетенции',
    content: (
      <div className="space-y-1">
        <p>Альфа Кронбаха &lt; 0.6</p>
        <p className="text-muted-foreground">
          Измерения нестабильны, требуется пересмотр вопросов
        </p>
      </div>
    ),
  },

  insufficientDataCompetency: {
    title: 'Недостаточно данных',
    content: (
      <p className="text-muted-foreground">
        Требуется больше завершенных тестов для расчета надежности
      </p>
    ),
  },

  // Big Five Trait Statuses
  reliableTraitStatus: {
    title: 'Надежные черты',
    content: (
      <p className="text-muted-foreground">
        Альфа &ge; 0.7 для проекции на личностную черту
      </p>
    ),
  },

  acceptableTraitStatus: {
    title: 'Приемлемые черты',
    content: (
      <p className="text-muted-foreground">
        Альфа 0.6 - 0.7, интерпретировать с осторожностью
      </p>
    ),
  },

  unreliableTraitStatus: {
    title: 'Ненадежные черты',
    content: (
      <p className="text-muted-foreground">
        Альфа &lt; 0.6, недостаточная согласованность
      </p>
    ),
  },

  insufficientDataTrait: {
    title: 'Недостаточно данных',
    content: (
      <p className="text-muted-foreground">
        Требуется больше ответов по связанным компетенциям
      </p>
    ),
  },

  // Big Five Individual Traits
  traitOpenness: {
    title: 'Открытость опыту (O)',
    content: (
      <div className="space-y-1">
        <p>Склонность к интеллектуальному любопытству и творчеству.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Высокая: креативность, любознательность</li>
          <li>Низкая: практичность, традиционность</li>
        </ul>
      </div>
    ),
  },

  traitConscientiousness: {
    title: 'Добросовестность (C)',
    content: (
      <div className="space-y-1">
        <p>Организованность, надежность и самодисциплина.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Высокая: планомерность, ответственность</li>
          <li>Низкая: гибкость, спонтанность</li>
        </ul>
      </div>
    ),
  },

  traitExtraversion: {
    title: 'Экстраверсия (E)',
    content: (
      <div className="space-y-1">
        <p>Общительность, энергичность и позитивные эмоции.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Высокая: социальность, энтузиазм</li>
          <li>Низкая: интроверсия, сдержанность</li>
        </ul>
      </div>
    ),
  },

  traitAgreeableness: {
    title: 'Доброжелательность (A)',
    content: (
      <div className="space-y-1">
        <p>Кооперативность, доверие и альтруизм.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Высокая: эмпатия, дипломатичность</li>
          <li>Низкая: конкурентность, прямолинейность</li>
        </ul>
      </div>
    ),
  },

  traitEmotionalStability: {
    title: 'Эмоциональная стабильность (N-)',
    content: (
      <div className="space-y-1">
        <p>Спокойствие и эмоциональная уравновешенность.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Высокая: стрессоустойчивость, уверенность</li>
          <li>Низкая: тревожность, эмоциональная реактивность</li>
        </ul>
      </div>
    ),
  },

  // Summary metrics
  averageBigFiveAlpha: {
    title: 'Средняя альфа Big Five',
    content: (
      <p className="text-muted-foreground">
        Среднее значение альфы Кронбаха по всем пяти чертам личности
      </p>
    ),
  },

  // ============================================================================
  // Dashboard Hero
  // ============================================================================

  healthScore: {
    title: 'Индекс здоровья теста',
    content: (
      <div className="space-y-1">
        <p>Комплексная оценка качества тестовой базы по шкале 0-100.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>80+ — Отлично</li>
          <li>60-79 — Хорошо</li>
          <li>40-59 — Требует внимания</li>
          <li>&lt; 40 — Критично</li>
        </ul>
      </div>
    ),
  },

  healthScoreBreakdown: {
    title: 'Формула расчета',
    content: (
      <div className="space-y-1">
        <p>Индекс рассчитывается по трем компонентам:</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li><span className="text-emerald-600">●</span> Активные элементы (40%)</li>
          <li><span className="text-blue-600">●</span> Надежные компетенции (30%)</li>
          <li><span className="text-amber-600">●</span> Не-проблемные элементы (30%)</li>
        </ul>
      </div>
    ),
  },

  activeItemsWeight: {
    title: 'Активные элементы (40%)',
    content: (
      <div className="space-y-1">
        <p>Доля вопросов, прошедших психометрическую валидацию.</p>
        <p className="text-muted-foreground">
          Высокий процент означает качественную тестовую базу
        </p>
      </div>
    ),
  },

  reliableCompetenciesWeight: {
    title: 'Надежные компетенции (30%)',
    content: (
      <div className="space-y-1">
        <p>Доля компетенций с альфой Кронбаха ≥ 0.6</p>
        <p className="text-muted-foreground">
          Включает «надежные» (α ≥ 0.7) и «приемлемые» (α 0.6-0.7)
        </p>
      </div>
    ),
  },

  nonFlaggedItemsWeight: {
    title: 'Не-проблемные элементы (30%)',
    content: (
      <div className="space-y-1">
        <p>Доля вопросов без критических проблем.</p>
        <p className="text-muted-foreground">
          Исключает элементы с экстремальной сложностью или отрицательной дискриминацией
        </p>
      </div>
    ),
  },

  heroTotalItems: {
    title: 'Всего элементов',
    content: (
      <p className="text-muted-foreground">
        Общее количество вопросов в системе оценки
      </p>
    ),
  },

  heroActiveRate: {
    title: 'Доля активных',
    content: (
      <div className="space-y-1">
        <p>Процент элементов со статусом «Активный».</p>
        <p className="text-muted-foreground">
          Активные вопросы прошли проверку и используются в тестах
        </p>
      </div>
    ),
  },

  heroIssues: {
    title: 'Проблемы',
    content: (
      <div className="space-y-1">
        <p>Количество элементов, требующих внимания.</p>
        <p className="text-muted-foreground">
          Включает вопросы с экстремальными метриками или статусом «На проверке»
        </p>
      </div>
    ),
  },

  // ============================================================================
  // Item Quality Scatter Chart
  // ============================================================================

  itemQualityMap: {
    title: 'Карта качества вопросов',
    content: (
      <div className="space-y-1">
        <p>Визуализация всех вопросов по двум ключевым метрикам.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Ось X — сложность вопроса (p-value)</li>
          <li>Ось Y — эффективность вопроса (rpb)</li>
        </ul>
        <p className="mt-1 text-muted-foreground">
          Клик по точке открывает детали вопроса
        </p>
      </div>
    ),
  },

  zoneOptimal: {
    title: 'Оптимальная зона',
    content: (
      <div className="space-y-1">
        <p>Вопросы с идеальными психометрическими характеристиками.</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          <li>Сложность: 0.2 - 0.8</li>
          <li>Эффективность: ≥ 0.25</li>
        </ul>
      </div>
    ),
  },

  zoneTooEasy: {
    title: 'Слишком легкие',
    content: (
      <div className="space-y-1">
        <p>Вопросы, на которые отвечают правильно почти все.</p>
        <p className="text-muted-foreground">
          Сложность p &gt; 0.9 — более 90% правильных ответов
        </p>
      </div>
    ),
  },

  zoneTooHard: {
    title: 'Слишком сложные',
    content: (
      <div className="space-y-1">
        <p>Вопросы, на которые мало кто отвечает правильно.</p>
        <p className="text-muted-foreground">
          Сложность p &lt; 0.2 — менее 20% правильных ответов
        </p>
      </div>
    ),
  },

  zoneToxic: {
    title: 'Токсичные вопросы',
    content: (
      <div className="space-y-1">
        <p>Вопросы с отрицательной дискриминацией (rpb &lt; 0).</p>
        <p className="text-muted-foreground">
          Сильные респонденты чаще ошибаются — требуется удаление или переработка
        </p>
      </div>
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

export function AverageDiscriminationHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.averageDiscrimination;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function AverageAlphaHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.averageAlpha;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function ActiveItemsHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.activeItemsPercent;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function ReliableCompetenciesHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.reliableCompetenciesPercent;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function FlaggedItemsHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.flaggedItems;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

// Section Headers
export function ItemStatusSectionHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.itemStatusSection;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function CompetencyReliabilitySectionHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.competencyReliabilitySection;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function BigFiveReliabilitySectionHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.bigFiveReliabilitySection;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

// Item Status Helpers
export function ActiveStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.activeStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function ProbationStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.probationStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function FlaggedForReviewStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.flaggedForReviewStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function RetiredStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.retiredStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

// Competency Reliability Helpers
export function ReliableCompetencyStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.reliableCompetencyStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function AcceptableCompetencyStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.acceptableCompetencyStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function UnreliableCompetencyStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.unreliableCompetencyStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function InsufficientDataCompetencyHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.insufficientDataCompetency;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

// Big Five Reliability Status Helpers
export function ReliableTraitStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.reliableTraitStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function AcceptableTraitStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.acceptableTraitStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function UnreliableTraitStatusHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.unreliableTraitStatus;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function InsufficientDataTraitHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.insufficientDataTrait;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

// Big Five Trait Helpers
export function TraitOpennessHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.traitOpenness;
  return <HelpTooltip className={className} title={title} variant="learn">{content}</HelpTooltip>;
}

export function TraitConscientiousnessHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.traitConscientiousness;
  return <HelpTooltip className={className} title={title} variant="learn">{content}</HelpTooltip>;
}

export function TraitExtraversionHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.traitExtraversion;
  return <HelpTooltip className={className} title={title} variant="learn">{content}</HelpTooltip>;
}

export function TraitAgreeablenessHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.traitAgreeableness;
  return <HelpTooltip className={className} title={title} variant="learn">{content}</HelpTooltip>;
}

export function TraitEmotionalStabilityHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.traitEmotionalStability;
  return <HelpTooltip className={className} title={title} variant="learn">{content}</HelpTooltip>;
}

// Average Big Five Alpha
export function AverageBigFiveAlphaHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.averageBigFiveAlpha;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

// ============================================================================
// Dashboard Hero Helpers
// ============================================================================

export function HealthScoreHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.healthScore;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function HealthScoreBreakdownHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.healthScoreBreakdown;
  return <HelpTooltip className={className} title={title} variant="info">{content}</HelpTooltip>;
}

export function ActiveItemsWeightHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.activeItemsWeight;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function ReliableCompetenciesWeightHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.reliableCompetenciesWeight;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function NonFlaggedItemsWeightHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.nonFlaggedItemsWeight;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function HeroTotalItemsHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.heroTotalItems;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function HeroActiveRateHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.heroActiveRate;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function HeroIssuesHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.heroIssues;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

// ============================================================================
// Item Quality Scatter Chart Helpers
// ============================================================================

export function ItemQualityMapHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.itemQualityMap;
  return <HelpTooltip className={className} title={title} variant="info">{content}</HelpTooltip>;
}

export function ZoneOptimalHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.zoneOptimal;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function ZoneTooEasyHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.zoneTooEasy;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function ZoneTooHardHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.zoneTooHard;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
}

export function ZoneToxicHelp({ className }: { className?: string }) {
  const { title, content } = psychometricHelp.zoneToxic;
  return <HelpTooltip className={className} title={title}>{content}</HelpTooltip>;
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
