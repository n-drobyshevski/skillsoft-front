"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Competency, BigFiveInfo, getEffectiveBigFive, getEffectiveDimension } from "@/types/domain";
import type { BigFiveDimension } from "@/types/domain";
import { approvalStatusToColor } from "@/lib/ui-utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { getBigFiveMapping } from "@/hooks/useBigFiveMapper";
import {
  Trash2,
  Layers,
  FileText,
  Activity,
  ChevronRight,
  Pencil,
  Globe2,
  Briefcase,
  Globe,
  Lightbulb,
  Shield,
  Users,
  Heart,
  Smile,
  Info,
} from "lucide-react";
import { IndicatorHoverCard } from "@/components/feedback/IndicatorHoverCard";
import { DeleteConfirmationDialog } from "@/components/feedback/DeleteConfirmationDialog";
import { deleteCompetency } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Big Five dimension icons mapping
const BigFiveIcons: Record<BigFiveDimension, React.ElementType> = {
  OPENNESS: Lightbulb,
  CONSCIENTIOUSNESS: Shield,
  EXTRAVERSION: Users,
  AGREEABLENESS: Heart,
  EMOTIONAL_STABILITY: Smile,
};

export default function CompetencyDrawer({
  open,
  onOpenChange,
  competency,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  competency: Competency;
}) {
  const router = useRouter();
  const t = useTranslations("competency");
  const tCommon = useTranslations("common");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCompetency(competency.id);
      toast.success(t('deletedSuccess'));
      onOpenChange(false);
    } catch {
      toast.error(t('deleteFailed'));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={`${
          isMobile
            ? "w-full max-w-full sm:max-w-full"
            : "sm:max-w-lg"
        } p-0 flex flex-col gap-0 border-l border-border/50`}
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Clean Header */}
        <div className={`${isMobile ? "px-4 py-3" : "px-5 py-4"} border-b border-border/40`}>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex-1 min-w-0 space-y-1">
              <SheetTitle className="text-base font-semibold leading-tight line-clamp-2 text-foreground">
                {competency.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {t("overview")}
              </SheetDescription>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            <Badge
              variant={competency.isActive ? "default" : "secondary"}
              className="h-5 text-[11px] px-1.5 font-medium"
            >
              {competency.isActive ? t("active") : t("inactive")}
            </Badge>
            <Badge
              variant="outline"
              className={`${approvalStatusToColor(competency.approvalStatus)} h-5 text-[11px] px-1.5 font-medium`}
            >
              {competency.approvalStatus.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "px-4 py-4" : "px-5 py-5"} space-y-5`}>
            {/* Description Section */}
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <h3 className="text-xs font-medium uppercase tracking-wide">{t("description")}</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 pl-5">
                {competency.description}
              </p>
            </section>

            {/* Standards Mapping Section */}
            {(competency.standardCodes?.onetRef || competency.standardCodes?.escoRef || competency.standardCodes?.bigFiveRef) && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe2 className="h-3.5 w-3.5" />
                  <h3 className="text-xs font-medium uppercase tracking-wide">{t("standards")}</h3>
                </div>
                <div className="space-y-2 pl-5">
                  {/* O*NET */}
                  {competency.standardCodes?.onetRef && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                      <Briefcase className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="h-4 text-[9px] px-1 bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                            O*NET
                          </Badge>
                          <span className="text-[10px] font-mono text-orange-700 dark:text-orange-300">
                            {competency.standardCodes.onetRef.code}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mt-0.5 truncate">
                          {competency.standardCodes.onetRef.title || 'Untitled'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* ESCO */}
                  {competency.standardCodes?.escoRef && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="h-4 text-[9px] px-1 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                            ESCO
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mt-0.5 truncate">
                          {competency.standardCodes.escoRef.title || 'ESCO Skill'}
                        </p>
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
                    
                    if (!bigFive) return null;
                    
                    const Icon = BigFiveIcons[bigFive];
                    const info = BigFiveInfo[bigFive];
                    
                    // Color mapping for Big Five
                    const colorMap: Record<BigFiveDimension, { bg: string; border: string; badge: string; text: string; icon: string }> = {
                      OPENNESS: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200', text: 'text-purple-900 dark:text-purple-100', icon: 'text-purple-600 dark:text-purple-400' },
                      CONSCIENTIOUSNESS: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200', text: 'text-green-900 dark:text-green-100', icon: 'text-green-600 dark:text-green-400' },
                      EXTRAVERSION: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200', text: 'text-orange-900 dark:text-orange-100', icon: 'text-orange-600 dark:text-orange-400' },
                      AGREEABLENESS: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200', text: 'text-blue-900 dark:text-blue-100', icon: 'text-blue-600 dark:text-blue-400' },
                      EMOTIONAL_STABILITY: { bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800', badge: 'bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-200', text: 'text-teal-900 dark:text-teal-100', icon: 'text-teal-600 dark:text-teal-400' },
                    };
                    const colors = colorMap[bigFive];
                    
                    return (
                      <div className={`flex items-center gap-2 p-2 rounded-md ${colors.bg} border ${colors.border}`}>
                        <Icon className={`h-3.5 w-3.5 ${colors.icon} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="secondary" className={`h-4 text-[9px] px-1 ${colors.badge}`}>
                              Big Five
                            </Badge>
                            {isComputed && (
                              <Badge variant="secondary" className="h-4 text-[8px] px-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 gap-0.5">
                                <Info className="w-2 h-2" />
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className={`text-xs font-medium ${colors.text} mt-0.5`}>
                            {info.displayName}
                          </p>
                          {facet && (
                            <p className={`text-[10px] ${colors.icon} capitalize`}>
                              {facet.replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* Behavioral Indicators Section */}
            {competency.behavioralIndicators && competency.behavioralIndicators.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  <h3 className="text-xs font-medium uppercase tracking-wide">
                    {t("behavioralIndicators")}
                  </h3>
                  <Badge variant="secondary" className="h-4 text-[10px] px-1.5 ml-auto">
                    {competency.behavioralIndicators.length}
                  </Badge>
                </div>
                <Accordion type="single" collapsible className="space-y-1.5 pl-5">
                  {competency.behavioralIndicators.map((indicator) => (
                    <AccordionItem 
                      value={indicator.id} 
                      key={indicator.id}
                      className="border border-border/40 rounded-lg bg-muted/20 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="text-sm text-left hover:no-underline px-3 py-2.5 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-muted-foreground">
                        <IndicatorHoverCard indicatorId={indicator.id}>
                          <span className="hover:text-primary transition-colors line-clamp-1 text-foreground/90">
                            {indicator.title}
                          </span>
                        </IndicatorHoverCard>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="space-y-2.5 text-sm">
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {indicator.description}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <Badge variant="outline" className="h-5 text-[10px] px-1.5 text-muted-foreground">
                              Weight: {indicator.weight.toFixed(2)}
                            </Badge>
                            <button
                              onClick={() => handleNavigate(`/hr/behavioral-indicators/${indicator.id}`)}
                              className="text-xs text-primary/80 hover:text-primary flex items-center gap-1 transition-colors"
                            >
                              {t("viewDetails")}
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>
        </div>

        {/* Clean Footer */}
        <div className={`${isMobile ? "px-4 py-3" : "px-5 py-4"} border-t border-border/40 bg-muted/20`}>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-3 sm:px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 touch-manipulation"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {tCommon("delete")}
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate(`/hr/competencies/${competency.id}`)}
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-3 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              {tCommon("viewDetails")}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleNavigate(`/hr/competencies/${competency.id}/edit`)}
              className="h-10 sm:h-8 min-h-[44px] sm:min-h-0 px-4 sm:px-3 text-xs touch-manipulation"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {tCommon("edit")}
            </Button>
          </div>
        </div>
      </SheetContent>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescriptionIndicators")}
        entityName={competency.name}
        isDeleting={isDeleting}
        confirmButtonText={t("delete")}
      />
    </Sheet>
  );
}
