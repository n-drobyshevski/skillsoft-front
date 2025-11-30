"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);

    const handleViewDetails = (question: AssessmentQuestion) => {
        setSelectedQuestion(question);
        setIsDrawerOpen(true);
    };

    const columns: ColumnDef<AssessmentQuestion>[] = [
        {
          accessorKey: "questionText",
          header: ({ column }) => {
            return (
              <div className="text-left">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  Question
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
                      <Link
                        href={`/hr/behavioral-indicators/${question.behavioralIndicatorId}`}
                        className="text-primary hover:underline"
                      >
                        View Indicator
                      </Link>
                    </IndicatorHoverCard>
                  ) : (
                    <span className="text-muted-foreground">No indicator assigned</span>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "questionType",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            const question = row.original;
            return (
              <div className="flex items-center gap-2">
                <span>{questionTypeToIcon(question.questionType)}</span>
                <span className="font-medium">
                  {question.questionType
                    .split("_")
                    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(" ")}
                </span>
              </div>
            );
          },
        },
        {
          accessorKey: "difficultyLevel",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Difficulty
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            const question = row.original;
            return (
              <Badge variant="outline" className={questionDifficultyToColor(question.difficultyLevel)}>
                {question.difficultyLevel}
              </Badge>
            );
          },
        },
        // Action column - uses group-hover to show/hide the menu button
        {
          id: "actions",
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
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(question);
                  }}>
                    <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                    Quick View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/hr/assessment-questions/${question.id}`);
                  }}>
                    <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/hr/assessment-questions/${question.id}/edit`);
                  }}>
                    <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    Edit
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
                    Copy ID
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