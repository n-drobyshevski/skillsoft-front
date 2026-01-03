'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

interface MobileSeverityBannerProps {
  severity: SeverityLevel;
  reasons: string[];
  defaultExpanded?: boolean;
  className?: string;
}

const severityStyles = {
  critical: {
    color: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-l-red-500',
    Icon: AlertOctagon,
  },
  high: {
    color: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-l-orange-500',
    Icon: AlertTriangle,
  },
  medium: {
    color: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-l-amber-500',
    Icon: AlertTriangle,
  },
  low: {
    color: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-l-blue-500',
    Icon: AlertTriangle,
  },
};

/**
 * MobileSeverityBanner - Collapsible alert banner for mobile
 *
 * Shows severity level with primary reason when collapsed,
 * expands to show full list of reasons on tap.
 */
export function MobileSeverityBanner({
  severity,
  reasons,
  defaultExpanded = false,
  className,
}: MobileSeverityBannerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('psychometrics.flaggedDetail');

  const styles = severityStyles[severity];
  const { Icon, color, bgClass, borderClass } = styles;

  // Get translated title and label based on severity
  const title = t(`severity.${severity}.title`);
  const label = t(`severity.${severity}.label`);

  // Show first reason as summary when collapsed
  const summaryReason = reasons[0] || t('itemFlaggedForReview');
  const hasMoreReasons = reasons.length > 1;

  return (
    <Card
      className={cn(
        'border-l-4 overflow-hidden',
        borderClass,
        bgClass,
        className
      )}
    >
      <CardContent className="p-0">
        {/* Clickable header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full p-3 sm:p-4 text-left',
            'flex items-start gap-3',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            'transition-colors',
            isExpanded && 'pb-0'
          )}
          aria-expanded={isExpanded}
          aria-controls="severity-details"
        >
          {/* Icon */}
          <div className={cn('p-1.5 rounded-lg bg-background/50 shrink-0', color)}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className={cn('font-semibold text-sm sm:text-base', color)}>
                {title}
              </h3>
              <Badge variant="outline" className={cn('text-xs', color)}>
                {label}
              </Badge>
            </div>

            {/* Summary when collapsed */}
            {!isExpanded && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {summaryReason}
                {hasMoreReasons && (
                  <span className="text-xs ml-1 opacity-70">
                    (+{reasons.length - 1} {t('moreReasons')})
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Expand indicator */}
          <div className={cn('shrink-0 transition-transform', color)}>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </div>
        </button>

        {/* Expandable details */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              id="severity-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.2, ease: 'easeInOut' }
              }
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <ul className="space-y-1.5 ml-10">
                  {reasons.map((reason, index) => (
                    <li
                      key={index}
                      className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1.5"
                    >
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
                      <span className="break-words">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default MobileSeverityBanner;
