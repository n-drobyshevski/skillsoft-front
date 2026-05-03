"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { UiLink } from "@/components/ui/ui-link";
import {
	MoreHorizontal,
	Settings2,
	ArrowUpDown,
	Copy,
	ExternalLink,
	Layers,
} from "lucide-react";
import {
	type ColumnDef,
} from "@tanstack/react-table";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

import { AssessmentQuestion } from "@/types/domain";
import { questionTypeToIcon, questionDifficultyToColor } from "@/lib/ui-utils";
import EntitiesTable from "@/components/data-display/Table";
import AssessmentQuestionDrawer from "./AssessmentQuestionDrawer";
import { IndicatorHoverCard } from "@/components/feedback/IndicatorHoverCard";

interface QuestionsTableProps {
    questions: AssessmentQuestion[];
}

export default function QuestionsTable({ questions }: QuestionsTableProps) {
    const router = useRouter();
    const t = useTranslations("question");
    const tEnumType = useTranslations("enums.questionType");
    const tEnumDifficulty = useTranslations("enums.difficultyLevel");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);

    const handleViewDetails = (question: AssessmentQuestion) => {
        setSelectedQuestion(question);
        setIsDrawerOpen(true);
    };

    const columns: ColumnDef<AssessmentQuestion>[] = [
        {
          accessorKey: "questionText",
          meta: { label: t("columns.question") },
          header: ({ column }) => {
            return (
              <div className="text-left">
                <Button
                  variant="link"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  size="sm"
                  className="-ml-4 text-muted-foreground"
                >
                  {t("columns.question")}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          },
          cell: ({ row }) => {
            const question = row.original;
            return (
              <div className="flex flex-col max-w-lg overflow-hidden text-ellipsis">
                <div className="font-medium ">{row.getValue("questionText")}</div>
                <div className="text-sm text-muted-foreground">
                  {question.behavioralIndicatorId ? (
                    <IndicatorHoverCard indicatorId={question.behavioralIndicatorId}>
                      <UiLink
                        href={`/hr/behavioral-indicators/${question.behavioralIndicatorId}`}
                        variant="underline"
                      >
                        {t("columns.viewIndicator")}
                      </UiLink>
                    </IndicatorHoverCard>
                  ) : (
                    <span className="text-muted-foreground">{t("columns.noIndicator")}</span>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "questionType",
          meta: { label: t("columns.type") },
          header: ({ column }) => (
            <Button
              variant="link"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              size="sm"
              className="-ml-4 text-muted-foreground"
            >
              {t("columns.type")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            const question = row.original;
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <span>{questionTypeToIcon(question.questionType)}</span>
                    <span className="font-medium">
                      {tEnumType(question.questionType)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {tEnumType(`${question.questionType}_DESC`)}
                </TooltipContent>
              </Tooltip>
            );
          },
        },
        {
          accessorKey: "difficultyLevel",
          meta: { label: t("columns.difficulty") },
          header: ({ column }) => (
            <Button
              variant="link"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              size="sm"
              className="-ml-4 text-muted-foreground"
            >
              {t("columns.difficulty")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            const question = row.original;
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={questionDifficultyToColor(question.difficultyLevel)}>
                    {tEnumDifficulty(question.difficultyLevel)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {tEnumDifficulty(`${question.difficultyLevel}_DESC`)}
                </TooltipContent>
              </Tooltip>
            );
          },
        },
        {
          id: "actions",
          meta: { label: t("columns.actions") },
          cell: ({ row }) => {
            const question = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">{t("actions.openMenu")}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">{t("actions.label")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(question);
                  }}>
                    <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                    {t("actions.quickView")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/hr/assessment-questions/${question.id}`);
                  }}>
                    <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                    {t("actions.viewDetails")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/hr/assessment-questions/${question.id}/edit`);
                  }}>
                    <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    {t("actions.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(question.id);
                    }}
                    className="text-muted-foreground"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {t("actions.copyId")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ];

    return (
        <>
            <EntitiesTable data={questions} columns={columns} onRowClick={handleViewDetails} />
            {selectedQuestion && (
                <AssessmentQuestionDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                question={selectedQuestion}
                />
            )}
        </>
    );
}