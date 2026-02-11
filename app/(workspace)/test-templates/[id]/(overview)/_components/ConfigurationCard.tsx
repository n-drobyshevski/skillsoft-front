'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Clock,
  Target,
  FileQuestion,
  Check,
  X,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { TestTemplate } from '@/types/domain';

interface ConfigurationCardProps {
  template: TestTemplate;
  competencyCount: number;
  isDraft: boolean;
  canEdit: boolean;
}

interface BehaviorToggleProps {
  label: string;
  enabled: boolean;
}

function BehaviorToggle({ label, enabled }: BehaviorToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span
        className={cn(
          'text-sm',
          enabled ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  );
}

interface StatMiniCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatMiniCard({ icon, value, label }: StatMiniCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-lg border p-3',
        'bg-muted/30 min-w-[80px] flex-1'
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
      </div>
      <p className="text-lg font-semibold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * ConfigurationCard - Read-only display of test configuration settings
 *
 * Displays:
 * - Time limit, passing score, and questions per indicator stats
 * - Test behavior toggles (shuffle, skip, navigation, results)
 * - Competency count with link to builder
 * - Optional link to builder for draft templates
 *
 * @example
 * ```tsx
 * <ConfigurationCard
 *   template={testTemplate}
 *   competencyCount={5}
 *   isDraft={true}
 *   canEdit={true}
 * />
 * ```
 */
export function ConfigurationCard({
  template,
  competencyCount,
  isDraft,
  canEdit,
}: ConfigurationCardProps) {
  const t = useTranslations('template.hub.overview.configurationCard');
  const tOverview = useTranslations('template.hub.overview');
  const showBuilderButton = isDraft && canEdit;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-4 w-4" />
          {tOverview('configuration')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        {showBuilderButton && (
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/test-templates/${template.id}/builder`}
                className="gap-1.5"
              >
                {tOverview('hero.goToBuilder')}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="flex flex-row gap-2">
          <StatMiniCard
            icon={<Clock className="h-4 w-4" />}
            value={template.timeLimitMinutes ? `${template.timeLimitMinutes} min` : t('unlimited')}
            label={t('timeLimit')}
          />
          <StatMiniCard
            icon={<Target className="h-4 w-4" />}
            value={template.passingScore ? `${template.passingScore}%` : t('notSet')}
            label={t('passScore')}
          />
          <StatMiniCard
            icon={<FileQuestion className="h-4 w-4" />}
            value={`${template.questionsPerIndicator}/ind`}
            label={t('questions')}
          />
        </div>

        <Separator />

        {/* Behavior toggles */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('testBehavior')}</h4>
          <div
            className={cn(
              'rounded-lg border bg-muted/30 p-3 space-y-2'
            )}
          >
            <BehaviorToggle
              label={t('shuffleQuestions')}
              enabled={template.shuffleQuestions}
            />
            <BehaviorToggle
              label={t('shuffleOptions')}
              enabled={template.shuffleOptions}
            />
            <BehaviorToggle
              label={t('allowSkipping')}
              enabled={template.allowSkip}
            />
            <BehaviorToggle
              label={t('allowBackNav')}
              enabled={template.allowBackNavigation}
            />
            <BehaviorToggle
              label={t('showResults')}
              enabled={template.showResultsImmediately}
            />
          </div>
        </div>

        <Separator />

        {/* Competencies section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('competencies')}</h4>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {t('competenciesSelected', { count: competencyCount })}
            </Badge>
            <Link
              href={`/test-templates/${template.id}/builder`}
              className={cn(
                'inline-flex items-center gap-1 text-sm text-primary',
                'hover:underline hover:underline-offset-4'
              )}
            >
              {t('viewInBuilder')}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
