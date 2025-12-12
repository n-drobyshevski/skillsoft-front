import React from 'react';
import { notFound } from 'next/navigation';
import { testTemplatesApi } from '@/services/api';
import { TestSession } from '@/types/domain';
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
import { SessionsTable } from './_components';

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


/**
 * Results Page - Candidates & Test Sessions
 * * Shows all test sessions for this template with:
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
    <div className="p-4 lg:p-6 space-y-6 max-w-[100vw] overflow-hidden">
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
          />
        </CardContent>
      </Card>
    </div>
  );
}