import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { testTemplatesApi } from '@/services/api';
import { TestSession } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

async function getResultsData(id: string, filters: { status?: string; search?: string }) {
  try {
    const template = await testTemplatesApi.getTemplateById(id);

    if (!template) {
      return { template: null, sessions: [] as ExtendedSession[], stats: null, error: 'Template not found' };
    }

    // TODO: Replace with actual API call when getSessionsByTemplate is available
    const sessions: ExtendedSession[] = [];

    // Filter sessions
    let filteredSessions = sessions;
    
    if (filters.status && filters.status !== 'all') {
      filteredSessions = filteredSessions.filter((s: ExtendedSession) => s.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredSessions = filteredSessions.filter(
        (s: ExtendedSession) =>
          s.candidateName?.toLowerCase().includes(searchLower) ||
          s.candidateEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filteredSessions.sort(
      (a: ExtendedSession, b: ExtendedSession) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    // Calculate stats
    const completedSessions = sessions.filter((s: ExtendedSession) => s.status === 'COMPLETED');
    const stats = {
      total: sessions.length,
      completed: completedSessions.length,
      inProgress: sessions.filter((s: ExtendedSession) => s.status === 'IN_PROGRESS').length,
      avgScore: completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum: number, s: ExtendedSession) => sum + (s.score || 0), 0) / completedSessions.length
          )
        : 0,
    };

    return { template, sessions: filteredSessions, stats, error: null };
  } catch (error) {
    console.error('Failed to fetch results data:', error);
    return { template: null, sessions: [] as ExtendedSession[], stats: null, error: 'Failed to load data' };
  }
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    COMPLETED: { icon: CheckCircle2, label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' },
    IN_PROGRESS: { icon: Clock, label: 'In Progress', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
    ABANDONED: { icon: XCircle, label: 'Abandoned', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    PENDING: { icon: AlertCircle, label: 'Pending', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400' },
  }[status] || { icon: AlertCircle, label: status, className: '' };

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1 text-xs', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/**
 * Results Page - Candidates & Test Sessions
 * 
 * Shows all test sessions for this template with:
 * - Search and filter functionality
 * - Session status and scores
 * - Export capabilities
 */
export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { id } = await params;
  const filters = await searchParams;
  const { template, sessions, stats, error } = await getResultsData(id, filters);

  if (!template || error) {
    notFound();
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stats Header */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.completed || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.inProgress || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats?.avgScore || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Test Sessions</CardTitle>
              <CardDescription>
                All candidates who have taken or are taking this test
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                defaultValue={filters.search}
                className="pl-9"
              />
            </div>
            <Select defaultValue={filters.status || 'all'}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ABANDONED">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {sessions.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-1">No test sessions yet</h3>
              <p className="text-sm text-muted-foreground">
                Sessions will appear here when candidates start taking this test.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session: ExtendedSession) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {session.candidateName || 'Anonymous'}
                          </p>
                          {session.candidateEmail && (
                            <p className="text-sm text-muted-foreground">
                              {session.candidateEmail}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={session.status || 'PENDING'} />
                      </TableCell>
                      <TableCell>
                        {session.score !== undefined ? (
                          <span
                            className={cn(
                              'font-semibold',
                              session.score >= (template.passingScore || 70)
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            {session.score}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.durationMinutes ? (
                          `${session.durationMinutes} min`
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.createdAt
                          ? new Date(session.createdAt).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {session.status === 'COMPLETED' && (
                          <Button asChild variant="ghost" size="sm" className="gap-1">
                            <Link href={`/test-templates/${id}/results/${session.id}`}>
                              View
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
