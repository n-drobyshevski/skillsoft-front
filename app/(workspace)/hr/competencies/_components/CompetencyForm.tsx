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
import { CompetencyCategory, ApprovalStatus } from '@/types/domain';
import { createCompetencyAction, updateCompetencyAction, type ActionResult } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { FileText, Tag, CheckCircle2, Loader2, X, Save, RefreshCw, Check, AlertCircle, Globe2, Layers } from "lucide-react";
import { HelpTooltip, formHelp } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import { StandardsSearchCombobox } from '@/components/common/standards-search-combobox';
import { getAllSkills } from '@/lib/skill-data-loader';
import type { UnifiedSkill } from '@/types/skills';

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
  const [skills, setSkills] = useState<UnifiedSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const isEditMode = !!competency;

  // Load skills on mount
  useEffect(() => {
    const loadSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const allSkills = getAllSkills();
        setSkills(allSkills);
      } catch {
        // Silently handle - combobox will show "no skills" state
      } finally {
        setIsLoadingSkills(false);
      }
    };
    loadSkills();
  }, []);

  const form = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    mode: 'onChange', // Enable inline validation
    defaultValues: {
      name: competency?.name || '',
      description: competency?.description || '',
      category: competency?.category || CompetencyCategory.LEADERSHIP,
      isActive: competency?.isActive ?? true,
      approvalStatus: competency?.approvalStatus || ApprovalStatus.DRAFT,
      standardCodes: competency?.standardCodes || undefined,
    },
  });

  // Get validation state for visual feedback
  const { errors, dirtyFields } = form.formState;
  
  // Helper to get field validation state (using Object.hasOwn for security)
  const getFieldState = useCallback((fieldName: keyof CompetencyFormValues) => {
    const isDirty = Object.hasOwn(dirtyFields, fieldName) && dirtyFields[fieldName as keyof typeof dirtyFields];
    const hasError = Object.hasOwn(errors, fieldName) && !!errors[fieldName as keyof typeof errors];
    return {
      isDirty,
      hasError,
      isValid: isDirty && !hasError,
    };
  }, [dirtyFields, errors]);

  // Helper to handle successful competency creation
  const handleCreateSuccess = (createdCompetency: Competency) => {
    toast.success("Competency created successfully!");
    if (onCompetencyCreated) {
      onCompetencyCreated(createdCompetency);
    } else {
      router.push(`/hr/competencies/${createdCompetency.id}`);
    }
  };

  // Helper to handle successful competency update
  const handleUpdateSuccess = () => {
    toast.success("Competency updated successfully!");
    if (competency) {
      router.push(`/hr/competencies/${competency.id}`);
    }
  };

  async function onSubmit(data: CompetencyFormValues) {
    setIsLoading(true);
    console.log('[CompetencyForm] onSubmit data:', JSON.stringify(data, null, 2));
    try {
      if (isEditMode && competency) {
        // Server Action call - types are correctly defined in actions.ts
        console.log('Updating competency with data:', data);
        const result: ActionResult<Competency> = await updateCompetencyAction(competency.id, data);
        if (result.success) {
          handleUpdateSuccess();
        } else {
          toast.error(result.message);
        }
      } else {
        // Server Action call - types are correctly defined in actions.ts
        console.log('[CompetencyForm] Creating competency with data:', JSON.stringify(data, null, 2));
        const result: ActionResult<Competency> = await createCompetencyAction(data);
        console.log('[CompetencyForm] Create result:', JSON.stringify(result, null, 2));
        if (result.success && result.data && result.data.id) {
          handleCreateSuccess(result.data);
        } else if (result.success && (!result.data || !result.data.id)) {
          toast.error('Competency was created but no valid ID was returned. Please refresh and try again.');
        } else if (!result.success) {
          toast.error(result.message);
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

  // Handle form validation errors
  const onFormError = (errors: Record<string, unknown>) => {
    console.error('Form validation errors:', errors);
    toast.error('Please fix the validation errors before submitting.');
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Basic Information</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Name and description for this competency</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
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
                              "h-11 sm:h-10 pr-8 touch-manipulation",
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
                              "min-h-24 resize-none touch-manipulation",
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
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Classification</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Category selection</p>
              </div>
            </div>
            <div className="p-4 sm:p-5">
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
                        <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
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
            </div>
          </div>

          {/* Standard Mapping Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Globe2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">Standard Mapping</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Link to O*NET, ESCO, or personality frameworks</p>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <FormField
                control={form.control}
                name="standardCodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      <Layers className="h-4 w-4 mr-1" />
                      Standards Reference
                      <HelpTooltip content="Map this competency to established frameworks like O*NET occupational skills, ESCO European skills taxonomy, or Big Five personality traits for standardized assessment alignment." />
                    </FormLabel>
                    <FormControl>
                      <StandardsSearchCombobox
                        skills={skills}
                        isLoading={isLoadingSkills}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          handlePreviewClick();
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
                <p className="text-xs sm:text-sm text-muted-foreground">Manage visibility and approval workflow</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Visibility
                      <HelpTooltip content={formHelp.competency.isActive} />
                    </FormLabel>
                    <div className="flex items-center gap-3 h-11 sm:h-10 px-3 rounded-lg border bg-muted/30 touch-manipulation">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handlePreviewClick();
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