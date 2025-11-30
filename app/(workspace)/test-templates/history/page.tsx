import React, { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { testResultsApi, testSessionsApi } from "@/services/api";
import { TestResult, TestSessionSummary } from "@/app/interfaces/domain-interfaces";
import { SessionStatus } from "@/app/enums/domain_enums";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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

export default async function TestHistoryPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title="Мои результаты"
        description="История пройденных тестов и текущие сессии"
      >
        <Link href="/test-templates">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Все шаблоны
          </Button>
        </Link>
      </PageHeader>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Результаты</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <PlayCircle className="h-4 w-4" />
            <span className="hidden sm:inline">В процессе</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Suspense fallback={<HistorySkeleton />}>
            <ResultsList userId={userId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="sessions">
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
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Нет результатов</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Вы ещё не завершили ни одного теста. 
            <Link href="/test-templates" className="text-primary ml-1 hover:underline">
              Пройдите первый тест
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          value={formatTotalTime(results.reduce((acc, r) => acc + r.totalTimeSeconds, 0))}
        />
      </div>

      {/* Results list */}
      <div className="space-y-3">
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
    // Filter for in-progress sessions only
    sessions = (response?.content || []).filter(
      (s) => s.status === SessionStatus.IN_PROGRESS || s.status === SessionStatus.NOT_STARTED
    );
  } catch (err) {
    console.error("Failed to fetch sessions:", err);
    error = "Не удалось загрузить сессии";
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <PlayCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Нет активных сессий</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            У вас нет незавершённых сессий.
            <Link href="/test-templates" className="text-primary ml-1 hover:underline">
              Начать новый тест
            </Link>
          </p>
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

// Result card component
function ResultCard({ result }: { result: TestResult }) {
  const percentScore = Math.round(result.overallPercentage);
  
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        {/* Score indicator */}
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0
          ${result.passed 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }
        `}>
          {percentScore}%
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{result.templateName}</h4>
            <Badge variant={result.passed ? "default" : "secondary"} className="shrink-0">
              {result.passed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Пройден
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Не пройден
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{formatDate(result.completedAt)}</span>
            <span>•</span>
            <span>{result.questionsAnswered} вопросов</span>
            <span>•</span>
            <span>{formatDuration(result.totalTimeSeconds)}</span>
          </div>
        </div>
        
        {/* Action */}
        <Link href={`/test-templates/results/${result.id}`}>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Session card component
function SessionCard({ session }: { session: TestSessionSummary }) {
  const progress = session.totalQuestions > 0 
    ? Math.round((session.answeredQuestions / session.totalQuestions) * 100) 
    : 0;
  
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        {/* Progress indicator */}
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg shrink-0">
          {progress}%
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{session.templateName}</h4>
            <Badge variant="outline" className="shrink-0">
              <PlayCircle className="h-3 w-3 mr-1" />
              В процессе
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Начат {formatDate(session.startedAt || session.createdAt)}</span>
            <span>•</span>
            <span>{session.answeredQuestions}/{session.totalQuestions} вопросов</span>
          </div>
        </div>
        
        {/* Action */}
        <Link href={`/test-templates/take/${session.id}`}>
          <Button size="sm">
            Продолжить
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Stat card component
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-lg font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
function HistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Format helpers
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
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  return `${mins}м`;
}

function formatTotalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}ч`;
  }
  return `${mins}м`;
}
