'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { CreateTestTemplateRequest } from '@/app/interfaces/domain-interfaces';
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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Step 1: Basic Info
  name: z.string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z.string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
  
  // Step 2: Competencies
  competencyIds: z.array(z.string())
    .min(1, 'Выберите хотя бы одну компетенцию'),
  
  // Step 3: Configuration
  questionsPerIndicator: z.number().min(1).max(5),
  timeLimitMinutes: z.number().min(5).max(180),
  passingScore: z.number().min(10).max(100),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  allowSkip: z.boolean(),
  allowBackNavigation: z.boolean(),
  showResultsImmediately: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// Step Configuration
// ============================================================================

const STEPS = [
  { 
    id: 1, 
    title: 'Основное', 
    description: 'Название и описание',
    icon: FileText 
  },
  { 
    id: 2, 
    title: 'Компетенции', 
    description: 'Выберите для оценки',
    icon: Target 
  },
  { 
    id: 3, 
    title: 'Настройки', 
    description: 'Параметры теста',
    icon: Settings 
  },
  { 
    id: 4, 
    title: 'Проверка', 
    description: 'Подтверждение',
    icon: Eye 
  },
] as const;

// ============================================================================
// Progress Indicator Component
// ============================================================================

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className="mb-6 md:mb-10">
      {/* Step Labels - Desktop - Full width horizontal stepper */}
      <div className="hidden md:grid md:grid-cols-4 gap-2 mb-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div 
                className={cn(
                  "flex items-center gap-3 flex-1 p-3 rounded-lg transition-all",
                  isActive && "bg-primary/10 border border-primary/20",
                  isCompleted && "bg-muted/50",
                  !isActive && !isCompleted && "opacity-50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all flex-shrink-0",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "border-muted-foreground/30 bg-background"
                )}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    isActive && "text-primary"
                  )}>{step.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "w-4 h-0.5 mx-1 flex-shrink-0",
                  isCompleted ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <Progress value={progress} className="h-2 md:h-1.5" />
      
      {/* Mobile Step Label */}
      <div className="md:hidden mt-3 text-center">
        <p className="text-sm font-medium">
          Шаг {currentStep} из {totalSteps}: {STEPS[currentStep - 1].title}
        </p>
        <p className="text-xs text-muted-foreground">
          {STEPS[currentStep - 1].description}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Step 1: Basic Info
// ============================================================================

interface BasicInfoStepProps {
  form: ReturnType<typeof useForm<FormValues>>;
}

function BasicInfoStep({ form }: BasicInfoStepProps) {
  const description = form.watch('description') || '';
  
  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Основная информация</h2>
        <p className="text-muted-foreground mt-1">
          Укажите название и описание теста для идентификации
        </p>
      </div>

      {/* Form Fields - Using full width with larger inputs */}
      <div className="grid gap-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Название теста <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Например: Оценка лидерских качеств" 
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormDescription className="text-sm">
                Краткое и понятное название для идентификации теста
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Описание</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Опишите цель и содержание теста..." 
                  className="min-h-[160px] resize-none text-base"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormDescription className="text-sm">
                  Подробное описание поможет пользователям понять назначение теста
                </FormDescription>
                <span className={cn(
                  "text-sm tabular-nums",
                  description.length > 450 ? "text-warning" : "text-muted-foreground",
                  description.length > 500 && "text-destructive"
                )}>
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
// Step 2: Competencies Selection
// ============================================================================

interface CompetenciesStepProps {
  form: ReturnType<typeof useForm<FormValues>>;
  competencies: CompetencyOption[];
}

function CompetenciesStep({ form, competencies }: CompetenciesStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const selectedIds = form.watch('competencyIds');
  
  // Group and filter competencies
  const { filteredByCategory, totalFiltered } = useMemo(() => {
    const filtered = competencies.filter(comp =>
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const grouped = new Map<string, CompetencyOption[]>();
    for (const comp of filtered) {
      const category = comp.category || 'Другое';
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, comp]);
    }
    
    return { 
      filteredByCategory: Object.fromEntries(grouped), 
      totalFiltered: filtered.length 
    };
  }, [competencies, searchQuery]);

  const toggleCompetency = (id: string) => {
    const current = form.getValues('competencyIds');
    const updated = current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id];
    form.setValue('competencyIds', updated, { shouldValidate: true });
  };

  const selectAllVisible = () => {
    const allIds = Object.values(filteredByCategory).flat().map(c => c.id);
    const currentIds = form.getValues('competencyIds');
    const newIds = [...new Set([...currentIds, ...allIds])];
    form.setValue('competencyIds', newIds, { shouldValidate: true });
  };

  const clearSelection = () => {
    form.setValue('competencyIds', [], { shouldValidate: true });
  };

  // Select/deselect all in a specific category
  const toggleCategory = (categoryComps: CompetencyOption[]) => {
    const categoryIds = categoryComps.map(c => c.id);
    const currentIds = form.getValues('competencyIds');
    const allSelected = categoryIds.every(id => currentIds.includes(id));
    
    if (allSelected) {
      const newIds = currentIds.filter(id => !categoryIds.includes(id));
      form.setValue('competencyIds', newIds, { shouldValidate: true });
    } else {
      const newIds = [...new Set([...currentIds, ...categoryIds])];
      form.setValue('competencyIds', newIds, { shouldValidate: true });
    }
  };

  // Check if all items in category are selected
  const isCategoryFullySelected = (categoryComps: CompetencyOption[]) => {
    const categoryIds = categoryComps.map(c => c.id);
    return categoryIds.every(id => selectedIds.includes(id));
  };

  // Check if some items in category are selected
  const isCategoryPartiallySelected = (categoryComps: CompetencyOption[]) => {
    const categoryIds = categoryComps.map(c => c.id);
    const selectedCount = categoryIds.filter(id => selectedIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < categoryIds.length;
  };

  if (competencies.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/20">
        <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-xl">Нет доступных компетенций</h3>
        <p className="text-muted-foreground mt-2">
          Сначала создайте компетенции в системе
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Выбор компетенций</h2>
        <p className="text-muted-foreground mt-1">Выберите компетенции для оценки в тесте</p>
      </div>

      {/* Selected Competencies Summary - Chips at top for visibility */}
      {selectedIds.length > 0 && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-primary">
              Выбранные компетенции ({selectedIds.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Очистить все
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIds.slice(0, 10).map(id => {
              const comp = competencies.find(c => c.id === id);
              return comp ? (
                <Badge
                  key={id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors group"
                  onClick={() => toggleCompetency(id)}
                >
                  {comp.name}
                  <X className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100" />
                </Badge>
              ) : null;
            })}
            {selectedIds.length > 10 && (
              <Badge variant="outline" className="bg-background">
                +{selectedIds.length - 10} ещё
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 text-base pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
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
            onClick={selectAllVisible}
            className="flex-1 md:flex-none h-12 px-4"
            disabled={totalFiltered === 0}
          >
            Выбрать все
          </Button>
        </div>
      </div>

      {/* Results Summary Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg border">
        <span className="text-sm">
          {searchQuery ? (
            <>Найдено: <strong>{totalFiltered}</strong> из {competencies.length}</>
          ) : (
            <>Всего компетенций: <strong>{competencies.length}</strong></>
          )}
        </span>
        <Badge 
          variant={selectedIds.length > 0 ? 'default' : 'secondary'}
          className="text-sm px-3 py-1"
        >
          Выбрано: {selectedIds.length}
        </Badge>
      </div>

      {/* Empty State for Search */}
      {totalFiltered === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg">Ничего не найдено</h3>
          <p className="text-muted-foreground mt-2">
            Попробуйте изменить поисковый запрос
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => setSearchQuery('')}
          >
            Сбросить поиск
          </Button>
        </div>
      ) : (
        /* Competencies List with Category Grouping */
        <FormField
          control={form.control}
          name="competencyIds"
          render={() => (
            <FormItem>
              <div className="max-h-[500px] overflow-y-auto border rounded-lg">
                {Object.entries(filteredByCategory).map(([category, comps]) => {
                  const selectedInCategory = comps.filter(c => selectedIds.includes(c.id)).length;
                  const isFullySelected = isCategoryFullySelected(comps);
                  const isPartiallySelected = isCategoryPartiallySelected(comps);
                  
                  return (
                    <div key={category} className="border-b last:border-b-0">
                      {/* Category Header with Select All */}
                      <div className="px-4 py-3 bg-muted/30 sticky top-0 z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isFullySelected}
                            ref={(el) => {
                              if (el) {
                                (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = isPartiallySelected;
                              }
                            }}
                            onCheckedChange={() => toggleCategory(comps)}
                            className="h-4 w-4"
                          />
                          <span className="font-semibold">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={selectedInCategory > 0 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {selectedInCategory}/{comps.length}
                          </Badge>
                          {selectedInCategory === comps.length && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                      
                      {/* Competencies Grid */}
                      <div className="p-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {comps.map((comp) => (
                          <label
                            key={comp.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border group",
                              selectedIds.includes(comp.id) 
                                ? "bg-primary/10 border-primary/30 hover:bg-primary/15 shadow-sm" 
                                : "border-transparent hover:bg-muted hover:border-border"
                            )}
                          >
                            <Checkbox
                              checked={selectedIds.includes(comp.id)}
                              onCheckedChange={() => toggleCompetency(comp.id)}
                              className="h-5 w-5 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm leading-tight block truncate">
                                {comp.name}
                              </span>
                              {comp.level && (
                                <span className="text-xs text-muted-foreground mt-0.5 block">
                                  {comp.level}
                                </span>
                              )}
                            </div>
                            {selectedIds.includes(comp.id) && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

// ============================================================================
// Step 3: Configuration
// ============================================================================

interface ConfigurationStepProps {
  form: ReturnType<typeof useForm<FormValues>>;
}

function ConfigurationStep({ form }: ConfigurationStepProps) {
  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Настройки теста</h2>
        <p className="text-muted-foreground mt-1">
          Настройте параметры прохождения теста
        </p>
      </div>

      {/* Main Parameters - Prominent cards */}
      <div>
        <h3 className="text-lg font-medium mb-4">Основные параметры</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="questionsPerIndicator"
            render={({ field }) => (
              <FormItem className="p-4 border rounded-lg bg-card">
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Вопросов на индикатор
                </FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 вопрос</SelectItem>
                    <SelectItem value="2">2 вопроса</SelectItem>
                    <SelectItem value="3">3 вопроса</SelectItem>
                    <SelectItem value="5">5 вопросов</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="mt-2">
                  Количество вопросов для каждого индикатора
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeLimitMinutes"
            render={({ field }) => (
              <FormItem className="p-4 border rounded-lg bg-card">
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Clock className="h-5 w-5 text-primary" />
                  Время на тест
                </FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15">15 минут</SelectItem>
                    <SelectItem value="30">30 минут</SelectItem>
                    <SelectItem value="45">45 минут</SelectItem>
                    <SelectItem value="60">1 час</SelectItem>
                    <SelectItem value="90">1.5 часа</SelectItem>
                    <SelectItem value="120">2 часа</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="mt-2">
                  Максимальная продолжительность теста
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passingScore"
            render={({ field }) => (
              <FormItem className="p-4 border rounded-lg bg-card">
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Percent className="h-5 w-5 text-primary" />
                  Проходной балл
                </FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(v) => field.onChange(parseInt(v))}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="60">60%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="mt-2">
                  Минимальный балл для прохождения
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Toggle Settings - Better organized grid */}
      <div>
        <h3 className="text-lg font-medium mb-4">Настройки прохождения</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="shuffleQuestions"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <FormLabel className="flex items-center gap-2 cursor-pointer text-base">
                    <Shuffle className="h-4 w-4 text-muted-foreground" />
                    Перемешивать вопросы
                  </FormLabel>
                  <FormDescription>
                    Случайный порядок вопросов
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-110"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shuffleOptions"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <FormLabel className="flex items-center gap-2 cursor-pointer text-base">
                    <Shuffle className="h-4 w-4 text-muted-foreground" />
                    Перемешивать ответы
                  </FormLabel>
                  <FormDescription>
                    Случайный порядок вариантов
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-110"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowSkip"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <FormLabel className="flex items-center gap-2 cursor-pointer text-base">
                    <SkipForward className="h-4 w-4 text-muted-foreground" />
                    Разрешить пропуск
                  </FormLabel>
                  <FormDescription>
                    Можно пропустить вопрос
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-110"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowBackNavigation"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <FormLabel className="flex items-center gap-2 cursor-pointer text-base">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    Возврат к вопросам
                  </FormLabel>
                  <FormDescription>
                    Можно вернуться назад
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-110"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showResultsImmediately"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors md:col-span-2 lg:col-span-2">
                <div className="space-y-1">
                  <FormLabel className="flex items-center gap-2 cursor-pointer text-base">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Показать результаты сразу
                  </FormLabel>
                  <FormDescription>
                    Результат виден сразу после завершения теста
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-110"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 4: Review
// ============================================================================

interface ReviewStepProps {
  form: ReturnType<typeof useForm<FormValues>>;
  competencies: CompetencyOption[];
}

function ReviewStep({ form, competencies }: ReviewStepProps) {
  const values = form.getValues();
  
  const selectedCompetencies = competencies.filter(c => 
    values.competencyIds.includes(c.id)
  );

  const configItems = [
    { label: 'Вопросов на индикатор', value: values.questionsPerIndicator, icon: HelpCircle },
    { label: 'Время на тест', value: `${values.timeLimitMinutes} мин`, icon: Clock },
    { label: 'Проходной балл', value: `${values.passingScore}%`, icon: Percent },
  ];

  const toggleItems = [
    { label: 'Перемешивание вопросов', enabled: values.shuffleQuestions },
    { label: 'Перемешивание ответов', enabled: values.shuffleOptions },
    { label: 'Пропуск вопросов', enabled: values.allowSkip },
    { label: 'Возврат к вопросам', enabled: values.allowBackNavigation },
    { label: 'Результаты сразу', enabled: values.showResultsImmediately },
  ];

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Проверка данных</h2>
        <p className="text-muted-foreground mt-1">
          Убедитесь, что все данные заполнены верно перед созданием теста
        </p>
      </div>

      {/* Summary Grid - Two columns on wide screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info Summary */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Название теста</p>
                <h3 className="font-semibold text-lg truncate">{values.name}</h3>
                {values.description ? (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {values.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/70 mt-2 italic">
                    Без описания
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competencies Summary */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Компетенции</p>
                <h3 className="font-semibold text-lg">
                  Выбрано: {selectedCompetencies.length}
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCompetencies.slice(0, 6).map(comp => (
                <Badge key={comp.id} variant="secondary" className="text-sm">
                  {comp.name}
                </Badge>
              ))}
              {selectedCompetencies.length > 6 && (
                <Badge variant="outline" className="text-sm">
                  +{selectedCompetencies.length - 6} ещё
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Summary - Full width */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Настройки</p>
              <h3 className="font-semibold text-lg">Параметры теста</h3>
            </div>
          </div>
          
          {/* Main params in cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {configItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <Icon className="h-8 w-8 text-primary/70" />
                  <div>
                    <p className="text-3xl font-bold">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggle status badges */}
          <div className="flex flex-wrap gap-2">
            {toggleItems.map(item => (
              <Badge 
                key={item.label}
                variant={item.enabled ? 'default' : 'outline'}
                className={cn(
                  "text-sm py-1.5 px-3",
                  !item.enabled && "opacity-50"
                )}
              >
                {item.enabled ? '✓' : '✗'} {item.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Form Component
// ============================================================================

export default function NewTestForm({ competencies }: NewTestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      competencyIds: [],
      questionsPerIndicator: 2,
      timeLimitMinutes: 30,
      passingScore: 70,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowSkip: false,
      allowBackNavigation: true,
      showResultsImmediately: true,
    },
    mode: 'onChange',
  });

  // Step validation
  const canProceed = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ['name', 'description'];
        break;
      case 2:
        fieldsToValidate = ['competencyIds'];
        break;
      case 3:
        fieldsToValidate = [
          'questionsPerIndicator',
          'timeLimitMinutes', 
          'passingScore'
        ];
        break;
    }
    
    return form.trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await canProceed(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    const request: CreateTestTemplateRequest = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
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

    startTransition(async () => {
      try {
        const template = await testTemplatesApi.createTemplate(request) as { id: string };
        toast.success('Тест успешно создан!');
        router.push(`/test-templates/${template.id}`);
      } catch (error: unknown) {
        const apiError = error as { message?: string };
        toast.error(apiError?.message || 'Не удалось создать тест');
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-6 md:p-8">
              {currentStep === 1 && <BasicInfoStep form={form} />}
              {currentStep === 2 && (
                <CompetenciesStep form={form} competencies={competencies} />
              )}
              {currentStep === 3 && <ConfigurationStep form={form} />}
              {currentStep === 4 && (
                <ReviewStep form={form} competencies={competencies} />
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons - Large touch targets for better UX */}
          <div className="flex justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={currentStep === 1 ? () => router.back() : handleBack}
              disabled={isPending}
              className="min-w-[120px] h-12"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {currentStep === 1 ? 'Отмена' : 'Назад'}
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                size="lg"
                onClick={handleNext}
                className="min-w-32 h-12"
              >
                Далее
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                size="lg"
                disabled={isPending}
                className="min-w-40 h-12"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Создать тест
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
