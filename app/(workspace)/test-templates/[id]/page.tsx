import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { testTemplatesApi, competenciesApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/app/components/PageHeader";
import StartTestSessionButton from "../components/StartTestSessionButton";
import DeleteTestTemplateButton from "../components/DeleteTestTemplateButton";
import { AssessmentGoal, AssessmentGoalInfo } from "@/app/enums/domain_enums";
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  Shuffle,
  SkipForward,
  ArrowLeftRight,
  Eye,
  Pencil,
  Crosshair,
  Briefcase,
  Users
} from "lucide-react";

interface TestDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Get icon component for assessment goal
 */
function getGoalIcon(goal: AssessmentGoal | undefined) {
  switch (goal) {
    case AssessmentGoal.JOB_FIT:
      return Briefcase;
    case AssessmentGoal.TEAM_FIT:
      return Users;
    case AssessmentGoal.OVERVIEW:
    default:
      return Crosshair;
  }
}

/**
 * Get color classes for assessment goal
 */
function getGoalColorClasses(goal: AssessmentGoal | undefined) {
  switch (goal) {
    case AssessmentGoal.JOB_FIT:
      return 'bg-blue-100 text-blue-700';
    case AssessmentGoal.TEAM_FIT:
      return 'bg-purple-100 text-purple-700';
    case AssessmentGoal.OVERVIEW:
    default:
      return 'bg-primary/10 text-primary';
  }
}

async function getTemplateData(id: string) {
  try {
    const template = await testTemplatesApi.getTemplateById(id);
    if (!template) {
      return { template: null, competencies: [], error: "Template not found" };
    }

    // Fetch related competencies
    const allCompetencies = await competenciesApi.getAllCompetencies();
    const competencies = allCompetencies?.filter(
      (c) => template.competencyIds?.includes(c.id)
    ) || [];

    return { template, competencies, error: null };
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return { template: null, competencies: [], error: "Failed to load test details" };
  }
}

export default async function TestDetailPage({ params }: TestDetailPageProps) {
  const { id } = await params;
  const { template, competencies, error } = await getTemplateData(id);

  if (!template || error === "Template not found") {
    notFound();
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} минут`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} часов`;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      {/* Back navigation */}
      <Link href="/test-templates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку шаблонов
      </Link>

      <PageHeader
        title={template.name}
        description={template.description}
      >
        <div className="flex items-center gap-2">
          <Link href={`/test-templates/${template.id}/edit`}>
            <Button variant="outline" size="default">
              <Pencil className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Редактировать</span>
            </Button>
          </Link>
          <DeleteTestTemplateButton 
            templateId={template.id} 
            templateName={template.name}
            variant="outline"
          />
          <StartTestSessionButton templateId={template.id} templateName={template.name} />
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Параметры теста</CardTitle>
                <CardDescription>
                  Ознакомьтесь с условиями прохождения перед началом
                </CardDescription>
              </div>
              {/* Assessment Goal Badge */}
              {(() => {
                const GoalIcon = getGoalIcon(template.goal);
                const goalInfo = template.goal ? AssessmentGoalInfo[template.goal] : AssessmentGoalInfo[AssessmentGoal.OVERVIEW];
                const colorClasses = getGoalColorClasses(template.goal);
                return (
                  <Badge className={colorClasses} title={goalInfo.description}>
                    <GoalIcon className="h-3.5 w-3.5 mr-1.5" />
                    {goalInfo.displayName}
                  </Badge>
                );
              })()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <Clock className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm text-muted-foreground">Время</span>
                <span className="font-semibold">{formatDuration(template.timeLimitMinutes)}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <Target className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm text-muted-foreground">Проходной</span>
                <span className="font-semibold">{template.passingScore}%</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <BookOpen className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm text-muted-foreground">Компетенций</span>
                <span className="font-semibold">{competencies.length}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm text-muted-foreground">Вопросов/индикатор</span>
                <span className="font-semibold">{template.questionsPerIndicator}</span>
              </div>
            </div>

            <Separator />

            {/* Test Settings */}
            <div>
              <h4 className="font-medium mb-3">Настройки прохождения</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <SettingItem
                  icon={Shuffle}
                  label="Перемешивание вопросов"
                  enabled={template.shuffleQuestions}
                />
                <SettingItem
                  icon={Shuffle}
                  label="Перемешивание вариантов"
                  enabled={template.shuffleOptions}
                />
                <SettingItem
                  icon={SkipForward}
                  label="Можно пропускать вопросы"
                  enabled={template.allowSkip}
                />
                <SettingItem
                  icon={ArrowLeftRight}
                  label="Возврат к предыдущим"
                  enabled={template.allowBackNavigation}
                />
                <SettingItem
                  icon={Eye}
                  label="Результаты сразу"
                  enabled={template.showResultsImmediately}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competencies Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Оцениваемые компетенции</CardTitle>
            <CardDescription>
              Навыки, которые будут проверены
            </CardDescription>
          </CardHeader>
          <CardContent>
            {competencies.length > 0 ? (
              <div className="space-y-3">
                {competencies.map((competency) => (
                  <div
                    key={competency.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{competency.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {competency.category}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {competency.level}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Информация о компетенциях недоступна
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <StartTestSessionButton templateId={template.id} templateName={template.name} fullWidth />
      </div>
      
      {/* Spacer for fixed bottom button on mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  enabled: boolean;
}

function SettingItem({ icon: Icon, label, enabled }: SettingItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
      {enabled ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );
}
