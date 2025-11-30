'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { competenciesApi } from '@/services/api';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/src/components/ui/hover-card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { 
  ExternalLink, 
  Users, 
  Target, 
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { levelToColor, approvalStatusToColor } from '@/lib/ui-utils';
import type { Competency } from '@/types/domain';

interface CompetencyHoverCardProps {
  competencyId: string;
  children: React.ReactNode;
}

export function CompetencyHoverCard({ competencyId, children }: CompetencyHoverCardProps) {
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetencyData = async () => {
    if (competency) return; // Don't refetch if already loaded
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await competenciesApi.getCompetencyById(competencyId);
      setCompetency(data);
    } catch {
      setError('Failed to load competency details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild onMouseEnter={fetchCompetencyData}>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0" side="top" align="start">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading competency...</span>
          </div>
        ) : error ? (
          <div className="p-4 flex items-center">
            <AlertCircle className="h-4 w-4 text-destructive mr-2" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        ) : competency ? (
          <div className="space-y-0">
            {/* Header */}
            <div className="p-4 pb-3 border-b">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                    {competency.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={levelToColor(competency.level)}>
                      {competency.level}
                    </Badge>
                    <Badge variant={competency.isActive ? "default" : "secondary"}>
                      {competency.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className={approvalStatusToColor(competency.approvalStatus)}>
                      {competency.approvalStatus.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <Link href={`/competencies/${competency.id}`} className="shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Description */}
            {competency.description && (
              <div className="p-4 py-3 border-b">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {competency.description}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="p-4 py-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{competency.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Indicators:</span>
                  <span className="font-medium">
                    {competency.behavioralIndicators?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">v{competency.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${competency.isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {competency.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 pt-0">
              <Link href={`/competencies/${competency.id}`}>
                <Button size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  View Full Details
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No competency data available
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}