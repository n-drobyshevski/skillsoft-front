'use client';

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  GripVertical, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Users,
  MessageSquare,
  TrendingUp,
  Heart,
  Lightbulb,
  Clock,
  Target,
  Package
} from 'lucide-react';
import { HealthStatus, fetchInventoryHeatmapAction } from '../actions';
import { cn } from '@/lib/utils';

interface LibraryCompetency {
  id: string;
  name: string;
  category: string;
  description: string;
  questionCount: number;
  health: HealthStatus;
}

interface CompetencyLibraryProps {
  competencies: LibraryCompetency[];
  selectedIds: string[];
}

/**
 * Modern Health Status Indicator - Compact pill design with dark mode
 */
function HealthIndicator({ health }: { health: HealthStatus }) {
  const config = {
    CRITICAL: {
      icon: AlertCircle,
      label: 'Low',
      className: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    },
    MODERATE: {
      icon: AlertTriangle,
      label: 'Med',
      className: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    HEALTHY: {
      icon: CheckCircle2,
      label: 'OK',
      className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
  };

  const { icon: Icon, className } = config[health];

  return (
    <div className={cn(
      "flex items-center justify-center w-5 h-5 rounded-full border",
      className
    )}>
      <Icon className="h-3 w-3" />
    </div>
  );
}

/**
 * Category Icon component - Compact sizing
 */
function CategoryIcon({ category }: { category: string }) {
  const iconMap: Record<string, React.ElementType> = {
    'COGNITIVE': Brain,
    'INTERPERSONAL': Users,
    'COMMUNICATION': MessageSquare,
    'LEADERSHIP': TrendingUp,
    'EMOTIONAL_INTELLIGENCE': Heart,
    'ADAPTABILITY': Lightbulb,
    'TIME_MANAGEMENT': Clock,
    'CRITICAL_THINKING': Target,
    'COLLABORATION': Users,
  };
  const Icon = iconMap[category] ?? Brain;
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

/**
 * Compact Competency item - Optimized for narrow sidebar
 */
function CompetencyItem({ 
  competency, 
  isSelected,
  onDragStart,
}: { 
  competency: LibraryCompetency; 
  isSelected: boolean;
  onDragStart: (e: React.DragEvent, competency: LibraryCompetency) => void;
}) {
  const isCritical = competency.health === 'CRITICAL';

  return (
    <div 
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg border transition-all duration-150",
        "cursor-grab active:cursor-grabbing hover:bg-muted/50",
        "border-l-2",
        competency.health === 'CRITICAL' && "border-l-red-500 dark:border-l-red-400",
        competency.health === 'MODERATE' && "border-l-amber-500 dark:border-l-amber-400",
        competency.health === 'HEALTHY' && "border-l-emerald-500 dark:border-l-emerald-400",
        isSelected && "ring-1 ring-primary/50 bg-primary/5",
        isCritical && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
      draggable={!isCritical}
      onDragStart={(e) => !isCritical && onDragStart(e, competency)}
    >
      {/* Drag Handle - shows on hover */}
      <GripVertical className={cn(
        "h-3.5 w-3.5 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
        isCritical && "hidden"
      )} />
      
      {/* Category Icon */}
      <CategoryIcon category={competency.category} />
      
      {/* Content - Compact layout */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {competency.name}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {competency.category.replace(/_/g, ' ')}
        </p>
      </div>
      
      {/* Health Status */}
      <HealthIndicator health={competency.health} />
    </div>
  );
}

/**
 * Competency Library Component
 * 
 * Modern, airy design with:
 * - Spacious search header
 * - Grouped competencies with category headers
 * - Drag-and-drop to editor
 * - Inventory health status display
 */
export default function CompetencyLibrary({ 
  competencies: initialCompetencies, 
  selectedIds 
}: CompetencyLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [competencies, setCompetencies] = useState(initialCompetencies);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  // Fetch inventory heatmap on mount
  useEffect(() => {
    async function loadHeatmap() {
      setIsLoadingHealth(true);
      try {
        const result = await fetchInventoryHeatmapAction();
        if (result.success) {
          // Update competencies with real health status
          setCompetencies(prev => 
            prev.map(c => ({
              ...c,
              health: result.data.competencyHealth[c.id] || 'HEALTHY',
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load inventory heatmap:', error);
      } finally {
        setIsLoadingHealth(false);
      }
    }
    loadHeatmap();
  }, []);

  // Filter competencies by search
  const filteredCompetencies = competencies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const groupedCompetencies = filteredCompetencies.reduce((acc, comp) => {
    const category = comp.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(comp);
    return acc;
  }, {} as Record<string, LibraryCompetency[]>);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, competency: LibraryCompetency) => {
    e.dataTransfer.setData('application/json', JSON.stringify(competency));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Compact Search Header */}
      <div className="p-3 space-y-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Package className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm leading-tight">Library</h2>
            <p className="text-[10px] text-muted-foreground">Drag to canvas</p>
          </div>
          <span className="text-[10px] px-1.5 h-5 inline-flex items-center rounded bg-muted text-muted-foreground font-medium">
            {competencies.length}
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm rounded-lg bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Compact Competency List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {isLoadingHealth ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : Object.entries(groupedCompetencies).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No results</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try a different search
              </p>
            </div>
          ) : (
            Object.entries(groupedCompetencies).map(([category, comps]) => (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-1">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                    {category.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-[10px] text-muted-foreground/60">
                    ({comps.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {comps.map(comp => (
                    <CompetencyItem
                      key={comp.id}
                      competency={comp}
                      isSelected={selectedIds.includes(comp.id)}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Compact Stats Footer */}
      <div className="px-3 py-2 border-t bg-background">
        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
          <span>{selectedIds.length} selected</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
