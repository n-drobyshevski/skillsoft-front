'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon } from 'lucide-react';
import {
  AlertTriangle,
  Info,
  Loader2,
  X,
  Save,
  Scale,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { createIndicatorSchema, IndicatorFormValues } from '@/lib/schemas';
import { useWeightValidation } from '../hooks/useWeightValidation';
import {
  BehavioralIndicator,
  ObservabilityLevel,
  ApprovalStatus,
  IndicatorMeasurementType,
  ContextScope,
} from '@/types/domain';
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
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEnumTranslation } from '@/hooks/useEnumTranslation';
import { useHelpTranslation } from '@/hooks/useHelpTranslation';
import { updateIndicatorAction, createIndicatorAction } from '@/app/actions';

const measurementTypes = Object.values(IndicatorMeasurementType);

// Backend constraints (UpdateIndicatorRequest / CreateIndicatorRequest @Size).
// Keep these in sync with src/lib/schemas/indicator-schema.ts.
const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 500;

interface IndicatorFormProps {
  indicator?: BehavioralIndicator;
  competencyId?: string;
  onUpdatePreview?: (data: IndicatorFormValues) => void;
}

export function IndicatorForm({ indicator, competencyId, onUpdatePreview }: IndicatorFormProps) {
  const router = useRouter();
  const t = useTranslations('forms');
  const tIndicator = useTranslations('indicator');
  const tValidation = useTranslations();
  const { getOptions: getObservabilityOptions } = useEnumTranslation<ObservabilityLevel>('observabilityLevel');
  const { getOptions: getMeasurementOptions } = useEnumTranslation<IndicatorMeasurementType>('measurementType');
  const { getOptions: getApprovalOptions } = useEnumTranslation<ApprovalStatus>('approvalStatus');
  const { getOptions: getContextOptions } = useEnumTranslation<ContextScope>('contextScope');
  const { getHelp } = useHelpTranslation('indicator');
  const [isLoading, setIsLoading] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const isEditMode = !!indicator;

  const indicatorSchema = useMemo(() => createIndicatorSchema(tValidation), [tValidation]);

  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorSchema),
    mode: 'onChange',
    defaultValues: {
      title: indicator?.title || '',
      description: indicator?.description || '',
      observabilityLevel: indicator?.observabilityLevel || ObservabilityLevel.DIRECTLY_OBSERVABLE,
      measurementType: indicator?.measurementType || IndicatorMeasurementType.QUALITY,
      weight: indicator?.weight || 0.1,
      examples: indicator?.examples || '',
      counterExamples: indicator?.counterExamples || '',
      contextScope: indicator?.contextScope || ContextScope.UNIVERSAL,
      ...(isEditMode && {
        isActive: indicator?.isActive ?? true,
        approvalStatus: indicator?.approvalStatus || ApprovalStatus.DRAFT,
        orderIndex: indicator?.orderIndex || 1,
      }),
    },
  });

  const { errors, dirtyFields } = form.formState;

  const getFieldState = useCallback((fieldName: keyof IndicatorFormValues) => {
    const isDirty = Object.hasOwn(dirtyFields, fieldName) && dirtyFields[fieldName as keyof typeof dirtyFields];
    const hasError = Object.hasOwn(errors, fieldName) && !!errors[fieldName as keyof typeof errors];
    return {
      isDirty,
      hasError,
      isValid: isDirty && !hasError,
    };
  }, [dirtyFields, errors]);

  const currentWeight = form.watch('weight');

  const weightValidation = useWeightValidation({
    competencyId,
    currentIndicatorId: indicator?.id,
    currentWeight: currentWeight || 0,
  });

  useEffect(() => {
    if (!weightValidation.isValid && weightValidation.errorMessage) {
      form.setError('weight', {
        type: 'custom',
        message: weightValidation.errorMessage,
      });
    } else {
      form.clearErrors('weight');
    }
  }, [weightValidation.isValid, weightValidation.errorMessage, form]);

  async function onSubmit(data: IndicatorFormValues) {
    if (!weightValidation.isValid) {
      toast.error(t('weightValidationError'));
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && indicator) {
        const result = await updateIndicatorAction(indicator.id, {
          ...data,
          orderIndex: data.orderIndex ?? 1,
          isActive: data.isActive ?? true,
          approvalStatus: data.approvalStatus ?? ApprovalStatus.DRAFT,
        });

        if (result.success) {
          toast.success(tIndicator('updatedSuccess'));
          router.push(`/hr/behavioral-indicators/${indicator.id}`);
        } else {
          toast.error(result.message);
        }
      } else if (competencyId) {
        const result = await createIndicatorAction(competencyId, {
          title: data.title,
          description: data.description,
          observabilityLevel: data.observabilityLevel,
          measurementType: data.measurementType,
          weight: data.weight,
          examples: data.examples,
          counterExamples: data.counterExamples,
          contextScope: data.contextScope,
        });

        if (result.success && result.data?.id) {
          toast.success(tIndicator('createdSuccess'));
          router.push(`/hr/behavioral-indicators/${result.data.id}`);
        } else if (result.success) {
          toast.error(tIndicator('createdNoId'));
        } else {
          toast.error(result.message);
        }
      }
    } catch (error: unknown) {
      let errorMessage = t('errorOccurred');

      if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;

        if (errorObj.status === 409) {
          errorMessage = `${t('updateFailed')}. ${t('duplicateTitle')}`;
        } else if (typeof errorObj.message === 'string') {
          if (errorObj.message.includes('weight')) {
            errorMessage = `${t('weightValidationError')}: ${errorObj.message}`;
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

  const handleFieldBlur = useCallback(() => {
    if (onUpdatePreview) {
      onUpdatePreview(form.getValues());
    }
  }, [onUpdatePreview, form]);

  const handlePreviewClick = () => {
    if (onUpdatePreview) {
      onUpdatePreview(form.getValues());
    }
  };

  return (
    <div className="space-y-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
                      {t('indicator.buttons.adjustWeights')}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {weightValidation.isValid && weightValidation.remainingWeight < 0.1 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {t('indicator.alerts.weightRemaining', { remaining: weightValidation.remainingWeight.toFixed(3) })}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Core Information */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <section className="py-6" role="region" aria-label={t('indicator.sections.coreInformation')}>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('indicator.sections.coreInformation')}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  {t('indicator.sections.coreInformationDesc')}
                </p>
                <div className="space-y-4 sm:space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => {
                      const fieldState = getFieldState('title');
                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            {t('indicator.fields.title')} <span className="text-destructive">*</span>
                            <HelpTooltip content={getHelp('title')} />
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder={t('indicator.placeholders.title')}
                                className={cn(
                                  'h-11 sm:h-10 pr-8 touch-manipulation',
                                  fieldState.isValid && 'border-green-500 focus-visible:ring-green-500',
                                  fieldState.hasError && 'border-destructive focus-visible:ring-destructive'
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
                      // Backend: @Size(min = 20, max = 500). Mirror exactly.
                      const charCount = field.value?.length ?? 0;
                      const belowMin = charCount < DESCRIPTION_MIN;
                      const aboveMax = charCount > DESCRIPTION_MAX;
                      const inRange = !belowMin && !aboveMax;
                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            {t('indicator.fields.description')} <span className="text-destructive">*</span>
                            <HelpTooltip content={getHelp('description')} />
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('indicator.placeholders.description')}
                              className={cn(
                                'min-h-24 resize-none touch-manipulation',
                                fieldState.isValid && 'border-green-500 focus-visible:ring-green-500',
                                fieldState.hasError && 'border-destructive focus-visible:ring-destructive'
                              )}
                              {...field}
                              onBlur={() => {
                                field.onBlur();
                                handleFieldBlur();
                              }}
                            />
                          </FormControl>
                          <div className="flex items-center justify-between gap-3">
                            <FormMessage />
                            <span
                              className={cn(
                                'text-xs tabular-nums shrink-0',
                                belowMin && 'text-muted-foreground',
                                inRange && 'text-green-600 dark:text-green-400',
                                aboveMax && 'text-destructive'
                              )}
                              aria-live="polite"
                            >
                              {belowMin
                                ? t('indicator.fields.descriptionCounterMin', {
                                    count: charCount,
                                    min: DESCRIPTION_MIN,
                                  })
                                : t('indicator.fields.descriptionCounterRange', {
                                    count: charCount,
                                    max: DESCRIPTION_MAX,
                                  })}
                            </span>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Classification & Metrics */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <section className="py-6" role="region" aria-label={t('indicator.sections.classification')}>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('indicator.sections.classification')}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  {t('indicator.sections.classificationDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <FormField
                    control={form.control}
                    name="observabilityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          {t('indicator.fields.observabilityLevel')}
                          <HelpTooltip content={getHelp('observabilityLevel')} />
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
                              <SelectValue placeholder={t('indicator.placeholders.selectLevel')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getObservabilityOptions(Object.values(ObservabilityLevel)).map((option) => (
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
                    name="measurementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          {t('indicator.fields.measurementType')}
                          <HelpTooltip content={getHelp('measurementType')} />
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
                              <SelectValue placeholder={t('indicator.placeholders.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getMeasurementOptions(measurementTypes).map((option) => (
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
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          {t('indicator.fields.weight')} <span className="text-destructive">*</span>
                          <HelpTooltip content={getHelp('weight')} />
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
                              onChange={(event) => field.onChange(parseFloat(event.target.value) || 0.01)}
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
                    name="contextScope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          {t('indicator.fields.contextScope')}
                          <HelpTooltip content={t('indicator.help.contextScope')} />
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
                              <SelectValue placeholder={t('indicator.placeholders.selectContextScope')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getContextOptions(Object.values(ContextScope)).map((option) => (
                              // Custom item: label inside ItemText (echoed by the
                              // trigger when selected), description outside so it
                              // shows in the dropdown only and never bleeds into
                              // the trigger button.
                              <SelectPrimitive.Item
                                key={option.value}
                                value={option.value}
                                data-slot="select-item"
                                className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default flex-col items-start gap-0.5 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              >
                                <span className="absolute right-2 top-2 flex size-3.5 items-center justify-center">
                                  <SelectPrimitive.ItemIndicator>
                                    <CheckIcon className="size-4" />
                                  </SelectPrimitive.ItemIndicator>
                                </span>
                                <SelectPrimitive.ItemText>
                                  <span className="font-medium">{option.label}</span>
                                </SelectPrimitive.ItemText>
                                {option.description && (
                                  <span className="text-xs text-muted-foreground leading-snug">
                                    {option.description}
                                  </span>
                                )}
                              </SelectPrimitive.Item>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          <Info className="inline h-3 w-3 mr-1" />
                          {t('indicator.help.contextScopeNote')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Contextual Examples */}
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent>
              <section className="py-6" role="region" aria-label={t('indicator.sections.contextualExamples')}>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('indicator.sections.contextualExamples')}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  {t('indicator.sections.contextualExamplesDesc')}
                </p>
                <div className="space-y-4 sm:space-y-5">
                  <FormField
                    control={form.control}
                    name="examples"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          {t('indicator.fields.examples')}
                          <HelpTooltip content={getHelp('examples')} variant="tip" />
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('indicator.placeholders.examples')}
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
                  <FormField
                    control={form.control}
                    name="counterExamples"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          {t('indicator.fields.counterExamples')}
                          <HelpTooltip content={getHelp('counterExamples')} variant="tip" />
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('indicator.placeholders.counterExamples')}
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
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Status & Approval — edit mode only */}
          {isEditMode && (
            <Card className="gap-0 py-0 rounded-lg shadow-none">
              <CardContent>
                <section className="py-6" role="region" aria-label={t('indicator.sections.statusApproval')}>
                  <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('indicator.sections.statusApproval')}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 mb-5">
                    {t('indicator.sections.statusApprovalDesc')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <FormField
                      control={form.control}
                      name="approvalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t('indicator.fields.approvalStatus')}</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleFieldBlur();
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                                <SelectValue placeholder={t('indicator.placeholders.selectStatus')} />
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
                      name="orderIndex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t('indicator.fields.orderIndex')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="1"
                              className="h-11 sm:h-10 touch-manipulation"
                              {...field}
                              onChange={(event) => field.onChange(parseInt(event.target.value))}
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
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-sm font-medium">{t('indicator.fields.visibility')}</FormLabel>
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
                </section>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="h-11 sm:h-10 min-h-11 touch-manipulation"
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
                className="h-11 sm:h-10 min-h-11 touch-manipulation"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('indicator.buttons.updatePreview')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !weightValidation.isValid}
              className="h-11 sm:h-10 min-h-11 touch-manipulation"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? t('saving') : t('creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? t('saveChanges') : t('indicator.buttons.createIndicator')}
                </>
              )}
            </Button>
          </div>
        </form>

        {competencyId && (
          <WeightAdjustmentModal
            isOpen={showWeightModal}
            onClose={() => setShowWeightModal(false)}
            onWeightsUpdated={() => {
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
