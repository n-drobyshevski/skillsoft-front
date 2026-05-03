"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

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
import EntityTable from "@/components/data-display/Table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Settings2,
  Copy,
  ExternalLink,
  Layers,
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
  const router = useRouter();
  const t = useTranslations("indicator");
  const tEnum = useTranslations("enums.observabilityLevel");
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
      meta: { label: t("columns.title") },
      header: ({ column }) => {
        return (
          <div className="text-left">
            <Button
              variant="link"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              size="sm"
              className="-ml-4 text-muted-foreground"
            >
              {t("columns.title")}
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
      meta: { label: t("columns.competency") },
      header: ({ column }) => (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("columns.competency")}
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
      meta: { label: t("columns.questions") },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("columns.questions")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return <span>{row.original.questionCount ?? 0}</span>;
      },
    },
    {
      accessorKey: "observabilityLevel",
      meta: { label: t("columns.level") },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("columns.level")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const level = row.getValue("observabilityLevel") as string;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={biLevelToColor(level)}>
                {tEnum(level)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {tEnum(`${level}_DESC`)}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "weight",
      meta: { label: t("columns.weight") },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("columns.weight")}
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
      meta: { label: t("columns.status") },
      header: t("columns.status"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? t("columns.active") : t("columns.inactive")}
          </Badge>
        );
      },
    },
    // Action column - uses group-hover to show/hide the menu button
    {
      id: "actions",
      meta: { label: t("columns.actions") },
      cell: ({ row }) => {
        const indicator = row.original;
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
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">{t("actions.label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(indicator);
              }}>
                <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                {t("actions.quickView")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                router.push(`/hr/behavioral-indicators/${indicator.id}`);
              }}>
                <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                {t("actions.viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                router.push(`/hr/behavioral-indicators/${indicator.id}/edit`);
              }}>
                <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
                {t("actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(indicator.id);
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