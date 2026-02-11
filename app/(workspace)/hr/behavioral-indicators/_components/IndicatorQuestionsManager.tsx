'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { BehavioralIndicator, AssessmentQuestion } from '@/types/domain';
import { assessmentQuestionsApi } from '@/services/api';
import { questionDifficultyToColor, questionTypeToColor } from '@/lib/ui-utils';
import { DifficultyLevel } from '@/types/domain';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Settings2,
  Pencil,
  Users
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
import AssessmentQuestionDrawer from '../../assessment-questions/_components/AssessmentQuestionDrawer';
import Link from 'next/link';

// Constants
const PREVIEW_INDICATOR_ID = 'preview-id';

// Enhanced Types
interface SortConfig {
  key: keyof AssessmentQuestion;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  type: string;
  difficulty: string;
  search: string;
}

interface QuestionStats {
  currentIndicator: number;
  otherIndicators: number;
  unassigned: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
}

// Shared styling constants and helper functions
const DEFAULT_COLOR = 'border-border text-muted-foreground bg-muted/50';

const getDifficultyColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'foundational':
      return questionDifficultyToColor('FOUNDATIONAL' as DifficultyLevel);
    case 'intermediate':
      return questionDifficultyToColor('INTERMEDIATE' as DifficultyLevel);
    case 'advanced':
      return questionDifficultyToColor('ADVANCED' as DifficultyLevel);
    case 'expert':
      return questionDifficultyToColor('EXPERT' as DifficultyLevel);
    default:
      return DEFAULT_COLOR;
  }
};

const getTypeColor = (type: string) => {
  return questionTypeToColor(type.toUpperCase());
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
const StatsCards = ({ stats }: { stats: QuestionStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">This Indicator</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.currentIndicator}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Other Indicators</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.otherIndicators}</p>
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
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">By Difficulty</p>
          <div className="space-y-1">
            {Object.entries(stats.byDifficulty).slice(0, 2).map(([level, count]) => (
              <div key={level} className="flex justify-between text-xs">
                <span className="capitalize">{level.toLowerCase()}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Current Indicator Question Row Component
const CurrentQuestionRow = React.memo(({ 
  question, 
  onView
}: {
  question: AssessmentQuestion;
  onView: (question: AssessmentQuestion) => void;
}) => {
  return (
    <TableRow 
      className="hover:bg-accent/30 transition-colors cursor-pointer group"
      onClick={() => onView(question)}
    >
      <TableCell className="max-w-md">
        <div className="space-y-2">
          <p className="font-medium text-sm leading-relaxed line-clamp-2">
            {question.questionText}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>ID: {question.id.slice(0, 8)}...</span>
            {question.orderIndex !== undefined && (
              <>
                <span>•</span>
                <span>Order: {question.orderIndex}</span>
              </>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getTypeColor(question.questionType)}>
          {question.questionType.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getDifficultyColor(question.difficultyLevel)}>
          {question.difficultyLevel}
        </Badge>
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
              <DropdownMenuItem onClick={() => onView(question)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/hr/assessment-questions/${question.id}`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Question
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

CurrentQuestionRow.displayName = 'CurrentQuestionRow';

// Main Component
export function IndicatorQuestionsManager({ 
  indicator 
}: { 
  indicator: BehavioralIndicator 
}) {
  // State Management
  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndicatorQuestions, setCurrentIndicatorQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  
  // Filtering and sorting state
  const [currentFilters, setCurrentFilters] = useState<FilterConfig>({
    type: 'all',
    difficulty: 'all',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'questionText', direction: 'desc' });
  
  // Drawer state for viewing question details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);

  // Data fetching with enhanced error handling
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Always fetch all questions
      const allQuestionsData = await assessmentQuestionsApi.getAllQuestions();
      
      if (allQuestionsData) {
        setAllQuestions(allQuestionsData);
      }
      
      // Only fetch current indicator questions if it's not a preview
      if (indicator.id !== PREVIEW_INDICATOR_ID) {
        const currentQuestionsData = await assessmentQuestionsApi.getIndicatorQuestions(indicator.competencyId, indicator.id);
        if (currentQuestionsData) {
          setCurrentIndicatorQuestions(currentQuestionsData);
        }
      } else {
        // For preview mode, use empty array
        setCurrentIndicatorQuestions([]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [indicator.competencyId, indicator.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Enhanced filtering and sorting with useMemo for performance
  const filteredCurrentQuestions = useMemo(() => {
    const filtered = currentIndicatorQuestions.filter(question => {
      // Search filter
      if (currentFilters.search && !question.questionText.toLowerCase().includes(currentFilters.search.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (currentFilters.type !== 'all' && question.questionType !== currentFilters.type) {
        return false;
      }
      
      // Difficulty filter
      if (currentFilters.difficulty !== 'all' && question.difficultyLevel !== currentFilters.difficulty) {
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
  }, [currentIndicatorQuestions, currentFilters, sortConfig]);

  // Statistics calculation
  const stats = useMemo((): QuestionStats => {
    const byType: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    
    allQuestions.forEach(question => {
      byType[question.questionType] = (byType[question.questionType] || 0) + 1;
      byDifficulty[question.difficultyLevel] = (byDifficulty[question.difficultyLevel] || 0) + 1;
    });

    return {
      currentIndicator: currentIndicatorQuestions.length,
      otherIndicators: 0,
      unassigned: 0,
      byType,
      byDifficulty
    };
  }, [allQuestions, currentIndicatorQuestions]);

  // Enhanced interaction handlers
  const handleSort = useCallback((key: keyof AssessmentQuestion) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle opening question details drawer
  const handleViewQuestion = useCallback((question: AssessmentQuestion) => {
    setSelectedQuestion(question);
    setDrawerOpen(true);
  }, []);

  // Get unique values for filter dropdowns
  const uniqueTypes = useMemo(() => 
    [...new Set(allQuestions.map(q => q.questionType))], [allQuestions]
  );
  
  const uniqueDifficulties = useMemo(() => 
    [...new Set(allQuestions.map(q => q.difficultyLevel))], [allQuestions]
  );

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h3 className="font-semibold mb-2">Error loading questions</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchQuestions} variant="outline">
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
          <h2 className="text-2xl font-bold tracking-tight">Manage Questions</h2>
          <p className="text-muted-foreground">
            Manage assessment questions for this behavioral indicator
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {indicator.id !== PREVIEW_INDICATOR_ID ? (
            <Link href={`/hr/assessment-questions/new?indicatorId=${indicator.id}&competencyId=${indicator.competencyId}`}>
              <Button variant="default" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create New Question
              </Button>
            </Link>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              disabled
              onClick={() => toast.error('Please save your indicator first to create questions.')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Question
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        {!isLoading && <StatsCards stats={stats} />}
      </Suspense>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="current" className="relative">
            Indicator Questions
            {currentIndicatorQuestions.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {currentIndicatorQuestions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Current Indicator Questions Tab */}
        <TabsContent value="current" className="space-y-4">
          {/* Filters and Search for Current Tab */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter Questions</CardTitle>
              <CardDescription>
                Filter questions assigned to this indicator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={currentFilters.search}
                      onChange={(e) => setCurrentFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={currentFilters.type} onValueChange={(value) => 
                    setCurrentFilters(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={currentFilters.difficulty} onValueChange={(value) => 
                    setCurrentFilters(prev => ({ ...prev, difficulty: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {uniqueDifficulties.map(level => (
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

          {/* Current Questions Table */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Current Questions ({filteredCurrentQuestions.length})
                  </CardTitle>
                  <CardDescription>
                    Questions assigned to this behavioral indicator
                  </CardDescription>
                </div>
                {filteredCurrentQuestions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {filteredCurrentQuestions.length} question{filteredCurrentQuestions.length !== 1 ? 's' : ''}
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
              ) : filteredCurrentQuestions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">No questions assigned</h3>
                  <p className="text-sm mb-4 max-w-md mx-auto">
                    {currentFilters.search || currentFilters.type !== 'all' || currentFilters.difficulty !== 'all'
                      ? 'No questions match your current filters. Try adjusting your search criteria.'
                      : 'This indicator doesn\'t have any questions yet. Create a new question or transfer existing ones from other indicators.'
                    }
                  </p>
                  {!currentFilters.search && currentFilters.type === 'all' && currentFilters.difficulty === 'all' && (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      {indicator.id !== PREVIEW_INDICATOR_ID ? (
                        <Link href={`/hr/assessment-questions/new?indicatorId=${indicator.id}&competencyId=${indicator.competencyId}`}>
                          <Button variant="default" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Question
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          disabled
                          onClick={() => toast.error('Please save your indicator first to create questions.')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Question
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('other')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Transfer Questions
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('questionText')} className="h-auto p-0 font-semibold">
                          Question Text
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCurrentQuestions.map(question => (
                      <CurrentQuestionRow
                        key={question.id}
                        question={question}
                        onView={handleViewQuestion}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Assessment Question Drawer */}
      {selectedQuestion && (
        <AssessmentQuestionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          question={selectedQuestion}
          indicator={indicator}
          onQuestionDeleted={() => {
            // Refresh data after question deletion
            fetchQuestions();
            setDrawerOpen(false);
            setSelectedQuestion(null);
          }}
        />
      )}
    </div>
  );
}

export default IndicatorQuestionsManager;