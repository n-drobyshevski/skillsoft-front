'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { Competency } from '@/app/interfaces/domain-interfaces';
import { CompetencyCategory, ProficiencyLevel } from '@/app/enums/domain_enums';
import { competenciesApi } from '@/services/api';
import { toast } from 'sonner';

interface CompetencySelectorProps {
  preselectedCompetencyId?: string;
  onCompetencySelected: (competencyId: string) => void;
}

export default function CompetencySelector({ 
  preselectedCompetencyId, 
  onCompetencySelected 
}: CompetencySelectorProps) {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState<Competency[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<string>(preselectedCompetencyId || '');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        setLoading(true);
        const competenciesData = await competenciesApi.getAllCompetencies();
        
        // Filter only active competencies for indicator creation
        const activeCompetencies = (competenciesData || []).filter(comp => comp.isActive);
        
        setCompetencies(activeCompetencies);
        setFilteredCompetencies(activeCompetencies);
      } catch {
        toast.error('Failed to load competencies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetencies();
  }, []);

  useEffect(() => {
    let filtered = competencies;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(competency => competency.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(competency => competency.level === selectedLevel);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(competency => 
        competency.name.toLowerCase().includes(query) ||
        (competency.description && competency.description.toLowerCase().includes(query))
      );
    }

    setFilteredCompetencies(filtered);
  }, [competencies, selectedCategory, selectedLevel, searchQuery]);

  const handleContinue = () => {
    if (!selectedCompetency) {
      toast.error('Please select a competency to continue.');
      return;
    }

    onCompetencySelected(selectedCompetency);
  };

  const getCategoryColor = (category: CompetencyCategory): string => {
    switch (category) {
      case CompetencyCategory.COGNITIVE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case CompetencyCategory.INTERPERSONAL:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case CompetencyCategory.LEADERSHIP:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case CompetencyCategory.ADAPTABILITY:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case CompetencyCategory.EMOTIONAL_INTELLIGENCE:
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case CompetencyCategory.COMMUNICATION:
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
      case CompetencyCategory.COLLABORATION:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case CompetencyCategory.CRITICAL_THINKING:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case CompetencyCategory.TIME_MANAGEMENT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getLevelColor = (level: ProficiencyLevel): string => {
    switch (level) {
      case ProficiencyLevel.NOVICE:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case ProficiencyLevel.DEVELOPING:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case ProficiencyLevel.PROFICIENT:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case ProficiencyLevel.ADVANCED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case ProficiencyLevel.EXPERT:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading competencies...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Select Competency
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the competency for which you want to create a behavioral indicator.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="category-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Filter by Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(CompetencyCategory).map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="level-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Filter by Level
            </label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {Object.values(ProficiencyLevel).map(level => (
                  <SelectItem key={level} value={level}>
                    {level.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Search Competencies
            </label>
            <div className="relative" suppressHydrationWarning>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Competencies List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredCompetencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No competencies found matching your criteria.</p>
              <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredCompetencies.map(competency => (
              <div
                key={competency.id}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedCompetency === competency.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
                onClick={() => setSelectedCompetency(competency.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{competency.name}</h4>
                      <Badge className={`text-xs ${getCategoryColor(competency.category)}`}>
                        {competency.category.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={`text-xs ${getLevelColor(competency.level)}`}>
                        {competency.level.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {competency.description || 'No description available'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Indicators: {competency.behavioralIndicators?.length || 0}</span>
                      <span>•</span>
                      <span>Status: {competency.approvalStatus.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>Version: {competency.version}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {selectedCompetency === competency.id && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistics */}
        {filteredCompetencies.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>{filteredCompetencies.length} competenc{filteredCompetencies.length === 1 ? 'y' : 'ies'} available</span>
            {selectedCompetency && (
              <span>✓ Competency selected</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:space-x-3">
          <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!selectedCompetency}
            className="w-full sm:w-auto"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}