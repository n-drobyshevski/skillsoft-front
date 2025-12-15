'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { indicatorSchema } from '../validation';
import { useWeightValidation } from '../hooks/useWeightValidation';
import { BehavioralIndicator } from '@/types/domain';
import { WeightAdjustmentModal } from './WeightAdjustmentModal';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ObservabilityLevel, ApprovalStatus, IndicatorMeasurementType, ContextScope } from '@/types/domain';
import { updateIndicatorAction, createIndicatorAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Info, 
  FileText, 
  Settings2, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2,
  Loader2,
  X,
  Save,
  RefreshCw,
  Scale,
  Check,
  AlertCircle
} from "lucide-react";
import { HelpTooltip, formHelp } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';

type IndicatorFormValues = z.infer<typeof indicatorSchema>;
const measurementTypes = Object.values(IndicatorMeasurementType);

export function IndicatorForm({ indicator, competencyId, onUpdatePreview }: { indicator?: BehavioralIndicator, competencyId?: string, onUpdatePreview?: (data: IndicatorFormValues) => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const isEditMode = !!indicator;

  // Initialize form 
  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorSchema),
    mode: 'onChange', // Enable inline validation
    defaultValues: {
      title: indicator?.title || '',
      description: indicator?.description || "", // Still empty but will be validated as required
      observabilityLevel: indicator?.observabilityLevel || ObservabilityLevel.DIRECTLY_OBSERVABLE,
      measurementType: indicator?.measurementType || IndicatorMeasurementType.QUALITY,
      weight: indicator?.weight || 0.1, // Changed from 0 to 0.1 to match DB constraint
      examples: indicator?.examples || "",
      counterExamples: indicator?.counterExamples || "",
      isActive: indicator?.isActive || true,
      approvalStatus: indicator?.approvalStatus || ApprovalStatus.DRAFT,
      orderIndex: indicator?.orderIndex || 1,
      contextScope: indicator?.contextScope || ContextScope.UNIVERSAL, // Smart Assessment default
    },
  });

  // Get validation state for visual feedback
  const { errors, dirtyFields } = form.formState;
  
  // Helper to get field validation state
  const getFieldState = useCallback((fieldName: keyof IndicatorFormValues) => {
    const isDirty = dirtyFields[fieldName];
    const hasError = !!errors[fieldName];
    return {
      isDirty,
      hasError,
      isValid: isDirty && !hasError,
    };
  }, [dirtyFields, errors]);

  // Watch the weight field for real-time validation
  const currentWeight = form.watch('weight');

  // Use weight validation hook
  const weightValidation = useWeightValidation({
    competencyId: competencyId,
    currentIndicatorId: indicator?.id,
    currentWeight: currentWeight || 0,
  });

  // Set weight validation error when validation fails
  useEffect(() => {
    if (!weightValidation.isValid && weightValidation.errorMessage) {
      form.setError('weight', {
        type: 'custom',
        message: weightValidation.errorMessage
      });
    } else {
      form.clearErrors('weight');
    }
  }, [weightValidation.isValid, weightValidation.errorMessage, form]);

  async function onSubmit(data: IndicatorFormValues) {
    // Check weight validation before submitting
    if (!weightValidation.isValid) {
      toast.error("Please fix weight validation errors before submitting.");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode) {
        const result = await updateIndicatorAction(indicator.id, {
          ...data,
          orderIndex: data.orderIndex ?? 1,
        });
        
        if (result.success) {
          toast.success(result.message);
          router.push(`/behavioral-indicators/${indicator.id}`);
        } else {
          toast.error(result.message);
        }
      } else if (competencyId) {
        const result = await createIndicatorAction(competencyId, {
          ...data,
          orderIndex: data.orderIndex ?? 1,
        });
        
        if (result.success) {
          toast.success(result.message);
          router.push(`/behavioral-indicators/${result.data?.id}`);
        } else {
          toast.error(result.message);
        }
      }
    } catch (error: unknown) {
      // Handle different error types safely
      let errorMessage = 'An error occurred.';
      
      if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;
        
        if (errorObj.status === 409) {
          errorMessage = "Failed to update indicator. The title might already exist within the same competency.";
        } else if (typeof errorObj.message === 'string') {
          if (errorObj.message.includes('weight')) {
            errorMessage = "Weight validation failed: " + errorObj.message;
          } else {
            errorMessage = errorObj.message;
          }
        }
      }
      
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
  }, [onUpdatePreview, form]);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Weight Validation Alerts */}
          {competencyId && !weightValidation.isLoading && (
            <>
              {!weightValidation.isValid && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="space-y-3">
                    <div>{weightValidation.errorMessage}</div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowWeightModal(true)}
                      className="bg-background"
                    >
                      Adjust Existing Weights
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {weightValidation.isValid && weightValidation.remainingWeight < 0.1 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Only {weightValidation.remainingWeight.toFixed(3)} weight remaining for this competency.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Core Information Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Core Information</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Title and description for this indicator</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => {
                  const fieldState = getFieldState('title');
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Title <span className="text-destructive">*</span>
                        <HelpTooltip content={formHelp.indicator.title} />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="e.g., Proactive Communication"
                            className={cn(
                              "h-11 sm:h-10 pr-8 touch-manipulation",
                              fieldState.isValid && "border-green-500 focus-visible:ring-green-500",
                              fieldState.hasError && "border-destructive focus-visible:ring-destructive"
                            )}
                            {...field} 
                            onBlur={() => {
                              field.onBlur();
                              handleFieldBlur();
                            }}
                          />
                          {fieldState.isDirty && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {fieldState.isValid ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : fieldState.hasError ? (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const fieldState = getFieldState('description');
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Description <span className="text-destructive">*</span>
                        <HelpTooltip content={formHelp.indicator.description} />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of what this indicator measures..."
                          className={cn(
                            "min-h-24 resize-none touch-manipulation",
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
            </div>
          </div>

          {/* Classification Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Settings2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Classification & Metrics</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Observability, measurement type, and weight</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              <FormField
                control={form.control}
                name="observabilityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Observability Level
                      <HelpTooltip content={formHelp.indicator.observabilityLevel} />
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldBlur();
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ObservabilityLevel).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.replace(/_/g, ' ')}
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
                name="measurementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Measurement Type
                      <HelpTooltip content={formHelp.indicator.measurementType} />
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldBlur();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {measurementTypes.map((type) => (
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
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Weight <span className="text-destructive">*</span>
                      <HelpTooltip content={formHelp.indicator.weight} />
                    </FormLabel>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0.01"
                          max="1"
                          placeholder="0.25"
                          className="h-11 sm:h-10 pl-10 touch-manipulation"
                          {...field} 
                          onChange={event => field.onChange(parseFloat(event.target.value) || 0.01)}
                          onBlur={() => {
                            field.onBlur();
                            handleFieldBlur();
                          }}
                        />
                      </FormControl>
                    </div>
                    {!weightValidation.isLoading && competencyId && (
                      <FormDescription className="text-xs">
                        Total: {weightValidation.currentTotal.toFixed(3)} / Available: {weightValidation.remainingWeight.toFixed(3)}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orderIndex"
                render={({ field }) => (
                  <FormItem className="md:col-start-1">
                    <FormLabel className="text-sm font-medium">Order Index</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="1"
                        className="h-11 sm:h-10 touch-manipulation"
                        {...field}
                        onChange={event => field.onChange(parseInt(event.target.value))}
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
                name="contextScope"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Context Scope
                      <HelpTooltip content="Determines the applicability of this indicator. 'Universal' indicators are context-neutral and used in Scenario A (Competency Passport)." />
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldBlur();
                      }} 
                      defaultValue={field.value || ContextScope.UNIVERSAL}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                          <SelectValue placeholder="Select context scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ContextScope.UNIVERSAL}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">Universal - All Humans</span>
                            <span className="text-xs text-muted-foreground">
                              Context-neutral (Active Listening, Emotional Regulation)
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ContextScope.PROFESSIONAL}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">Professional - Office Jobs</span>
                            <span className="text-xs text-muted-foreground">
                              White-collar environments (Email Etiquette, Meeting Facilitation)
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ContextScope.TECHNICAL}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">Technical - Specialist Roles</span>
                            <span className="text-xs text-muted-foreground">
                              IT, Engineering, Data (Code Review, Technical Documentation)
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ContextScope.MANAGERIAL}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">Managerial - Leadership</span>
                            <span className="text-xs text-muted-foreground">
                              People management (Delegation, Performance Feedback)
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      <Info className="inline h-3 w-3 mr-1" />
                      "Universal" indicators are included in Scenario A (General Overview / Competency Passport).
                      Other scopes are for targeted assessments in Scenarios B and C.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contextual Examples Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Contextual Examples</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Provide examples to clarify the indicator</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
              <FormField
                control={form.control}
                name="examples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      Positive Examples
                      <HelpTooltip content={formHelp.indicator.examples} variant="tip" />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List behaviors that demonstrate this indicator..."
                        className="min-h-24 resize-none border-green-200 focus-visible:ring-green-500/20 dark:border-green-800 touch-manipulation"
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
                name="counterExamples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      Counter Examples
                      <HelpTooltip content={formHelp.indicator.counterExamples} variant="tip" />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List behaviors that contradict this indicator..."
                        className="min-h-24 resize-none border-red-200 focus-visible:ring-red-500/20 dark:border-red-800 touch-manipulation"
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
            </div>
          </div>

          {/* Status Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Status & Approval</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage visibility and workflow</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Approval Status</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldBlur();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ApprovalStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ')}
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
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Visibility</FormLabel>
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
                        {field.value ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

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
              Cancel
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
                Update Preview
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !weightValidation.isValid}
              className="h-11 sm:h-10 min-h-[44px] touch-manipulation"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Save Changes' : 'Create Indicator'}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Weight Adjustment Modal */}
        {competencyId && (
          <WeightAdjustmentModal
            isOpen={showWeightModal}
            onClose={() => setShowWeightModal(false)}
            onWeightsUpdated={() => {
              // Force weight validation to refresh by triggering a re-render
              window.location.reload();
            }}
            competencyId={competencyId}
            newIndicatorWeight={currentWeight}
          />
        )}
      </Form>
    </div>
  );
}