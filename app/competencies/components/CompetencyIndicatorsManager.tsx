'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { BehavioralIndicator, Competency } from '@/app/interfaces/domain-interfaces';
import { competenciesApi, behavioralIndicatorsApi } from '@/services/api';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  ArrowUpDown, 
  CheckCircle2, 
  Circle, 
  Loader2,
  AlertCircle,
  Eye,
  Settings2,
  ArrowRight,
  Move,
  Users,
  Pencil,
  Target
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndicatorDrawer from '@/app/behavioral-indicators/components/IndicatorDrawer';
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
  onView,
  onRemove
}: {
  indicator: BehavioralIndicator;
  onView: (indicator: BehavioralIndicator) => void;
  onRemove: (indicator: BehavioralIndicator) => void;
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRemove(indicator)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 opacity-70 group-hover:opacity-100 transition-opacity"
          >
            <Move className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Detach</span>
          </Button>
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

// Available Indicators Row Component  
const AvailableIndicatorRow = React.memo(({ 
  indicator, 
  onView,
  onTransfer,
  isTransferring
}: {
  indicator: BehavioralIndicator;
  onView: (indicator: BehavioralIndicator) => void;
  onTransfer: (indicatorId: string) => void;
  isTransferring: boolean;
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
            {indicator.competencyId && (
              <>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400">
                  From another competency
                </span>
              </>
            )}
            {!indicator.competencyId && (
              <>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Unassigned
                </span>
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onTransfer(indicator.id)}
            disabled={isTransferring}
          >
            {isTransferring ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span className="hidden sm:inline ml-1">Attach</span>
          </Button>
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

AvailableIndicatorRow.displayName = 'AvailableIndicatorRow';

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
  const [availableFilters, setAvailableFilters] = useState<FilterConfig>({
    observabilityLevel: 'all', 
    search: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'desc' });
  
  // Drawer and dialog state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<BehavioralIndicator | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  
  const [transferringIndicatorId, setTransferringIndicatorId] = useState<string | null>(null);

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

  // Get indicators for the "Available Indicators" tab
  const availableIndicators = useMemo(() => {
    return allIndicators.filter(indicator => 
      !currentCompetencyIndicators.some(current => current.id === indicator.id)
    );
  }, [allIndicators, currentCompetencyIndicators]);

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

  const filteredAvailableIndicators = useMemo(() => {
    const filtered = availableIndicators.filter(indicator => {
      // Search filter
      if (availableFilters.search && !indicator.title.toLowerCase().includes(availableFilters.search.toLowerCase())) {
        return false;
      }
      
      // Level filter
      if (availableFilters.observabilityLevel !== 'all' && indicator.observabilityLevel !== availableFilters.observabilityLevel) {
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
  }, [availableIndicators, availableFilters, sortConfig]);

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
      otherCompetencies: availableIndicators.filter(i => i.competencyId).length,
      unassigned: availableIndicators.filter(i => !i.competencyId).length,
      byObservabilityLevel,
      byActive
    };
  }, [allIndicators, currentCompetencyIndicators, availableIndicators]);

  // Enhanced interaction handlers
  const handleSort = useCallback((key: keyof BehavioralIndicator) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Attach indicator to current competency
  const handleAttachIndicator = useCallback(async (indicatorId: string) => {
    // Prevent attachment in preview mode
    if (competency.id === PREVIEW_COMPETENCY_ID) {
      toast.error('Please save your competency first to attach indicators.');
      return;
    }

    try {
      setTransferringIndicatorId(indicatorId);
      
      await competenciesApi.attachIndicator(competency.id, indicatorId);
      
      toast.success('Indicator attached successfully!');
      
      // Refresh the data to reflect changes
      await fetchIndicators();
      
    } catch {
      toast.error('Failed to attach indicator. Please try again.');
    } finally {
      setTransferringIndicatorId(null);
    }
  }, [competency.id, fetchIndicators]);

  // Detach indicator from current competency
  const handleDetachIndicator = useCallback(async (indicatorId: string) => {
    // Prevent detachment in preview mode
    if (competency.id === PREVIEW_COMPETENCY_ID) {
      toast.error('Please save your competency first to manage indicators.');
      return;
    }

    try {
      await competenciesApi.detachIndicator(competency.id, indicatorId);
      
      toast.success('Indicator detached from competency!');
      
      // Refresh the data to reflect changes
      await fetchIndicators();
      
    } catch {
      toast.error('Failed to detach indicator. Please try again.');
    }
  }, [competency.id, fetchIndicators]);

  // Handle opening indicator details drawer
  const handleViewIndicator = useCallback((indicator: BehavioralIndicator) => {
    setSelectedIndicator(indicator);
    setDrawerOpen(true);
  }, []);

  // Handle opening delete dialog
  const handleOpenDeleteDialog = useCallback((indicator: BehavioralIndicator) => {
    setSelectedIndicator(indicator);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle delete confirmation
  const handleDelete = useCallback(async () => {
    if (!selectedIndicator) return;

    setIsDeleteLoading(true);
    try {
      await handleDetachIndicator(selectedIndicator.id);
    } finally {
      setIsDeleteLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedIndicator(null);
    }
  }, [selectedIndicator, handleDetachIndicator]);

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

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="relative">
            Competency Indicators
            {currentCompetencyIndicators.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {currentCompetencyIndicators.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="available" className="relative">
            Available Indicators
            {availableIndicators.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {availableIndicators.length}
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('available')}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Attach Indicators
                      </Button>
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
                        onRemove={handleOpenDeleteDialog}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Indicators Tab */}
        <TabsContent value="available" className="space-y-4">
          {/* Filters and Search for Available Tab */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter Available Indicators</CardTitle>
              <CardDescription>
                Filter indicators from other competencies and unassigned indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search indicators..."
                      value={availableFilters.search}
                      onChange={(e) => setAvailableFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={availableFilters.observabilityLevel} onValueChange={(value) => 
                    setAvailableFilters(prev => ({ ...prev, observabilityLevel: value }))
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

          {/* Available Indicators Table */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    Available Indicators ({filteredAvailableIndicators.length})
                  </CardTitle>
                  <CardDescription>
                    Indicators from other competencies that can be attached
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : filteredAvailableIndicators.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No indicators available</h3>
                  <p className="text-sm">
                    {availableFilters.search || availableFilters.observabilityLevel !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'All indicators are either assigned to this competency or do not exist yet.'
                    }
                  </p>
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
                    {filteredAvailableIndicators.map(indicator => (
                      <AvailableIndicatorRow
                        key={indicator.id}
                        indicator={indicator}
                        onView={handleViewIndicator}
                        onTransfer={handleAttachIndicator}
                        isTransferring={transferringIndicatorId === indicator.id}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will detach the indicator &quot;{selectedIndicator?.title}&quot; from this competency. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleteLoading}
              onClick={handleDelete}
            >
              {isDeleteLoading ? "Detaching..." : "Detach"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}