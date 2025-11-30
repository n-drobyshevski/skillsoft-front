"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	Clock,
	MoreHorizontal,
	Eye,
	Settings2,
	ArrowUpDown,
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

import { AssessmentQuestion } from "@/app/interfaces/domain-interfaces";
import { questionTypeToIcon, questionDifficultyToColor } from "@/app/utils";
import EntitiesTable from "@/app/components/Table";
import AssessmentQuestionDrawer from "./AssessmentQuestionDrawer";
import { IndicatorHoverCard } from "@/app/components/IndicatorHoverCard";

interface QuestionsTableProps {
    questions: AssessmentQuestion[];
}

export default function QuestionsTable({ questions }: QuestionsTableProps) {
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
                        href={`/behavioral-indicators/${question.behavioralIndicatorId}`}
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
        // ... other columns can be added here
        {
          id: "actions",
          cell: ({ row }) => {
            const question = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleViewDetails(question)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
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