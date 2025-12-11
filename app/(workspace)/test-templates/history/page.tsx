import React, { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { testResultsApi, testSessionsApi } from "@/services/api";
import { TestResult, TestSessionSummary } from "@/types/domain";
import { SessionStatus } from "@/types/domain";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  History,
  ChevronRight,
  FileText,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function TestHistoryPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6 max-w-5xl mx-auto w-full">
      <PageHeader
        title="Мои результаты"
        description="История пройденных тестов и текущие сессии"
      >
        <Link href="/test-templates" className="w-full md:w-auto">
          <Button variant="outline" size="sm" className="w-full md:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            Все шаблоны
          </Button>
        </Link>
      </PageHeader>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 md:w-auto">
          <TabsTrigger value="results" className="flex-1 md:flex-none gap-2 py-2.5">
            <Trophy className="h-4 w-4" />
            <span>Результаты</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1 md:flex-none gap-2 py-2.5">
            <PlayCircle className="h-4 w-4" />
            <span>В процессе</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Suspense fallback={<HistorySkeleton />}>
            <ResultsList userId={userId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Suspense fallback={<HistorySkeleton />}>
            <SessionsList userId={userId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function ResultsList({ userId }: { userId: string }) {
  let results: TestResult[] = [];
  let error: string | null = null;

  try {
    const response = await testResultsApi.getUserResults(userId, 0, 50);
    results = response?.content || [];
  } catch (err) {
    console.error("Failed to fetch results:", err);
    error = "Не удалось загрузить результаты";
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Нет результатов</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
            Вы ещё не завершили ни одного теста.
          </p>
          <Link href="/test-templates">
            <Button>Пройти первый тест</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats summary - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Тестов пройдено"
          value={results.length.toString()}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Успешно"
          value={results.filter(r => r.passed).length.toString()}
        />
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Средний балл"
          value={`${Math.round(results.reduce((acc, r) => acc + r.overallPercentage, 0) / results.length)}%`}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Общее время"
          value={formatTotalTime(results.reduce((acc, r) => acc + (r.totalTimeSeconds || 0), 0))}
        />
      </div>

      {/* Results list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">История прохождений</h3>
        {results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}

async function SessionsList({ userId }: { userId: string }) {
  let sessions: TestSessionSummary[] = [];
  let error: string | null = null;

  try {
    const response = await testSessionsApi.getUserSessions(userId, 0, 50);
    sessions = (response?.content || []).filter(
      (s) => s.status === SessionStatus.IN_PROGRESS || s.status === SessionStatus.NOT_STARTED
    );
  } catch (err) {
    console.error("Failed to fetch sessions:", err);
    error = "Не удалось загрузить сессии";
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <PlayCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Нет активных сессий</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
            У вас нет незавершённых тестов.
          </p>
          <Link href="/test-templates">
            <Button>Начать новый тест</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

// ============================================================================
// UI Components
// ============================================================================

function ResultCard({ result }: { result: TestResult }) {
  const percentScore = Math.round(result.overallPercentage);
  
  return (
    <Card className="active:scale-[0.99] transition-transform duration-200 hover:border-primary/50">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Header Row (Mobile: Top, Desktop: Left) */}
        <div className="flex items-start gap-4 flex-1">
          {/* Score Circle */}
          <div className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg shrink-0 mt-1 sm:mt-0",
            result.passed 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          )}>
            {percentScore}%
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-base leading-tight">{result.templateName}</h4>
              <Badge variant={result.passed ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                {result.passed ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {result.passed ? "Пройден" : "Не пройден"}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(result.completedAt)}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{result.questionsAnswered} вопросов</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatDuration(result.totalTimeSeconds)}</span>
            </div>
          </div>
        </div>
        
        {/* Action (Mobile: Full Width Button, Desktop: Arrow) */}
        <div className="w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
          <Link href={`/test-templates/results/${result.id}`} className="block">
            <Button variant="ghost" className="w-full sm:w-auto justify-between sm:justify-center group">
              <span className="sm:hidden">Подробнее</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionCard({ session }: { session: TestSessionSummary }) {
  const progress = session.totalQuestions > 0 
    ? Math.round((session.answeredQuestions / session.totalQuestions) * 100) 
    : 0;
  
  return (
    <Card className="active:scale-[0.99] transition-transform duration-200 hover:border-primary/50">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Progress Circle */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm sm:text-lg shrink-0 mt-1 sm:mt-0">
            {progress}%
          </div>
          
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-base leading-tight">{session.templateName}</h4>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300">
                В процессе
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
              <span>Начат {formatDate(session.startedAt || session.createdAt)}</span>
              <span className="hidden sm:inline">•</span>
              <span>{session.answeredQuestions} из {session.totalQuestions} вопросов</span>
            </div>
          </div>
        </div>
        
        <div className="w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
          <Link href={`/test-templates/take/${session.id}`} className="block">
            <Button size="sm" className="w-full sm:w-auto">
              Продолжить
              <PlayCircle className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground bg-muted p-2 rounded-lg">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Helpers
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function formatDuration(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "0м";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}ч ${mins}м`;
  return `${mins}м`;
}

function formatTotalTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "0м";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}ч`;
  return `${mins}м`;
}