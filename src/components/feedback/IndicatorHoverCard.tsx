'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { behavioralIndicatorsApi } from '@/services/api';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  Target, 
  Weight,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { biLevelToColor, approvalStatusToColor } from '@/app/utils';
import type { BehavioralIndicator } from '@/app/interfaces/domain-interfaces';

interface IndicatorHoverCardProps {
  indicatorId: string;
  children: React.ReactNode;
}

export function IndicatorHoverCard({ indicatorId, children }: IndicatorHoverCardProps) {
  const [indicator, setIndicator] = useState<BehavioralIndicator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicatorData = async () => {
    if (indicator) return; // Don't refetch if already loaded
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await behavioralIndicatorsApi.getIndicatorById(indicatorId);
      setIndicator(data);
    } catch {
      setError('Failed to load indicator details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild onMouseEnter={fetchIndicatorData}>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0" side="top" align="start">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading indicator...</span>
          </div>
        ) : error ? (
          <div className="p-4 flex items-center">
            <AlertCircle className="h-4 w-4 text-destructive mr-2" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        ) : indicator ? (
          <div className="space-y-0">
            {/* Header */}
            <div className="p-4 pb-3 border-b">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                    {indicator.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={biLevelToColor(indicator.observabilityLevel)}>
                      {indicator.observabilityLevel}
                    </Badge>
                    <Badge variant={indicator.isActive ? "default" : "secondary"}>
                      {indicator.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className={approvalStatusToColor(indicator.approvalStatus)}>
                      {indicator.approvalStatus.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <Link href={`/behavioral-indicators/${indicator.id}`} className="shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Description */}
            {indicator.description && (
              <div className="p-4 py-3 border-b">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {indicator.description}
                </p>
              </div>
            )}

            {/* Examples */}
            {(indicator.examples || indicator.counterExamples) && (
              <div className="p-4 py-3 border-b">
                {indicator.examples && (
                  <div className="mb-2">
                    <h5 className="text-xs font-medium text-emerald-600 mb-1">Examples:</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {indicator.examples}
                    </p>
                  </div>
                )}
                {indicator.counterExamples && (
                  <div>
                    <h5 className="text-xs font-medium text-red-600 mb-1">Counter Examples:</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {indicator.counterExamples}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="p-4 py-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Weight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{indicator.weight}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{indicator.measurementType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Order:</span>
                  <span className="font-medium">#{indicator.orderIndex}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${indicator.isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {indicator.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 pt-0">
              <Link href={`/behavioral-indicators/${indicator.id}`}>
                <Button size="sm" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  View Full Details
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No indicator data available
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}