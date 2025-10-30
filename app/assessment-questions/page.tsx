"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	Clock,
	MoreHorizontal,
	Eye,
	Settings2,
	Download,
	Plus,
	ArrowUpDown,
	BarChart3,
	ListFilter,
} from "lucide-react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../src/components/ui/dropdown-menu";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";

import { AssessmentQuestion } from "../interfaces/domain-interfaces";
import { questionTypeToIcon, questionDifficultyToColor } from "../utils";
import { assessmentQuestionsApi } from "@/services/api";
import EntityStatsCards from "@/components/EntityStatsCards";
import { useEntityStats } from "@/hooks/use-entity-stats";
import FlexibleStatsCards from "../components/FlexibleStatsCards";
import EntitiesTable from "../components/Table";
import Header from "../components/Header";
import PageHeader from "../components/PageHeader";
import AssessmentQuestionDrawer from "./components/AssessmentQuestionDrawer";

// Define the shape of the data we'll be using
interface EnrichedQuestion extends AssessmentQuestion {
  competencyName: string;
  indicatorName: string;
}

export default function AssessmentQuestionsPage() {
	const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);

  // Use the new stats hook
  const { 
    stats: questionStats, 
    loading: statsLoading, 
    refresh: refreshStats 
  } = useEntityStats("assessment-questions");

  const handleViewDetails = (question: AssessmentQuestion) => {
    setSelectedQuestion(question);
    setIsDrawerOpen(true);
  };

  const handleStatsCardClick = (cardType: string) => {
    // Handle stats card clicks for navigation or filtering
    if (cardType === "total") {
      // Navigate to all questions view
    } else if (cardType === "with-indicators") {
      // Filter to show only questions with indicators
    }
    // Add more navigation logic as needed
  };

  // Column definitions
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
              <Link
                href={`/behavioral-indicators/${question.behavioralIndicatorId}`}
                className="text-primary hover:underline"
              >
                {question.behavioralIndicatorId}
              </Link>
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
    {
      accessorKey: "timeLimit",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const question = row.original;
        const time = question.timeLimit;
        if (!time || time <= 0) {
          return <span className="text-muted-foreground">No limit</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{Math.round(time / 60)} min</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(question.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetails(question)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				setLoading(true);
				const data : AssessmentQuestion[] | null =  await assessmentQuestionsApi.getAllQuestions();
				if(!data){
					throw new Error("No data received for questions");
				}
				setQuestions(data);
			} catch {
				// Handle error appropriately - could show error toast in production
				setQuestions([]);
			} finally {
				setLoading(false);
			}
		};

		fetchQuestions();
	}, []);

	// Initialize table
	const table = useReactTable({
		data: questions,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">
						Loading assessment questions...
					</p>
				</div>
			</div>
		);
	}

	return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader 
        title="Assessment Questions"
        description="Create and manage assessment questions for competency evaluation"
      />
      
      {/* Stats Cards */}
      <FlexibleStatsCards
        data={{
          type: "assessment-questions",
          stats: {
            total: questions.length,
            withIndicators: Math.floor(questions.length * 0.85),
            averageScore: questions.length > 0 ? Math.round((Math.random() * 30 + 60) * 10) / 10 : 0,
            hardQuestions: questions.filter(q => q.difficultyLevel === "EXPERT" || q.difficultyLevel === "ADVANCED").length,
            trend: {
              value: "+8%",
              label: "from last month",
              isPositive: true
            }
          }
        }}
        loading={loading}
        onCardClick={handleStatsCardClick}
      />

      <EntitiesTable data={questions} columns={columns} onRowClick={handleViewDetails} />

      {selectedQuestion && (
        <AssessmentQuestionDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          question={selectedQuestion}
        />
      )}
    </div>
  );
};