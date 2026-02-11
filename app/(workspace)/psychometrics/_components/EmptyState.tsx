'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Database,
  type LucideIcon,
} from 'lucide-react';

export type EmptyStateVariant = 'default' | 'success' | 'warning' | 'search' | 'filter';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  variant?: EmptyStateVariant;
  className?: string;
  compact?: boolean;
  withCard?: boolean;
}

const variantConfig: Record<
  EmptyStateVariant,
  {
    defaultIcon: LucideIcon;
    iconColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  default: {
    defaultIcon: FileText,
    iconColor: 'text-muted-foreground',
    bgColor: '',
    borderColor: '',
  },
  success: {
    defaultIcon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-900',
  },
  warning: {
    defaultIcon: AlertTriangle,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-900',
  },
  search: {
    defaultIcon: Search,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-900',
  },
  filter: {
    defaultIcon: Filter,
    iconColor: 'text-violet-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-900',
  },
};

/**
 * EmptyState - Contextual empty states with variants for different scenarios
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
  compact = false,
  withCard = true,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.defaultIcon;

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-6 px-4' : 'py-12 px-6',
        !withCard && config.bgColor,
        !withCard && 'rounded-lg border',
        !withCard && config.borderColor,
        className
      )}
    >
      <div
        className={cn(
          'rounded-full p-3 mb-4',
          variant !== 'default' && 'bg-background/50'
        )}
      >
        <Icon
          className={cn(
            config.iconColor,
            compact ? 'h-6 w-6' : 'h-10 w-10',
            'opacity-70'
          )}
        />
      </div>

      <h3
        className={cn(
          'font-semibold',
          compact ? 'text-base' : 'text-lg',
          'text-foreground'
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'text-muted-foreground mt-1 max-w-sm',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {description}
      </p>

      {(action || secondaryAction) && (
        <div
          className={cn(
            'flex items-center gap-2',
            compact ? 'mt-3' : 'mt-4',
            'flex-wrap justify-center'
          )}
        >
          {action && (
            <ActionButton action={action} compact={compact} primary />
          )}
          {secondaryAction && (
            <ActionButton action={secondaryAction} compact={compact} />
          )}
        </div>
      )}
    </div>
  );

  if (!withCard) {
    return content;
  }

  return (
    <Card className={cn(config.bgColor, config.borderColor, className)}>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}

interface ActionButtonProps {
  action: EmptyStateAction;
  compact?: boolean;
  primary?: boolean;
}

function ActionButton({ action, compact, primary }: ActionButtonProps) {
  const variant = action.variant || (primary ? 'default' : 'outline');
  const size = compact ? 'sm' : 'default';

  if (action.href) {
    return (
      <Button variant={variant} size={size} asChild>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} size={size} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

/**
 * Pre-configured empty states for common psychometrics scenarios
 */

export function NoItemsFound({
  onClearFilters,
  className,
}: {
  onClearFilters?: () => void;
  className?: string;
}) {
  const t = useTranslations('psychometrics');
  return (
    <EmptyState
      variant="filter"
      icon={Filter}
      title={t('itemsNotFound')}
      description={t('tryChangingFilters')}
      action={onClearFilters ? { label: t('resetFilters'), onClick: onClearFilters } : undefined}
      className={className}
    />
  );
}

export function NoDataYet({
  entityName = 'data',
  className,
}: {
  entityName?: string;
  className?: string;
}) {
  const t = useTranslations('psychometrics');
  return (
    <EmptyState
      variant="default"
      icon={Database}
      title={t('noData', { entityName })}
      description={t('dataWillAppear')}
      className={className}
    />
  );
}

export function AllItemsValid({ className }: { className?: string }) {
  const t = useTranslations('psychometrics');
  return (
    <EmptyState
      variant="success"
      icon={CheckCircle2}
      title={t('allItemsOk')}
      description={t('allQuestionsValid')}
      className={className}
    />
  );
}

export function NoFlaggedItems({ className }: { className?: string }) {
  const t = useTranslations('psychometrics');
  return (
    <EmptyState
      variant="success"
      icon={CheckCircle2}
      title={t('noFlaggedItems')}
      description={t('allQuestionsGood')}
      className={className}
    />
  );
}

export function SearchNoResults({
  query,
  onClear,
  className,
}: {
  query?: string;
  onClear?: () => void;
  className?: string;
}) {
  const t = useTranslations('psychometrics');
  return (
    <EmptyState
      variant="search"
      icon={Search}
      title={t('nothingFoundSearch')}
      description={
        query
          ? t('noResultsFor', { query })
          : t('tryDifferentQuery')
      }
      action={onClear ? { label: t('clearSearchBtn'), onClick: onClear } : undefined}
      className={className}
    />
  );
}

export function InsufficientData({
  requiredCount = 50,
  currentCount,
  className,
}: {
  requiredCount?: number;
  currentCount?: number;
  className?: string;
}) {
  const t = useTranslations('psychometrics');
  const description = currentCount !== undefined
    ? t('minResponses', { required: requiredCount, current: currentCount })
    : t('minResponsesGeneric', { required: requiredCount });

  return (
    <EmptyState
      variant="warning"
      icon={AlertTriangle}
      title={t('insufficientData')}
      description={description}
      className={className}
    />
  );
}

export default EmptyState;
