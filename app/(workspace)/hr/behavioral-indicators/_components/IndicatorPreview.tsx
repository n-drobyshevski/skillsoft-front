
'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BehavioralIndicator, Competency } from "@/app/interfaces/domain-interfaces";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ExternalLink } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {indicator.title}
        </CardTitle>
        <CardDescription className="text-base">
          Live preview of the behavioral indicator.
        </CardDescription>
        <div className="flex items-center justify-start gap-2 pt-4">
          <Badge variant={indicator.isActive ? "default" : "secondary"}>
            {indicator.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant="outline"
          >
            {indicator.observabilityLevel}
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-6 space-y-6">
        {/* Competency Information Section */}
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            Associated Competency
          </h3>
          {isLoadingCompetency ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ) : competency ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {competency.name}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {competency.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {competency.level}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" asChild>
                  <Link href={`/competencies/${competency.id}`}>
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">View competency details</span>
                  </Link>
                </Button>
              </div>
              {competency.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {competency.description}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Failed to load competency information
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium">Description</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {indicator.description || "No description provided."}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Examples</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {indicator.examples || "No examples provided yet."}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Counter Examples</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {indicator.counterExamples || "No counter examples provided yet."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
