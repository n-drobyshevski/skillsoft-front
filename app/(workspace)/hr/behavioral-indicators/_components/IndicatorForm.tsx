'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { indicatorSchema } from '../validation';
import { useWeightValidation } from '../hooks/useWeightValidation';
import { BehavioralIndicator } from '@/app/interfaces/domain-interfaces';
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
import { ProficiencyLevel, ApprovalStatus, IndicatorMeasurementType } from '@/app/enums/domain_enums';
import { updateIndicatorAction, createIndicatorAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

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
    defaultValues: {
      title: indicator?.title || '',
      description: indicator?.description || "", // Still empty but will be validated as required
      observabilityLevel: indicator?.observabilityLevel || ProficiencyLevel.NOVICE,
      measurementType: indicator?.measurementType || IndicatorMeasurementType.QUALITY,
      weight: indicator?.weight || 0.1, // Changed from 0 to 0.1 to match DB constraint
      examples: indicator?.examples || "",
      counterExamples: indicator?.counterExamples || "",
      isActive: indicator?.isActive || true,
      approvalStatus: indicator?.approvalStatus || ApprovalStatus.DRAFT,
      orderIndex: indicator?.orderIndex || 1,
    },
  });

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
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Core Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Provide the main details for this indicator</p>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Title <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Proactive Communication" 
                        className="h-9"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Description <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of what this indicator measures"
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
            </div>
          </div>

          {/* Classification Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Classification</h3>
              <p className="text-sm text-muted-foreground mt-1">Categorize and define the indicator's properties</p>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="observabilityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Observability Level</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldBlur();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProficiencyLevel).map((level) => (
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
                name="measurementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Measurement Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldBlur();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
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
                    <FormLabel className="text-sm font-medium">Weight <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        max="1"
                        placeholder="0.25" 
                        className="h-9"
                        {...field} 
                        onChange={event => field.onChange(parseFloat(event.target.value) || 0.01)}
                        onBlur={() => {
                          field.onBlur();
                          handleFieldBlur();
                        }}
                      />
                    </FormControl>
                    {!weightValidation.isLoading && competencyId && (
                      <FormDescription className="text-xs">
                        Total: {weightValidation.currentTotal.toFixed(3)}, Available: {weightValidation.remainingWeight.toFixed(3)}
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
                        placeholder="1" 
                        className="h-9"
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
            </div>
          </div>

          {/* Contextual Examples Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Contextual Examples</h3>
              <p className="text-sm text-muted-foreground mt-1">Provide specific examples to clarify the indicator</p>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <FormField
                control={form.control}
                name="examples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Positive Examples</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List behaviors that demonstrate this indicator" 
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
              <FormField
                control={form.control}
                name="counterExamples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Counter Examples</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List behaviors that contradict this indicator" 
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
            </div>
          </div>

          {/* Status Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Status</h3>
            </div>
            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectTrigger className="h-9">
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
              disabled={isLoading || !weightValidation.isValid}
              className="h-9"
            >
              {isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Indicator')}
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