'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ClipboardList, Briefcase, Users, HelpCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Strategy,
  StrategyValidation,
  STRATEGY_CONFIG,
  STRATEGY_HELP_CONTENT,
} from './strategy-context';

// ============================================
// ICON MAPPING
// ============================================

const STRATEGY_ICONS = {
  UNIVERSAL_BASELINE: ClipboardList,
  TARGETED_FIT: Briefcase,
  DYNAMIC_GAP_ANALYSIS: Users,
} as const;

// ============================================
// TYPES
// ============================================

interface StrategyHeroBadgeProps {
  strategy: Strategy;
  validation?: StrategyValidation;
  /** compact: Badge only (desktop sidebar), expanded: Full card (mobile) */
  variant?: 'compact' | 'expanded';
  className?: string;
}

// ============================================
// HELP CONTENT COMPONENT
// ============================================

function StrategyHelpContent({ strategy }: { strategy: Strategy }) {
  const t = useTranslations('builder.simulator');
  const content = STRATEGY_HELP_CONTENT[strategy];

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{t(content.titleKey as Parameters<typeof t>[0])}</p>
      <ul className="text-xs text-muted-foreground space-y-1">
        {content.pointKeys.map((key, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="text-primary mt-0.5 shrink-0">*</span>
            <span>{t(key as Parameters<typeof t>[0])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// STRATEGY LABEL HELPERS
// ============================================

const STRATEGY_LABEL_KEYS: Record<Strategy, string> = {
  UNIVERSAL_BASELINE: 'strategyConfig.universalBaseline.label',
  TARGETED_FIT: 'strategyConfig.targetedFit.label',
  DYNAMIC_GAP_ANALYSIS: 'strategyConfig.dynamicGap.label',
};

const STRATEGY_SHORT_LABEL_KEYS: Record<Strategy, string> = {
  UNIVERSAL_BASELINE: 'strategyConfig.universalBaseline.shortLabel',
  TARGETED_FIT: 'strategyConfig.targetedFit.shortLabel',
  DYNAMIC_GAP_ANALYSIS: 'strategyConfig.dynamicGap.shortLabel',
};

const STRATEGY_DESCRIPTION_KEYS: Record<Strategy, string> = {
  UNIVERSAL_BASELINE: 'strategyConfig.universalBaseline.description',
  TARGETED_FIT: 'strategyConfig.targetedFit.description',
  DYNAMIC_GAP_ANALYSIS: 'strategyConfig.dynamicGap.description',
};

// ============================================
// MAIN COMPONENT
// ============================================

export function StrategyHeroBadge({
  strategy,
  validation,
  variant = 'compact',
  className,
}: StrategyHeroBadgeProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];
  const Icon = STRATEGY_ICONS[strategy];

  const label = t(STRATEGY_LABEL_KEYS[strategy] as Parameters<typeof t>[0]);
  const shortLabel = t(STRATEGY_SHORT_LABEL_KEYS[strategy] as Parameters<typeof t>[0]);
  const description = t(STRATEGY_DESCRIPTION_KEYS[strategy] as Parameters<typeof t>[0]);

  const hasValidationIssues = validation && !validation.isValid;

  // Compact variant: Badge with tooltip
  if (variant === 'compact') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                'gap-1.5 py-1.5 px-2.5 cursor-help transition-colors',
                config.border,
                config.bg,
                hasValidationIssues && 'border-amber-500/50',
                className
              )}
              role="status"
              aria-label={`${t('testDrive')}: ${label}${hasValidationIssues ? ` (${t('strategy.configurationIncomplete')})` : ''}`}
            >
              <Icon
                className={cn('h-3.5 w-3.5 shrink-0', config.iconText)}
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{shortLabel}</span>
              {hasValidationIssues && (
                <AlertTriangle
                  className="h-3 w-3 text-amber-500 shrink-0"
                  aria-hidden="true"
                />
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-xs">
            <StrategyHelpContent strategy={strategy} />
            {hasValidationIssues && validation && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-amber-500 font-medium text-xs mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t('strategy.missingConfiguration')}
                </div>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {validation.missingRequirements.map((req, i) => (
                    <li key={i}>* {req}</li>
                  ))}
                </ul>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Expanded variant: Full card with details
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border relative overflow-hidden',
        config.border,
        config.bg,
        hasValidationIssues && 'border-amber-500/50',
        className
      )}
      role="region"
      aria-label={`${t('testDrive')}: ${label}`}
    >
      {/* Accent line at top */}
      <div
        className={cn(
          'absolute top-0 inset-x-0 h-0.5 rounded-t-xl',
          config.accentGradient
        )}
        aria-hidden="true"
      />

      {/* Icon */}
      <div className={cn('p-2.5 rounded-lg shrink-0', config.iconBg)}>
        <Icon className={cn('h-5 w-5', config.iconText)} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{label}</span>
          {hasValidationIssues && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 gap-1"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                    {t('strategy.incomplete')}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-1">
                    <div className="font-medium text-xs">{t('strategy.missingConfiguration')}</div>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {validation?.missingRequirements.map((req, i) => (
                        <li key={i}>* {req}</li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-0.5 rounded hover:bg-muted/50 transition-colors"
                  aria-label={t('strategy.learnMore', { label })}
                >
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <StrategyHelpContent strategy={strategy} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}

export default StrategyHeroBadge;
