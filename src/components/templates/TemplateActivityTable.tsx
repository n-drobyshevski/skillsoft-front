'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Users, RefreshCw, GitCompareArrows, Trash2 } from 'lucide-react';
import { activityApi } from '@/services/api';
import {
  ActivityTable,
  ActivityCardList,
  ActivityPagination,
  ActivityFilterPills,
  useActivityFilters,
  getDateRangeBounds,
} from './activity';
import { DeleteConfirmationDialog } from '@/components/feedback/DeleteConfirmationDialog';
import {
  deleteTestSession,
  bulkDeleteTestSessions,
} from '@/actions/session-delete';
import type { ActivityPage, ActivityFilterParams, TestActivity, UserResultSummary } from '@/types/activity';
import type { AssessmentGoal } from '@/types/domain';
import { createLogger } from '@/lib/logger';

/**
 * Groups activities by user, keeping only the latest attempt per user.
 * @param activities - Raw activity list from API
 * @returns Array of UserResultSummary sorted by latest activity date
 */
function groupByLatestUserAttempt(activities: TestActivity[]): UserResultSummary[] {
  const userMap = new Map<string, { latest: TestActivity; count: number }>();

  for (const activity of activities) {
    const existing = userMap.get(activity.clerkUserId);
    if (!existing || new Date(activity.occurredAt) > new Date(existing.latest.occurredAt)) {
      userMap.set(activity.clerkUserId, {
        latest: activity,
        count: (existing?.count || 0) + 1,
      });
    } else {
      existing.count++;
    }
  }

  return Array.from(userMap.values())
    .map(({ latest, count }) => ({
      clerkUserId: latest.clerkUserId,
      userName: latest.userName,
      userImageUrl: latest.userImageUrl,
      latestSession: {
        sessionId: latest.sessionId,
        eventType: latest.eventType,
        occurredAt: latest.occurredAt,
        score: latest.score,
        passed: latest.passed,
        timeSpentSeconds: latest.timeSpentSeconds,
      },
      totalAttempts: count,
    }))
    .sort((a, b) =>
      new Date(b.latestSession.occurredAt).getTime() -
      new Date(a.latestSession.occurredAt).getTime()
    );
}

const log = createLogger('TemplateActivityTable');

const MAX_COMPARE_SELECTIONS = 5;

export interface TemplateActivityTableProps {
  templateId: string;
  templateGoal?: AssessmentGoal;
  className?: string;
  /** Whether the current user is admin */
  isAdmin?: boolean;
}

/**
 * TemplateActivityTable - Paginated activity table/list for a template.
 *
 * Features:
 * - Mobile-first design with QuickFilterPills
 * - Desktop: Table view with Select dropdowns
 * - Mobile: Card list view with horizontal scroll filters
 * - URL-synced filters (status, passed, dateRange)
 * - Pagination with sticky mobile support
 * - Admin: bulk delete with confirmation dialog
 */
export function TemplateActivityTable({
  templateId,
  templateGoal,
  className,
  isAdmin,
}: TemplateActivityTableProps) {
  const t = useTranslations('activity');
  const tTable = useTranslations('activity.table');
  const tCompare = useTranslations('results.comparison');
  const tDelete = useTranslations('template');
  const isMobile = useIsMobile();
  const router = useRouter();

  const isTeamFit = templateGoal === 'TEAM_FIT';

  // Filter state from URL
  const {
    filters,
    setStatus,
    setPassed,
    setDateRange,
    setPage,
    hasActiveFilters,
    resetFilters,
  } = useActivityFilters();

  // Data state
  const [data, setData] = useState<ActivityPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compare selection state (TEAM_FIT only)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Admin delete state (separate from TEAM_FIT comparison)
  const [adminSelectedIds, setAdminSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'single'; sessionId: string; entityName: string }
    | { type: 'bulk' }
    | null
  >(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleCheckboxChange = (sessionId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= MAX_COMPARE_SELECTIONS) {
          toast.warning(tCompare('maxSelections'));
          return prev;
        }
        next.add(sessionId);
      } else {
        next.delete(sessionId);
      }
      return next;
    });
  };

  const handleCompare = () => {
    const ids = Array.from(selectedIds).join(',');
    router.push(`/test-templates/compare?templateId=${templateId}&sessionIds=${ids}`);
  };

  const handleAdminCheckboxChange = (sessionId: string, checked: boolean) => {
    setAdminSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(sessionId);
      else next.delete(sessionId);
      return next;
    });
  };

  const handleAdminSelectAll = () => {
    if (!data) return;
    const grouped = groupByLatestUserAttempt(data.content);
    const allIds = grouped.map((r) => r.latestSession.sessionId);
    if (adminSelectedIds.size === allIds.length) {
      setAdminSelectedIds(new Set());
    } else {
      setAdminSelectedIds(new Set(allIds));
    }
  };

  const handleDeleteSingle = (sessionId: string, userName: string) => {
    setDeleteTarget({ type: 'single', sessionId, entityName: userName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteBulk = () => {
    setDeleteTarget({ type: 'bulk' });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    startDeleteTransition(async () => {
      if (deleteTarget.type === 'single') {
        const result = await deleteTestSession(deleteTarget.sessionId, templateId);
        if (result.success) {
          toast.success(tDelete('sessionDelete.sessionDeleted'), {
            description: tDelete('sessionDelete.sessionDeletedDescription'),
          });
          setAdminSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(deleteTarget.sessionId);
            return next;
          });
          fetchData();
        } else {
          toast.error(tDelete('sessionDelete.deleteError'), {
            description: tDelete('sessionDelete.deleteErrorDescription'),
          });
        }
      } else {
        const ids = Array.from(adminSelectedIds);
        const result = await bulkDeleteTestSessions(ids, templateId);
        if (result.success) {
          toast.success(
            tDelete('sessionDelete.sessionsDeleted', { count: result.deleted ?? ids.length }),
            {
              description: tDelete('sessionDelete.sessionsDeletedDescription', {
                deleted: result.deleted ?? ids.length,
              }),
            }
          );
          setAdminSelectedIds(new Set());
          fetchData();
        } else {
          toast.error(tDelete('sessionDelete.deleteError'), {
            description: tDelete('sessionDelete.bulkDeleteErrorDescription'),
          });
        }
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    });
  };

  const pageSize = 10;

  // Fetch data based on filters
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: ActivityFilterParams = {
        page: filters.page,
        size: pageSize,
      };

      // Apply status filter
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      // Apply passed filter
      if (filters.passed !== 'all') {
        params.passed = filters.passed === 'true';
      }

      // Apply date range filter
      const { from, to } = getDateRangeBounds(filters.dateRange);
      if (from) params.from = from;
      if (to) params.to = to;

      const result = await activityApi.getTemplateActivity(templateId, params);
      setData(result);
    } catch (err) {
      log.error('Failed to fetch template activity', { templateId, error: err });
      setError(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and filter changes

  useEffect(() => {
    fetchData();
  }, [templateId, filters]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">{tTable('title')}</CardTitle>
          </div>

        </div>

        {/* Filters */}
        <ActivityFilterPills
          statusValue={filters.status}
          onStatusChange={setStatus}
          passedValue={filters.passed}
          onPassedChange={setPassed}
          dateRangeValue={filters.dateRange}
          onDateRangeChange={setDateRange}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          className="mt-3"
        />
      </CardHeader>

      {/* Admin Bulk Delete Toolbar */}
      {isAdmin && adminSelectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-t">
          <span className="text-sm text-muted-foreground">
            {tDelete('sessionDelete.selected', { count: adminSelectedIds.size })}
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={handleDeleteBulk}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {tDelete('sessionDelete.deleteSelected', { count: adminSelectedIds.size })}
          </Button>
        </div>
      )}

      <CardContent className="pt-0">
        {loading ? (
          <ActivityTableSkeleton isMobile={isMobile} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} t={t} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState t={tTable} />
        ) : (
          <GroupedActivityView
            data={data}
            filters={filters}
            pageSize={pageSize}
            setPage={setPage}
            isTeamFit={isTeamFit}
            selectedIds={selectedIds}
            onCheckboxChange={handleCheckboxChange}
            isAdmin={isAdmin}
            adminSelectedIds={adminSelectedIds}
            onAdminCheckboxChange={handleAdminCheckboxChange}
            onAdminSelectAll={handleAdminSelectAll}
            onDeleteSingle={handleDeleteSingle}
          />
        )}
      </CardContent>

      {/* Compare Bar — visible when 2+ TEAM_FIT candidates selected */}
      {isTeamFit && selectedIds.size >= 2 && (
        <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3 flex items-center justify-between gap-3 rounded-b-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitCompareArrows className="h-4 w-4" />
            <span>{tCompare('selectedCount', { count: selectedIds.size })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              {tCompare('clearSelection')}
            </Button>
            <Button size="sm" onClick={handleCompare}>
              <GitCompareArrows className="h-4 w-4 mr-1.5" />
              {tCompare('compareSelected')}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title={
            deleteTarget?.type === 'single'
              ? tDelete('sessionDelete.deleteSessionTitle')
              : tDelete('sessionDelete.bulkDeleteTitle', { count: adminSelectedIds.size })
          }
          description={
            deleteTarget?.type === 'single'
              ? tDelete('sessionDelete.deleteSessionDescription')
              : tDelete('sessionDelete.bulkDeleteDescription', { count: adminSelectedIds.size })
          }
          entityName={
            deleteTarget?.type === 'single'
              ? deleteTarget.entityName
              : `${adminSelectedIds.size} sessions`
          }
          isDeleting={isDeleting}
          confirmButtonText={tDelete('sessionDelete.deleteSession')}
        />
      )}
    </Card>
  );
}

/**
 * Grouped activity view - groups activities by user and shows latest attempt only
 */
function GroupedActivityView({
  data,
  filters,
  pageSize,
  setPage,
  isTeamFit,
  selectedIds,
  onCheckboxChange,
  isAdmin,
  adminSelectedIds,
  onAdminCheckboxChange,
  onAdminSelectAll,
  onDeleteSingle,
}: {
  data: ActivityPage;
  filters: { page: number };
  pageSize: number;
  setPage: (page: number) => void;
  isTeamFit: boolean;
  selectedIds: Set<string>;
  onCheckboxChange: (sessionId: string, checked: boolean) => void;
  isAdmin?: boolean;
  adminSelectedIds?: Set<string>;
  onAdminCheckboxChange?: (sessionId: string, checked: boolean) => void;
  onAdminSelectAll?: () => void;
  onDeleteSingle?: (sessionId: string, userName: string) => void;
}) {
  // Group activities by user, keeping only latest attempt per user
  const groupedData = groupByLatestUserAttempt(data.content);

  return (
    <>
      {/* Desktop: Table View */}
      <div className="hidden md:block">
        <ActivityTable
          data={groupedData}
          isTeamFit={isTeamFit}
          selectedIds={selectedIds}
          onCheckboxChange={onCheckboxChange}
          isAdmin={isAdmin}
          adminSelectedIds={adminSelectedIds}
          onAdminCheckboxChange={onAdminCheckboxChange}
          onAdminSelectAll={onAdminSelectAll}
          onDeleteSingle={onDeleteSingle}
        />
      </div>

      {/* Mobile: Card List View */}
      <div className="md:hidden">
        <ActivityCardList
          data={groupedData}
          isTeamFit={isTeamFit}
          selectedIds={selectedIds}
          onCheckboxChange={onCheckboxChange}
          isAdmin={isAdmin}
          onDeleteSingle={onDeleteSingle}
        />
      </div>

      {/* Pagination */}
      <ActivityPagination
        page={filters.page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        pageSize={pageSize}
        onPageChange={setPage}
        isFirst={data.first}
        isLast={data.last}
      />
    </>
  );
}

/**
 * Loading skeleton
 */
function ActivityTableSkeleton({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
            <div className="flex gap-3 mt-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="w-7 h-7 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * Error state
 */
function ErrorState({
  message,
  onRetry,
  t,
}: {
  message: string;
  onRetry: () => void;
  t: ReturnType<typeof useTranslations<'activity'>>;
}) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-destructive/80 mb-2">{message}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3 h-3 mr-1" />
        {t('retry')}
      </Button>
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState({
  t,
}: {
  t: ReturnType<typeof useTranslations<'activity.table'>>;
}) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">{t('noResults')}</p>
    </div>
  );
}

export default TemplateActivityTable;
