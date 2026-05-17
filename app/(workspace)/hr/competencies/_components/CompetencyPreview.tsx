'use client';

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Competency, BigFiveInfo, getEffectiveBigFive, getEffectiveDimension } from "@/types/domain";
import type { BigFiveDimension } from "@/types/domain";
import { Eye, Sparkles, Tag, Layers, FileText, Globe2, Briefcase, Globe, Brain, Lightbulb, Shield, Users, Heart, Smile, Info } from "lucide-react";
import { getBigFiveMapping } from "@/hooks/useBigFiveMapper";
import { useTranslations } from "next-intl";

// Big Five dimension icons mapping
const BigFiveIcons: Record<BigFiveDimension, React.ElementType> = {
  OPENNESS: Lightbulb,
  CONSCIENTIOUSNESS: Shield,
  EXTRAVERSION: Users,
  AGREEABLENESS: Heart,
  EMOTIONAL_STABILITY: Smile,
};

// Big Five color classes
const BigFiveColorClasses: Record<BigFiveDimension, { bg: string; border: string; text: string; icon: string }> = {
  OPENNESS: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-900 dark:text-purple-100',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  CONSCIENTIOUSNESS: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
    icon: 'text-green-600 dark:text-green-400',
  },
  EXTRAVERSION: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-100',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  AGREEABLENESS: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  EMOTIONAL_STABILITY: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-200 dark:border-teal-800',
    text: 'text-teal-900 dark:text-teal-100',
    icon: 'text-teal-600 dark:text-teal-400',
  },
};

export default function CompetencyPreview({ competency }: { competency: Competency }) {
  const t = useTranslations("competency");

  return (
    <div className="rounded-xl border bg-linear-to-br from-card to-muted/30 shadow-sm overflow-hidden">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>{t("livePreview")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">{t("autoUpdating")}</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-5 space-y-5">
        {/* Title & Status */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight leading-tight">
            {competency.name || <span className="text-muted-foreground italic">{t("competencyName")}</span>}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={competency.isActive ? "default" : "secondary"} className="font-medium">
              <Sparkles className="h-3 w-3 mr-1" />
              {competency.isActive ? t("active") : t("inactive")}
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
            {t("description")}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed pl-6">
            {competency.description || <span className="text-muted-foreground italic">{t("noDescriptionYet")}</span>}
          </p>
        </div>

        {/* Approval Status */}
        {competency.approvalStatus && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("approvalStatus")}</span>
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

        {/* Standard Codes Mapping */}
        {(competency.standardCodes?.onetRef || competency.standardCodes?.escoRef || competency.standardCodes?.bigFiveRef) && (
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe2 className="h-4 w-4" />
              {t("standardsMapping")}
            </div>
            <div className="space-y-2 pl-6">
              {competency.standardCodes.onetRef && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-200 dark:bg-orange-950/40 dark:border-orange-800">
                  <Briefcase className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                        O*NET
                      </Badge>
                      <span className="text-[11px] font-mono text-orange-700 dark:text-orange-300">
                        {competency.standardCodes.onetRef.code}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mt-1 truncate">
                      {competency.standardCodes.onetRef.title || 'Untitled'}
                    </p>
                    {competency.standardCodes.onetRef.elementType && (
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5 capitalize">
                        {competency.standardCodes.onetRef.elementType.replace(/_/g, ' ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {competency.standardCodes.escoRef && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
                  <Globe className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                        ESCO
                      </Badge>
                      <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300 truncate max-w-[180px]">
                        {competency.standardCodes.escoRef.uri?.split('/').pop() || 'URI'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-1 truncate">
                      {competency.standardCodes.escoRef.title || 'ESCO Skill'}
                    </p>
                    {competency.standardCodes.escoRef.skillType && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 capitalize">
                        {competency.standardCodes.escoRef.skillType}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Big Five - stored or computed from O*NET */}
              {(() => {
                // Get stored Big Five
                const storedBigFive = competency.standardCodes?.bigFiveRef 
                  ? getEffectiveBigFive(competency.standardCodes.bigFiveRef) 
                  : null;
                const storedFacet = competency.standardCodes?.bigFiveRef 
                  ? getEffectiveDimension(competency.standardCodes.bigFiveRef) 
                  : null;
                
                // Compute from O*NET if not stored
                const computedMapping = !storedBigFive && competency.standardCodes?.onetRef?.code
                  ? getBigFiveMapping(competency.standardCodes.onetRef.code)
                  : null;
                
                const bigFive = storedBigFive || (computedMapping?.bigFive ?? null);
                const facet = storedFacet || (computedMapping?.facet ?? null);
                const isComputed = !storedBigFive && !!computedMapping?.bigFive;
                
                if (bigFive) {
                  const Icon = BigFiveIcons[bigFive];
                  const colors = BigFiveColorClasses[bigFive];
                  const info = BigFiveInfo[bigFive];
                  
                  return (
                    <div className={`flex items-start gap-2 p-2.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <Icon className={`h-4 w-4 mt-0.5 ${colors.icon} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${colors.bg} ${colors.text.replace('900', '800').replace('100', '200')}`}>
                            Big Five
                          </Badge>
                          {isComputed && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 gap-0.5">
                              <Info className="w-2.5 h-2.5" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm font-medium ${colors.text} mt-1`}>
                          {info.displayName}
                        </p>
                        {facet && (
                          <p className={`text-[11px] ${colors.icon} mt-0.5 capitalize`}>
                            {facet.replace(/_/g, ' ')}
                          </p>
                        )}
                        <p className={`text-[10px] ${colors.icon} mt-1 opacity-80`}>
                          {info.description}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                // Fallback for when bigFiveRef exists but trait is not extracted
                if (competency.standardCodes?.bigFiveRef) {
                  return (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800">
                      <Brain className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                            Big Five
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mt-1 truncate capitalize">
                          {competency.standardCodes.bigFiveRef.title || 'Big Five Trait'}
                        </p>
                        {competency.standardCodes.bigFiveRef.facet && (
                          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5 capitalize">
                            {competency.standardCodes.bigFiveRef.facet.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
                
                return null;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
