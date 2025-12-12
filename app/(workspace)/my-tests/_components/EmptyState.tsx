'use client';

import { Inbox, CheckCircle2, Clock, PlayCircle, Trophy } from 'lucide-react';
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

const EMPTY_STATE_CONFIG: Record<EmptyStateType, {
  icon: typeof Inbox;
  iconClassName: string;
  title: string;
  description: string;
}> = {
  no_tests: {
    icon: Inbox,
    iconClassName: 'text-muted-foreground/40',
    title: 'Нет тестов',
    description: 'У вас пока нет назначенных тестов. Когда HR-отдел назначит вам тестирование, оно появится здесь.',
  },
  no_all: {
    icon: Inbox,
    iconClassName: 'text-muted-foreground/40',
    title: 'Нет тестов',
    description: 'У вас пока нет назначенных тестов.',
  },
  no_pending: {
    icon: CheckCircle2,
    iconClassName: 'text-emerald-500/40',
    title: 'Нет ожидающих тестов',
    description: 'Все назначенные тесты уже начаты или завершены. Отличная работа!',
  },
  no_in_progress: {
    icon: Clock,
    iconClassName: 'text-blue-500/40',
    title: 'Нет активных тестов',
    description: 'У вас нет тестов в процессе прохождения.',
  },
  no_completed: {
    icon: Trophy,
    iconClassName: 'text-amber-500/40',
    title: 'Нет завершенных тестов',
    description: 'Вы ещё не завершили ни одного теста. Начните с ожидающих!',
  },
};

/**
 * Empty State Component
 * Shows when there are no tests in a particular category
 */
export function EmptyState({ type }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center animate-fadeIn">
      <div className={cn(
        "rounded-full p-4 mb-4 bg-muted/50",
        "ring-1 ring-border/50"
      )}>
        <Icon className={cn("size-12 sm:size-16", config.iconClassName)} />
      </div>

      <h3 className="text-lg sm:text-xl font-semibold mb-2">
        {config.title}
      </h3>

      <p className="text-muted-foreground text-sm sm:text-base max-w-md">
        {config.description}
      </p>
    </div>
  );
}
