"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

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
import EntityTable from "@/components/data-display/Table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Settings2,
  Eye,
} from "lucide-react";
import { BehavioralIndicator } from "@/types/domain";
import { biLevelToColor } from "@/lib/ui-utils";
import IndicatorDrawer from "./IndicatorDrawer";
import { CompetencyHoverCard } from "../[indicatorId]/_components/CompetencyHoverCard";

interface EnrichedIndicator extends BehavioralIndicator {
  competencyName: string;
  questionCount: number;
}

interface IndicatorsTableProps {
  indicators: EnrichedIndicator[];
}

export default function IndicatorsTable({ indicators }: IndicatorsTableProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] =
    useState<BehavioralIndicator | null>(null);

  const handleViewDetails = (indicator: BehavioralIndicator) => {
    setSelectedIndicator(indicator);
    setIsDrawerOpen(true);
  };

  const columns: ColumnDef<EnrichedIndicator>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
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
      cell: ({ row }) => (
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CompetencyHoverCard competencyId={row.original.competencyId}>
            <Link
              href={`/hr/competencies/${row.original.competencyId}`}
              className="text-primary hover:underline"
            >
              {row.original.competencyName}
            </Link>
          </CompetencyHoverCard>
        </div>
      ),
      sortingFn: (a, b) =>
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
      cell: ({ row }) => {
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

  return (
    <>
      <EntityTable
        columns={columns}
        data={indicators}
        onRowClick={handleViewDetails}
      />
      {selectedIndicator && (
        <IndicatorDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          indicator={selectedIndicator}
        />
      )}
    </>
  );
}