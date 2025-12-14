'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Inbox,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType =
  | 'no_tests'
  | 'no_all'
  | 'no_pending'
  | 'no_in_progress'
  | 'no_completed';

interface EmptyStateProps {
  type: EmptyStateType;
}

interface EmptyStateConfig {
  icon: typeof Inbox;
  iconClassName: string;
  bgGradient: string;
  decorColor: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon: typeof ArrowRight;
  };
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, EmptyStateConfig> = {
  no_tests: {
    icon: Inbox,
    iconClassName: 'text-slate-400 dark:text-slate-500',
    bgGradient: 'from-slate-100/80 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/30',
    decorColor: 'bg-slate-300/50 dark:bg-slate-700/50',
    title: 'Нет назначенных тестов',
    description:
      'Когда HR-отдел назначит вам тестирование, оно появится здесь. Пока можете ознакомиться с каталогом тестов.',
    action: {
      label: 'Каталог тестов',
      href: '/test-templates',
      icon: ArrowRight,
    },
  },
  no_all: {
    icon: Inbox,
    iconClassName: 'text-slate-400 dark:text-slate-500',
    bgGradient: 'from-slate-100/80 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/30',
    decorColor: 'bg-slate-300/50 dark:bg-slate-700/50',
    title: 'Нет тестов',
    description: 'У вас пока нет назначенных тестов.',
  },
  no_pending: {
    icon: CheckCircle2,
    iconClassName: 'text-emerald-500',
    bgGradient: 'from-emerald-100/80 to-emerald-50/50 dark:from-emerald-900/30 dark:to-emerald-950/20',
    decorColor: 'bg-emerald-300/50 dark:bg-emerald-700/50',
    title: 'Все тесты начаты!',
    description:
      'Отличная работа! Все назначенные тесты уже начаты или завершены. Проверьте активные тесты.',
    action: {
      label: 'Активные тесты',
      href: '/my-tests?tab=in_progress',
      icon: PlayCircle,
    },
  },
  no_in_progress: {
    icon: Clock,
    iconClassName: 'text-blue-500',
    bgGradient: 'from-blue-100/80 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-950/20',
    decorColor: 'bg-blue-300/50 dark:bg-blue-700/50',
    title: 'Нет активных тестов',
    description: 'У вас нет тестов в процессе прохождения. Начните новый тест!',
    action: {
      label: 'Начать тест',
      href: '/my-tests?tab=pending',
      icon: PlayCircle,
    },
  },
  no_completed: {
    icon: Trophy,
    iconClassName: 'text-amber-500',
    bgGradient: 'from-amber-100/80 to-amber-50/50 dark:from-amber-900/30 dark:to-amber-950/20',
    decorColor: 'bg-amber-300/50 dark:bg-amber-700/50',
    title: 'Нет завершенных тестов',
    description: 'Вы ещё не завершили ни одного теста. Начните с ожидающих тестов!',
    action: {
      label: 'Ожидающие тесты',
      href: '/my-tests?tab=pending',
      icon: Sparkles,
    },
  },
};

/**
 * Empty State Component - Enhanced
 *
 * Features:
 * - Decorative background pattern
 * - Status-specific color gradients
 * - Contextual call-to-action buttons
 * - Smooth fade-in animation
 */
export function EmptyState({ type }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;
  const ActionIcon = config.action?.icon;

  return (
    <div
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Decorative Icon Container */}
      <div className="relative mb-6">
        {/* Background glow effect */}
        <div
          className={cn(
            'absolute inset-0 -m-4 rounded-full blur-2xl opacity-60',
            `bg-gradient-to-b ${config.bgGradient}`
          )}
          aria-hidden="true"
        />

        {/* Decorative dots */}
        <div
          className={cn('absolute -top-2 -right-2 size-3 rounded-full', config.decorColor)}
          aria-hidden="true"
        />
        <div
          className={cn('absolute -bottom-1 -left-3 size-2 rounded-full', config.decorColor)}
          aria-hidden="true"
        />

        {/* Main icon container */}
        <div
          className={cn(
            'relative z-10',
            'size-20 sm:size-24 rounded-2xl',
            'flex items-center justify-center',
            `bg-gradient-to-br ${config.bgGradient}`,
            'border border-border/50',
            'shadow-lg shadow-black/5 dark:shadow-black/20'
          )}
        >
          <Icon className={cn('size-10 sm:size-12', config.iconClassName)} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{config.title}</h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm sm:text-base max-w-sm leading-relaxed mb-6">
        {config.description}
      </p>

      {/* Action Button */}
      {config.action && ActionIcon && (
        <Button asChild variant="outline" className="group">
          <Link href={config.action.href}>
            <ActionIcon className="size-4 mr-2 transition-transform group-hover:scale-110" />
            {config.action.label}
            <ArrowRight className="size-4 ml-2 opacity-50 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      )}
    </div>
  );
}
