'use client';

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Competency } from "@/types/domain";
import { Eye, Sparkles, Tag, Layers, FileText } from "lucide-react";

export default function CompetencyPreview({ competency }: { competency: Competency }) {
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
            {competency.name || <span className="text-muted-foreground italic">Competency name...</span>}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={competency.isActive ? "default" : "secondary"} className="font-medium">
              <Sparkles className="h-3 w-3 mr-1" />
              {competency.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className="font-normal">
              <Layers className="h-3 w-3 mr-1" />
              {competency.level}
            </Badge>
            {competency.category && (
              <Badge variant="outline" className="font-normal bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                <Tag className="h-3 w-3 mr-1" />
                {competency.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Description
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed pl-6">
            {competency.description || <span className="text-muted-foreground italic">No description yet...</span>}
          </p>
        </div>

        {/* Approval Status */}
        {competency.approvalStatus && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Approval Status</span>
              <Badge 
                variant="outline" 
                className={`font-normal ${
                  competency.approvalStatus === 'APPROVED' 
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                    : competency.approvalStatus === 'PENDING_REVIEW'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800'
                }`}
              >
                {competency.approvalStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
