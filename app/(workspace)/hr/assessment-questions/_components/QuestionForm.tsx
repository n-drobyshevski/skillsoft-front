'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { questionSchema } from '../validation';
import { AssessmentQuestion } from '@/app/interfaces/domain-interfaces';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { DifficultyLevel } from '@/app/enums/domain_enums';
import { assessmentQuestionsApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { TrashIcon } from 'lucide-react';
import { toast } from "sonner";

type QuestionFormValues = z.infer<typeof questionSchema>;

import { QuestionType } from '@/app/enums/domain_enums';

const questionTypes = Object.values(QuestionType);

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
    defaultValues: {
      questionText: question?.questionText || '',
      questionType: question?.questionType || QuestionType.MULTIPLE_CHOICE,
      scoringRubric: question?.scoringRubric || '',
      difficultyLevel: question?.difficultyLevel || DifficultyLevel.FOUNDATIONAL,
      isActive: question?.isActive ?? true,
      orderIndex: question?.orderIndex ?? 1,
      timeLimit: question?.timeLimit ?? 60,
      answerOptions: question?.answerOptions?.map(opt => ({
          text: opt.text || '',
          score: opt.score ?? 0,
          correct: opt.correct ?? false,
      })) || [],
    },
  });

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
        router.push(`/assessment-questions/${question.id}`);
      } else {
        const newQuestion = await assessmentQuestionsApi.createQuestion(competencyId, behavioralIndicatorId, data);
        toast.success("Question created successfully!");
        router.push(`/assessment-questions/${newQuestion.id}`);
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
                            <Input 
                              {...field} 
                              placeholder="Enter answer option"
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
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Basic Information</h3>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Question Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., How do you handle tight deadlines?" 
                        className="min-h-[100px] resize-none"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Question Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
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
                      <FormLabel className="text-sm font-medium">Difficulty Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
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
            </div>
          </div>

          {/* Configuration Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Configuration</h3>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <FormField
                control={form.control}
                name="scoringRubric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Scoring Rubric</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Based on clarity and feasibility" 
                        className="min-h-[80px] resize-none"
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Order Index</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-9"
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
                      <FormLabel className="text-sm font-medium">Time Limit (s)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-9"
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
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel className="text-sm font-medium">Active</FormLabel>
                      <div className="flex items-center space-x-2 h-9">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleFieldBlur();
                            }}
                          />
                        </FormControl>
                        <span className="text-sm text-muted-foreground">
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              disabled={isLoading}
              className="h-9"
            >
              Cancel
            </Button>
            {onUpdatePreview && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handlePreviewClick} 
                disabled={isLoading}
                className="h-9"
              >
                Update Preview
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-9"
            >
              {isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Question')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
