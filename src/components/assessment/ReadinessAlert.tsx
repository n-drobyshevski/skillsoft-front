'use client';

import { TemplateReadinessResponse, CompetencyReadiness, HealthStatus } from '@/types/domain';
import { AlertTriangle, XCircle, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ReadinessAlertProps {
  readiness: TemplateReadinessResponse;
  isLoading?: boolean;
  onGoBack?: () => void;
  className?: string;
}

const healthStatusConfig: Record<HealthStatus, {
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  HEALTHY: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    label: 'Ready',
  },
  MODERATE: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'Low Questions',
  },
  CRITICAL: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    label: 'Missing Questions',
  },
};

function CompetencyReadinessCard({ competency }: { competency: CompetencyReadiness }) {
  const config = healthStatusConfig[competency.healthStatus];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border',
      config.bgColor,
      config.borderColor
    )}>
      <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
        <StatusIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {competency.competencyName}
          </span>
          <Badge
            variant="outline"
            className={cn('text-xs flex-shrink-0', config.color, config.borderColor)}
          >
            {competency.questionsAvailable}/{competency.questionsRequired}
          </Badge>
        </div>
        {competency.issues.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {competency.issues.map((issue, idx) => (
              <li key={idx} className="text-xs text-muted-foreground">
                {issue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ReadinessAlert({
  readiness,
  isLoading = false,
  onGoBack,
  className,
}: ReadinessAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className={cn(
        'rounded-xl border border-muted bg-muted/30 p-6',
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Checking template readiness...</span>
        </div>
      </div>
    );
  }

  if (readiness.ready) {
    return null; // Don't show alert when ready
  }

  const criticalCount = readiness.competencyReadiness.filter(
    c => c.healthStatus === 'CRITICAL'
  ).length;

  const moderateCount = readiness.competencyReadiness.filter(
    c => c.healthStatus === 'MODERATE'
  ).length;

  return (
    <div className={cn(
      'rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20',
      className
    )}>
      {/* Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Template Not Ready
            </h3>
            <p className="text-sm text-muted-foreground">
              {readiness.message}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">
              <XCircle className="w-3 h-3 mr-1" />
              {criticalCount} missing
            </Badge>
          )}
          {moderateCount > 0 && (
            <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10">
              <AlertCircle className="w-3 h-3 mr-1" />
              {moderateCount} low
            </Badge>
          )}
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
            {readiness.totalQuestionsAvailable}/{readiness.questionsRequired} questions
          </Badge>
        </div>

        {/* Expandable Competency Details */}
        {readiness.competencyReadiness.length > 0 && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="text-xs">
                {isExpanded ? 'Hide' : 'Show'} competency details
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {isExpanded && (
              <div className="mt-3 space-y-2">
                {readiness.competencyReadiness.map(competency => (
                  <CompetencyReadinessCard
                    key={competency.competencyId}
                    competency={competency}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="px-5 pb-5">
        <div className="rounded-lg bg-background/50 dark:bg-background/30 border border-border/50 p-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This assessment cannot be started until all competencies have sufficient questions.
            Please contact your HR administrator to add questions to the affected competencies.
          </p>
        </div>
      </div>

      {/* Action */}
      {onGoBack && (
        <div className="px-5 pb-5">
          <Button
            variant="outline"
            onClick={onGoBack}
            className="w-full border-amber-500/30 hover:bg-amber-500/10"
          >
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
}

export function ReadinessAlertCompact({
  readiness,
  className,
}: {
  readiness: TemplateReadinessResponse;
  className?: string;
}) {
  if (readiness.ready) {
    return null;
  }

  const criticalCount = readiness.competencyReadiness.filter(
    c => c.healthStatus === 'CRITICAL'
  ).length;

  return (
    <div className={cn(
      'flex items-center gap-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10',
      className
    )}>
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
      <span className="text-sm text-amber-600 dark:text-amber-400">
        {criticalCount > 0
          ? `${criticalCount} competenc${criticalCount === 1 ? 'y' : 'ies'} missing questions`
          : 'Insufficient questions available'
        }
      </span>
    </div>
  );
}
