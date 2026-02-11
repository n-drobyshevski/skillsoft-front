'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  ArrowRight,
  Ban,
  CheckCheck,
  Eye,
  Clock,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FlaggedItemSummary,
  DiscriminationFlag,
  ItemValidityStatus,
} from '@/types/psychometrics';
import { PsychometricSwipeCard } from './SwipeableCard';
import { ConfirmationSheet } from './BottomSheet';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * MobileFlaggedItemCard
 *
 * A mobile-optimized card for displaying flagged psychometric items.
 * Features:
 * - Swipe gestures for quick actions
 * - Compact layout for small screens
 * - Touch-friendly interaction targets
 * - Smart suggestion badges
 * - Collapsible details
 */

export interface MobileFlaggedItemCardProps {
  item: FlaggedItemSummary;
  isSelected?: boolean;
  selectionMode?: boolean;
  onSelect?: () => void;
  onRetire?: () => void;
  onApprove?: () => void;
  onFlagForReview?: () => void;
  isLoading?: boolean;
  className?: string;
}

// Suggestion types based on discrimination flags
type SuggestionAction = 'RETIRE' | 'FLAG_FOR_REVIEW' | 'MONITOR';

interface Suggestion {
  action: SuggestionAction;
  confidence: number;
  reason: string;
}

// Generate suggestion based on item metrics
function generateSuggestion(item: FlaggedItemSummary): Suggestion {
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    return {
      action: 'RETIRE',
      confidence: 0.95,
      reason: 'Negative discrimination',
    };
  }

  if (
    item.discriminationFlag === DiscriminationFlag.CRITICAL &&
    item.difficultyIndex !== null &&
    (item.difficultyIndex < 0.2 || item.difficultyIndex > 0.9)
  ) {
    return {
      action: 'FLAG_FOR_REVIEW',
      confidence: 0.8,
      reason: 'Critical with extreme difficulty',
    };
  }

  if (item.discriminationFlag === DiscriminationFlag.WARNING && item.responseCount >= 100) {
    return {
      action: 'MONITOR',
      confidence: 0.7,
      reason: 'May improve with more data',
    };
  }

  return {
    action: 'FLAG_FOR_REVIEW',
    confidence: 0.6,
    reason: 'Requires manual review',
  };
}

// Get severity info
function getSeverityInfo(flag: DiscriminationFlag | null) {
  if (!flag) {
    return { icon: AlertCircle, color: 'text-gray-500', label: 'Unknown' };
  }

  switch (flag) {
    case DiscriminationFlag.NEGATIVE:
      return { icon: XCircle, color: 'text-red-600', label: 'Negative' };
    case DiscriminationFlag.CRITICAL:
      return { icon: AlertTriangle, color: 'text-orange-600', label: 'Critical' };
    case DiscriminationFlag.WARNING:
      return { icon: AlertCircle, color: 'text-amber-600', label: 'Warning' };
    default:
      return { icon: AlertCircle, color: 'text-emerald-600', label: 'Normal' };
  }
}

// Suggestion badge config
const suggestionConfig = {
  RETIRE: {
    icon: Ban,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    label: 'Retire',
  },
  FLAG_FOR_REVIEW: {
    icon: Eye,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    label: 'Review',
  },
  MONITOR: {
    icon: Clock,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    label: 'Monitor',
  },
};

export function MobileFlaggedItemCard({
  item,
  isSelected,
  selectionMode,
  onSelect,
  onRetire,
  onApprove,
  onFlagForReview,
  isLoading,
  className,
}: MobileFlaggedItemCardProps) {
  const isMobile = useIsMobile();
  const [showConfirmSheet, setShowConfirmSheet] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<'retire' | 'approve' | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const severityInfo = getSeverityInfo(item.discriminationFlag);
  const SeverityIcon = severityInfo.icon;
  const suggestion = generateSuggestion(item);
  const SuggestionIcon = suggestionConfig[suggestion.action].icon;

  const isNegative = item.discriminationFlag === DiscriminationFlag.NEGATIVE;
  const isCritical = item.discriminationFlag === DiscriminationFlag.CRITICAL;

  // Handle swipe action with confirmation
  const handleRetireSwipe = () => {
    if (isMobile) {
      setPendingAction('retire');
      setShowConfirmSheet(true);
    } else {
      onRetire?.();
    }
  };

  const handleApproveSwipe = () => {
    if (isMobile) {
      setPendingAction('approve');
      setShowConfirmSheet(true);
    } else {
      onApprove?.();
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction === 'retire') {
      onRetire?.();
    } else if (pendingAction === 'approve') {
      onApprove?.();
    }
    setShowConfirmSheet(false);
    setPendingAction(null);
  };

  // Card content
  const cardContent = (
    <div className="p-3 sm:p-4">
      <div className="flex items-start gap-3">
        {/* Selection checkbox (when in selection mode) */}
        {selectionMode && (
          <div className="pt-0.5 shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect?.()}
              className="h-5 w-5"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Severity icon */}
        <div className={cn(
          'p-2 rounded-lg shrink-0',
          isNegative ? 'bg-red-100 dark:bg-red-900/30' :
          isCritical ? 'bg-orange-100 dark:bg-orange-900/30' :
          'bg-amber-100 dark:bg-amber-900/30'
        )}>
          <SeverityIcon className={cn('h-4 w-4 sm:h-5 sm:w-5', severityInfo.color)} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Question text */}
          <p className="text-sm font-medium line-clamp-2 leading-snug">
            {item.questionText ?? 'Question text not specified'}
          </p>

          {/* Competency */}
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {item.competencyName}
          </p>

          {/* Metrics row - compact */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {/* Difficulty */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">p:</span>
              <span className={cn(
                'font-medium',
                item.difficultyIndex !== null && item.difficultyIndex < 0.2 && 'text-red-600',
                item.difficultyIndex !== null && item.difficultyIndex > 0.9 && 'text-amber-600'
              )}>
                {item.difficultyIndex?.toFixed(2) ?? '—'}
              </span>
            </div>

            {/* Discrimination */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">rpb:</span>
              <span className={cn(
                'font-medium',
                item.discriminationIndex !== null && item.discriminationIndex < 0 && 'text-red-600',
                item.discriminationIndex !== null && item.discriminationIndex < 0.1 && 'text-orange-600'
              )}>
                {item.discriminationIndex?.toFixed(2) ?? '—'}
              </span>
            </div>

            {/* Response count */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">n:</span>
              <span className="font-medium">{item.responseCount}</span>
            </div>
          </div>
        </div>

        {/* Right side - suggestion badge and arrow */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Suggestion badge */}
          <Badge
            variant="outline"
            className={cn(
              'gap-1 text-xs px-2 py-0.5',
              suggestionConfig[suggestion.action].color
            )}
          >
            <SuggestionIcon className="h-3 w-3" />
            {suggestionConfig[suggestion.action].label}
          </Badge>

          {/* Expand/Details indicator (only when not in selection mode) */}
          {!selectionMode && (
            <Link
              href={`/psychometrics/items/${item.questionId}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Expandable details (tap to expand on mobile) */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-3 pt-3 border-t"
        >
          {/* Suggestion reason */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
            <p>{suggestion.reason}</p>
          </div>

          {/* Indicator title if available */}
          {item.indicatorTitle && (
            <p className="text-xs text-muted-foreground mt-2">
              Indicator: {item.indicatorTitle}
            </p>
          )}

          {/* Quick actions for mobile */}
          {!selectionMode && (
            <div className="flex items-center gap-2 mt-3">
              {(isNegative || isCritical) && item.validityStatus !== ItemValidityStatus.RETIRED && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRetireSwipe();
                  }}
                  disabled={isLoading}
                >
                  <Ban className="h-3.5 w-3.5 mr-1.5" />
                  Retire
                </Button>
              )}

              {item.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveSwipe();
                  }}
                  disabled={isLoading}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Approve
                </Button>
              )}

              <Link
                href={`/psychometrics/items/${item.questionId}`}
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Details
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );

  // Wrap with swipeable card on mobile
  if (isMobile && !selectionMode) {
    return (
      <>
        <PsychometricSwipeCard
          onRetire={handleRetireSwipe}
          onApprove={handleApproveSwipe}
          onSelect={onSelect}
          isSelected={isSelected}
          isNegative={isNegative}
          isCritical={isCritical}
          className={className}
          disabled={isLoading}
        >
          <div onClick={() => setIsExpanded(!isExpanded)}>
            {cardContent}
          </div>
        </PsychometricSwipeCard>

        {/* Confirmation sheet for mobile */}
        <ConfirmationSheet
          isOpen={showConfirmSheet}
          onClose={() => {
            setShowConfirmSheet(false);
            setPendingAction(null);
          }}
          onConfirm={handleConfirmAction}
          title={pendingAction === 'retire' ? 'Retire Item?' : 'Approve Item?'}
          description={
            pendingAction === 'retire'
              ? 'This will remove the item from active use.'
              : 'This will mark the item as reviewed and active.'
          }
          confirmLabel={pendingAction === 'retire' ? 'Retire' : 'Approve'}
          confirmVariant={pendingAction === 'retire' ? 'destructive' : 'default'}
          isLoading={isLoading}
        />
      </>
    );
  }

  // Desktop/tablet card without swipe
  return (
    <div
      className={cn(
        'bg-card border rounded-lg',
        isNegative ? 'border-l-4 border-l-red-500' :
        isCritical ? 'border-l-4 border-l-orange-500' :
        'border-l-4 border-l-amber-500',
        isSelected && 'ring-2 ring-primary bg-primary/5',
        selectionMode && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      onClick={selectionMode ? onSelect : undefined}
    >
      {cardContent}
    </div>
  );
}

export default MobileFlaggedItemCard;
