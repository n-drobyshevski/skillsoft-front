'use client';

import React, { useState, useEffect, useMemo, useCallback, useTransition, Suspense } from 'react';
import { BehavioralIndicator, AssessmentQuestion } from '../../interfaces/domain-interfaces';
import { assessmentQuestionsApi } from '@/services/api';
import { questionDifficultyToColor, questionTypeToColor } from '../../utils';
import { DifficultyLevel } from '../../enums/domain_enums';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  ArrowUpDown, 
  CheckCircle2, 
  Circle, 
  Loader2,
  AlertCircle,
  Save,
  Undo2,
  Eye,
  Settings2,
  CheckSquare,
  Square
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
import AssessmentQuestionDrawer from '../../assessment-questions/components/AssessmentQuestionDrawer';
import Link from 'next/link';

// Enhanced Types
interface SortConfig {
  key: keyof AssessmentQuestion;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  type: string;
  difficulty: string;
  status: 'all' | 'selected' | 'unselected';
}

interface QuestionStats {
  total: number;
  selected: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
}

// Custom Checkbox Component - Using app's design system colors
const CustomCheckbox = ({ 
  checked, 
  onChange, 
  indeterminate = false,
  'aria-label': ariaLabel 
}: {
  checked: boolean;
  onChange: () => void;
  indeterminate?: boolean;
  'aria-label'?: string;
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={indeterminate ? 'mixed' : checked}
    aria-label={ariaLabel}
    onClick={onChange}
    className="h-4 w-4 border border-border rounded focus:ring-2 focus:ring-ring focus:outline-none flex items-center justify-center hover:bg-accent/50 transition-colors"
  >
    {indeterminate ? (
      <div className="w-2 h-0.5 bg-primary" />
    ) : checked ? (
      <CheckSquare className="h-3 w-3 text-primary" />
    ) : (
      <Square className="h-3 w-3 text-muted-foreground" />
    )}
  </button>
);

// Enhanced Loading States
const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
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

// Enhanced Error Boundary Component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <Card className="border-destructive">
    <CardContent className="p-6">
      <div className="flex items-center space-x-2 text-destructive mb-4">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-semibold">Error Loading Questions</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        <Undo2 className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </CardContent>
  </Card>
);

// Stats Cards Component
const StatsCards = ({ stats }: { stats: QuestionStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <Circle className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Selected</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.selected}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">By Type</p>
          <div className="space-y-1">
            {Object.entries(stats.byType).slice(0, 2).map(([type, count]) => (
              <div key={type} className="flex justify-between text-xs">
                <span className="capitalize">{type.toLowerCase()}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
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

// Enhanced Question Row Component
const QuestionRow = React.memo(({ 
  question, 
  isSelected, 
  onSelect,
  onView 
}: {
  question: AssessmentQuestion;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (question: AssessmentQuestion) => void;
}) => {
  const getDifficultyColor = (level: string) => {
    // Map string values to DifficultyLevel enum and use centralized color function
    switch (level.toLowerCase()) {
      case 'basic':
        return questionDifficultyToColor(DifficultyLevel.BASIC);
      case 'intermediate':
        return questionDifficultyToColor(DifficultyLevel.INTERMEDIATE);
      case 'advanced':
        return questionDifficultyToColor(DifficultyLevel.ADVANCED);
      case 'expert':
        return questionDifficultyToColor(DifficultyLevel.EXPERT);
      default:
        return 'border-border text-muted-foreground bg-muted/50';
    }
  };

  const getTypeColor = (type: string) => {
    // Use centralized question type color function
    return questionTypeToColor(type.toUpperCase());
  };

  return (
    <TableRow 
      className={`hover:bg-accent/30 transition-colors cursor-pointer ${isSelected ? 'bg-accent/50' : ''}`}
      onClick={() => onView(question)}
    >
      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
        <CustomCheckbox
          checked={isSelected}
          onChange={() => onSelect(question.id)}
          aria-label={`Select question: ${question.questionText.substring(0, 50)}...`}
        />
      </TableCell>
      <TableCell className="max-w-md">
        <div className="space-y-1">
          <p className="font-medium text-sm leading-relaxed line-clamp-2">
            {question.questionText}
          </p>
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
      <TableCell className="text-sm text-muted-foreground">
        {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'N/A'}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
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
              <Link href={`/assessment-questions/${question.id}`}>
                Edit Question
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

QuestionRow.displayName = 'QuestionRow';

// Main Component
export function IndicatorQuestionsManager({ 
  indicator 
}: { 
  indicator: BehavioralIndicator 
}) {
  // State Management
  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    type: 'all',
    difficulty: 'all',
    status: 'all'
  });
  
  // Drawer state for viewing question details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);
  
  // React 18 Transitions for better UX
  const [isPending, startTransition] = useTransition();

  // Add loading state for save operations
  const [isSaving, setIsSaving] = useState(false);

  // Data fetching with enhanced error handling
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [questions, associatedQuestions] = await Promise.all([
        assessmentQuestionsApi.getAllQuestions(),
        assessmentQuestionsApi.getIndicatorQuestions(indicator.competencyId, indicator.id)
      ]);

      if (questions) {
        setAllQuestions(questions);
      }
      
      const associatedQuestionIds = associatedQuestions?.map((q: AssessmentQuestion) => q.id) || [];
      setSelectedQuestionIds(associatedQuestionIds);
      setInitialSelectedIds(associatedQuestionIds);
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
  const processedQuestions = useMemo(() => {
    const filtered = allQuestions.filter(question => {
      // Search filter
      if (searchTerm && !question.questionText.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterConfig.type !== 'all' && question.questionType !== filterConfig.type) {
        return false;
      }
      
      // Difficulty filter
      if (filterConfig.difficulty !== 'all' && question.difficultyLevel !== filterConfig.difficulty) {
        return false;
      }
      
      // Status filter
      if (filterConfig.status === 'selected' && !selectedQuestionIds.includes(question.id)) {
        return false;
      }
      if (filterConfig.status === 'unselected' && selectedQuestionIds.includes(question.id)) {
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
  }, [allQuestions, searchTerm, filterConfig, selectedQuestionIds, sortConfig]);

  // Statistics calculation
  const stats = useMemo((): QuestionStats => {
    const byType: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    
    allQuestions.forEach(question => {
      byType[question.questionType] = (byType[question.questionType] || 0) + 1;
      byDifficulty[question.difficultyLevel] = (byDifficulty[question.difficultyLevel] || 0) + 1;
    });

    return {
      total: allQuestions.length,
      selected: selectedQuestionIds.length,
      byType,
      byDifficulty
    };
  }, [allQuestions, selectedQuestionIds]);

  // Enhanced interaction handlers
  const handleSort = useCallback((key: keyof AssessmentQuestion) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleSelectQuestion = useCallback((questionId: string) => {
    startTransition(() => {
      setSelectedQuestionIds(prev => 
        prev.includes(questionId) 
          ? prev.filter(id => id !== questionId)
          : [...prev, questionId]
      );
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    startTransition(() => {
      const allIds = processedQuestions.map(q => q.id);
      const allSelected = allIds.every(id => selectedQuestionIds.includes(id));
      
      if (allSelected) {
        setSelectedQuestionIds(prev => prev.filter(id => !allIds.includes(id)));
      } else {
        setSelectedQuestionIds(prev => [...new Set([...prev, ...allIds])]);
      }
    });
  }, [processedQuestions, selectedQuestionIds]);

  // Update the handleSaveChanges function to use the new loading state
  const handleSaveChanges = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Get questions that were added (selected but not in initial)
      const questionsToAdd = selectedQuestionIds.filter(id => !initialSelectedIds.includes(id));
      
      // Get questions that were removed (in initial but not selected)
      const questionsToRemove = initialSelectedIds.filter(id => !selectedQuestionIds.includes(id));
      
      // Process additions - update each question to associate with indicator
      for (const questionId of questionsToAdd) {
        const question = allQuestions.find(q => q.id === questionId);
        if (question) {
          await assessmentQuestionsApi.updateQuestion(
            questionId,
            {
              ...question,
              behavioralIndicatorId: indicator.id
            },
            indicator.competencyId,
            indicator.id
          );
        }
      }
      
      // Process removals - update each question to remove indicator association
      for (const questionId of questionsToRemove) {
        const question = allQuestions.find(q => q.id === questionId);
        if (question) {
          await assessmentQuestionsApi.updateQuestion(
            questionId,
            {
              ...question,
              behavioralIndicatorId: null // or empty string, depending on your backend
            },
            indicator.competencyId,
            indicator.id
          );
        }
      }
      
      toast.success(`Successfully updated ${questionsToAdd.length + questionsToRemove.length} question associations!`);
      setInitialSelectedIds([...selectedQuestionIds]);
      
      // Refresh the data to reflect changes
      await fetchQuestions();
      
    } catch (error) {
      console.error('Error updating question associations:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [indicator.id, indicator.competencyId, selectedQuestionIds, initialSelectedIds, allQuestions, fetchQuestions]);

  const handleResetChanges = useCallback(() => {
    setSelectedQuestionIds([...initialSelectedIds]);
  }, [initialSelectedIds]);

  // Handle opening question details drawer
  const handleViewQuestion = useCallback((question: AssessmentQuestion) => {
    setSelectedQuestion(question);
    setDrawerOpen(true);
  }, []);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(selectedQuestionIds.sort()) !== JSON.stringify(initialSelectedIds.sort());
  }, [selectedQuestionIds, initialSelectedIds]);

  // Get unique values for filter dropdowns
  const uniqueTypes = useMemo(() => 
    [...new Set(allQuestions.map(q => q.questionType))], [allQuestions]
  );
  
  const uniqueDifficulties = useMemo(() => 
    [...new Set(allQuestions.map(q => q.difficultyLevel))], [allQuestions]
  );

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchQuestions} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Questions</h2>
          <p className="text-muted-foreground">
            Associate assessment questions with this behavioral indicator
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/assessment-questions/new?indicatorId=${indicator.id}&competencyId=${indicator.competencyId}`}>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </Link>
          
          {hasUnsavedChanges && (
            <>
              <Button variant="ghost" size="sm" onClick={handleResetChanges} disabled={isSaving}>
                <Undo2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        {!isLoading && <StatsCards stats={stats} />}
      </Suspense>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>
            Filter and search through available questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterConfig.type} onValueChange={(value) => 
                setFilterConfig(prev => ({ ...prev, type: value }))
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

              <Select value={filterConfig.difficulty} onValueChange={(value) => 
                setFilterConfig(prev => ({ ...prev, difficulty: value }))
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

              <Select value={filterConfig.status} onValueChange={(value: FilterConfig['status']) => 
                setFilterConfig(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="unselected">Unselected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">
                Questions ({processedQuestions.length})
              </CardTitle>
              <CardDescription>
                Select questions to associate with this indicator
              </CardDescription>
            </div>
            
            {processedQuestions.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                disabled={isPending}
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {processedQuestions.every(q => selectedQuestionIds.includes(q.id)) ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : processedQuestions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No questions found</h3>
              <p className="text-sm">
                {searchTerm || filterConfig.type !== 'all' || filterConfig.difficulty !== 'all' || filterConfig.status !== 'all'
                  ? 'Try adjusting your filters or search term.'
                  : 'Create your first assessment question to get started.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <CustomCheckbox
                      checked={processedQuestions.length > 0 && processedQuestions.every(q => selectedQuestionIds.includes(q.id))}
                      indeterminate={processedQuestions.some(q => selectedQuestionIds.includes(q.id)) && !processedQuestions.every(q => selectedQuestionIds.includes(q.id))}
                      onChange={handleSelectAll}
                      aria-label="Select all questions"
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('questionText')} className="h-auto p-0 font-semibold">
                      Question Text
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('createdAt')} className="h-auto p-0 font-semibold">
                      Created
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedQuestions.map(question => (
                  <QuestionRow
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestionIds.includes(question.id)}
                    onSelect={handleSelectQuestion}
                    onView={handleViewQuestion}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Card className="border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/90 dark:border-amber-400/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-200">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">You have unsaved changes</p>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
              Remember to save your changes before navigating away.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Assessment Question Drawer */}
      {selectedQuestion && (
        <AssessmentQuestionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          question={selectedQuestion}
        />
      )}
    </div>
  );
}

export default IndicatorQuestionsManager;