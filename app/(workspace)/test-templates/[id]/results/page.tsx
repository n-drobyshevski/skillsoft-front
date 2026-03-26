import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { testTemplatesApi } from '@/services/api';
import { getCurrentUserRole } from '@/services/roleApi';
import { activityApi } from '@/services/api/activity';
import { TestSession, SessionStatus } from '@/types/domain';
import type { TestActivity } from '@/types/activity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { SessionsTable, AnonymousResultsList } from './_components';
import { isReservedTestTemplateSegment } from '@/lib/routing-constants';
import Loading from './loading';
import { Link2 } from 'lucide-react';

// Extended session type with additional fields that may come from API
type ExtendedSession = TestSession & {
  candidateName?: string;
  candidateEmail?: string;
  score?: number;
  durationMinutes?: number;
};

interface ResultsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

/**
 * Generate metadata for the results page with i18n support
 */
export async function generateMetadata({ params }: ResultsPageProps) {
  const { id } = await params;
  const t = await getTranslations('template.metadata');

  // Reject reserved route segments
  if (isReservedTestTemplateSegment(id)) {
    return {
      title: t('invalidRoute'),
      description: t('invalidRouteDescription'),
    };
  }

  const template = await testTemplatesApi.getTemplateById(id);

  return {
    title: template
      ? t('results', { name: template.name })
      : t('testTemplate'),
    description: t('resultsDescription'),
  };
}

/**
 * Maps an ActivityEventType to a SessionStatus for display purposes.
 */
function mapEventTypeToStatus(eventType: string): SessionStatus {
  switch (eventType) {
    case 'COMPLETED': return SessionStatus.COMPLETED;
    case 'ABANDONED': return SessionStatus.ABANDONED;
    case 'TIMED_OUT': return SessionStatus.TIMED_OUT;
    default: return SessionStatus.COMPLETED;
  }
}

/**
 * Maps a TestActivity (from activity tracking API) to an ExtendedSession
 * for display in the SessionsTable component.
 */
function mapActivityToSession(activity: TestActivity): ExtendedSession {
  return {
    id: activity.sessionId,
    templateId: activity.templateId,
    templateName: activity.templateName,
    clerkUserId: activity.clerkUserId,
    status: mapEventTypeToStatus(activity.eventType),
    createdAt: activity.occurredAt,
    currentQuestionIndex: 0,
    questionOrder: [],
    totalQuestions: 0,
    answeredQuestions: 0,
    candidateName: activity.userName || undefined,
    score: activity.score ?? undefined,
    durationMinutes: activity.timeSpentSeconds
      ? Math.round(activity.timeSpentSeconds / 60)
      : undefined,
  } as ExtendedSession;
}

async function getResultsData(id: string, filters: { status?: string; search?: string }) {
  // Reject reserved route segments to prevent routing conflicts
  if (isReservedTestTemplateSegment(id)) {
    return { template: null, sessions: [] as ExtendedSession[], stats: null, error: 'Invalid route segment' };
  }

  try {
    const template = await testTemplatesApi.getTemplateById(id);

    if (!template) {
      return { template: null, sessions: [] as ExtendedSession[], stats: null, error: 'Template not found' };
    }

    // Fetch real session data from activity API
    const [activityPage, activityStats] = await Promise.all([
      activityApi.getTemplateActivity(id, {
        status: (filters.status && filters.status !== 'all')
          ? filters.status as 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT'
          : undefined,
        page: 0,
        size: 100,
      }).catch(() => null),
      activityApi.getTemplateActivityStats(id).catch(() => null),
    ]);

    // Map activity data to ExtendedSession format
    let sessions: ExtendedSession[] = (activityPage?.content ?? []).map(mapActivityToSession);

    // Client-side text search filter (activity API doesn't support text search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      sessions = sessions.filter(
        (s: ExtendedSession) =>
          s.candidateName?.toLowerCase().includes(searchLower) ||
          s.candidateEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    sessions.sort(
      (a: ExtendedSession, b: ExtendedSession) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    // Use real stats from activity API, with fallback to client-side calculation
    const stats = activityStats
      ? {
          total: activityStats.totalSessions,
          completed: activityStats.completedCount,
          inProgress: Math.max(
            0,
            activityStats.totalSessions
              - activityStats.completedCount
              - activityStats.abandonedCount
              - activityStats.timedOutCount
          ),
          avgScore: Math.round(activityStats.averageScore),
        }
      : {
          total: sessions.length,
          completed: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
          inProgress: 0,
          avgScore: sessions.length > 0
            ? Math.round(
                sessions
                  .filter(s => s.score !== undefined)
                  .reduce((sum, s) => sum + (s.score || 0), 0)
                / Math.max(1, sessions.filter(s => s.score !== undefined).length)
              )
            : 0,
        };

    return { template, sessions, stats, error: null };
  } catch (error) {
    console.error('Failed to fetch results data:', error);
    return { template: null, sessions: [] as ExtendedSession[], stats: null, error: 'Failed to load data' };
  }
}


/**
 * Async data-fetching component for results content.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function ResultsData({ id, filters }: { id: string; filters: { status?: string; search?: string } }) {
  const [{ template, sessions, stats, error }, role] = await Promise.all([
    getResultsData(id, filters),
    getCurrentUserRole(),
  ]);
  const isAdmin = role === 'ADMIN';

  if (!template || error) {
    notFound();
  }

  return (
    <>
      {/* Stats Header - Mobile: 2 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Total</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Done</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats?.completed || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Active</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats?.inProgress || 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Avg Score</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats?.avgScore || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Test Sessions</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                All candidates who have taken or are taking this test
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 h-9 text-xs sm:text-sm">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-0 sm:mb-6 border-b sm:border-0 bg-muted/5 sm:bg-transparent">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                defaultValue={filters.search}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <Select defaultValue={filters.status || 'all'}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="text-foreground"><SelectValue placeholder="Status" /></span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ABANDONED">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions Table with Side Drawer */}
          <SessionsTable
            sessions={sessions}
            templateId={id}
            templateGoal={template.goal}
            passingScore={template.passingScore}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>

      {/* Anonymous Results Section */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg sm:text-xl">Anonymous Results</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Results from anonymous test takers via share links
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <AnonymousResultsList
            templateId={id}
            passingScore={template.passingScore}
          />
        </CardContent>
      </Card>
    </>
  );
}

/**
 * Results Page - Candidates & Test Sessions
 * Shows all test sessions for this template with:
 * - Search and filter functionality
 * - Session status and scores
 * - Export capabilities
 */
export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { id } = await params;
  const filters = await searchParams;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[100vw] overflow-hidden">
      <Suspense fallback={<Loading />}>
        <ResultsData id={id} filters={filters} />
      </Suspense>
    </div>
  );
}