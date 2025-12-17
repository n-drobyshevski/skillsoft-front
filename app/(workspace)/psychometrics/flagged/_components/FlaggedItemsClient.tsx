'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  FlaggedItemSummary,
  DiscriminationFlag,
  DifficultyFlag,
  ItemValidityStatus,
  UpdateItemStatusRequest,
} from '@/types/psychometrics';
import { psychometricsApi } from '@/services/api';
import {
  ValidityStatusBadge,
  MetricCell,
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
} from 'lucide-react';
import { toast } from 'sonner';

// Severity icon and color mapping
function getSeverityInfo(flag: DiscriminationFlag | null) {
  if (!flag) return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Unknown' };

  switch (flag) {
    case DiscriminationFlag.NEGATIVE:
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Negative' };
    case DiscriminationFlag.CRITICAL:
      return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Critical' };
    case DiscriminationFlag.WARNING:
      return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Warning' };
    default:
      return { icon: AlertCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Normal' };
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
}

function FlaggedItemCard({
  item,
  selectionMode,
  isSelected,
  onToggleSelect,
  onQuickRetire,
  onMarkReviewed,
  isLoading,
}: FlaggedItemCardProps) {
  const severityInfo = getSeverityInfo(item.discriminationFlag);
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
            <Link
              href={`/psychometrics/items/${item.questionId}`}
              className="font-medium hover:underline block line-clamp-2"
              onClick={(e) => selectionMode && e.preventDefault()}
            >
              {item.questionText ?? 'Question text not specified'}
            </Link>
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
                <span className="text-xs text-muted-foreground">Responses:</span>
                <span className="text-sm font-medium">{item.responseCount}</span>
              </div>
            </div>
          </div>

          {/* Actions column */}
          <div className="flex flex-col items-end gap-2 shrink-0">
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
                    <TooltipContent>Quick Retire</TooltipContent>
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
                    <TooltipContent>Mark as Reviewed</TooltipContent>
                  </Tooltip>
                )}

                {/* Details link */}
                <Link href={`/psychometrics/items/${item.questionId}`}>
                  <Button variant="ghost" size="sm" className="gap-1 h-8">
                    <span className="hidden sm:inline">Details</span>
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
}

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
}: SeveritySectionProps) {
  if (items.length === 0) return null;

  const allSelected = items.every((item) => selectedIds.has(item.questionId));
  const someSelected = items.some((item) => selectedIds.has(item.questionId));

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between gap-3 p-3 rounded-lg ${bgColor}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <div>
            <h3 className="font-semibold">{title} ({items.length})</h3>
            <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
          </div>
        </div>

        {selectionMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="shrink-0"
          >
            {allSelected ? (
              <>
                <CheckSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Deselect All</span>
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Select All</span>
              </>
            )}
          </Button>
        )}
      </div>
      <div className="space-y-3 pl-0 sm:pl-4">
        {items.map((item) => (
          <FlaggedItemCard
            key={item.questionId}
            item={item}
            selectionMode={selectionMode}
            isSelected={selectedIds.has(item.questionId)}
            onToggleSelect={onToggleSelect}
            onQuickRetire={onQuickRetire}
            onMarkReviewed={onMarkReviewed}
            isLoading={loadingId === item.questionId}
          />
        ))}
      </div>
    </div>
  );
}

interface FlaggedItemsClientProps {
  initialItems: FlaggedItemSummary[];
}

export function FlaggedItemsClient({ initialItems }: FlaggedItemsClientProps) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [isBatchLoading, setIsBatchLoading] = React.useState(false);

  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggle,
    selectAll,
    clearSelection,
    selectMany,
    deselectMany,
    selectedArray,
  } = useBatchSelection<{ id: string }>();

  const groups = React.useMemo(() => groupBySeverity(items), [items]);

  // Convert FlaggedItemSummary to have 'id' field for batch selection
  const itemsWithId = React.useMemo(
    () => items.map((item) => ({ ...item, id: item.questionId })),
    [items]
  );

  // Handle single item retire
  const handleQuickRetire = async (item: FlaggedItemSummary) => {
    setLoadingId(item.questionId);
    try {
      const request: UpdateItemStatusRequest = {
        newStatus: ItemValidityStatus.RETIRED,
        reason: 'Quick retired due to poor discrimination',
      };
      await psychometricsApi.updateItemStatus(item.questionId, request);
      setItems((prev) => prev.filter((i) => i.questionId !== item.questionId));
      toast.success('Item retired successfully');
    } catch (error) {
      toast.error('Failed to retire item');
      console.error('Error retiring item:', error);
    } finally {
      setLoadingId(null);
    }
  };

  // Handle mark as reviewed (activate)
  const handleMarkReviewed = async (item: FlaggedItemSummary) => {
    setLoadingId(item.questionId);
    try {
      const request: UpdateItemStatusRequest = {
        newStatus: ItemValidityStatus.ACTIVE,
        reason: 'Manually reviewed and approved',
      };
      await psychometricsApi.updateItemStatus(item.questionId, request);
      setItems((prev) => prev.filter((i) => i.questionId !== item.questionId));
      toast.success('Item marked as reviewed');
    } catch (error) {
      toast.error('Failed to update item status');
      console.error('Error updating item:', error);
    } finally {
      setLoadingId(null);
    }
  };

  // Handle batch retire
  const handleBatchRetire = async () => {
    if (selectedCount === 0) return;

    setIsBatchLoading(true);
    try {
      const request: UpdateItemStatusRequest = {
        newStatus: ItemValidityStatus.RETIRED,
        reason: 'Batch retired due to poor psychometric properties',
      };

      // Process in parallel
      await Promise.all(
        selectedArray.map((id) => psychometricsApi.updateItemStatus(id, request))
      );

      setItems((prev) => prev.filter((i) => !selectedIds.has(i.questionId)));
      clearSelection();
      toast.success(`${selectedCount} items retired successfully`);
    } catch (error) {
      toast.error('Failed to retire some items');
      console.error('Error in batch retire:', error);
    } finally {
      setIsBatchLoading(false);
    }
  };

  // Handle batch activate
  const handleBatchActivate = async () => {
    if (selectedCount === 0) return;

    setIsBatchLoading(true);
    try {
      const request: UpdateItemStatusRequest = {
        newStatus: ItemValidityStatus.ACTIVE,
        reason: 'Batch activated after review',
      };

      await Promise.all(
        selectedArray.map((id) => psychometricsApi.updateItemStatus(id, request))
      );

      setItems((prev) => prev.filter((i) => !selectedIds.has(i.questionId)));
      clearSelection();
      toast.success(`${selectedCount} items activated successfully`);
    } catch (error) {
      toast.error('Failed to activate some items');
      console.error('Error in batch activate:', error);
    } finally {
      setIsBatchLoading(false);
    }
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
  const exitSelectionMode = () => {
    setSelectionMode(false);
    clearSelection();
  };

  if (items.length === 0) {
    return <NoFlaggedItems />;
  }

  return (
    <div className="space-y-6">
      {/* Selection mode toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant={selectionMode ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
          className="gap-2"
        >
          {selectionMode ? (
            <>
              <XCircle className="h-4 w-4" />
              Exit Selection Mode
            </>
          ) : (
            <>
              <CheckSquare className="h-4 w-4" />
              Selection Mode
            </>
          )}
        </Button>

        {selectionMode && (
          <div className="text-sm text-muted-foreground">
            {selectedCount} of {items.length} items selected
          </div>
        )}
      </div>

      {/* Grouped Items */}
      <div className="space-y-8">
        <SeveritySection
          title="Negative Discrimination"
          description="Items working in reverse - high performers answer worse"
          items={groups.negative}
          icon={XCircle}
          iconColor="text-red-600"
          bgColor="bg-red-50 dark:bg-red-950/20"
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggle}
          onSelectAll={() => toggleSectionSelection(groups.negative)}
          onQuickRetire={handleQuickRetire}
          onMarkReviewed={handleMarkReviewed}
          loadingId={loadingId ?? undefined}
        />
        <SeveritySection
          title="Critical Discrimination"
          description="Items barely distinguish respondents by competency level"
          items={groups.critical}
          icon={AlertTriangle}
          iconColor="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-950/20"
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggle}
          onSelectAll={() => toggleSectionSelection(groups.critical)}
          onQuickRetire={handleQuickRetire}
          onMarkReviewed={handleMarkReviewed}
          loadingId={loadingId ?? undefined}
        />
        <SeveritySection
          title="Warnings"
          description="Items with weak discrimination requiring observation"
          items={groups.warning}
          icon={AlertCircle}
          iconColor="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/20"
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggle}
          onSelectAll={() => toggleSectionSelection(groups.warning)}
          onQuickRetire={handleQuickRetire}
          onMarkReviewed={handleMarkReviewed}
          loadingId={loadingId ?? undefined}
        />
        {groups.other.length > 0 && (
          <SeveritySection
            title="Other Issues"
            description="Items with other issues (e.g., difficulty only)"
            items={groups.other}
            icon={AlertCircle}
            iconColor="text-gray-600"
            bgColor="bg-gray-50 dark:bg-gray-950/20"
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={toggle}
            onSelectAll={() => toggleSectionSelection(groups.other)}
            onQuickRetire={handleQuickRetire}
            onMarkReviewed={handleMarkReviewed}
            loadingId={loadingId ?? undefined}
          />
        )}
      </div>

      {/* Batch action toolbar */}
      {selectionMode && (
        <PsychometricBatchToolbar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          onRetire={handleBatchRetire}
          onActivate={handleBatchActivate}
          className="z-50"
        />
      )}

      {/* Loading overlay for batch operations */}
      {isBatchLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing batch operation...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlaggedItemsClient;
