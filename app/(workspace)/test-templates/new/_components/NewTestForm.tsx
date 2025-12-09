'use client';

import React, { useState, useTransition, useMemo, useEffect } from 'react';
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
import { CreateTestTemplateRequest } from '@/types/domain';
import { AssessmentGoal, AssessmentGoalInfo } from '@/types/domain';
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
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {GOAL_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const info = AssessmentGoalInfo[option.value];
                    const isSelected = selectedGoal === option.value;
                    
                    return (
                      <div key={option.value} className="relative group">
                        <RadioGroupItem value={option.value} id={`goal-${option.value}`} className="sr-only" />
                        <Label
                          htmlFor={`goal-${option.value}`}
                          className={cn(
                            "flex sm:flex-col items-center gap-4 sm:gap-3 rounded-2xl border p-4 cursor-pointer transition-all duration-200 w-full h-full relative overflow-hidden active:scale-[0.98]",
                            isSelected ? option.selectedClassName : option.className
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 animate-in zoom-in duration-200">
                                <CheckCircle2 className="h-5 w-5 text-primary fill-background" />
                            </div>
                          )}
                          <div className={cn(
                            "p-2.5 rounded-full transition-colors shrink-0",
                            isSelected ? "bg-background" : "bg-muted group-hover:bg-background"
                          )}>
                             <Icon className={cn("h-6 w-6 sm:h-8 sm:w-8", isSelected ? "text-primary" : "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 sm:text-center min-w-0">
                            <p className={cn("font-bold text-sm sm:text-base", isSelected && "text-primary")}>
                              {info.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-2 line-clamp-2 leading-relaxed">
                              {info.description}
                            </p>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </FormControl>
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
// Step 2: Competencies (FIXED: Visible Checkboxes & build error)
// ============================================================================

function CompetenciesStep({ form, competencies }: NewTestFormProps & { form: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectedOpen, setIsSelectedOpen] = useState(true);
  const selectedIds = form.watch('competencyIds');
  
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
    return { filteredByCategory: Object.fromEntries(grouped), totalFiltered: filtered.length };
  }, [competencies, searchQuery]);

  const toggleCompetency = (id: string) => {
    const current = form.getValues('competencyIds');
    const updated = current.includes(id) ? current.filter((c: string) => c !== id) : [...current, id];
    form.setValue('competencyIds', updated, { shouldValidate: true });
  };

  const selectAllVisible = () => {
    const allIds = Object.values(filteredByCategory).flat().map((c: any) => c.id);
    const currentIds = form.getValues('competencyIds');
    const newIds = [...new Set([...currentIds, ...allIds])];
    form.setValue('competencyIds', newIds, { shouldValidate: true });
  };

  const toggleCategory = (categoryComps: CompetencyOption[]) => {
    const categoryIds = categoryComps.map(c => c.id);
    const currentIds = form.getValues('competencyIds');
    const allSelected = categoryIds.every(id => currentIds.includes(id));
    if (allSelected) {
      form.setValue('competencyIds', currentIds.filter((id: string) => !categoryIds.includes(id)), { shouldValidate: true });
    } else {
      form.setValue('competencyIds', [...new Set([...currentIds, ...categoryIds])], { shouldValidate: true });
    }
  };

  if (competencies.length === 0) return (
    <div className="text-center py-16 border rounded-2xl bg-muted/20">
      <Target className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="font-semibold text-xl">Нет компетенций</h3>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-3 sticky top-0 md:static z-20 bg-background/80 backdrop-blur-md pb-2 md:pb-0 pt-1">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск навыков..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 md:h-12 text-base rounded-xl pl-11 pr-10 shadow-sm"
          />
          {searchQuery && (
            <Button
              type="button" variant="ghost" size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full hover:bg-muted"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
            type="button" variant="outline" onClick={selectAllVisible}
            className="h-12 rounded-xl px-5 border-dashed"
            disabled={totalFiltered === 0}
          >
            Выбрать все
        </Button>
      </div>

      {/* Selected Drawer */}
      {selectedIds.length > 0 && (
        <Collapsible open={isSelectedOpen} onOpenChange={setIsSelectedOpen} className="border border-primary/20 rounded-xl bg-primary/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-3.5 bg-primary/5">
                 <div className="flex items-center gap-2.5">
                    <Badge className="h-6 px-2 rounded-md">{selectedIds.length}</Badge>
                    <span className="text-sm font-medium text-primary">Выбрано навыков</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue('competencyIds', [], { shouldValidate: true })} 
                      className="h-8 text-xs text-muted-foreground hover:text-destructive px-3 rounded-lg">
                        Сбросить
                    </Button>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            {isSelectedOpen ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                        </Button>
                    </CollapsibleTrigger>
                 </div>
            </div>
            <CollapsibleContent>
                <div className="p-3.5 pt-0">
                    <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pt-2">
                        {selectedIds.map((id: string) => {
                        const comp = competencies.find(c => c.id === id);
                        return comp ? (
                            <Badge key={id} variant="secondary" className="pl-2.5 pr-1.5 py-1.5 rounded-md cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group border-transparent hover:border-destructive/20 border" onClick={() => toggleCompetency(id)}>
                              <span className="truncate max-w-[140px] md:max-w-xs text-sm font-normal">{comp.name}</span>
                              <X className="h-3.5 w-3.5 ml-1.5 opacity-50 group-hover:opacity-100" />
                            </Badge>
                        ) : null;
                        })}
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
      )}

      {/* Competencies List - Optimized for Scrolling & Visibility */}
      {totalFiltered === 0 ? (
        <div className="text-center py-12 border rounded-2xl bg-muted/20">
          <Filter className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Ничего не найдено</p>
        </div>
      ) : (
        <div className="md:max-h-[600px] md:overflow-y-auto md:border md:rounded-xl md:pr-1 min-h-[50vh] pb-8">
          {Object.entries(filteredByCategory).map(([category, comps]) => {
            const isFullySelected = comps.every(c => selectedIds.includes(c.id));
            const isPartiallySelected = !isFullySelected && comps.some(c => selectedIds.includes(c.id));
            const selectedCount = comps.filter(c => selectedIds.includes(c.id)).length;
            
            return (
              <div key={category} className="mb-4 last:mb-0">
                <div className="sticky top-[60px] md:top-0 z-10 bg-background/95 backdrop-blur-sm px-1 py-3 mb-1 border-b">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3" onClick={() => toggleCategory(comps)}>
                        {/* CATEGORY CHECKBOX: 5 (20px) with border */}
                        <Checkbox 
                          checked={isFullySelected} 
                          ref={el => { if (el) (el as any).indeterminate = isPartiallySelected; }} 
                          className="h-5 w-5 rounded-[4px] border-2 border-muted-foreground/50 data-[state=checked]:border-primary pointer-events-none" 
                        />
                        <span className="font-bold text-sm uppercase tracking-wide text-foreground/80">{category}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full border">
                        {selectedCount} / {comps.length}
                      </span>
                   </div>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pl-1">
                  {comps.map((comp) => (
                    <div key={comp.id} onClick={() => toggleCompetency(comp.id)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border active:scale-[0.98]",
                        selectedIds.includes(comp.id) 
                          ? "bg-primary/10 border-primary/50 shadow-sm" 
                          : "bg-card border-border/60 shadow-sm hover:border-primary/30"
                      )}>
                      {/* ITEM CHECKBOX: 5 (20px) with border - Reduced from 6. REMOVED readOnly prop. */}
                      <Checkbox 
                        checked={selectedIds.includes(comp.id)} 
                        className="h-5 w-5 mt-0.5 rounded-[6px] border-2 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all pointer-events-none" 
                      />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <span className={cn("text-sm font-semibold leading-tight block", selectedIds.includes(comp.id) ? "text-foreground" : "text-foreground/90")}>
                          {comp.name}
                        </span>
                        {comp.level && <span className="text-xs text-muted-foreground mt-1.5 block">{comp.level}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
    },
    mode: 'onChange',
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
        const template = await testTemplatesApi.createTemplate(values) as { id: string };
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