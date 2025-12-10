'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { questionSchema } from '../validation';
import { AssessmentQuestion } from '@/types/domain';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DifficultyLevel, QuestionType } from '@/types/domain';
import { assessmentQuestionsApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { 
  TrashIcon, 
  MessageSquare, 
  Settings2, 
  ListChecks,
  Loader2,
  X,
  Save,
  RefreshCw,
  Plus,
  Check,
  AlertCircle,
  Tag as TagIcon
} from 'lucide-react';
import { toast } from "sonner";
import { HelpTooltip, formHelp } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QUESTION_TAG_OPTIONS, QuestionTag } from '../validation';

type QuestionFormValues = z.infer<typeof questionSchema>;

const questionTypes = Object.values(QuestionType);

// Tag options with descriptions for the multi-select
const TAG_METADATA = [
  { value: 'GENERAL', label: 'General', description: 'Context-neutral, no industry jargon (Scenario A)' },
  { value: 'IT', label: 'IT', description: 'Information technology context' },
  { value: 'SALES', label: 'Sales', description: 'Sales and marketing context' },
  { value: 'FINANCE', label: 'Finance', description: 'Financial industry context' },
  { value: 'MEDICAL', label: 'Medical', description: 'Healthcare context' },
  { value: 'ENGINEERING', label: 'Engineering', description: 'Engineering context' },
  { value: 'JUNIOR', label: 'Junior', description: 'Entry-level complexity' },
  { value: 'MID', label: 'Mid', description: 'Mid-career complexity' },
  { value: 'SENIOR', label: 'Senior', description: 'Senior-level complexity' },
] as const;

export function QuestionForm({ question, competencyId, behavioralIndicatorId, onUpdatePreview }: { 
  question?: AssessmentQuestion; 
  competencyId: string; 
  behavioralIndicatorId: string; 
  onUpdatePreview?: (data: QuestionFormValues) => void; 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!question;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    mode: 'onChange', // Enable inline validation
    defaultValues: {
      questionText: question?.questionText || '',
      questionType: question?.questionType || QuestionType.MULTIPLE_CHOICE,
      scoringRubric: question?.scoringRubric || '',
      difficultyLevel: question?.difficultyLevel || DifficultyLevel.FOUNDATIONAL,
      isActive: question?.isActive ?? true,
      orderIndex: question?.orderIndex ?? 1,
      timeLimit: question?.timeLimit ?? 60,
      metadata: {
        tags: (question?.metadata?.tags || []) as QuestionTag[],
      },
      answerOptions: question?.answerOptions?.map(opt => ({
          text: opt.text || '',
          score: opt.score ?? 0,
          correct: opt.correct ?? false,
      })) || [],
    },
  });

  // Get validation state for visual feedback
  const { errors, dirtyFields } = form.formState;
  
  // Helper to get field validation state
  const getFieldState = useCallback((fieldName: keyof QuestionFormValues) => {
    const isDirty = dirtyFields[fieldName];
    const hasError = !!errors[fieldName];
    return {
      isDirty,
      hasError,
      isValid: isDirty && !hasError,
    };
  }, [dirtyFields, errors]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answerOptions",
  });

  const questionType = form.watch('questionType');
  const difficultyLevel = form.watch('difficultyLevel');
  const likertPoints = 5;

  // Handle answer options for Likert Scale (supports both LIKERT and LIKERT_SCALE)
  useEffect(() => {
    if (questionType === 'LIKERT_SCALE' || questionType === 'LIKERT') {
      const currentLength = fields.length;
      if (likertPoints > currentLength) {
        for (let i = currentLength; i < likertPoints; i++) {
          append({ text: (i + 1).toString(), value: i + 1, score: i + 1 });
        }
      } else if (likertPoints < currentLength) {
        for (let i = currentLength - 1; i >= likertPoints; i--) {
          remove(i);
        }
      }
    }
  }, [questionType, append, remove, fields.length, likertPoints]);

  // Separate effect for preview updates to avoid infinite loops
  useEffect(() => {
    if (onUpdatePreview) {
      const timer = setTimeout(() => {
        onUpdatePreview(form.getValues());
      }, 0);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionType, difficultyLevel, onUpdatePreview]);

  async function onSubmit(data: QuestionFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await assessmentQuestionsApi.updateQuestion(question.id, data, competencyId, behavioralIndicatorId);
        toast.success("Question updated successfully!");
        router.push(`/hr/assessment-questions/${question.id}`);
      } else {
        const newQuestion = await assessmentQuestionsApi.createQuestion(competencyId, behavioralIndicatorId, data);
        toast.success("Question created successfully!");
        router.push(`/hr/ assessment-questions/${newQuestion.id}`);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePreviewClick = () => {
    if (onUpdatePreview) {
      onUpdatePreview(form.getValues());
    }
  };

  const handleFieldBlur = useCallback(() => {
    if (onUpdatePreview) {
      onUpdatePreview(form.getValues());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpdatePreview]);

  const renderAnswerOptions = () => {
    switch (questionType) {
      case 'MULTIPLE_CHOICE':
      case 'MCQ':  // Primary type per ROADMAP.md
        return (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-muted/40 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Answer Options</h3>
                  <p className="text-sm text-muted-foreground">Configure multiple choice answers</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: "", score: fields.length + 1, correct: false })}
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="p-5 space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30 hover:bg-muted/40 transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <FormField
                      control={form.control}
                      name={`answerOptions.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter answer option"
                              className="h-9"
                              onBlur={() => {
                                field.onBlur();
                                handleFieldBlur();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`answerOptions.${index}.score`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Score"
                                className="h-9"
                                {...field}
                                onChange={event => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                                onBlur={() => {
                                  field.onBlur();
                                  handleFieldBlur();
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`answerOptions.${index}.correct`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleFieldBlur();
                                }}
                              />
                            </FormControl>
                            <span className="text-xs text-muted-foreground">Correct</span>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => remove(index)} 
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'SITUATIONAL_JUDGMENT':
      case 'SJT':  // Primary type per ROADMAP.md - supports vector weights
        return (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Answer Options</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: "", score: fields.length + 1, correct: false })}
                className="h-8 text-xs"
              >
                Add Option
              </Button>
            </div>
            <div className="px-4 pb-4 space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 p-3 rounded-md border bg-muted/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`answerOptions.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe the action you would take"
                              className="min-h-[60px] resize-none text-sm"
                              onBlur={() => {
                                field.onBlur();
                                handleFieldBlur();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`answerOptions.${index}.score`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Score"
                                className="h-8 text-sm"
                                {...field}
                                onChange={event => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                                onBlur={() => {
                                  field.onBlur();
                                  handleFieldBlur();
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`answerOptions.${index}.correct`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleFieldBlur();
                                }}
                              />
                            </FormControl>
                            <span className="text-xs text-muted-foreground">Correct</span>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => remove(index)} 
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'LIKERT_SCALE':
      case 'LIKERT':  // Primary type per ROADMAP.md
        return (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Likert Scale Options</h3>
              <p className="text-sm text-muted-foreground mt-1">Configure the scale points and their labels</p>
            </div>
            <div className="px-4 pb-4 space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`answerOptions.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder={`Label for point ${index + 1}`}
                            className="h-8 text-sm"
                            onBlur={() => {
                              field.onBlur();
                              handleFieldBlur();
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`answerOptions.${index}.score`}
                    render={({ field }) => (
                      <FormItem className="w-20">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Score"
                            className="h-8 text-sm"
                            {...field}
                            onChange={event => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                            onBlur={() => {
                              field.onBlur();
                              handleFieldBlur();
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Question Details</h3>
                <p className="text-sm text-muted-foreground">Question text and classification</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => {
                  const fieldState = getFieldState('questionText');
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Question Text <span className="text-destructive">*</span>
                        <HelpTooltip content={formHelp.question.questionText} />
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., How do you handle tight deadlines?" 
                          className={cn(
                            "min-h-28 resize-none",
                            fieldState.isValid && "border-green-500 focus-visible:ring-green-500",
                            fieldState.hasError && "border-destructive focus-visible:ring-destructive"
                          )}
                          {...field} 
                          onBlur={() => {
                            field.onBlur();
                            handleFieldBlur();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Question Type
                        <HelpTooltip content={formHelp.question.questionType} />
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Difficulty Level
                        <HelpTooltip content={formHelp.question.difficultyLevel} />
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DifficultyLevel).map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Context Tags for Smart Assessment Filtering */}
              <FormField
                control={form.control}
                name="metadata.tags"
                render={({ field }) => {
                  const selectedTags = field.value || [];
                  
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Context Tags
                        <HelpTooltip content="Tags enable context filtering for different assessment scenarios. Add 'GENERAL' for Universal Baseline (Scenario A) assessments." />
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-auto min-h-10 justify-start text-left font-normal",
                                !selectedTags.length && "text-muted-foreground"
                              )}
                            >
                              <TagIcon className="mr-2 h-4 w-4 shrink-0" />
                              {selectedTags.length > 0 ? (
                                <div className="flex gap-1.5 flex-wrap">
                                  {selectedTags.map((tag: string) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      {TAG_METADATA.find(t => t.value === tag)?.label || tag}
                                      <X
                                        className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          field.onChange(selectedTags.filter((t: string) => t !== tag));
                                        }}
                                      />
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span>Select tags...</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search tags..." />
                            <CommandEmpty>No tag found.</CommandEmpty>
                            <CommandGroup>
                              {TAG_METADATA.map((tag) => {
                                const isSelected = selectedTags.includes(tag.value);
                                return (
                                  <CommandItem
                                    key={tag.value}
                                    onSelect={() => {
                                      if (isSelected) {
                                        field.onChange(selectedTags.filter((t: string) => t !== tag.value));
                                      } else {
                                        field.onChange([...selectedTags, tag.value]);
                                      }
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        isSelected ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{tag.label}</span>
                                      <span className="text-xs text-muted-foreground">{tag.description}</span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Scenario A Compatibility Warning */}
              {(() => {
                const selectedTags = form.watch('metadata.tags') || [];
                const hasGeneralTag = selectedTags.includes('GENERAL');
                
                if (!hasGeneralTag && selectedTags.length > 0) {
                  return (
                    <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                      <AlertTitle className="text-amber-900 dark:text-amber-300">Scenario A Incompatible</AlertTitle>
                      <AlertDescription className="text-amber-800 dark:text-amber-400 text-sm">
                        This question does not have the "GENERAL" tag and will not be included in
                        Universal Baseline assessments (Competency Passport). Add the "GENERAL" tag
                        if the scenario is context-neutral and applies to all roles.
                      </AlertDescription>
                    </Alert>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Configuration Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Configuration</h3>
                <p className="text-sm text-muted-foreground">Scoring, timing, and display settings</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <FormField
                control={form.control}
                name="scoringRubric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Scoring Rubric
                      <HelpTooltip content={formHelp.question.scoringRubric} />
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Based on clarity and feasibility" 
                        className="min-h-24 resize-none"
                        {...field}
                        onBlur={() => {
                          field.onBlur();
                          handleFieldBlur();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Order Index</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          inputMode="numeric"
                          className="h-10"
                          {...field}
                          onChange={event => field.onChange(event.target.value === '' ? 0 : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Time Limit (s)
                        <HelpTooltip content={formHelp.question.timeLimit} />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          inputMode="numeric"
                          className="h-10"
                          {...field}
                          onChange={event => field.onChange(event.target.value === '' ? 60 : Number(event.target.value))}
                          onBlur={() => {
                            field.onBlur();
                            handleFieldBlur();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Visibility</FormLabel>
                      <div className="flex items-center gap-3 h-10 px-3 rounded-lg border bg-muted/30">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleFieldBlur();
                            }}
                          />
                        </FormControl>
                        <span className={`text-sm font-medium ${field.value ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {field.value ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Answer Options Section */}
          {renderAnswerOptions()}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              disabled={isLoading}
              className="h-10 min-h-11"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {onUpdatePreview && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handlePreviewClick} 
                disabled={isLoading}
                className="h-10 min-h-11"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Preview
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-10 min-h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Save Changes' : 'Create Question'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
