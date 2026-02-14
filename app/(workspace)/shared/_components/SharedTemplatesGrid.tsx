/* eslint-disable security/detect-object-injection -- Safe: accessing typed Record with enum keys */
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Clock,
  FileText,
  Target,
  Play,
  Eye,
  Edit,
  Settings2,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SharedTemplateItem,
  SharePermission,
  AssessmentGoal,
  getPermissionDisplayText,
} from '@/types/domain';
import { useFormattedDates } from '@/hooks/useFormattedDates';

interface SharedTemplatesGridProps {
  items: SharedTemplateItem[];
  total: number;
}

const permissionConfig: Record<
  SharePermission,
  { icon: typeof Eye; color: string; bgColor: string }
> = {
  [SharePermission.VIEW]: {
    icon: Eye,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950/50',
  },
  [SharePermission.EDIT]: {
    icon: Edit,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/50',
  },
  [SharePermission.MANAGE]: {
    icon: Settings2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950/50',
  },
};

const goalBadgeConfig: Record<
  AssessmentGoal,
  { label: string; className: string }
> = {
  [AssessmentGoal.OVERVIEW]: {
    label: 'Overview',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  },
  [AssessmentGoal.JOB_FIT]: {
    label: 'Job Fit',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  },
  [AssessmentGoal.TEAM_FIT]: {
    label: 'Team Fit',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  },
};

/**
 * SharedTemplatesGrid - Grid display of shared templates
 *
 * Features:
 * - Responsive grid layout (1-3 columns)
 * - Permission badges
 * - Shared by attribution
 * - Quick action buttons
 * - Mobile-first design with touch-friendly targets
 */
export function SharedTemplatesGrid({ items, total }: SharedTemplatesGridProps) {
  const t = useTranslations('shared');

  return (
    <div className="space-y-4">
      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {t('resultsCount', { count: total })}
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <SharedTemplateCard key={item.template.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface SharedTemplateCardProps {
  item: SharedTemplateItem;
}

function SharedTemplateCard({ item }: SharedTemplateCardProps) {
  const t = useTranslations('shared');
  const { formatRelativeTime, formatFutureRelativeTime } = useFormattedDates();
  const { template, permission, sharedBy, sharedAt, expiresAt } = item;
  const permConfig = permissionConfig[permission];
  const PermIcon = permConfig.icon;
  const goalConfig = goalBadgeConfig[template.goal];

  // Check if expired
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  // Get initials for avatar
  const initials = sharedBy.name
    ? sharedBy.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        isExpired && 'opacity-60'
      )}
    >
      {/* Permission indicator strip */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          permConfig.bgColor.replace('bg-', 'bg-').replace('/50', '')
        )}
      />

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate">
              {template.name}
            </CardTitle>
            {template.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {template.description}
              </p>
            )}
          </div>
          {/* Permission badge */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className={cn('shrink-0 gap-1', permConfig.bgColor)}
                >
                  <PermIcon className={cn('h-3 w-3', permConfig.color)} />
                  <span className={cn('text-xs', permConfig.color)}>
                    {getPermissionDisplayText(permission)}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {t(`permission.${permission.toLowerCase()}`)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Goal badge */}
        <Badge variant="outline" className={cn('w-fit text-xs', goalConfig.className)}>
          {goalConfig.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Template stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {template.competencyCount} competencies
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.timeLimitMinutes} min
          </span>
        </div>

        {/* Shared by */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Avatar className="h-6 w-6">
            <AvatarImage src={sharedBy.avatarUrl} alt={sharedBy.name} />
            <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{sharedBy.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(sharedAt)}
            </p>
          </div>
        </div>

        {/* Expiry warning */}
        {expiresAt && !isExpired && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <Calendar className="h-3 w-3" />
            Expires {formatFutureRelativeTime(expiresAt)}
          </div>
        )}
        {isExpired && (
          <Badge variant="destructive" className="text-xs">
            Access Expired
          </Badge>
        )}

        {/* Actions */}
        {!isExpired && (
          <div className="flex gap-2 pt-2">
            <Button
              asChild
              variant="default"
              size="sm"
              className="flex-1 gap-1.5 min-h-[36px]"
            >
              <Link href={`/test-templates/${template.id}`}>
                <FileText className="h-4 w-4" />
                {t('viewTemplate')}
              </Link>
            </Button>
            {template.isActive && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 min-h-[36px]"
              >
                <Link href={`/test-templates/${template.id}/take`}>
                  <Play className="h-4 w-4" />
                  {t('takeTest')}
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
