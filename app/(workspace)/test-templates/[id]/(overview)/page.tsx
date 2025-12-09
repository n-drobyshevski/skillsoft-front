import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { testTemplatesApi, competenciesApi } from '@/services/api';
import { Competency, TestSession } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wrench,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Timer,
  BarChart3,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Fetch template with competencies and performance data
 */
async function getOverviewData(id: string) {
  try {
    const [template, allCompetencies] = await Promise.all([
      testTemplatesApi.getTemplateById(id),
      competenciesApi.getAllCompetencies(),
    ]);

    if (!template) {
      return { template: null, competencies: [], sessions: [] as TestSession[], stats: null, error: 'Template not found' };
    }

    // Get competencies for this template
    const competencies = allCompetencies?.filter(
      (c: Competency) => template.competencyIds?.includes(c.id)
    ) || [];

    // TODO: Replace with actual API call when getSessionsByTemplate is available
    const sessions: TestSession[] = [];
    
    // Calculate performance stats
    const completedSessions = sessions.filter((s: TestSession) => s.status === 'COMPLETED');
    
    const stats = {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      passRate: 0,
      avgDuration: 0,
      completionRate: 0,
    };

    return { template, competencies, sessions, stats, error: null };
  } catch (error) {
    console.error('Failed to fetch overview data:', error);
    return { template: null, competencies: [], sessions: [] as TestSession[], stats: null, error: 'Failed to load data' };
  }
}

/**
 * Health indicator dot for competency inventory
 */
function HealthDot({ isHealthy }: { isHealthy: boolean }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        isHealthy ? 'bg-green-500' : 'bg-red-500'
      )}
      title={isHealthy ? 'Healthy - Has active questions' : 'Needs attention - Missing questions'}
    />
  );
}

/**
 * Blueprint Spec Sheet Card
 */
function BlueprintSpecSheet({
  template,
  competencies,
  isDraft,
}: {
  template: Awaited<ReturnType<typeof getOverviewData>>['template'];
  competencies: Awaited<ReturnType<typeof getOverviewData>>['competencies'];
  isDraft: boolean;
}) {
  if (!template) return null;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Configuration</CardTitle>
          <CardDescription>Blueprint specification and competency selection</CardDescription>
        </div>
        {isDraft && (
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`/test-templates/${template.id}/builder`}>
              <Wrench className="h-4 w-4" />
              Go to Builder
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meta Info Badges */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Clock className="h-3.5 w-3.5" />
            {template.timeLimitMinutes || 30} min
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Target className="h-3.5 w-3.5" />
            {template.passingScore || 70}% to pass
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <BarChart3 className="h-3.5 w-3.5" />
            {template.goal?.replace(/_/g, ' ') || 'General Assessment'}
          </Badge>
        </div>

        {/* Competencies List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Selected Competencies ({competencies.length})
          </h4>
          
          {competencies.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No competencies selected</p>
              {isDraft && (
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href={`/test-templates/${template.id}/builder`}>
                    Add competencies
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {competencies.map((competency: Competency) => {
                // Check if competency has active behavioral indicators
                const hasQuestions = competency.behavioralIndicators?.some((bi: { isActive?: boolean }) => bi.isActive);
                
                return (
                  <div
                    key={competency.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <HealthDot isHealthy={!!hasQuestions} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{competency.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {competency.category?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Performance Stats Card
 */
function PerformanceCard({
  stats,
}: {
  stats: Awaited<ReturnType<typeof getOverviewData>>['stats'];
}) {
  if (!stats) return null;

  const metrics = [
    {
      label: 'Pass Rate',
      value: `${stats.passRate}%`,
      icon: TrendingUp,
      color: stats.passRate >= 70 ? 'text-green-600' : 'text-yellow-600',
    },
    {
      label: 'Avg Duration',
      value: `${stats.avgDuration} min`,
      icon: Timer,
      color: 'text-blue-600',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: CheckCircle2,
      color: stats.completionRate >= 80 ? 'text-green-600' : 'text-yellow-600',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Performance
        </CardTitle>
        <CardDescription>
          Based on {stats.completedSessions} completed sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.totalSessions === 0 ? (
          <div className="text-center py-6">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No test sessions yet</p>
          </div>
        ) : (
          metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className={cn('h-4 w-4', metric.color)} />
                    {metric.label}
                  </span>
                  <span className="font-semibold">{metric.value}</span>
                </div>
                {metric.label === 'Pass Rate' && (
                  <Progress value={stats.passRate} className="h-2" />
                )}
                {metric.label === 'Completion Rate' && (
                  <Progress value={stats.completionRate} className="h-2" />
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Recent Activity Table
 */
function RecentActivityCard({
  sessions,
  templateId,
}: {
  sessions: Awaited<ReturnType<typeof getOverviewData>>['sessions'];
  templateId: string;
}) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Last 5 test sessions</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/test-templates/${templateId}/results`}>
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No test sessions yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Sessions will appear here once candidates start the test
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session: TestSession & { candidateName?: string; candidateEmail?: string; score?: number; durationMinutes?: number }) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {session.candidateName || session.candidateEmail || 'Anonymous'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}
                      className={cn(
                        'text-xs',
                        session.status === 'COMPLETED' && 'bg-green-100 text-green-700',
                        session.status === 'IN_PROGRESS' && 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {session.status?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {session.score !== undefined ? (
                      <span className={cn(
                        'font-medium',
                        session.score >= 70 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {session.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.durationMinutes ? `${session.durationMinutes} min` : '—'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {session.createdAt
                      ? new Date(session.createdAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for the overview page
 */
function OverviewSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-36 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
        <div className="col-span-full">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-28 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Overview Page - Management Dashboard
 * 
 * Shows read-only view of:
 * - Blueprint Spec Sheet (competencies, settings)
 * - Performance metrics (pass rate, duration, completion)
 * - Recent activity (last 5 sessions)
 */
export default async function OverviewPage({ params }: OverviewPageProps) {
  const { id } = await params;
  const { template, competencies, sessions, stats, error } = await getOverviewData(id);

  if (!template || error) {
    notFound();
  }

  // Use isActive to determine draft status
  const isDraft = !template.isActive;

  return (
    <div className="p-4 lg:p-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Blueprint Spec Sheet - 2 columns */}
        <BlueprintSpecSheet
          template={template}
          competencies={competencies}
          isDraft={isDraft}
        />

        {/* Performance Stats - 1 column */}
        <PerformanceCard stats={stats} />

        {/* Recent Activity - Full width */}
        <RecentActivityCard sessions={sessions} templateId={id} />
      </div>
    </div>
  );
}
