'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  BookOpen,
  Video,
  GraduationCap,
  Users,
  Lightbulb,
  ExternalLink,
  AlertTriangle,
  ArrowUp,
} from 'lucide-react';
import type {
  DevelopmentRecommendationsProps,
  DevelopmentRecommendation,
  RecommendationPriority,
  ResourceType,
} from '@/types/results';

// Priority Configuration

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  critical: {
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
    icon: AlertTriangle,
  },
  high: {
    label: 'High',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    icon: ArrowUp,
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    icon: Target,
  },
  low: {
    label: 'Low',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-border',
    icon: Lightbulb,
  },
};

// Resource Type Icons

const RESOURCE_ICONS: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
  course: GraduationCap,
  book: BookOpen,
  article: BookOpen,
  video: Video,
  workshop: Users,
  mentoring: Users,
  practice: Target,
  assessment: Target,
};

// Recommendation Card Component

interface RecommendationCardProps {
  recommendation: DevelopmentRecommendation;
  showPriority?: boolean;
  showEstimatedTime?: boolean;
  showResources?: boolean;
  compact?: boolean;
  onClick?: (rec: DevelopmentRecommendation) => void;
  index?: number;
  animate?: boolean;
}

export function RecommendationCard({
  recommendation,
  showPriority = true,
  showEstimatedTime = true,
  showResources = true,
  compact = false,
  onClick,
  index = 0,
  animate = true,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const priorityConfig = PRIORITY_CONFIG[recommendation.priority];
  const PriorityIcon = priorityConfig.icon;

  // Progress percentage from current to target
  const progressPercent = Math.round(
    (recommendation.currentScore / recommendation.targetScore) * 100
  );

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card
          className={cn(
            'border transition-all overflow-hidden',
            priorityConfig.bgColor,
            onClick && 'cursor-pointer hover:shadow-md'
          )}
          onClick={() => onClick?.(recommendation)}
        >
          <CollapsibleTrigger asChild>
            <CardHeader
              className={cn(
                'cursor-pointer hover:bg-muted/30 transition-colors',
                compact ? 'py-3 px-4' : 'py-4 px-4 sm:px-6'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Priority indicator */}
                {showPriority && (
                  <div className={cn('p-1.5 rounded-lg shrink-0', priorityConfig.bgColor)}>
                    <PriorityIcon className={cn('w-4 h-4', priorityConfig.color)} />
                  </div>
                )}

                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle
                      className={cn(
                        'font-semibold truncate',
                        compact ? 'text-sm' : 'text-base'
                      )}
                    >
                      {recommendation.competencyName}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] shrink-0', priorityConfig.color)}
                    >
                      {priorityConfig.label}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {Math.round(recommendation.currentScore)}%
                        <span className="mx-1">→</span>
                        {Math.round(recommendation.targetScore)}%
                      </span>
                      {showEstimatedTime && recommendation.estimatedHours && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {recommendation.estimatedHours}h
                        </span>
                      )}
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>

                  {/* Title preview */}
                  {!compact && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {recommendation.title}
                    </p>
                  )}
                </div>

                {/* Expand chevron */}
                <div className="shrink-0 ml-2">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className={cn('pt-0 space-y-4', compact ? 'pb-3 px-4' : 'pb-4 px-4 sm:px-6')}>
              {/* Description */}
              <div className="pl-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recommendation.description}
                </p>
              </div>

              {/* Focus indicators */}
              {recommendation.focusIndicators && recommendation.focusIndicators.length > 0 && (
                <div className="pl-10 space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Focus Areas
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.focusIndicators.map((indicator, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {showResources &&
                recommendation.resources &&
                recommendation.resources.length > 0 && (
                  <div className="pl-10 space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Resources
                    </h5>
                    <div className="space-y-1.5">
                      {recommendation.resources.slice(0, 3).map((resource, idx) => {
                        const ResourceIcon = RESOURCE_ICONS[resource.type];
                        return (
                          <div
                            key={idx}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-lg bg-background/50',
                              'hover:bg-background transition-colors',
                              resource.url && 'cursor-pointer'
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (resource.url) {
                                window.open(resource.url, '_blank');
                              }
                            }}
                          >
                            <ResourceIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {resource.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {resource.provider && <span>{resource.provider}</span>}
                                {resource.durationMinutes && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {resource.durationMinutes}min
                                  </span>
                                )}
                                {resource.isFree && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                                    Free
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {resource.url && (
                              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Success metrics */}
              {recommendation.successMetrics && recommendation.successMetrics.length > 0 && (
                <div className="pl-10 space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Success Metrics
                  </h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {recommendation.successMetrics.map((metric, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Target className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}

// Main Component

export function DevelopmentRecommendations({
  recommendations,
  initialCount = 3,
  showPriority = true,
  showEstimatedTime = true,
  showResources = true,
  groupByPriority = false,
  compact,
  onRecommendationClick,
  className,
}: DevelopmentRecommendationsProps) {
  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState(false);

  // Auto-detect compact mode
  const isCompact = compact ?? isMobile;

  // Sort recommendations by priority
  const priorityOrder: Record<RecommendationPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // Group by priority if requested
  const groupedRecommendations = (() => {
    if (!groupByPriority) return null;

    const groups: Record<RecommendationPriority, DevelopmentRecommendation[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    sortedRecommendations.forEach((rec) => {
      groups[rec.priority].push(rec);
    });

    return groups;
  })();

  // Visible recommendations
  const visibleRecommendations = showAll
    ? sortedRecommendations
    : sortedRecommendations.slice(0, initialCount);

  const hasMore = recommendations.length > initialCount;

  // Calculate total estimated hours
  const totalHours = recommendations.reduce(
    (sum, rec) => sum + (rec.estimatedHours ?? 0),
    0
  );

  if (recommendations.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="py-8 text-center">
          <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No development recommendations at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base sm:text-lg">
            Development Plan
          </h3>
          <Badge variant="secondary" className="text-xs">
            {recommendations.length} areas
          </Badge>
        </div>
        {totalHours > 0 && showEstimatedTime && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            ~{totalHours}h total
          </div>
        )}
      </div>

      {/* Recommendation list */}
      {groupByPriority && groupedRecommendations ? (
        // Grouped view
        <div className="space-y-6">
          {(Object.keys(PRIORITY_CONFIG) as RecommendationPriority[]).map((priority) => {
            const group = groupedRecommendations[priority];
            if (group.length === 0) return null;

            const config = PRIORITY_CONFIG[priority];
            return (
              <div key={priority} className="space-y-3">
                <div className="flex items-center gap-2">
                  <config.icon className={cn('w-4 h-4', config.color)} />
                  <span className={cn('text-sm font-semibold', config.color)}>
                    {config.label} Priority
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({group.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {group.map((rec, idx) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      showPriority={false}
                      showEstimatedTime={showEstimatedTime}
                      showResources={showResources}
                      compact={isCompact}
                      onClick={onRecommendationClick}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List view
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {visibleRecommendations.map((rec, idx) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                showPriority={showPriority}
                showEstimatedTime={showEstimatedTime}
                showResources={showResources}
                compact={isCompact}
                onClick={onRecommendationClick}
                index={idx}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Show more/less button */}
      {hasMore && !groupByPriority && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show {recommendations.length - initialCount} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default DevelopmentRecommendations;
