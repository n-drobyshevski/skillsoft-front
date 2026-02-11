'use client';

import * as React from 'react';
import Link from 'next/link';
import { UiLink } from '@/components/ui/ui-link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  FlaggedItemSummary,
  DiscriminationFlag,
  ItemValidityStatus,
  UpdateItemStatusRequest,
} from '@/types/psychometrics';
import { psychometricsApi } from '@/services/api';
import {
  ValidityStatusBadge,
  MetricBadge,
  NoFlaggedItems,
  PsychometricBatchToolbar,
  useBatchSelection,
} from '../../_components';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  ArrowRight,
  CheckSquare,
  Square,
  Ban,
  CheckCheck,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  Lightbulb,
  Eye,
  Clock,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  usePsychometricsReviewStore,
  useReviewPhase,
  useIsExecuting,
  useBatchSaga,
  useCanUndo,
  useUndoCountdown,
  useLastUndoAction,
} from '@/store/psychometrics-review-store';
import { useUndoToast } from '@/components/common';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  MobileFlaggedItemCard,
  ConfirmationSheet,
} from '@/components/mobile';

// ============================================================================
// Progressive Disclosure Components
// ============================================================================

interface ReviewSuggestion {
  action: 'RETIRE' | 'FLAG_FOR_REVIEW' | 'MONITOR';
  confidence: number;
  reason: string;
  alternativeReason?: string;
}

// Type for translation function
type TranslationFunction = ReturnType<typeof useTranslations<'psychometrics.flaggedPage'>>;

/**
 * Generate smart review suggestion based on item metrics
 */
function generateSuggestion(item: FlaggedItemSummary, t: TranslationFunction): ReviewSuggestion {
  // Rule 1: Negative discrimination = immediate retire
  if (item.discriminationFlag === DiscriminationFlag.NEGATIVE) {
    return {
      action: 'RETIRE',
      confidence: 0.95,
      reason: t('suggestions.negativeReason'),
    };
  }

  // Rule 2: Critical + extreme difficulty = content issue
  if (
    item.discriminationFlag === DiscriminationFlag.CRITICAL &&
    item.difficultyIndex !== null &&
    (item.difficultyIndex < 0.2 || item.difficultyIndex > 0.9)
  ) {
    return {
      action: 'FLAG_FOR_REVIEW',
      confidence: 0.8,
      reason: t('suggestions.criticalWithDifficultyReason'),
      alternativeReason: t('suggestions.criticalAlternative'),
    };
  }

  // Rule 3: Warning with sufficient responses = monitor
  if (item.discriminationFlag === DiscriminationFlag.WARNING && item.responseCount >= 100) {
    return {
      action: 'MONITOR',
      confidence: 0.7,
      reason: t('suggestions.warningReason'),
    };
  }

  // Default: Flag for review
  return {
    action: 'FLAG_FOR_REVIEW',
    confidence: 0.6,
    reason: t('suggestions.defaultReason'),
  };
}

/**
 * Tier 1: Urgent Action Banner
 * Shown when there are negative discrimination items requiring immediate attention
 */
interface UrgentActionBannerProps {
  negativeCount: number;
  criticalCount: number;
  onRetireAllNegative: () => void;
  onReviewOneByOne: () => void;
  isLoading?: boolean;
  t: TranslationFunction;
}

function UrgentActionBanner({
  negativeCount,
  criticalCount,
  onRetireAllNegative,
  onReviewOneByOne,
  isLoading,
  t,
}: UrgentActionBannerProps) {
  if (negativeCount === 0 && criticalCount === 0) return null;

  const urgentCount = negativeCount + criticalCount;
  const hasNegative = negativeCount > 0;

  return (
    <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
              <Zap className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                {t('urgent.title', { count: urgentCount })}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {hasNegative && (
                  <span className="font-medium">{t('urgent.negativeCount', { count: negativeCount })}</span>
                )}
                {hasNegative && criticalCount > 0 && ' • '}
                {criticalCount > 0 && (
                  <span>{t('urgent.criticalCount', { count: criticalCount })}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasNegative && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onRetireAllNegative}
                disabled={isLoading}
                className="flex-1 sm:flex-initial"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                {t('urgent.retireAllNegative')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onReviewOneByOne}
              className="flex-1 sm:flex-initial"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('urgent.reviewOneByOne')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Smart Suggestion Badge Component
 */
function SuggestionBadge({ suggestion, t }: { suggestion: ReviewSuggestion; t: TranslationFunction }) {
  const config = {
    RETIRE: { icon: Ban, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', labelKey: 'suggestions.retire' as const },
    FLAG_FOR_REVIEW: { icon: Eye, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', labelKey: 'suggestions.review' as const },
    MONITOR: { icon: Clock, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', labelKey: 'suggestions.monitor' as const },
  };

  const { icon: Icon, color, labelKey } = config[suggestion.action];
  const label = t(labelKey);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={cn('gap-1 cursor-help', color)}>
          <Icon className="h-3 w-3" />
          <span className="text-xs">{label}</span>
          <span className="text-xs opacity-70">({Math.round(suggestion.confidence * 100)}%)</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            {t('suggestions.suggestionLabel')}: {label}
          </p>
          <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
          {suggestion.alternativeReason && (
            <p className="text-xs text-muted-foreground italic">
              {t('suggestions.alternativeLabel')}: {suggestion.alternativeReason}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Severity icon and color mapping
function getSeverityInfo(flag: DiscriminationFlag | null, t: TranslationFunction) {
  if (!flag) return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: t('stats.unknown' as Parameters<typeof t>[0]) };

  switch (flag) {
    case DiscriminationFlag.NEGATIVE:
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: t('stats.negative') };
    case DiscriminationFlag.CRITICAL:
      return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: t('stats.critical') };
    case DiscriminationFlag.WARNING:
      return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: t('stats.warnings') };
    default:
      return { icon: AlertCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: t('stats.normal' as Parameters<typeof t>[0]) };
  }
}

// Group items by severity
function groupBySeverity(items: FlaggedItemSummary[]) {
  const groups: Record<string, FlaggedItemSummary[]> = {
    negative: [],
    critical: [],
    warning: [],
    other: [],
  };

  items.forEach((item) => {
    switch (item.discriminationFlag) {
      case DiscriminationFlag.NEGATIVE:
        groups.negative.push(item);
        break;
      case DiscriminationFlag.CRITICAL:
        groups.critical.push(item);
        break;
      case DiscriminationFlag.WARNING:
        groups.warning.push(item);
        break;
      default:
        groups.other.push(item);
    }
  });

  return groups;
}

interface FlaggedItemCardProps {
  item: FlaggedItemSummary;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onQuickRetire: (item: FlaggedItemSummary) => void;
  onMarkReviewed: (item: FlaggedItemSummary) => void;
  isLoading?: boolean;
  t: TranslationFunction;
}

function FlaggedItemCard({
  item,
  selectionMode,
  isSelected,
  onToggleSelect,
  onQuickRetire,
  onMarkReviewed,
  isLoading,
  t,
}: FlaggedItemCardProps) {
  const severityInfo = getSeverityInfo(item.discriminationFlag, t);
  const SeverityIcon = severityInfo.icon;
  const canQuickRetire = item.discriminationFlag === DiscriminationFlag.NEGATIVE ||
    item.discriminationFlag === DiscriminationFlag.CRITICAL;

  return (
    <Card
      className={cn(
        'border-l-4 transition-all duration-200',
        item.discriminationFlag === DiscriminationFlag.NEGATIVE ? 'border-l-red-500' :
          item.discriminationFlag === DiscriminationFlag.CRITICAL ? 'border-l-orange-500' :
            'border-l-amber-500',
        selectionMode && 'hover:bg-muted/50 cursor-pointer',
        isSelected && 'ring-2 ring-primary bg-primary/5'
      )}
      onClick={selectionMode ? () => onToggleSelect(item.questionId) : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Selection checkbox */}
          {selectionMode && (
            <div className="pt-1 shrink-0">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(item.questionId)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Severity icon */}
          <div className={`p-2 rounded-lg ${severityInfo.bg} shrink-0`}>
            <SeverityIcon className={`h-5 w-5 ${severityInfo.color}`} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <UiLink
              href={`/psychometrics/items/${item.questionId}`}
              variant="primary"
              className="block line-clamp-2"
              onClick={(e) => selectionMode && e.preventDefault()}
            >
              {item.questionText ?? t('card.questionNotSpecified')}
            </UiLink>
            <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
              <span className="truncate max-w-[200px]">{item.competencyName}</span>
              {item.indicatorTitle && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span className="truncate max-w-[200px] hidden sm:inline">{item.indicatorTitle}</span>
                </>
              )}
            </div>

            {/* Metrics row using MetricCell */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">p:</span>
                <MetricBadge
                  value={item.difficultyIndex}
                  type="difficulty"
                  size="sm"
                />
              </div>

              {/* Discrimination */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">rpb:</span>
                <MetricBadge
                  value={item.discriminationIndex}
                  type="discrimination"
                  size="sm"
                />
              </div>

              {/* Response count */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{t('card.responses')}:</span>
                <span className="text-sm font-medium">{item.responseCount}</span>
              </div>
            </div>
          </div>

          {/* Actions column */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Smart Suggestion Badge */}
            <SuggestionBadge suggestion={generateSuggestion(item, t)} t={t} />

            <ValidityStatusBadge status={item.validityStatus} />

            {!selectionMode && (
              <div className="flex items-center gap-1">
                {/* Quick retire for critical items */}
                {canQuickRetire && item.validityStatus !== ItemValidityStatus.RETIRED && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickRetire(item);
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('card.quickRetire')}</TooltipContent>
                  </Tooltip>
                )}

                {/* Mark as reviewed */}
                {item.validityStatus === ItemValidityStatus.FLAGGED_FOR_REVIEW && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkReviewed(item);
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCheck className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('card.markAsReviewed')}</TooltipContent>
                  </Tooltip>
                )}

                {/* Details link */}
                <Link href={`/psychometrics/items/${item.questionId}`}>
                  <Button variant="ghost" size="sm" className="gap-1 h-8">
                    <span className="hidden sm:inline">{t('card.details')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SeveritySectionProps {
  title: string;
  description: string;
  items: FlaggedItemSummary[];
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onQuickRetire: (item: FlaggedItemSummary) => void;
  onMarkReviewed: (item: FlaggedItemSummary) => void;
  loadingId?: string;
  defaultOpen?: boolean;
  t: TranslationFunction;
}

/**
 * Tier 2: Collapsible Severity Section
 * Progressive disclosure - sections can be expanded/collapsed
 * Uses MobileFlaggedItemCard on mobile for swipe gestures
 */
function SeveritySection({
  title,
  description,
  items,
  icon: Icon,
  iconColor,
  bgColor,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onQuickRetire,
  onMarkReviewed,
  loadingId,
  defaultOpen = false,
  t,
}: SeveritySectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const isMobile = useIsMobile();

  if (items.length === 0) return null;

  const allSelected = items.every((item) => selectedIds.has(item.questionId));
  const selectedInSection = items.filter((item) => selectedIds.has(item.questionId)).length;

  // Calculate summary stats for collapsed view
  const avgDifficulty = items.reduce((sum, i) => sum + (i.difficultyIndex ?? 0), 0) / items.length;
  const avgDiscrimination = items.reduce((sum, i) => sum + (i.discriminationIndex ?? 0), 0) / items.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-colors',
            bgColor,
            'hover:opacity-90'
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Expand/Collapse indicator */}
            {isOpen ? (
              <ChevronDown className={`h-4 w-4 ${iconColor} shrink-0`} />
            ) : (
              <ChevronRight className={`h-4 w-4 ${iconColor} shrink-0`} />
            )}
            <Icon className={`h-5 w-5 ${iconColor} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
                {selectedInSection > 0 && selectionMode && (
                  <Badge variant="outline" className="text-xs">
                    {t('selection.selected', { count: selectedInSection })}
                  </Badge>
                )}
              </div>
              {/* Collapsed summary - show when collapsed */}
              {!isOpen && (
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {t('sections.avgP')}: {avgDifficulty.toFixed(2)} • {t('sections.avgRpb')}: {avgDiscrimination.toFixed(2)}
                </p>
              )}
              {/* Full description - show when expanded */}
              {isOpen && (
                <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
              )}
            </div>
          </div>

          {selectionMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAll();
              }}
              className="shrink-0"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t('selection.deselectAll')}</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t('selection.selectAll')}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pl-0 sm:pl-4">
        {items.map((item) => (
          isMobile ? (
            <MobileFlaggedItemCard
              key={item.questionId}
              item={item}
              selectionMode={selectionMode}
              isSelected={selectedIds.has(item.questionId)}
              onSelect={() => onToggleSelect(item.questionId)}
              onRetire={() => onQuickRetire(item)}
              onApprove={() => onMarkReviewed(item)}
              isLoading={loadingId === item.questionId}
            />
          ) : (
            <FlaggedItemCard
              key={item.questionId}
              item={item}
              selectionMode={selectionMode}
              isSelected={selectedIds.has(item.questionId)}
              onToggleSelect={onToggleSelect}
              onQuickRetire={onQuickRetire}
              onMarkReviewed={onMarkReviewed}
              isLoading={loadingId === item.questionId}
              t={t}
            />
          )
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface FlaggedItemsClientProps {
  initialItems: FlaggedItemSummary[];
}

/**
 * Batch Operation Progress Overlay
 */
function BatchOperationOverlay({ t }: { t: TranslationFunction }) {
  const saga = useBatchSaga();
  const isExecuting = useIsExecuting();

  if (!isExecuting || !saga) return null;

  const progress = saga.totalItems > 0
    ? Math.round((saga.completedItems / saga.totalItems) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border max-w-sm w-full mx-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('batch.processing')}</span>
            <span className="font-medium">{saga.completedItems}/{saga.totalItems}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {saga.failedItems.length > 0 && (
          <p className="text-sm text-amber-600">
            {t('batch.itemsFailed', { count: saga.failedItems.length })}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Undo Banner Component
 */
function UndoBanner({ t }: { t: TranslationFunction }) {
  const canUndo = useCanUndo();
  const countdown = useUndoCountdown();
  const lastAction = useLastUndoAction();
  const { undo } = usePsychometricsReviewStore();
  const [isUndoing, setIsUndoing] = React.useState(false);

  if (!canUndo || !lastAction) return null;

  const handleUndo = async () => {
    setIsUndoing(true);
    const success = await undo();
    setIsUndoing(false);

    if (success) {
      toast.success(t('undo.undoSuccess'));
    } else {
      toast.error(t('undo.undoFailed'));
    }
  };

  const itemCount = lastAction.itemIds.length;
  const isRetired = lastAction.newStatus === ItemValidityStatus.RETIRED;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border bg-slate-900 dark:bg-slate-800 text-white min-w-[300px]">
        {/* Countdown ring */}
        <div className="relative h-10 w-10 flex-shrink-0">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-slate-700"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${(countdown / 30) * 100}, 100`}
              strokeLinecap="round"
              className="text-amber-400 transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {countdown}
          </span>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {isRetired
              ? t('undo.itemsRetired', { count: itemCount })
              : t('undo.itemsUpdated', { count: itemCount })
            }
          </p>
        </div>

        {/* Undo button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={isUndoing}
          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 gap-1.5 font-semibold"
        >
          {isUndoing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Undo2 className="h-4 w-4" />
          )}
          {t('undo.undoButton')}
        </Button>
      </div>
    </div>
  );
}

export function FlaggedItemsClient({ initialItems }: FlaggedItemsClientProps) {
  const router = useRouter();
  const t = useTranslations('psychometrics.flaggedPage');

  // Store state and actions
  const {
    items,
    setItems,
    selectedIds,
    toggleSelection,
    selectMany,
    deselectMany,
    clearSelection,
    enterSelectMode,
    exitSelectMode,
    setLoadingItem,
    loadingItemId,
    removeItems,
    executeBatchStatusChange,
    generateSuggestions,
  } = usePsychometricsReviewStore();

  const phase = useReviewPhase();
  const isExecuting = useIsExecuting();
  const selectionMode = phase === 'SELECT' || phase === 'EXECUTING';

  // Initialize store with items on mount
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  // Use local items state synced from store
  const displayItems = items.length > 0 ? items : initialItems;
  const groups = React.useMemo(() => groupBySeverity(displayItems), [displayItems]);
  const selectedCount = selectedIds.size;

  // Handler for "Retire All Negative" quick action using store
  const handleRetireAllNegative = async () => {
    if (groups.negative.length === 0) return;

    const negativeIds = groups.negative.map((item) => item.questionId);
    selectMany(negativeIds);
    await executeBatchStatusChange(
      ItemValidityStatus.RETIRED,
      'Quick retired due to negative discrimination'
    );
    toast.success(t('batch.retiredSuccess', { count: groups.negative.length }));
  };

  // Handler for "Review One by One" - navigate to first urgent item
  const handleReviewOneByOne = () => {
    const firstUrgent = groups.negative[0] ?? groups.critical[0];
    if (firstUrgent) {
      router.push(`/psychometrics/items/${firstUrgent.questionId}`);
    }
  };

  // Handle single item retire
  const handleQuickRetire = async (item: FlaggedItemSummary) => {
    setLoadingItem(item.questionId);
    try {
      const request: UpdateItemStatusRequest = {
        newStatus: ItemValidityStatus.RETIRED,
        reason: 'Quick retired due to poor discrimination',
      };
      await psychometricsApi.updateItemStatus(item.questionId, request);
      removeItems([item.questionId]);
      toast.success(t('batch.itemRetired'));
    } catch (error) {
      toast.error(t('batch.retireFailed'));
      console.error('Error retiring item:', error);
    } finally {
      setLoadingItem(null);
    }
  };

  // Handle mark as reviewed (activate)
  const handleMarkReviewed = async (item: FlaggedItemSummary) => {
    setLoadingItem(item.questionId);
    try {
      const request: UpdateItemStatusRequest = {
        newStatus: ItemValidityStatus.ACTIVE,
        reason: 'Manually reviewed and approved',
      };
      await psychometricsApi.updateItemStatus(item.questionId, request);
      removeItems([item.questionId]);
      toast.success(t('batch.itemReviewed'));
    } catch (error) {
      toast.error(t('batch.updateFailed'));
      console.error('Error updating item:', error);
    } finally {
      setLoadingItem(null);
    }
  };

  // Handle batch retire using store saga
  const handleBatchRetire = async () => {
    if (selectedCount === 0) return;

    await executeBatchStatusChange(
      ItemValidityStatus.RETIRED,
      'Batch retired due to poor psychometric properties'
    );
    toast.success(t('batch.retiredSuccessBatch', { count: selectedCount }));
  };

  // Handle batch activate using store saga
  const handleBatchActivate = async () => {
    if (selectedCount === 0) return;

    await executeBatchStatusChange(
      ItemValidityStatus.ACTIVE,
      'Batch activated after review'
    );
    toast.success(t('batch.activatedSuccess', { count: selectedCount }));
  };

  // Toggle selection for a section
  const toggleSectionSelection = (sectionItems: FlaggedItemSummary[]) => {
    const sectionIds = sectionItems.map((i) => i.questionId);
    const allSelected = sectionIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      deselectMany(sectionIds);
    } else {
      selectMany(sectionIds);
    }
  };

  // Exit selection mode and clear selection
  const handleExitSelectionMode = () => {
    exitSelectMode();
  };

  // Enter selection mode
  const handleEnterSelectionMode = () => {
    enterSelectMode();
  };

  if (displayItems.length === 0) {
    return <NoFlaggedItems />;
  }

  return (
    <div className="space-y-6">
      {/* Tier 1: Urgent Action Banner */}
      <UrgentActionBanner
        negativeCount={groups.negative.length}
        criticalCount={groups.critical.length}
        onRetireAllNegative={handleRetireAllNegative}
        onReviewOneByOne={handleReviewOneByOne}
        isLoading={isExecuting}
        t={t}
      />

      {/* Selection mode toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant={selectionMode ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => selectionMode ? handleExitSelectionMode() : handleEnterSelectionMode()}
          className="gap-2"
          disabled={isExecuting}
        >
          {selectionMode ? (
            <>
              <XCircle className="h-4 w-4" />
              {t('selection.exitSelectionMode')}
            </>
          ) : (
            <>
              <CheckSquare className="h-4 w-4" />
              {t('selection.selectionMode')}
            </>
          )}
        </Button>

        {selectionMode && (
          <div className="text-sm text-muted-foreground">
            {t('selection.selectedCount', { selected: selectedCount, total: displayItems.length })}
          </div>
        )}
      </div>

      {/* Tier 2: Collapsible Grouped Items */}
      <div className="space-y-4">
        <SeveritySection
          title={t('sections.negativeDiscrimination')}
          description={t('sections.negativeDescription')}
          items={groups.negative}
          icon={XCircle}
          iconColor="text-red-600"
          bgColor="bg-red-50 dark:bg-red-950/20"
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onSelectAll={() => toggleSectionSelection(groups.negative)}
          onQuickRetire={handleQuickRetire}
          onMarkReviewed={handleMarkReviewed}
          loadingId={loadingItemId ?? undefined}
          defaultOpen={groups.negative.length > 0}
          t={t}
        />
        <SeveritySection
          title={t('sections.criticalDiscrimination')}
          description={t('sections.criticalDescription')}
          items={groups.critical}
          icon={AlertTriangle}
          iconColor="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-950/20"
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onSelectAll={() => toggleSectionSelection(groups.critical)}
          onQuickRetire={handleQuickRetire}
          onMarkReviewed={handleMarkReviewed}
          loadingId={loadingItemId ?? undefined}
          defaultOpen={groups.negative.length === 0 && groups.critical.length > 0}
          t={t}
        />
        <SeveritySection
          title={t('sections.warnings')}
          description={t('sections.warningsDescription')}
          items={groups.warning}
          icon={AlertCircle}
          iconColor="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/20"
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onSelectAll={() => toggleSectionSelection(groups.warning)}
          onQuickRetire={handleQuickRetire}
          onMarkReviewed={handleMarkReviewed}
          loadingId={loadingItemId ?? undefined}
          defaultOpen={false}
          t={t}
        />
        {groups.other.length > 0 && (
          <SeveritySection
            title={t('sections.otherIssues')}
            description={t('sections.otherDescription')}
            items={groups.other}
            icon={AlertCircle}
            iconColor="text-gray-600"
            bgColor="bg-gray-50 dark:bg-gray-950/20"
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelection}
            onSelectAll={() => toggleSectionSelection(groups.other)}
            onQuickRetire={handleQuickRetire}
            onMarkReviewed={handleMarkReviewed}
            loadingId={loadingItemId ?? undefined}
            defaultOpen={false}
            t={t}
          />
        )}
      </div>

      {/* Batch action toolbar */}
      {selectionMode && !isExecuting && (
        <PsychometricBatchToolbar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          onRetire={handleBatchRetire}
          onActivate={handleBatchActivate}
          className="z-50"
        />
      )}

      {/* Batch operation progress overlay */}
      <BatchOperationOverlay t={t} />

      {/* Undo banner */}
      <UndoBanner t={t} />
    </div>
  );
}

export default FlaggedItemsClient;
