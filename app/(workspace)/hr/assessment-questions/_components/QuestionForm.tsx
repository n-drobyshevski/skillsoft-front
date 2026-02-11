'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMemo } from 'react';
import { createQuestionSchema, QuestionFormValues, QUESTION_TAG_OPTIONS, QuestionTag } from '@/lib/schemas';
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
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEnumTranslation } from '@/hooks/useEnumTranslation';
import { useHelpTranslation } from '@/hooks/useHelpTranslation';

const questionTypes = Object.values(QuestionType);

// Tag values for the multi-select (labels/descriptions come from translations)
const TAG_VALUES = ['GENERAL', 'IT', 'SALES', 'FINANCE', 'MEDICAL', 'ENGINEERING', 'JUNIOR', 'MID', 'SENIOR'] as const;

export function QuestionForm({ question, competencyId, behavioralIndicatorId, onUpdatePreview }: {
  question?: AssessmentQuestion;
  competencyId: string;
  behavioralIndicatorId: string;
  onUpdatePreview?: (data: QuestionFormValues) => void;
}) {
  const router = useRouter();
  const t = useTranslations('forms');
  const tAll = useTranslations();
  const { getOptions: getQuestionTypeOptions } = useEnumTranslation<QuestionType>('questionType');
  const { getOptions: getDifficultyOptions } = useEnumTranslation<DifficultyLevel>('difficultyLevel');
  const { getHelp } = useHelpTranslation('question');
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!question;

  // Create i18n-aware schema with translated error messages
  const questionSchema = useMemo(() => createQuestionSchema(tAll), [tAll]);

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
        toast.success(t('updateSuccess'));
        router.push(`/hr/assessment-questions/${question.id}`);
      } else {
        const newQuestion = await assessmentQuestionsApi.createQuestion(competencyId, behavioralIndicatorId, data);
        toast.success(t('createSuccess'));
        router.push(`/hr/assessment-questions/${newQuestion.id}`);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t('errorOccurred');
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
                  <h3 className="text-base font-semibold">{t('question.sections.answerOptions')}</h3>
                  <p className="text-sm text-muted-foreground">{t('question.sections.answerOptionsDesc')}</p>
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
                {t('question.buttons.addOption')}
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
                              placeholder={t('question.placeholders.answerOption')}
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
                                placeholder={t('question.placeholders.score')}
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
                            <span className="text-xs text-muted-foreground">{t('question.labels.correct')}</span>
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
              <h3 className="text-lg font-semibold leading-none tracking-tight">{t('question.sections.answerOptions')}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: "", score: fields.length + 1, correct: false })}
                className="h-8 text-xs"
              >
                {t('question.buttons.addOption')}
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
                              placeholder={t('question.placeholders.sjtAction')}
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
                                placeholder={t('question.placeholders.score')}
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
                            <span className="text-xs text-muted-foreground">{t('question.labels.correct')}</span>
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
              <h3 className="text-lg font-semibold leading-none tracking-tight">{t('question.sections.likertOptions')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('question.sections.likertOptionsDesc')}</p>
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
                            placeholder={t('question.placeholders.likertLabel', { index: index + 1 })}
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
                            placeholder={t('question.placeholders.score')}
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
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">{t('question.sections.questionDetails')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('question.sections.questionDetailsDesc')}</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => {
                  const fieldState = getFieldState('questionText');
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        {t('question.fields.questionText')} <span className="text-destructive">*</span>
                        <HelpTooltip content={getHelp('questionText')} />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('question.placeholders.questionText')}
                          className={cn(
                            "min-h-28 resize-none touch-manipulation",
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        {t('question.fields.questionType')}
                        <HelpTooltip content={getHelp('questionType')} />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                            <SelectValue placeholder={t('question.placeholders.selectType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getQuestionTypeOptions(questionTypes).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                        {t('question.fields.difficultyLevel')}
                        <HelpTooltip content={getHelp('difficultyLevel')} />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                            <SelectValue placeholder={t('question.placeholders.selectLevel')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getDifficultyOptions(Object.values(DifficultyLevel)).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                        {t('question.fields.contextTags')}
                        <HelpTooltip content={getHelp('contextTags')} />
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
                                      {t(`question.tags.${tag}`)}
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
                                <span>{t('question.placeholders.selectTags')}</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder={t('question.placeholders.searchTags')} />
                            <CommandEmpty>{t('question.labels.noTagFound')}</CommandEmpty>
                            <CommandGroup>
                              {TAG_VALUES.map((tagValue) => {
                                const isSelected = selectedTags.includes(tagValue);
                                return (
                                  <CommandItem
                                    key={tagValue}
                                    onSelect={() => {
                                      if (isSelected) {
                                        field.onChange(selectedTags.filter((t: string) => t !== tagValue));
                                      } else {
                                        field.onChange([...selectedTags, tagValue]);
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
                                      <span className="font-medium">{t(`question.tags.${tagValue}`)}</span>
                                      <span className="text-xs text-muted-foreground">{t(`question.tags.${tagValue}_DESC`)}</span>
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
                      <AlertTitle className="text-amber-900 dark:text-amber-300">{t('question.alerts.scenarioAIncompatibleTitle')}</AlertTitle>
                      <AlertDescription className="text-amber-800 dark:text-amber-400 text-sm">
                        {t('question.alerts.scenarioAIncompatibleDesc')}
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
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Settings2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">{t('question.sections.configuration')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('question.sections.configurationDesc')}</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              <FormField
                control={form.control}
                name="scoringRubric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      {t('question.fields.scoringRubric')}
                      <HelpTooltip content={getHelp('scoringRubric')} />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('question.placeholders.scoringRubric')}
                        className="min-h-24 resize-none touch-manipulation"
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t('question.fields.orderIndex')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          className="h-11 sm:h-10 touch-manipulation"
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
                        {t('question.fields.timeLimit')}
                        <HelpTooltip content={getHelp('timeLimit')} />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          className="h-11 sm:h-10 touch-manipulation"
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
                      <FormLabel className="text-sm font-medium">{t('question.fields.visibility')}</FormLabel>
                      <div className="flex items-center gap-3 h-11 sm:h-10 px-3 rounded-lg border bg-muted/30 touch-manipulation">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleFieldBlur();
                            }}
                            className="touch-manipulation"
                          />
                        </FormControl>
                        <span className={`text-sm font-medium ${field.value ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {field.value ? t('active') : t('inactive')}
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
              className="h-11 sm:h-10 min-h-[44px] touch-manipulation"
            >
              <X className="h-4 w-4 mr-2" />
              {t('cancel')}
            </Button>
            {onUpdatePreview && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreviewClick}
                disabled={isLoading}
                className="h-11 sm:h-10 min-h-[44px] touch-manipulation"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('question.buttons.updatePreview')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 sm:h-10 min-h-[44px] touch-manipulation"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? t('saving') : t('creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? t('saveChanges') : t('question.buttons.createQuestion')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
