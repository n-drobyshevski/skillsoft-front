'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Pencil, Check, Wrench, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TestTemplate, AssessmentGoalInfo, AssessmentGoal } from '@/types/domain';
import { useFormattedDates } from '@/hooks/useFormattedDates';
import StartTestSessionButton from '../../../_components/StartTestSessionButton';
import StartTestDriveButton from '../../../_components/StartTestDriveButton';

// ============================================
// PROPS INTERFACE
// ============================================

export interface OverviewHeroProps {
  template: TestTemplate;
  isDraft: boolean;
  canEdit: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Truncate text to a maximum length with ellipsis.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * OverviewHero - Template identity, status, and primary actions.
 *
 * Displays at the top of the Overview tab with:
 * - Status badge (Draft/Published)
 * - Goal badge (Universal Baseline, Job Fit, Team Fit)
 * - Template name and description
 * - Created/Updated timestamps
 * - Primary action button (Go to Builder or New Version)
 *
 * Responsive layout:
 * - Mobile: Stack vertically, action button at bottom
 * - Desktop: Flex row with button on right
 */
export function OverviewHero({ template, isDraft, canEdit }: OverviewHeroProps) {
  const { id, name, description, goal, createdAt, updatedAt } = template;
  const t = useTranslations('template.hub.overview.hero');
  const tStatus = useTranslations('template.hub.status');
  const tActions = useTranslations('template.hub.actions');
  const { formatDate } = useFormattedDates();

  // Get goal display info
  const goalInfo = AssessmentGoalInfo[goal as AssessmentGoal];
  const goalDisplayName = goalInfo?.displayName ?? goal;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      {/* Left: Template Info */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          {isDraft ? (
            <Badge
              className={cn(
                'bg-amber-100 text-amber-700 border-amber-200',
                'dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
              )}
            >
              <Pencil className="h-3 w-3" />
              {tStatus('draft')}
            </Badge>
          ) : (
            <Badge
              className={cn(
                'bg-green-100 text-green-700 border-green-200',
                'dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
              )}
            >
              <Check className="h-3 w-3" />
              {tStatus('published')}
            </Badge>
          )}

          {/* Goal Badge */}
          <Badge
            className={cn(
              'bg-primary/10 text-primary border-primary/20',
              'dark:bg-primary/20 dark:border-primary/30'
            )}
          >
            {goalDisplayName}
          </Badge>

          {/* Version Badge */}
          {template.version != null && (
            <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
              v{template.version}
            </Badge>
          )}
        </div>

        {/* Template Name */}
        <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
          {name}
        </h1>

        {/* Description */}
        {description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {/* Mobile: Show truncated, Desktop: Show more */}
            <span className="lg:hidden">{truncateText(description, 150)}</span>
            <span className="hidden lg:inline line-clamp-3">{description}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {t('noDescription')}
          </p>
        )}

        {/* Timestamps */}
        <p className="text-xs text-muted-foreground">
          {t('createdAt', { date: formatDate(createdAt) })}
          <span className="mx-2">&#x2022;</span>
          {t('updatedAt', { date: formatDate(updatedAt) })}
        </p>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex-shrink-0 pt-4 lg:pt-0 w-full lg:w-auto">
        {isDraft ? (
          // Draft: Show Go to Builder button only
          <Button asChild className="w-full lg:w-auto gap-2">
            <Link href={`/test-templates/${id}/builder`}>
              <Wrench className="h-4 w-4" />
              {t('goToBuilder')}
            </Link>
          </Button>
        ) : (
          // Published: Show test action buttons
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-nowrap">
            {/* Start Test - Primary action */}
            <StartTestSessionButton
              templateId={id}
              templateName={name}
              fullWidth={false}
              size="sm"
            />

            {/* HR Test Drive - Secondary action */}
            <StartTestDriveButton
              templateId={id}
              templateName={name}
              className="w-full sm:w-auto"
            />

            {/* New Version - Only if canEdit */}
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline">{tActions('newVersion')}</span>
                <span className="sm:hidden">{tActions('newVersionShort')}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewHero;
