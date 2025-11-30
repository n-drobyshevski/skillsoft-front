'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { testTemplatesApi } from '@/services/api';
import { TestTemplate, UpdateTestTemplateRequest } from '@/types/domain';
import { AssessmentGoal, AssessmentGoalInfo } from '@/types/domain';
import { toast } from 'sonner';
import { 
  Loader2, 
  Save,
  ArrowLeft,
  FileText, 
  Target, 
  Settings, 
  Clock,
  HelpCircle,
  Percent,
  Shuffle,
  SkipForward,
  RotateCcw,
  BarChart3,
  Check,
  Power,
  PowerOff,
  Search,
  X,
  Crosshair,
  Briefcase,
  Users
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

interface EditTestFormProps {
  template: TestTemplate;
  competencies: CompetencyOption[];
}

const formSchema = z.object({
  name: z.string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z.string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
  goal: z.nativeEnum(AssessmentGoal),
  competencyIds: z.array(z.string())
    .min(1, 'Выберите хотя бы одну компетенцию'),
  questionsPerIndicator: z.number().min(1).max(5),
  timeLimitMinutes: z.number().min(5).max(180),
  passingScore: z.number().min(10).max(100),
  isActive: z.boolean(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  allowSkip: z.boolean(),
  allowBackNavigation: z.boolean(),
  showResultsImmediately: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================================================
// Main Edit Form Component
// ============================================================================

export default function EditTestForm({ template, competencies }: EditTestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name,
      description: template.description || '',
      goal: template.goal || AssessmentGoal.OVERVIEW,
      competencyIds: template.competencyIds || [],
      questionsPerIndicator: template.questionsPerIndicator,
      timeLimitMinutes: template.timeLimitMinutes,
      passingScore: template.passingScore,
      isActive: template.isActive,
      shuffleQuestions: template.shuffleQuestions,
      shuffleOptions: template.shuffleOptions,
      allowSkip: template.allowSkip,
      allowBackNavigation: template.allowBackNavigation,
      showResultsImmediately: template.showResultsImmediately,
    },
    mode: 'onChange',
  });

  const selectedIds = form.watch('competencyIds');
  const description = form.watch('description') || '';
  const hasChanges = form.formState.isDirty;

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
    form.setValue('competencyIds', updated, { shouldValidate: true, shouldDirty: true });
  };

  // Select/deselect all visible competencies
  const selectAllVisible = () => {
    const allVisibleIds = Object.values(filteredByCategory).flat().map(c => c.id);
    const currentIds = form.getValues('competencyIds');
    const newIds = [...new Set([...currentIds, ...allVisibleIds])];
    form.setValue('competencyIds', newIds, { shouldValidate: true, shouldDirty: true });
  };

  const clearSelection = () => {
    form.setValue('competencyIds', [], { shouldValidate: true, shouldDirty: true });
  };

  // Select/deselect all in a specific category
  const toggleCategory = (categoryComps: CompetencyOption[]) => {
    const categoryIds = categoryComps.map(c => c.id);
    const currentIds = form.getValues('competencyIds');
    const allSelected = categoryIds.every(id => currentIds.includes(id));
    
    if (allSelected) {
      // Deselect all in this category
      const newIds = currentIds.filter(id => !categoryIds.includes(id));
      form.setValue('competencyIds', newIds, { shouldValidate: true, shouldDirty: true });
    } else {
      // Select all in this category
      const newIds = [...new Set([...currentIds, ...categoryIds])];
      form.setValue('competencyIds', newIds, { shouldValidate: true, shouldDirty: true });
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

  const handleSubmit = async (values: FormValues) => {
    const request: UpdateTestTemplateRequest = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      goal: values.goal,
      competencyIds: values.competencyIds,
      questionsPerIndicator: values.questionsPerIndicator,
      timeLimitMinutes: values.timeLimitMinutes,
      passingScore: values.passingScore,
      isActive: values.isActive,
      shuffleQuestions: values.shuffleQuestions,
      shuffleOptions: values.shuffleOptions,
      allowSkip: values.allowSkip,
      allowBackNavigation: values.allowBackNavigation,
      showResultsImmediately: values.showResultsImmediately,
    };

    startTransition(async () => {
      try {
        await testTemplatesApi.updateTemplate(template.id, request);
        toast.success('Тест успешно обновлён!');
        router.push(`/test-templates/${template.id}`);
        router.refresh();
      } catch (error: unknown) {
        const apiError = error as { message?: string };
        toast.error(apiError?.message || 'Не удалось обновить тест');
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Header with Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Редактирование теста</h1>
                <p className="text-muted-foreground mt-0.5">
                  {template.name}
                </p>
              </div>
            </div>
            
            {/* Status Toggle - Prominent */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <div className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-colors",
                  field.value 
                    ? "border-green-500/30 bg-green-500/5" 
                    : "border-orange-500/30 bg-orange-500/5"
                )}>
                  {field.value ? (
                    <Power className="h-5 w-5 text-green-600" />
                  ) : (
                    <PowerOff className="h-5 w-5 text-orange-600" />
                  )}
                  <span className={cn(
                    "font-medium text-sm",
                    field.value ? "text-green-700" : "text-orange-700"
                  )}>
                    {field.value ? 'Активен' : 'Неактивен'}
                  </span>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 mb-8">
              <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
                <FileText className="h-4 w-4" />
                <span>Основное</span>
              </TabsTrigger>
              <TabsTrigger value="competencies" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
                <Target className="h-4 w-4" />
                <span>Компетенции</span>
                <Badge 
                  variant={selectedIds.length > 0 ? 'default' : 'secondary'}
                  className="ml-1 text-xs"
                >
                  {selectedIds.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
                <Settings className="h-4 w-4" />
                <span>Настройки</span>
              </TabsTrigger>
            </TabsList>

            {/* ============================================ */}
            {/* GENERAL TAB */}
            {/* ============================================ */}
            <TabsContent value="general" className="space-y-8">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Основная информация</h2>
                <p className="text-muted-foreground mt-1">Название и описание теста</p>
              </div>

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
                      <FormDescription>
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
                          className="min-h-[120px] resize-none text-base"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormDescription>
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

                {/* Assessment Goal Selection */}
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Цель оценки <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid gap-3 sm:grid-cols-3"
                        >
                          {[
                            { value: AssessmentGoal.OVERVIEW, icon: Crosshair, className: 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5', selectedClassName: 'border-primary bg-primary/10', iconSelectedClassName: 'text-primary' },
                            { value: AssessmentGoal.JOB_FIT, icon: Briefcase, className: 'border-muted-foreground/30 hover:border-blue-500/50 hover:bg-blue-500/5', selectedClassName: 'border-blue-500 bg-blue-500/10', iconSelectedClassName: 'text-blue-500' },
                            { value: AssessmentGoal.TEAM_FIT, icon: Users, className: 'border-muted-foreground/30 hover:border-purple-500/50 hover:bg-purple-500/5', selectedClassName: 'border-purple-500 bg-purple-500/10', iconSelectedClassName: 'text-purple-500' },
                          ].map((option) => {
                            const Icon = option.icon;
                            const info = AssessmentGoalInfo[option.value];
                            const isSelected = field.value === option.value;
                            
                            return (
                              <Label
                                key={option.value}
                                htmlFor={`edit-goal-${option.value}`}
                                className={cn(
                                  "flex flex-col items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all",
                                  isSelected ? option.selectedClassName : option.className
                                )}
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`edit-goal-${option.value}`}
                                  className="sr-only"
                                />
                                <Icon className={cn(
                                  "h-8 w-8 transition-colors",
                                  isSelected ? option.iconSelectedClassName : "text-muted-foreground"
                                )} />
                                <div className="text-center">
                                  <p className={cn(
                                    "font-semibold text-sm transition-colors",
                                    isSelected && option.iconSelectedClassName
                                  )}>
                                    {info.displayName}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {info.description}
                                  </p>
                                </div>
                              </Label>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Выберите тип оценки, который определяет стратегию подсчёта результатов
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Parameters Section */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Основные параметры</h3>
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
            </TabsContent>

            {/* ============================================ */}
            {/* COMPETENCIES TAB */}
            {/* ============================================ */}
            <TabsContent value="competencies" className="space-y-6">
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

              {/* Empty State */}
              {competencies.length === 0 ? (
                <div className="text-center py-16 border rounded-lg bg-muted/20">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-xl">Нет доступных компетенций</h3>
                  <p className="text-muted-foreground mt-2">
                    Сначала создайте компетенции в системе
                  </p>
                </div>
              ) : totalFiltered === 0 ? (
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
                                        // Set indeterminate state for partial selection
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
            </TabsContent>

            {/* ============================================ */}
            {/* SETTINGS TAB */}
            {/* ============================================ */}
            <TabsContent value="settings" className="space-y-8">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Настройки теста</h2>
                <p className="text-muted-foreground mt-1">Параметры прохождения теста</p>
              </div>

              {/* Toggle Settings Grid */}
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
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={!hasChanges}
                >
                  Отменить изменения
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Отменить изменения?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Все несохранённые изменения будут потеряны. Вы уверены?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push(`/test-templates/${template.id}`)}>
                    Отменить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              type="submit" 
              disabled={isPending || !hasChanges} 
              className="min-w-[180px] h-12"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
