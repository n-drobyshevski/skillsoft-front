"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CompetencyCategory,
  ApprovalStatus,
  BigFiveInfo,
  getEffectiveBigFive,
} from "@/types/domain";
import type {
  Competency,
  BehavioralIndicator,
  StandardCodesDto,
  BigFiveDimension,
} from "@/types/domain";
import {
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Target,
  Settings2,
  Copy,
  ExternalLink,
  Layers,
  Briefcase,
  Globe,
  Brain,
} from "lucide-react";
import {
  approvalStatusToColor,
  competencyCategoryToIcon,
} from "@/lib/ui-utils";
import EntitiesTable from "@/components/data-display/Table";
import CompetencyDrawer from "./CompetencyDrawer";
import { useTranslations } from "next-intl";

// Helper component for standards badges
function StandardsBadges({ standardCodes }: { standardCodes?: StandardCodesDto }) {
  if (!standardCodes) return <span className="text-xs text-muted-foreground">—</span>;

  const hasOnet = !!standardCodes.onetRef;
  const hasEsco = !!standardCodes.escoRef;
  const bigFive = getEffectiveBigFive(standardCodes.bigFiveRef);

  if (!hasOnet && !hasEsco && !bigFive) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {hasOnet && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800 px-1.5 py-0.5 text-[10px] font-medium gap-1"
              >
                <Briefcase className="h-2.5 w-2.5" />
                O*NET
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">{standardCodes.onetRef?.title || 'O*NET Standard'}</p>
              <p className="text-xs text-muted-foreground">{standardCodes.onetRef?.code}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {hasEsco && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-1.5 py-0.5 text-[10px] font-medium gap-1"
              >
                <Globe className="h-2.5 w-2.5" />
                ESCO
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">{standardCodes.escoRef?.title || 'ESCO Standard'}</p>
              <p className="text-xs text-muted-foreground truncate">{standardCodes.escoRef?.uri}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {bigFive && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 px-1.5 py-0.5 text-[10px] font-medium gap-1"
              >
                <Brain className="h-2.5 w-2.5" />
                {bigFive.charAt(0)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="font-medium">{BigFiveInfo[bigFive]?.displayName}</p>
              <p className="text-xs text-muted-foreground">{BigFiveInfo[bigFive]?.description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

interface CompetenciesTableProps {
  competencies: Competency[];
}

export default function CompetenciesTable({ competencies }: CompetenciesTableProps) {
  const router = useRouter();
  const t = useTranslations("competency");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
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
              {t("title").slice(0, -3)}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
              {competencyCategoryToIcon(category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground block truncate">
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
          {t("category")}
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
      accessorKey: "standardCodes",
      header: () => (
        <div className="text-left pl-3">{t("standards")}</div>
      ),
      cell: ({ row }) => {
        const standardCodes = row.original.standardCodes;
        return <StandardsBadges standardCodes={standardCodes} />;
      },
    },
    {
      accessorKey: "behavioralIndicators",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("indicators")}
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
    // Action column - uses group-hover to show/hide the menu button
    {
      id: "actions",
      cell: ({ row }) => {
        const competency = row.original;
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
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">{tTable("actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(competency);
              }}>
                <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                {t("quickView")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                router.push(`/hr/competencies/${competency.id}`);
              }}>
                <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                {t("viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                router.push(`/hr/competencies/${competency.id}/edit`);
              }}>
                <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(competency.id);
                }}
                className="text-muted-foreground"
              >
                <Copy className="mr-2 h-4 w-4" />
                {tTable("copyId")}
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