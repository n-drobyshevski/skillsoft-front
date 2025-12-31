'use client';

import React, { useState, useTransition, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { testTemplatesApi } from '@/services/api';
import { CreateTestTemplateRequest, TestTemplateBlueprint } from '@/types/domain';
import { AssessmentGoal, AssessmentGoalInfo } from '@/types/domain';
import {
  GoalSelector,
  OverviewConfigPanel,
  JobFitConfigPanel,
  TeamFitConfigPanel,
} from '@/components/blueprint-config';
import { toast } from 'sonner';
import { 
  Loader2, 
  ArrowLeft, 
  ArrowRight,
  Check, 
  FileText, 
  Target, 
  Settings, 
  Eye,
  Clock,
  HelpCircle,
  Percent,
  Shuffle,
  SkipForward,
  RotateCcw,
  BarChart3,
  Search,
  X,
  Crosshair,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Filter,
  Lightbulb,
  ListChecks,
  Sparkles,
  Heart,
  Shield,
  Brain,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import bigFiveMapping from '@/data/standards/onet_to_bigfive_map.json';

// ============================================================================
// Types & Schema
// ============================================================================

interface CompetencyOption {
  id: string;
  name: string;
  category: string;
  level?: string;
}

interface NewTestFormProps {
  competencies: CompetencyOption[];
}

const formSchema = z.object({
  name: z.string().min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
  description: z.string().max(500, 'Максимум 500 символов').optional(),
  goal: z.nativeEnum(AssessmentGoal),
  competencyIds: z.array(z.string()).min(1, 'Выберите хотя бы одну компетенцию'),
  questionsPerIndicator: z.number().min(1).max(5),
  timeLimitMinutes: z.number().min(5).max(180),
  passingScore: z.number().min(10).max(100),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  allowSkip: z.boolean(),
  allowBackNavigation: z.boolean(),
  showResultsImmediately: z.boolean(),
  // Goal-specific fields (OVERVIEW)
  includeBigFive: z.boolean().optional(),
  preferredDifficulty: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']).optional(),
  // Goal-specific fields (JOB_FIT)
  onetSocCode: z.string().optional(),
  strictnessLevel: z.number().min(0).max(100).optional(),
  enableDeltaTesting: z.boolean().optional(),
  // Goal-specific fields (TEAM_FIT)
  teamId: z.string().optional(),
  saturationThreshold: z.number().min(0.3).max(0.9).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// Step Configuration
// ============================================================================

const STEPS = [
  { id: 1, title: 'Основное', description: 'Название и цель', icon: FileText },
  { id: 2, title: 'Компетенции', description: 'Выбор навыков', icon: Target },
  { id: 3, title: 'Настройки', description: 'Параметры теста', icon: Settings },
  { id: 4, title: 'Проверка', description: 'Итог', icon: Eye },
] as const;

// ============================================================================
// Component: Step Indicator
// ============================================================================

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const currentStepInfo = STEPS[currentStep - 1];
  
  return (
    <div className="mb-6 md:mb-10 px-1">
      {/* Desktop Stepper */}
      <div className="hidden md:grid md:grid-cols-4 gap-2 mb-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center gap-3 flex-1 p-3 rounded-lg transition-all",
                isActive && "bg-primary/10 border border-primary/20",
                isCompleted && "bg-muted/50",
                !isActive && !isCompleted && "opacity-50"
              )}>
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all flex-shrink-0",
                  isActive || isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-background"
                )}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold truncate", isActive && "text-primary")}>{step.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn("w-4 h-0.5 mx-1 flex-shrink-0", isCompleted ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile Header (Modern & Clean) */}
      <div className="md:hidden flex items-end justify-between mb-4 pt-2">
        <div>
           <span className="text-xs font-semibold text-primary uppercase tracking-wider">Шаг {currentStep} из {totalSteps}</span>
           <h2 className="text-2xl font-bold tracking-tight mt-1">{currentStepInfo.title}</h2>
        </div>
        <div className="bg-secondary p-2.5 rounded-xl text-foreground/70">
            {React.createElement(currentStepInfo.icon, { className: "h-6 w-6" })}
        </div>
      </div>
      
      <Progress value={progress} className="h-1.5 md:h-1.5 rounded-full" />
    </div>
  );
}

// ============================================================================
// Step 1: Basic Info
// ============================================================================

const GOAL_OPTIONS = [
  {
    value: AssessmentGoal.OVERVIEW,
    icon: Crosshair,
    className: 'border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30',
    selectedClassName: 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm',
  },
  {
    value: AssessmentGoal.JOB_FIT,
    icon: Briefcase,
    className: 'border-border/60 bg-card hover:border-blue-500/50 hover:bg-blue-500/5',
    selectedClassName: 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 shadow-sm',
  },
  {
    value: AssessmentGoal.TEAM_FIT,
    icon: Users,
    className: 'border-border/60 bg-card hover:border-purple-500/50 hover:bg-purple-500/5',
    selectedClassName: 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500 shadow-sm',
  },
] as const;

function BasicInfoStep({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const description = form.watch('description') || '';
  const selectedGoal = form.watch('goal');
  const selectedCompetencyCount = form.watch('competencyIds')?.length || 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Название теста</FormLabel>
              <FormControl>
                <Input
                  placeholder="Например: Оценка лидерских качеств"
                  {...field}
                  className="h-14 md:h-12 text-base rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Цель оценки</FormLabel>
              <FormControl>
                <GoalSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Goal-Specific Configuration Panels */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {selectedGoal === AssessmentGoal.OVERVIEW && (
            <Card className="border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Crosshair className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Настройки Universal Baseline</span>
                </div>
                <OverviewConfigPanel selectedCompetencyCount={selectedCompetencyCount} />
              </CardContent>
            </Card>
          )}

          {selectedGoal === AssessmentGoal.JOB_FIT && (
            <Card className="border-dashed border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Настройки Job Fit</span>
                </div>
                <JobFitConfigPanel />
              </CardContent>
            </Card>
          )}

          {selectedGoal === AssessmentGoal.TEAM_FIT && (
            <Card className="border-dashed border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold">Настройки Team Fit</span>
                </div>
                <TeamFitConfigPanel />
              </CardContent>
            </Card>
          )}
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Опишите цель и содержание теста..."
                  className="min-h-32 rounded-xl resize-none text-base"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-end">
                <span className={cn("text-xs tabular-nums", description.length > 450 ? "text-warning" : "text-muted-foreground")}>
                  {description.length}/500
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Step 2: Competencies - Big Five Grouped Selector (Optimized)
// ============================================================================

const BIG_FIVE_CONFIG = {
  OPENNESS: {
    name: 'Openness',
    nameRu: 'Открытость опыту',
    description: 'Creativity, curiosity, and willingness to explore',
    descriptionRu: 'Креативность, любознательность, открытость новому',
    icon: Lightbulb,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    selectedCardBg: 'bg-purple-50/80 dark:bg-purple-950/50',
  },
  CONSCIENTIOUSNESS: {
    name: 'Conscientiousness',
    nameRu: 'Добросовестность',
    description: 'Organization, responsibility, and self-discipline',
    descriptionRu: 'Организованность, ответственность, самодисциплина',
    icon: ListChecks,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    selectedCardBg: 'bg-blue-50/80 dark:bg-blue-950/50',
  },
  EXTRAVERSION: {
    name: 'Extraversion',
    nameRu: 'Экстраверсия',
    description: 'Sociability, assertiveness, and energy',
    descriptionRu: 'Общительность, активность, энергичность',
    icon: Sparkles,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-200 dark:border-orange-800',
    selectedCardBg: 'bg-orange-50/80 dark:bg-orange-950/50',
  },
  AGREEABLENESS: {
    name: 'Agreeableness',
    nameRu: 'Доброжелательность',
    description: 'Cooperation, empathy, and trust',
    descriptionRu: 'Сотрудничество, эмпатия, доверие',
    icon: Heart,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800',
    selectedCardBg: 'bg-pink-50/80 dark:bg-pink-950/50',
  },
  EMOTIONAL_STABILITY: {
    name: 'Emotional Stability',
    nameRu: 'Эмоциональная стабильность',
    description: 'Calmness, resilience, and stress management',
    descriptionRu: 'Спокойствие, стрессоустойчивость, уравновешенность',
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/40',
    borderColor: 'border-green-200 dark:border-green-800',
    selectedCardBg: 'bg-green-50/80 dark:bg-green-950/50',
  },
} as const;

type BigFiveCategory = keyof typeof BIG_FIVE_CONFIG;

function CompetenciesStep({ form, competencies }: NewTestFormProps & { form: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<string[]>(['CONSCIENTIOUSNESS', 'EXTRAVERSION']);
  
  // Local state for selections - completely independent of React Hook Form reactive system
  const [selectedIds, setSelectedIds] = useState<string[]>(() => form.getValues('competencyIds') || []);

  // Map competencies to Big Five categories
  const competenciesByBigFive = useMemo(() => {
    const grouped: Record<BigFiveCategory, CompetencyOption[]> = {
      OPENNESS: [],
      CONSCIENTIOUSNESS: [],
      EXTRAVERSION: [],
      AGREEABLENESS: [],
      EMOTIONAL_STABILITY: [],
    };

    competencies.forEach(comp => {
      const mapping = (bigFiveMapping.mappings as any)[comp.id];
      
      if (mapping?.primaryBigFive) {
        grouped[mapping.primaryBigFive as BigFiveCategory]?.push(comp);
      } else {
        const categoryLower = comp.category.toLowerCase();
        
        if (categoryLower.includes('innovation') || categoryLower.includes('creative') || 
            categoryLower.includes('analytical') || categoryLower.includes('learning')) {
          grouped.OPENNESS.push(comp);
        } else if (categoryLower.includes('dependab') || categoryLower.includes('detail') || 
                   categoryLower.includes('organiz') || categoryLower.includes('planning')) {
          grouped.CONSCIENTIOUSNESS.push(comp);
        } else if (categoryLower.includes('leadership') || categoryLower.includes('social') || 
                   categoryLower.includes('communication') || categoryLower.includes('initiative')) {
          grouped.EXTRAVERSION.push(comp);
        } else if (categoryLower.includes('cooperat') || categoryLower.includes('team') || 
                   categoryLower.includes('empathy') || categoryLower.includes('support')) {
          grouped.AGREEABLENESS.push(comp);
        } else if (categoryLower.includes('stress') || categoryLower.includes('adapt') || 
                   categoryLower.includes('resilience') || categoryLower.includes('control')) {
          grouped.EMOTIONAL_STABILITY.push(comp);
        } else {
          grouped.CONSCIENTIOUSNESS.push(comp);
        }
      }
    });

    return grouped;
  }, [competencies]);

  // Filter competencies by search query
  const filteredByBigFive = useMemo(() => {
    if (!searchQuery.trim()) return competenciesByBigFive;

    const query = searchQuery.toLowerCase();
    const filtered: Record<BigFiveCategory, CompetencyOption[]> = {
      OPENNESS: [],
      CONSCIENTIOUSNESS: [],
      EXTRAVERSION: [],
      AGREEABLENESS: [],
      EMOTIONAL_STABILITY: [],
    };

    Object.entries(competenciesByBigFive).forEach(([category, comps]) => {
      filtered[category as BigFiveCategory] = comps.filter(comp =>
        comp.name.toLowerCase().includes(query) ||
        comp.category.toLowerCase().includes(query)
      );
    });

    return filtered;
  }, [competenciesByBigFive, searchQuery]);

  const totalFiltered = useMemo(() => 
    Object.values(filteredByBigFive).reduce((sum, comps) => sum + comps.length, 0),
    [filteredByBigFive]
  );

  // Stable toggle function - updates local state, then syncs to form outside React cycle
  const handleToggleCompetency = useCallback((id: string) => {
    setSelectedIds(current => {
      const newIds = current.includes(id) 
        ? current.filter(cid => cid !== id) 
        : [...current, id];
      // Use setTimeout to break the React update cycle
      setTimeout(() => form.setValue('competencyIds', newIds, { shouldValidate: false }), 0);
      return newIds;
    });
  }, [form]);

  const handleSelectAllInCategory = useCallback((category: BigFiveCategory) => {
    setSelectedIds(current => {
      const categoryIds = filteredByBigFive[category].map(c => c.id);
      const allSelected = categoryIds.every(id => current.includes(id));
      const newIds = allSelected
        ? current.filter(id => !categoryIds.includes(id))
        : [...new Set([...current, ...categoryIds])];
      setTimeout(() => form.setValue('competencyIds', newIds, { shouldValidate: false }), 0);
      return newIds;
    });
  }, [filteredByBigFive, form]);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(current => {
      const allIds = Object.values(filteredByBigFive).flat().map(c => c.id);
      const newIds = [...new Set([...current, ...allIds])];
      setTimeout(() => form.setValue('competencyIds', newIds, { shouldValidate: false }), 0);
      return newIds;
    });
  }, [filteredByBigFive, form]);

  const handleClearAll = useCallback(() => {
    setSelectedIds([]);
    setTimeout(() => form.setValue('competencyIds', [], { shouldValidate: false }), 0);
  }, [form]);

  const selectedCount = selectedIds.length;

  if (competencies.length === 0) {
    return (
      <div className="text-center py-16 border rounded-2xl bg-muted/20">
        <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-xl">Нет компетенций</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск компетенций..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 text-base rounded-xl pl-11 pr-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectAll}
            disabled={totalFiltered === 0}
            className="h-12 rounded-xl"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Выбрать все
          </Button>
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearAll}
              className="h-12 rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
          )}
        </div>
      </div>

      {/* Selected Count Badge */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <Badge className="h-7 px-3 text-sm">{selectedCount}</Badge>
          <span className="text-sm font-medium text-primary">Выбрано компетенций</span>
        </div>
      )}

      {/* Big Five Accordion */}
      {totalFiltered === 0 ? (
        <div className="text-center py-12 border rounded-2xl bg-muted/20">
          <Filter className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Ничего не найдено</p>
        </div>
      ) : (
        <Accordion 
          type="multiple" 
          value={openSections} 
          onValueChange={setOpenSections}
          className="space-y-3"
        >
          {(Object.keys(BIG_FIVE_CONFIG) as BigFiveCategory[]).map((categoryKey) => {
            const config = BIG_FIVE_CONFIG[categoryKey];
            const comps = filteredByBigFive[categoryKey];
            
            if (comps.length === 0) return null;

            const Icon = config.icon;
            const selectedCount = comps.filter(c => selectedIds.includes(c.id)).length;
            const allSelected = selectedCount === comps.length && comps.length > 0;

            return (
              <AccordionItem
                key={categoryKey}
                value={categoryKey}
                className={cn(
                  "border-2 rounded-xl overflow-hidden transition-all",
                  allSelected ? config.borderColor : "border-border"
                )}
              >
                <AccordionTrigger className={cn(
                  "px-5 py-4 hover:no-underline",
                  allSelected ? config.bgColor : "hover:bg-muted/50 dark:hover:bg-muted/30"
                )}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "p-2.5 rounded-lg",
                      allSelected ? "bg-background/80 dark:bg-background/60" : "bg-muted dark:bg-muted/50"
                    )}>
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-base">{config.nameRu}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {selectedCount} / {comps.length}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {config.descriptionRu}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4">
                  <div className="flex justify-end mb-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAllInCategory(categoryKey)}
                      className="h-8 text-xs"
                    >
                      {allSelected ? 'Снять выбор' : 'Выбрать все'}
                    </Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {comps.map((comp) => {
                      const isSelected = selectedIds.includes(comp.id);
                      
                      return (
                        <div
                          key={comp.id}
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleToggleCompetency(comp.id)}
                          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleToggleCompetency(comp.id); }}}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border select-none",
                            isSelected
                              ? cn(config.selectedCardBg, config.borderColor, "shadow-sm")
                              : "bg-card border-border hover:border-primary/30 hover:bg-muted/50 dark:hover:bg-muted/30"
                          )}
                        >
                          {/* Custom checkbox visual - no Radix state */}
                          <div className={cn(
                            "h-5 w-5 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                            isSelected 
                              ? "bg-primary border-primary text-primary-foreground" 
                              : "border-muted-foreground/40 bg-background dark:bg-muted/50"
                          )}>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-semibold leading-tight",
                              isSelected && "text-foreground"
                            )}>
                              {comp.name}
                            </p>
                            {comp.level && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {comp.level}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

// ============================================================================
// Step 3: Configuration (FIXED: Smaller Toggles)
// ============================================================================

function ConfigurationStep({ form }: { form: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Основные параметры</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { name: 'questionsPerIndicator', label: 'Вопросы/индикатор', icon: HelpCircle, options: [1, 2, 3, 5], suffix: 'вопр.' },
            { name: 'timeLimitMinutes', label: 'Время на тест', icon: Clock, options: [15, 30, 45, 60, 90, 120], suffix: 'мин' },
            { name: 'passingScore', label: 'Проходной балл', icon: Percent, options: [50, 60, 70, 80, 90], suffix: '%' },
          ].map((fieldData) => (
            <FormField key={fieldData.name} control={form.control} name={fieldData.name} render={({ field }) => (
              <FormItem className="p-4 border rounded-2xl bg-card shadow-sm space-y-3">
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <fieldData.icon className="h-4 w-4" /> {fieldData.label}
                </FormLabel>
                <Select value={field.value.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base rounded-xl bg-background border-input/60">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldData.options.map(opt => (
                      <SelectItem key={opt} value={opt.toString()}>{opt} {fieldData.suffix}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Режим прохождения</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'shuffleQuestions', label: 'Перемешать вопросы', desc: 'Случайный порядок' },
            { name: 'shuffleOptions', label: 'Перемешать ответы', desc: 'Случайный порядок вариантов' },
            { name: 'allowSkip', label: 'Разрешить пропуск', desc: 'Можно пропустить вопрос' },
            { name: 'allowBackNavigation', label: 'Возврат назад', desc: 'Можно изменить ответ' },
            { name: 'showResultsImmediately', label: 'Результат сразу', desc: 'Показать итог в конце' },
          ].map((item) => (
            <FormField key={item.name} control={form.control} name={item.name} render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 border rounded-2xl bg-card shadow-sm active:bg-muted/30 transition-colors">
                <div className="space-y-1 mr-4">
                  <FormLabel className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{item.label}</FormLabel>
                  <FormDescription className="text-xs">{item.desc}</FormDescription>
                </div>
                <FormControl>
                  {/* CHANGED: Removed scale-110, added scale-90 for mobile to make it smaller */}
                  <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-90 md:scale-100" />
                </FormControl>
              </FormItem>
            )} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 4: Review
// ============================================================================

function ReviewStep({ form, competencies }: NewTestFormProps & { form: any }) {
  const values = form.getValues();
  const selectedCompetencies = competencies.filter(c => values.competencyIds.includes(c.id));
  const config = [
    { label: 'Вопросов/инд.', value: values.questionsPerIndicator, icon: HelpCircle },
    { label: 'Время', value: `${values.timeLimitMinutes} мин`, icon: Clock },
    { label: 'Порог', value: `${values.passingScore}%`, icon: Percent },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <Card className="rounded-2xl border-none shadow-sm bg-primary/5">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-background rounded-xl shadow-sm shrink-0 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
               <h3 className="font-bold text-xl break-words leading-tight mb-1">{values.name}</h3>
               <p className="text-sm text-muted-foreground line-clamp-2">{values.description || "Без описания"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Competencies */}
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Target className="h-5 w-5" /></div>
                    <span className="font-semibold">Компетенции ({selectedCompetencies.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedCompetencies.slice(0, 5).map(c => (
                        <Badge key={c.id} variant="secondary" className="rounded-md font-normal">{c.name}</Badge>
                    ))}
                    {selectedCompetencies.length > 5 && <Badge variant="outline">+{selectedCompetencies.length - 5} ещё</Badge>}
                </div>
            </CardContent>
        </Card>

        {/* Settings */}
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Settings className="h-5 w-5" /></div>
                    <span className="font-semibold">Параметры</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {config.map((c, i) => (
                        <div key={i} className="text-center p-2 rounded-xl bg-muted/30 border">
                            <div className="text-lg font-bold">{c.value}</div>
                            <div className="text-[10px] uppercase text-muted-foreground font-medium flex justify-center gap-1 items-center mt-1">
                                <c.icon className="h-3 w-3" /> {c.label}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function NewTestForm({ competencies }: NewTestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', description: '', goal: AssessmentGoal.OVERVIEW, competencyIds: [],
      questionsPerIndicator: 2, timeLimitMinutes: 30, passingScore: 70,
      shuffleQuestions: true, shuffleOptions: true, allowSkip: false, allowBackNavigation: true, showResultsImmediately: true,
      // Goal-specific defaults
      includeBigFive: true,
      preferredDifficulty: 'INTERMEDIATE',
      onetSocCode: '',
      strictnessLevel: 60,
      enableDeltaTesting: false,
      teamId: '',
      saturationThreshold: 0.7,
    },
    mode: 'onBlur',
  });

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleNext = async () => {
    let fields: any[] = [];
    if (currentStep === 1) fields = ['name', 'description', 'goal'];
    if (currentStep === 2) fields = ['competencyIds'];
    if (currentStep === 3) fields = ['questionsPerIndicator', 'timeLimitMinutes', 'passingScore'];
    
    const isValid = await form.trigger(fields);
    if (isValid && currentStep < STEPS.length) setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async (values: FormValues) => {
    startTransition(async () => {
      try {
        // Build goal-specific blueprint
        const blueprint: TestTemplateBlueprint = {};

        if (values.goal === AssessmentGoal.OVERVIEW) {
          blueprint.include_big_five = values.includeBigFive;
          blueprint.preferred_difficulty = values.preferredDifficulty;
        } else if (values.goal === AssessmentGoal.JOB_FIT) {
          blueprint.onet_soc_code = values.onetSocCode;
          blueprint.strictness_level = values.strictnessLevel;
          blueprint.enable_delta_testing = values.enableDeltaTesting;
        } else if (values.goal === AssessmentGoal.TEAM_FIT) {
          blueprint.team_id = values.teamId;
          blueprint.saturation_threshold = values.saturationThreshold;
        }

        // Create template request with blueprint
        const request: CreateTestTemplateRequest = {
          name: values.name,
          description: values.description,
          goal: values.goal,
          blueprint,
          competencyIds: values.competencyIds,
          questionsPerIndicator: values.questionsPerIndicator,
          timeLimitMinutes: values.timeLimitMinutes,
          passingScore: values.passingScore,
          shuffleQuestions: values.shuffleQuestions,
          shuffleOptions: values.shuffleOptions,
          allowSkip: values.allowSkip,
          allowBackNavigation: values.allowBackNavigation,
          showResultsImmediately: values.showResultsImmediately,
        };

        const template = await testTemplatesApi.createTemplate(request) as { id: string };
        toast.success('Тест создан!');
        router.push(`/test-templates/${template.id}`);
      } catch (e: any) {
        toast.error(e?.message || 'Ошибка создания');
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative min-h-screen pb-32 md:pb-10">
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card className="border-0 md:border shadow-none md:shadow-sm bg-transparent md:bg-card">
            <CardContent className="p-0 md:p-8">
              {currentStep === 1 && <BasicInfoStep form={form} />}
              {currentStep === 2 && <CompetenciesStep form={form} competencies={competencies} />}
              {currentStep === 3 && <ConfigurationStep form={form} />}
              {currentStep === 4 && <ReviewStep form={form} competencies={competencies} />}
            </CardContent>
          </Card>

          {/* Sticky Footer: FIXED GRID LAYOUT (Prevents missing Next button) */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t z-50 grid grid-cols-[1fr_2fr] gap-3 safe-area-bottom shadow-lg md:hidden">
             <Button type="button" variant="outline" size="lg" className="h-12 rounded-xl text-base w-full"
                onClick={currentStep === 1 ? () => router.back() : () => setCurrentStep(p => p - 1)} disabled={isPending}>
                {currentStep === 1 ? 'Отмена' : 'Назад'}
             </Button>
             
             {currentStep < STEPS.length ? (
               <Button type="button" size="lg" className="h-12 rounded-xl text-base w-full shadow-primary/25 shadow-md" onClick={handleNext}>
                 Далее
               </Button>
             ) : (
               <Button type="submit" size="lg" className="h-12 rounded-xl text-base w-full shadow-primary/25 shadow-md" disabled={isPending}>
                 {isPending ? <Loader2 className="animate-spin" /> : <><Check className="mr-2 h-5 w-5" /> Создать</>}
               </Button>
             )}
          </div>

          {/* Desktop Footer (Standard) */}
          <div className="hidden md:flex justify-between mt-8">
             <Button type="button" variant="ghost" onClick={currentStep === 1 ? () => router.back() : () => setCurrentStep(p => p - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
             </Button>
             {currentStep < STEPS.length ? (
               <Button type="button" onClick={handleNext}>Далее <ArrowRight className="ml-2 h-4 w-4" /></Button>
             ) : (
               <Button type="submit" disabled={isPending}>
                 {isPending ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />} Создать тест
               </Button>
             )}
          </div>
        </form>
      </Form>
    </div>
  );
}