"use client";

import React, { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
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
  CompetencyCategory,
  ProficiencyLevel,
  ApprovalStatus,
} from "@/types/domain";
import {
  Competency,
  BehavioralIndicator,
} from "@/types/domain";
import {
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Activity,
  Target,
  Clock,
  Settings2,
} from "lucide-react";
import {
  approvalStatusToColor,
  competencyCategoryToIcon,
  competencyProficiencyLevelToColor,
} from "@/lib/ui-utils";
import EntitiesTable from "@/components/data-display/Table";
import CompetencyDrawer from "./CompetencyDrawer";

interface CompetenciesTableProps {
  competencies: Competency[];
}

export default function CompetenciesTable({ competencies }: CompetenciesTableProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCompetency, setSelectedCompetency] =
    useState<Competency | null>(null);

  const handleViewDetails = (competency: Competency) => {
    setSelectedCompetency(competency);
    setIsDrawerOpen(true);
  };

  const columns: ColumnDef<Competency>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Competency
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-base">
                {competencyCategoryToIcon(category)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-medium text-primary hover:underline block truncate"
              >
                {row.getValue("name")}
              </div>
              <p className="max-w-xs text-xs text-muted-foreground truncate mt-0.5">
                {row.original.description}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const category = row.getValue("category") as CompetencyCategory;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">
              {category.toLowerCase().replace("_", " ")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "level",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const level = row.getValue("level") as ProficiencyLevel;
        return (
          <Badge
            variant="outline"
            className={competencyProficiencyLevelToColor(level)}
          >
            {level}
          </Badge>
        );
      },
    },
    {
      accessorKey: "behavioralIndicators",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Indicators
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const indicators = row.getValue(
          "behavioralIndicators"
        ) as BehavioralIndicator[];
        return (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{indicators?.length || 0}</span>
          </div>
        );
      },
    },
    // ... other columns can be added here following the same pattern
    {
      id: "actions",
      cell: ({ row }) => {
        const competency = row.original;
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
                onClick={() => navigator.clipboard.writeText(competency.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetails(competency)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Competency
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <EntitiesTable
        columns={columns}
        data={competencies}
        onRowClick={handleViewDetails}
      />
      {selectedCompetency && (
        <CompetencyDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          competency={selectedCompetency}
        />
      )}
    </>
  );
}