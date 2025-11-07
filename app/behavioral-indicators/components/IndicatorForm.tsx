'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { indicatorSchema } from '../validation';
import { BehavioralIndicator } from '../../interfaces/domain-interfaces';
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
import { ProficiencyLevel, ApprovalStatus, IndicatorMeasurementType } from '../../enums/domain_enums';
import { behavioralIndicatorsApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type IndicatorFormValues = z.infer<typeof indicatorSchema>;
const measurementTypes = Object.values(IndicatorMeasurementType);

export function IndicatorForm({ indicator, competencyId, onUpdatePreview }: { indicator?: BehavioralIndicator, competencyId?: string, onUpdatePreview?: (data: any) => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!indicator;

  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorSchema),
    defaultValues: {
      title: indicator?.title || '',
      description: indicator?.description || "",
      observabilityLevel: indicator?.observabilityLevel || ProficiencyLevel.NOVICE,
      measurementType: indicator?.measurementType || IndicatorMeasurementType.QUALITY,
      weight: indicator?.weight || 1,
      examples: indicator?.examples || "",
      counterExamples: indicator?.counterExamples || "",
      isActive: indicator?.isActive || true,
      approvalStatus: indicator?.approvalStatus || ApprovalStatus.DRAFT,
      orderIndex: indicator?.orderIndex || 0,
    },
  });

  async function onSubmit(data: IndicatorFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        const apiData = {
          ...data,
          level: data.observabilityLevel,
          competencyId: indicator.competencyId,
          orderIndex: data.orderIndex ?? 0,
        };
        await behavioralIndicatorsApi.updateIndicator(indicator.competencyId, indicator.id, apiData);
        toast.success("Indicator updated successfully!");
        router.push(`/behavioral-indicators/${indicator.id}`);
      } else if (competencyId) {
        const apiData = {
          ...data,
          level: data.observabilityLevel,
          competencyId: competencyId,
          orderIndex: data.orderIndex ?? 0,
        };
        const newIndicator = await behavioralIndicatorsApi.createIndicator(competencyId, apiData);
        toast.success("Indicator created successfully!");
        router.push(`/competencies/${competencyId}`);
      }
    } catch (e: any) {
      if (e.status === 409) {
        toast.error("Failed to update indicator. The title might already exist within the same competency.");
      } else {
        toast.error(e.message || 'An error occurred.');
      }
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Core Information</CardTitle>
            <CardDescription>Provide the main details for this indicator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Proactive Communication" 
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the indicator's purpose and what it measures."
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
            <CardDescription>Help categorize and define the indicator's properties.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="observabilityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observability Level</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldBlur();
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
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
                  <FormLabel>Measurement Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldBlur();
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
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
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g., 0.5" 
                      {...field} 
                      onChange={event => field.onChange(parseFloat(event.target.value))}
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
              name="orderIndex"
              render={({ field }) => (
                <FormItem className="sm:col-start-1 lg:col-start-auto">
                  <FormLabel>Order Index</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 1" 
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contextual Examples</CardTitle>
            <CardDescription>Provide specific examples to clarify the indicator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="examples"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Positive Examples</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List behaviors that demonstrate this indicator." 
                      {...field} 
                      rows={3} 
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
                  <FormLabel>Counter Examples</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List behaviors that contradict this indicator." 
                      {...field} 
                      rows={3} 
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

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
            <FormField
              control={form.control}
              name="approvalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval Status</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldBlur();
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
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
                  <FormLabel>Active Status</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleFieldBlur();
                        }}
                      />
                      <label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        This indicator is currently active
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:space-x-2">
          {onUpdatePreview && (
            <Button type="button" variant="secondary" onClick={handlePreviewClick} disabled={isLoading} className="w-full sm:w-auto">
              Update Preview
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Indicator')}
          </Button>
        </div>
      </form>
    </Form>
  );
}