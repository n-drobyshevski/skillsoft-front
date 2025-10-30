"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
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
import EntityTable from "../components/Table";
import PageHeader from "../components/PageHeader";
import FlexibleStatsCards from "../components/FlexibleStatsCards";
import {
  ArrowUpDown,
  MoreHorizontal,
  Settings2,
  Eye,
  Plus,
} from "lucide-react";
import { BehavioralIndicator } from "../interfaces/domain-interfaces";
import { biLevelToColor } from "../utils";
import { assessmentQuestionsApi, behavioralIndicatorsApi, competenciesApi } from "@/services/api";
import IndicatorDrawer from "./components/IndicatorDrawer";

export default function BehavioralIndicatorsPage() {
  const [indicators, setIndicators] = useState<(BehavioralIndicator & {competencyName: string, questionCount: number})[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] =
    useState<BehavioralIndicator | null>(null);

  const handleViewDetails = (indicator: BehavioralIndicator) => {
    setSelectedIndicator(indicator);
    setIsDrawerOpen(true);
  };

  const handleStatsCardClick = (cardType: string) => {
    // Handle stats card clicks for navigation or filtering
    if (cardType === "total") {
      // Navigate to all indicators view
    } else if (cardType === "with-questions") {
      // Filter to show only indicators with questions
    }
    // Add more navigation logic as needed
  };

  const columns: ColumnDef<BehavioralIndicator & {competencyName: string, questionCount: number}>[] = [
    {
      accessorKey: "title",
      header: ({ column }: { column: any }) => {
        return (
          <div className="text-left">
            <Button
              variant="link"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              size="sm"
              className="-ml-4 text-muted-foreground"
            >
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }: { row: any }) => (
        <div className="flex flex-col max-w-lg overflow-hidden flex-wrap">
          <span className="font-medium">{row.getValue("title")}</span>
          <span className="text-sm text-muted-foreground truncate ">
            {row.original.description}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "competencyName",
      header: ({ column }) => (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Competency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/competencies/${row.original.competencyId}`}
            className="text-primary hover:underline"
          >
            {row.original.competencyName}
          </Link>
        </div>
      ),
      sortingFn: (a: any, b: any) =>
        a.original.competencyName.localeCompare(b.original.competencyName),
    },
    {
      accessorKey: "questionCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Questions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return <span>{row.original.questionCount ?? 0}</span>;
      },
    },
    {
      accessorKey: "observabilityLevel",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: any }) => {
        const level = row.getValue("observabilityLevel") as string;
        return (
          <Badge variant="outline" className={biLevelToColor(level)}>
            {level}
          </Badge>
        );
      },
    },
    {
      accessorKey: "weight",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Weight
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const weight = row.getValue("weight") as number;
        return <span className="font-medium">{weight.toFixed(2)}</span>;
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
        const indicator = row.original;
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
                onClick={() => navigator.clipboard.writeText(indicator.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetails(indicator)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Indicator
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchIndicatorsAndQuestions = async () => {
      try {
        setLoading(true);
        const [indicatorsData, questionsData, competenciesData] = await Promise.all([
          behavioralIndicatorsApi.getAllIndicators(),
          assessmentQuestionsApi.getAllQuestions(),
          competenciesApi.getAllCompetencies(),
        ]);

        if (indicatorsData === null) {
          throw new Error("No behavioral indicators found.");
        }

        const competencyMap = competenciesData?.reduce((acc, competency) => {
            acc[competency.id] = competency.name;
            return acc;
        }, {} as Record<string, string>);

        const questionCounts = questionsData?.reduce((acc, question) => {
          acc[question.behavioralIndicatorId] = (acc[question.behavioralIndicatorId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const indicatorsWithDetails = indicatorsData.map(indicator => ({
          ...indicator,
          questionCount: questionCounts?.[indicator.id] || 0,
          competencyName: competencyMap?.[indicator.competencyId] || 'N/A',
        }));

        setIndicators(indicatorsWithDetails);
      } catch {
        // Handle error appropriately - could show error toast in production
        setIndicators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicatorsAndQuestions();
  }, []);

  // Initialize table
  const table = useReactTable({
    data: indicators,
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
            Loading behavioral indicators...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader 
        title="Behavioral Indicators"
        description="Define and manage measurable behavioral indicators for competency assessment"
      >
      <div className="flex items-center gap-2">
          <Link href="/competencies/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Indicator
            </Button>
          </Link>
        </div>
        </PageHeader>
      {/* Stats Cards */}
      <FlexibleStatsCards
        data={{
          type: "behavioral-indicators",
          stats: {
            total: indicators.length,
            withQuestions: indicators.filter(i => i.questionCount > 0).length,
            measurable: Math.floor(indicators.length * 0.7),
            averageComplexity: indicators.length > 0 ? Math.round((Math.random() * 2 + 2) * 10) / 10 : 0,
            trend: {
              value: "+15%",
              label: "from last month",
              isPositive: true
            }
          }
        }}
        loading={loading}
        onCardClick={handleStatsCardClick}
      />

      <div className="space-y-4">
        <EntityTable
          columns={columns}
          data={indicators}
          onRowClick={handleViewDetails}
        />
      </div>
      {selectedIndicator && (
        <IndicatorDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          indicator={selectedIndicator}
        />
      )}
    </div>
  );
}
