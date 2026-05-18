'use client';

import * as React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { AssessmentQuestion, DifficultyLevel, QuestionType } from "@/types/domain";
import { questionDifficultyToColor, questionTypeToIcon } from "@/lib/ui-utils";
import { useEnumTranslation } from "@/hooks/useEnumTranslation";
import {
  Eye,
  Sparkles,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  ListChecks,
  BarChart3,
  MessageSquare
} from "lucide-react";

export default function QuestionPreview({ question }: { question: AssessmentQuestion }) {
  const t = useTranslations("forms.question.preview");
  const tForms = useTranslations("forms");
  const { translate: translateQuestionType } = useEnumTranslation<QuestionType>("questionType");
  const { translate: translateDifficulty } = useEnumTranslation<DifficultyLevel>("difficultyLevel");

  const renderAnswerOptions = () => {
    if (!question.answerOptions || question.answerOptions.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t("noOptions")}</p>
        </div>
      );
    }

    const questionType = question.questionType;

    switch (questionType) {
      case 'MULTIPLE_CHOICE':
      case 'MCQ':
        return (
          <div className="space-y-2">
            {question.answerOptions.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  option.correct 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    option.correct 
                      ? 'bg-green-600 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-sm">{option.text || t("optionFallback", { index: index + 1 })}</span>
                  {option.correct && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {t("points", { count: option.score ?? 0 })}
                </Badge>
              </div>
            ))}
          </div>
        );

      case 'LIKERT_SCALE':
      case 'LIKERT':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
              <span>{t("scale.min")}</span>
              <span>{t("scale.mid")}</span>
              <span>{t("scale.max")}</span>
            </div>
            <div className="flex justify-between gap-2">
              {question.answerOptions.map((option, index) => (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-primary/50 flex items-center justify-center text-sm font-medium">
                    {option.score || index + 1}
                  </div>
                  <span className="text-xs text-center text-muted-foreground line-clamp-1">
                    {option.text || `${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'SITUATIONAL_JUDGMENT':
      case 'SJT':
        return (
          <div className="space-y-2">
            {question.answerOptions.map((option, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-900 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed">
                      {option.text || t("situationalFallback")}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {t("points", { count: option.score ?? 0 })}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {question.answerOptions.map((option, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{option.text || t("optionFallback", { index: index + 1 })}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {t("points", { count: option.score ?? 0 })}
                </Badge>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="rounded-xl border bg-linear-to-br from-card to-muted/30 shadow-sm overflow-hidden">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>{t("header")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">{t("autoUpdating")}</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-5 space-y-5">
        {/* Question Text */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-base font-medium leading-relaxed">
              {question.questionText || <span className="text-muted-foreground italic">{t("questionPlaceholder")}</span>}
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={question.isActive ? "default" : "secondary"} className="font-medium">
            <Sparkles className="h-3 w-3 mr-1" />
            {question.isActive ? tForms("active") : tForms("inactive")}
          </Badge>
          {question.difficultyLevel && (
            <Badge
              variant="outline"
              className={`font-normal ${questionDifficultyToColor(question.difficultyLevel)}`}
            >
              {translateDifficulty(question.difficultyLevel as DifficultyLevel)}
            </Badge>
          )}
          {question.questionType && (
            <Badge variant="outline" className="font-normal bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              <span className="mr-1">{questionTypeToIcon(question.questionType)}</span>
              {translateQuestionType(question.questionType as QuestionType)}
            </Badge>
          )}
          {question.timeLimit && (
            <Badge variant="outline" className="font-normal bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
              <Clock className="h-3 w-3 mr-1" />
              {t("secondsSuffix", { value: question.timeLimit })}
            </Badge>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ListChecks className="h-4 w-4" />
            {t("answerOptionsLabel")}
          </div>
          <div className="pl-6">
            {renderAnswerOptions()}
          </div>
        </div>

        {/* Scoring Rubric */}
        {question.scoringRubric && (
          <div className="space-y-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
              <BarChart3 className="h-4 w-4" />
              {t("scoringRubric")}
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400 pl-6 leading-relaxed">
              {question.scoringRubric}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
