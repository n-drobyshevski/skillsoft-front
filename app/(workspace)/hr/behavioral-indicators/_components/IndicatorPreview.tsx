
'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BehavioralIndicator, Competency } from "@/types/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Sparkles, 
  Layers, 
  FileText, 
  Building2, 
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Scale,
  Gauge
} from "lucide-react";
import { competenciesApi } from "@/services/api";

export default function IndicatorPreview({ indicator }: { indicator: BehavioralIndicator }) {
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [isLoadingCompetency, setIsLoadingCompetency] = useState(false);

  useEffect(() => {
    const fetchCompetency = async () => {
      if (!indicator.competencyId) return;
      
      setIsLoadingCompetency(true);
      try {
        const competencyData = await competenciesApi.getCompetencyById(indicator.competencyId);
        setCompetency(competencyData);
      } catch {
        setCompetency(null);
      } finally {
        setIsLoadingCompetency(false);
      }
    };

    fetchCompetency();
  }, [indicator.competencyId]);

  return (
    <div className="rounded-xl border bg-linear-to-br from-card to-muted/30 shadow-sm overflow-hidden">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>Live Preview</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">Auto-updating</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-5 space-y-5">
        {/* Title & Status */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight leading-tight">
            {indicator.title || <span className="text-muted-foreground italic">Indicator title...</span>}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={indicator.isActive ? "default" : "secondary"} className="font-medium">
              <Sparkles className="h-3 w-3 mr-1" />
              {indicator.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className="font-normal">
              <Layers className="h-3 w-3 mr-1" />
              {indicator.observabilityLevel}
            </Badge>
            {indicator.measurementType && (
              <Badge variant="outline" className="font-normal bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                <Gauge className="h-3 w-3 mr-1" />
                {indicator.measurementType.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>

        {/* Parent Competency */}
        {(isLoadingCompetency || competency) && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/40 border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Parent Competency
            </div>
            {isLoadingCompetency ? (
              <div className="space-y-2 pl-6">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ) : competency ? (
              <div className="flex items-center justify-between pl-6">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{competency.name}</p>
                  <div className="flex gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-xs h-5">{competency.category}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" asChild>
                  <Link href={`/hr/competencies/${competency.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Weight Display */}
        {indicator.weight !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Weight</span>
            </div>
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              {(indicator.weight * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Description
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed pl-6">
            {indicator.description || <span className="text-muted-foreground italic">No description yet...</span>}
          </p>
        </div>

        {/* Examples */}
        {(indicator.examples || indicator.counterExamples) && (
          <div className="grid gap-3">
            {indicator.examples && (
              <div className="space-y-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                  <ThumbsUp className="h-4 w-4" />
                  Positive Examples
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 pl-6 leading-relaxed">
                  {indicator.examples}
                </p>
              </div>
            )}
            {indicator.counterExamples && (
              <div className="space-y-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
                  <ThumbsDown className="h-4 w-4" />
                  Counter Examples
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 pl-6 leading-relaxed">
                  {indicator.counterExamples}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Approval Status */}
        {indicator.approvalStatus && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Approval Status</span>
              <Badge 
                variant="outline" 
                className={`font-normal ${
                  indicator.approvalStatus === 'APPROVED' 
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                    : indicator.approvalStatus === 'PENDING_REVIEW'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800'
                }`}
              >
                {indicator.approvalStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
