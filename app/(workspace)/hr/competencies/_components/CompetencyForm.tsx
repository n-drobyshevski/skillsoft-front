'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { createCompetencySchema, CompetencyFormValues } from '@/lib/schemas';
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
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import { StandardsSearchCombobox } from '@/components/common/standards-search-combobox';
import { getAllSkills } from '@/lib/skill-data-loader';
import type { UnifiedSkill } from '@/types/skills';
import { useTranslations } from 'next-intl';
import { useEnumTranslation } from '@/hooks/useEnumTranslation';
import { useHelpTranslation } from '@/hooks/useHelpTranslation';

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
  const t = useTranslations('competency');
  const tForms = useTranslations('forms');
  const tCommon = useTranslations('common');
  const tAll = useTranslations();
  const { getOptions: getCategoryOptions } = useEnumTranslation<CompetencyCategory>('competencyCategory');
  const { getOptions: getApprovalOptions } = useEnumTranslation<ApprovalStatus>('approvalStatus');
  const { getHelp } = useHelpTranslation('competency');
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<UnifiedSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const isEditMode = !!competency;

  // Create i18n-aware schema with translated error messages
  const competencySchema = useMemo(() => createCompetencySchema(tAll), [tAll]);

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
    toast.success(t('createdSuccess'));
    if (onCompetencyCreated) {
      onCompetencyCreated(createdCompetency);
    } else {
      router.push(`/hr/competencies/${createdCompetency.id}`);
    }
  };

  // Helper to handle successful competency update
  const handleUpdateSuccess = () => {
    toast.success(t('updatedSuccess'));
    if (competency) {
      router.push(`/hr/competencies/${competency.id}`);
    }
  };

  async function onSubmit(data: CompetencyFormValues) {
    setIsLoading(true);

    // Clean up standardCodes - if it's an empty object, set to undefined
    if (data.standardCodes && Object.keys(data.standardCodes).length === 0) {
      data.standardCodes = undefined;
    }
    // Also clean nested empty objects
    if (data.standardCodes) {
      if (data.standardCodes.onetRef && !data.standardCodes.onetRef.code) {
        delete data.standardCodes.onetRef;
      }
      if (data.standardCodes.escoRef && !data.standardCodes.escoRef.uri) {
        delete data.standardCodes.escoRef;
      }
      if (data.standardCodes.bigFiveRef && !data.standardCodes.bigFiveRef.trait) {
        delete data.standardCodes.bigFiveRef;
      }
      // If all refs were removed, set standardCodes to undefined
      if (Object.keys(data.standardCodes).length === 0) {
        data.standardCodes = undefined;
      }
    }

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
          toast.error(t('createdNoId'));
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
  const onFormError = (formErrors: Record<string, unknown>) => {
    // Extract actual error messages from react-hook-form errors
    const errorMessages: string[] = [];
    const extractErrors = (obj: Record<string, unknown>, prefix = ''): void => {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (value && typeof value === 'object') {
          const errorObj = value as Record<string, unknown>;
          if ('message' in errorObj && typeof errorObj.message === 'string') {
            const fieldName = prefix ? `${prefix}.${key}` : key;
            errorMessages.push(`${fieldName}: ${errorObj.message}`);
          } else {
            // Recurse for nested errors
            extractErrors(errorObj, prefix ? `${prefix}.${key}` : key);
          }
        }
      }
    };

    extractErrors(formErrors);

    console.error('Form validation errors:', {
      raw: formErrors,
      messages: errorMessages,
      formValues: form.getValues(),
    });

    if (errorMessages.length > 0) {
      toast.error(`Validation errors: ${errorMessages.join(', ')}`);
    } else {
      toast.error('Please fix the validation errors before submitting.');
    }
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
                <h3 className="text-sm sm:text-base font-semibold">{t('basicInformation')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('basicInformationDescription')}</p>
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
                        {t('name')} <span className="text-destructive">*</span>
                        <HelpTooltip content={getHelp('name')} />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={tForms('competency.placeholders.name')}
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
                  const minChars = 50; // Backend: @Size(min = 50, max = 1000)
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        {t('description')} <span className="text-destructive">*</span>
                        <HelpTooltip content={getHelp('description')} />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder={tForms('competency.placeholders.description')}
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
                          {charCount}/{minChars}+ {t('characters')}
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
                <h3 className="text-sm sm:text-base font-semibold">{t('classification')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('classificationDescription')}</p>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      {t('category')}
                      <HelpTooltip content={getHelp('category')} />
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
                          <SelectValue placeholder={t('selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getCategoryOptions(Object.values(CompetencyCategory)).map((option) => (
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
          </div>

          {/* Standard Mapping Section */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Globe2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">{t('standardMapping')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('standardMappingDescription')}</p>
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
                      {t('standardsReference')}
                      <HelpTooltip content={t('standardsReferenceHelp')} />
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
                <h3 className="text-sm sm:text-base font-semibold">{t('statusApproval')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('statusApprovalDescription')}</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      {t('approvalStatus')}
                      <HelpTooltip content={getHelp('approvalStatus')} />
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
                          <SelectValue placeholder={t('selectStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getApprovalOptions(Object.values(ApprovalStatus)).map((option) => (
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
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      {t('visibility')}
                      <HelpTooltip content={getHelp('isActive')} />
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
                        {field.value ? t('active') : t('inactive')}
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
              {tCommon('cancel')}
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
                {t('updatePreview')}
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
                  {isEditMode ? t('saving') : t('creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? t('saveChanges') : t('create')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}