'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Target
} from 'lucide-react';
import { HealthStatus, fetchInventoryHeatmapAction, InventoryHeatmap } from '../actions';
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
 * Get icon for competency category
 */
function getCategoryIcon(category: string) {
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
  return iconMap[category] || Brain;
}

/**
 * Get health status indicator
 */
function HealthIndicator({ health }: { health: HealthStatus }) {
  switch (health) {
    case 'CRITICAL':
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-xs">Critical</span>
        </div>
      );
    case 'MODERATE':
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-xs">Low</span>
        </div>
      );
    case 'HEALTHY':
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="text-xs">Ready</span>
        </div>
      );
  }
}

/**
 * Get border color based on health status
 */
function getHealthBorderClass(health: HealthStatus): string {
  switch (health) {
    case 'CRITICAL':
      return 'border-l-4 border-l-red-500';
    case 'MODERATE':
      return 'border-l-4 border-l-yellow-500';
    case 'HEALTHY':
      return 'border-l-4 border-l-green-500';
  }
}

/**
 * Competency item card - draggable
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
  const Icon = getCategoryIcon(competency.category);
  const isCritical = competency.health === 'CRITICAL';

  return (
    <Card 
      className={cn(
        "transition-all cursor-grab active:cursor-grabbing hover:shadow-md",
        getHealthBorderClass(competency.health),
        isSelected && "ring-2 ring-primary bg-primary/5",
        isCritical && "opacity-60 cursor-not-allowed"
      )}
      draggable={!isCritical}
      onDragStart={(e) => !isCritical && onDragStart(e, competency)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {!isCritical && (
            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-sm truncate">{competency.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {competency.category.replace('_', ' ')}
              </Badge>
              <HealthIndicator health={competency.health} />
            </div>
            {isCritical && (
              <p className="text-xs text-red-600 mt-1.5">
                Not enough questions
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Competency Library Component
 * 
 * Server-rendered list with client-side interactivity for:
 * - Search filtering
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
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-3">Competency Library</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search competencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Competency List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoadingHealth ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))
          ) : Object.entries(groupedCompetencies).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No competencies found
            </p>
          ) : (
            Object.entries(groupedCompetencies).map(([category, comps]) => (
              <div key={category}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  {category.replace('_', ' ')} ({comps.length})
                </h3>
                <div className="space-y-2">
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

      {/* Stats Footer */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{competencies.length} total</span>
          <span>{selectedIds.length} selected</span>
        </div>
      </div>
    </div>
  );
}
