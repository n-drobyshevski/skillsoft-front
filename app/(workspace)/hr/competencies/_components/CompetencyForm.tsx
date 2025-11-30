'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { competencySchema } from '../validation';
import { Competency } from '@/types/domain';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { CompetencyCategory, ProficiencyLevel, ApprovalStatus } from '@/types/domain';
import { competenciesApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { FileText, Tag, CheckCircle2, Loader2, X, Save, RefreshCw, Check, AlertCircle } from "lucide-react";
import { HelpTooltip, formHelp } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';

type CompetencyFormValues = z.infer<typeof competencySchema>;

export function CompetencyForm({ 
  competency, 
  onUpdatePreview,
  onCompetencyCreated 
}: { 
  competency?: Competency, 
  onUpdatePreview?: (data: CompetencyFormValues) => void,
  onCompetencyCreated?: (competency: Competency) => void
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!competency;

  const form = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    mode: 'onChange', // Enable inline validation
    defaultValues: {
      name: competency?.name || '',
      description: competency?.description || '',
      category: competency?.category || CompetencyCategory.LEADERSHIP,
      level: competency?.level || ProficiencyLevel.NOVICE,
      isActive: competency?.isActive ?? true,
      approvalStatus: competency?.approvalStatus || ApprovalStatus.DRAFT,
    },
  });

  // Get validation state for visual feedback
  const { errors, dirtyFields, isValid } = form.formState;
  
  // Helper to get field validation state
  const getFieldState = useCallback((fieldName: keyof CompetencyFormValues) => {
    const isDirty = dirtyFields[fieldName];
    const hasError = !!errors[fieldName];
    return {
      isDirty,
      hasError,
      isValid: isDirty && !hasError,
    };
  }, [dirtyFields, errors]);

  async function onSubmit(data: CompetencyFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await competenciesApi.updateCompetency(competency.id, data);
        toast.success("Competency updated successfully!");
        router.push(`/competencies/${competency.id}`);
      } else {
        const newCompetency = await competenciesApi.createCompetency(data);
        toast.success("Competency created successfully!");
        
        // Call the callback if provided (for new competency page)
        if (onCompetencyCreated) {
          onCompetencyCreated(newCompetency);
        } else {
          // Default behavior - navigate to the competency page
          router.push(`/competencies/${newCompetency.id}`);
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred.';
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

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Name and description for this competency</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  const fieldState = getFieldState('name');
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Name <span className="text-destructive">*</span>
                        <HelpTooltip content={formHelp.competency.name} />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="e.g., Strategic Leadership" 
                            className={cn(
                              "h-10 pr-8",
                              fieldState.isValid && "border-green-500 focus-visible:ring-green-500",
                              fieldState.hasError && "border-destructive focus-visible:ring-destructive"
                            )}
                            {...field}
                            onBlur={() => {
                              field.onBlur();
                              handlePreviewClick();
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
                  const charCount = field.value?.length || 0;
                  const minChars = 10;
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Description <span className="text-destructive">*</span>
                        <HelpTooltip content={formHelp.competency.description} />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="A detailed description of the competency and what it measures..."
                            className={cn(
                              "min-h-24 resize-none",
                              fieldState.isValid && "border-green-500 focus-visible:ring-green-500",
                              fieldState.hasError && "border-destructive focus-visible:ring-destructive"
                            )}
                            {...field}
                            onBlur={() => {
                              field.onBlur();
                              handlePreviewClick();
                            }}
                          />
                        </div>
                      </FormControl>
                      <div className="flex items-center justify-between">
                        <FormMessage />
                        <span className={cn(
                          "text-xs",
                          charCount < minChars ? "text-muted-foreground" : "text-green-600"
                        )}>
                          {charCount}/{minChars}+ characters
                        </span>
                      </div>
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>

          {/* Classification Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Classification</h3>
                <p className="text-sm text-muted-foreground">Category and proficiency level</p>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Category
                      <HelpTooltip content={formHelp.competency.category} />
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePreviewClick();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CompetencyCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Proficiency Level
                      <HelpTooltip content={formHelp.competency.level} />
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePreviewClick();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
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
            </div>
          </div>

          {/* Status Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Status & Approval</h3>
                <p className="text-sm text-muted-foreground">Manage visibility and approval workflow</p>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Approval Status
                      <HelpTooltip content={formHelp.competency.approvalStatus} />
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePreviewClick();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
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
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Visibility
                      <HelpTooltip content={formHelp.competency.isActive} />
                    </FormLabel>
                    <div className="flex items-center gap-3 h-10 px-3 rounded-lg border bg-muted/30">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handlePreviewClick();
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

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              disabled={isLoading}
              className="h-11 sm:h-10 min-h-11"
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
                className="h-11 sm:h-10 min-h-11"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Preview
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-11 sm:h-10 min-h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Save Changes' : 'Create Competency'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}