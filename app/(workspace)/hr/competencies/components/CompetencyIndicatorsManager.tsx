'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { BehavioralIndicator, Competency } from '@/app/interfaces/domain-interfaces';
import { behavioralIndicatorsApi } from '@/services/api';
import { 
  Search, 
  Plus, 
  ArrowUpDown, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Eye,
  Settings2,
  Users,
  Pencil,
  Target,
  PieChart,
  Edit3
} from 'lucide-react';

// Enhanced UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import IndicatorDrawer from '@/app/(workspace)/hr/behavioral-indicators/components/IndicatorDrawer';
import { WeightAdjustmentModal } from '@/app/(workspace)/hr/behavioral-indicators/components/WeightAdjustmentModal';
import Link from 'next/link';

// Constants
const PREVIEW_COMPETENCY_ID = 'preview-id';

// Enhanced Types
interface SortConfig {
  key: keyof BehavioralIndicator;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  observabilityLevel: string;
  search: string;
}

interface IndicatorStats {
  currentCompetency: number;
  otherCompetencies: number;
  unassigned: number;
  byObservabilityLevel: Record<string, number>;
  byActive: Record<string, number>;
}

// Shared styling constants
const DEFAULT_COLOR = 'border-border text-muted-foreground bg-muted/50';

const getLevelColor = (observabilityLevel: string) => {
  switch (observabilityLevel.toLowerCase()) {
    case 'foundational':
      return 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/50';
    case 'intermediate':
      return 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300 dark:bg-yellow-950/50';
    case 'advanced':
      return 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950/50';
    case 'expert':
      return 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-950/50';
    default:
      return DEFAULT_COLOR;
  }
};

// Enhanced Loading States
const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
    ))}
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    {Array.from({ length: 4 }, (_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-12" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Stats Cards Component
const StatsCards = ({ stats }: { stats: IndicatorStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">This Competency</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.currentCompetency}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Other Competencies</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.otherCompetencies}</p>
          </div>
          <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.unassigned}</p>
          </div>
          <Circle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">By Level</p>
          <div className="space-y-1">
            {Object.entries(stats.byObservabilityLevel).slice(0, 2).map(([level, count]) => (
              <div key={level} className="flex justify-between text-xs">
                <span className="capitalize">{level.toLowerCase()}</span>
                <span>{String(count)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Current Indicator Row Component
const CurrentIndicatorRow = React.memo(({ 
  indicator, 
  onView
}: {
  indicator: BehavioralIndicator;
  onView: (indicator: BehavioralIndicator) => void;
}) => {
  return (
    <TableRow 
      className="hover:bg-accent/30 transition-colors cursor-pointer group"
      onClick={() => onView(indicator)}
    >
      <TableCell className="max-w-md">
        <div className="space-y-2">
          <p className="font-medium text-sm leading-relaxed line-clamp-2">
            {indicator.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>ID: {indicator.id.slice(0, 8)}...</span>
            {indicator.orderIndex !== undefined && (
              <>
                <span>•</span>
                <span>Order: {indicator.orderIndex}</span>
              </>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {indicator.description}
        </p>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getLevelColor(indicator.observabilityLevel)}>
          {indicator.observabilityLevel}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm">{indicator.isActive ? 'Active' : 'Inactive'}</span>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-70 group-hover:opacity-100 transition-opacity">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(indicator)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/behavioral-indicators/${indicator.id}`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Indicator
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

CurrentIndicatorRow.displayName = 'CurrentIndicatorRow';

// Main Component
export function CompetencyIndicatorsManager({ 
  competency 
}: { 
  competency: Competency 
}) {
  // State Management
  const [allIndicators, setAllIndicators] = useState<BehavioralIndicator[]>([]);
  const [currentCompetencyIndicators, setCurrentCompetencyIndicators] = useState<BehavioralIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  
  // Filtering and sorting state
  const [currentFilters, setCurrentFilters] = useState<FilterConfig>({
    observabilityLevel: 'all',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'desc' });
  
  // Drawer and dialog state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<BehavioralIndicator | null>(null);
  
  // Weight adjustment state
  const [weightModalOpen, setWeightModalOpen] = useState(false);

  // Data fetching with enhanced error handling
  const fetchIndicators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Always fetch all indicators
      const allIndicatorsData = await behavioralIndicatorsApi.getAllIndicators();
      
      if (allIndicatorsData) {
        setAllIndicators(allIndicatorsData);
      }
      
      // Only fetch current competency indicators if it's not a preview
      if (competency.id !== PREVIEW_COMPETENCY_ID) {
        const currentIndicatorsData = await behavioralIndicatorsApi.getIndicators(competency.id);
        if (currentIndicatorsData) {
          setCurrentCompetencyIndicators(currentIndicatorsData);
        }
      } else {
        // For preview mode, use the indicators from the competency object (empty array)
        setCurrentCompetencyIndicators(competency.behavioralIndicators || []);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load indicators');
    } finally {
      setIsLoading(false);
    }
  }, [competency.id, competency.behavioralIndicators]);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  // Enhanced filtering and sorting with useMemo for performance
  const filteredCurrentIndicators = useMemo(() => {
    const filtered = currentCompetencyIndicators.filter(indicator => {
      // Search filter
      if (currentFilters.search && !indicator.title.toLowerCase().includes(currentFilters.search.toLowerCase())) {
        return false;
      }
      
      // Level filter
      if (currentFilters.observabilityLevel !== 'all' && indicator.observabilityLevel !== currentFilters.observabilityLevel) {
        return false;
      }
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [currentCompetencyIndicators, currentFilters, sortConfig]);

  // Statistics calculation
  const stats = useMemo((): IndicatorStats => {
    const levelCounts = new Map<string, number>();
    const activeCounts = new Map<string, number>();
    
    allIndicators.forEach(indicator => {
      const level = indicator.observabilityLevel;
      if (level && typeof level === 'string') {
        levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
      }
      const activeStatus = indicator.isActive ? 'Active' : 'Inactive';
      activeCounts.set(activeStatus, (activeCounts.get(activeStatus) || 0) + 1);
    });

    const byObservabilityLevel = Object.fromEntries(levelCounts);
    const byActive = Object.fromEntries(activeCounts);

    return {
      currentCompetency: currentCompetencyIndicators.length,
      otherCompetencies: 0,
      unassigned: 0,
      byObservabilityLevel,
      byActive
    };
  }, [allIndicators, currentCompetencyIndicators]);

  // Enhanced interaction handlers
  const handleSort = useCallback((key: keyof BehavioralIndicator) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle opening indicator details drawer
  const handleViewIndicator = useCallback((indicator: BehavioralIndicator) => {
    setSelectedIndicator(indicator);
    setDrawerOpen(true);
  }, []);

  // Get unique values for filter dropdowns
  const uniqueLevels = useMemo(() => 
    [...new Set(allIndicators.map(i => i.observabilityLevel))], [allIndicators]
  );

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h3 className="font-semibold mb-2">Error loading indicators</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchIndicators} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Indicators</h2>
          <p className="text-muted-foreground">
            Manage behavioral indicators for this competency
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/behavioral-indicators/new?competencyId=${competency.id}`}>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create New Indicator
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        {!isLoading && <StatsCards stats={stats} />}
      </Suspense>

      {/* Weight Distribution */}
      {!isLoading && currentCompetencyIndicators.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Weight Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of weights across behavioral indicators
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWeightModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Adjust Weights
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentCompetencyIndicators.map((indicator, index) => {
                const weight = indicator.weight || 0;
                const weightPercent = weight * 100; // Convert decimal to percentage
                // Generate color based on index for consistent coloring
                const hue = (index * 137.508) % 360; // Golden angle approximation
                const color = `hsl(${hue}, 70%, 50%)`;
                
                return (
                  <div 
                    key={indicator.id}
                    className="group relative p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {indicator.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {indicator.observabilityLevel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {weightPercent.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={weightPercent} 
                        className="h-2"
                        style={{
                          '--progress-background': color,
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
              
              {/* Summary */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Weight:</span>
                  <Badge variant={
                    Math.abs((currentCompetencyIndicators.reduce((sum, ind) => sum + (ind.weight || 0), 0) * 100) - 100) < 0.01 
                      ? "default" 
                      : "destructive"
                  }>
                    {(currentCompetencyIndicators.reduce((sum, ind) => sum + (ind.weight || 0), 0) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="current" className="relative">
            Competency Indicators
            {currentCompetencyIndicators.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {currentCompetencyIndicators.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Current Competency Indicators Tab */}
        <TabsContent value="current" className="space-y-4">
          {/* Filters and Search for Current Tab */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter Indicators</CardTitle>
              <CardDescription>
                Filter indicators assigned to this competency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search indicators..."
                      value={currentFilters.search}
                      onChange={(e) => setCurrentFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={currentFilters.observabilityLevel} onValueChange={(value) => 
                    setCurrentFilters(prev => ({ ...prev, observabilityLevel: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {uniqueLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Indicators Table */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Current Indicators ({filteredCurrentIndicators.length})
                  </CardTitle>
                  <CardDescription>
                    Behavioral indicators assigned to this competency
                  </CardDescription>
                </div>
                {filteredCurrentIndicators.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {filteredCurrentIndicators.length} indicator{filteredCurrentIndicators.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : filteredCurrentIndicators.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">No indicators assigned</h3>
                  <p className="text-sm mb-4 max-w-md mx-auto">
                    {currentFilters.search || currentFilters.observabilityLevel !== 'all'
                      ? 'No indicators match your current filters. Try adjusting your search criteria.'
                      : 'This competency doesn\'t have any indicators yet. Create a new indicator or attach existing ones from other competencies.'
                    }
                  </p>
                  {!currentFilters.search && currentFilters.observabilityLevel === 'all' && (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Link href={`/behavioral-indicators/new?competencyId=${competency.id}`}>
                        <Button variant="default" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Indicator
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('title')} className="h-auto p-0 font-semibold">
                          Title
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCurrentIndicators.map(indicator => (
                      <CurrentIndicatorRow
                        key={indicator.id}
                        indicator={indicator}
                        onView={handleViewIndicator}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Indicator Drawer */}
      {selectedIndicator && (
        <IndicatorDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          indicator={selectedIndicator}
        />
      )}
      
      {/* Weight Adjustment Modal */}
      {currentCompetencyIndicators.length > 0 && (
        <WeightAdjustmentModal
          isOpen={weightModalOpen}
          onClose={() => setWeightModalOpen(false)}
          onWeightsUpdated={() => {
            // This will only be called when onWeightDistributionComplete is not provided
            fetchIndicators();
          }}
          competencyId={competency.id}
          newIndicatorWeight={0} // Not needed for this use case
          onWeightDistributionComplete={(adjustedWeights) => {
            // Update local state with new weights immediately
            setCurrentCompetencyIndicators(prev => 
              prev.map(indicator => {
                const adjustedWeight = adjustedWeights.find(w => w.id === indicator.id);
                return adjustedWeight ? { ...indicator, weight: adjustedWeight.weight } : indicator;
              })
            );
            setWeightModalOpen(false);
          }}
        />
      )}
    </div>
  );
}