'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { questionSchema } from '../validation';
import { AssessmentQuestion } from '../../interfaces/domain-interfaces';
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
import { DifficultyLevel } from '../../enums/domain_enums';
import { assessmentQuestionsApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { TrashIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

type QuestionFormValues = z.infer<typeof questionSchema>;

import { QuestionType } from '../../enums/domain_enums';

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
      orderIndex: question?.orderIndex ?? 0,
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

  // Handle answer options for Likert Scale
  useEffect(() => {
    if (questionType === 'LIKERT_SCALE') {
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
        await assessmentQuestionsApi.createQuestion(competencyId, behavioralIndicatorId, data);
        toast.success("Question created successfully!");
        router.push(`/behavioral-indicators/${behavioralIndicatorId}`);
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
        return (
          <Card>
            <CardHeader>
              <CardTitle>Answer Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-3 border rounded-lg bg-muted/50 sm:space-y-0 sm:flex sm:items-end sm:space-x-2">
                  <FormField
                    control={form.control}
                    name={`answerOptions.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="grow">
                        <FormLabel>Option {index + 1} Text</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Prioritize tasks"
                            onBlur={() => {
                              field.onBlur();
                              handleFieldBlur();
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end space-x-2 sm:space-x-2">
                    <FormField
                      control={form.control}
                      name={`answerOptions.${index}.score`}
                      render={({ field }) => (
                        <FormItem className="w-20 sm:w-24">
                          <FormLabel>Score</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="10"
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
                        <FormItem className="flex flex-col items-center min-w-[60px]">
                          <FormLabel className="text-xs">Correct?</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                handleFieldBlur();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)} 
                      className="hover:bg-destructive/80 hover:text-destructive-foreground h-9 w-9 shrink-0"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full sm:w-auto"
                onClick={() => append({ text: "", score: fields.length + 1, correct: false })}
              >
                Add Answer Option
              </Button>
            </CardContent>
          </Card>
        );
      case 'SITUATIONAL_JUDGMENT':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Answer Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-3 border rounded-lg bg-muted/50 sm:space-y-0 sm:flex sm:items-end sm:space-x-2">
                  <FormField
                    control={form.control}
                    name={`answerOptions.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="grow">
                        <FormLabel>Option {index + 1} Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="e.g., Describe the action you would take." 
                            className="min-h-20"
                            onBlur={() => {
                              field.onBlur();
                              handleFieldBlur();
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end space-x-2 sm:space-x-2">
                    <FormField
                      control={form.control}
                      name={`answerOptions.${index}.score`}
                      render={({ field }) => (
                        <FormItem className="w-20 sm:w-24">
                          <FormLabel>Score</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="10"
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
                        <FormItem className="flex flex-col items-center min-w-[60px]">
                          <FormLabel className="text-xs">Correct?</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                handleFieldBlur();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)} 
                      className="hover:bg-destructive/80 hover:text-destructive-foreground h-9 w-9 shrink-0"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full sm:w-auto"
                onClick={() => append({ text: "", score: fields.length + 1, correct: false })}
              >
                Add Answer Option
              </Button>
            </CardContent>
          </Card>
        );
      case 'LIKERT_SCALE':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Likert Scale Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 sm:space-y-0 sm:flex sm:items-end sm:space-x-4">
                    <FormField
                      control={form.control}
                      name={`answerOptions.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="grow">
                          <FormLabel>Label for Point {index + 1}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
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
                        <FormItem className="w-20 sm:w-24">
                          <FormLabel>Score</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., How do you handle tight deadlines?" 
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
            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="scoringRubric"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Scoring Rubric</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Based on clarity and feasibility" 
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
            <FormField
              control={form.control}
              name="difficultyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty level" />
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
            <FormField
              control={form.control}
              name="orderIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Index</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
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
                <FormItem className="sm:col-start-2">
                  <FormLabel>Time Limit (seconds)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
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
          </CardContent>
        </Card>

        {renderAnswerOptions()}

        <Card>
            <CardContent className="pt-6">
                <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                        Set whether this question is currently active and available.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleFieldBlur();
                        }}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:space-x-4">
          {onUpdatePreview && (
            <Button type="button" variant="secondary" onClick={handlePreviewClick} disabled={isLoading} className="w-full sm:w-auto">
              Update Preview
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Question')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
