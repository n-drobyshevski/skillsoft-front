'use client';

import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Save,
  Loader2,
  Archive,
  Trash2,
  AlertTriangle,
  Clock,
  Target,
  ListChecks,
  Shuffle,
  SkipForward,
  ArrowLeftRight,
  Eye,
  Check,
  Briefcase,
  Users,
  Crosshair,
  Settings2,
  ToggleRight,
  Lock,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AssessmentGoal, AssessmentGoalInfo, TestTemplate } from '@/types/domain';
import { updateTemplateSettings, archiveTemplate, deleteTemplate, createNewVersion } from '../../actions';
import { useTranslations } from 'next-intl';
import { GoalConfigSection } from './GoalConfigSection';

// Validation schema factory — accepts translation function for i18n error messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSettingsSchema(t: (key: string, values?: any) => string) {
  return z.object({
    name: z.string()
      .min(3, t('validation.minChars', { min: 3 }))
      .max(100, t('validation.maxChars', { max: 100 })),
    description: z.string().max(500, t('validation.maxChars', { max: 500 })).optional(),
    goal: z.nativeEnum(AssessmentGoal),
    questionsPerIndicator: z.number().min(1).max(10),
    timeLimitMinutes: z.number().min(5).max(180),
    passingScore: z.number().min(10).max(100),
    isActive: z.boolean(),
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
    allowSkip: z.boolean(),
    allowBackNavigation: z.boolean(),
    showResultsImmediately: z.boolean(),
    // Blueprint fields for OVERVIEW goal
    includeBigFive: z.boolean().optional(),
    preferredDifficulty: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']).optional(),
    // Blueprint fields for JOB_FIT goal
    onetSocCode: z.string().optional(),
    strictnessLevel: z.number().min(0).max(100).optional(),
    enableDeltaTesting: z.boolean().optional(),
    candidateClerkUserId: z.string().optional(),
    // Blueprint fields for TEAM_FIT goal
    teamId: z.string().optional(),
    saturationThreshold: z.number().min(0.3).max(0.9).optional(),
  }).refine(
    (data) => {
      if (data.goal === AssessmentGoal.JOB_FIT && data.onetSocCode) {
        return /^\d{2}-\d{4}\.\d{2}$/.test(data.onetSocCode);
      }
      return true;
    },
    {
      message: t('validation.invalidOnetFormat'),
      path: ['onetSocCode'],
    }
  ).refine(
    (data) => {
      if (data.goal === AssessmentGoal.TEAM_FIT && data.teamId) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.teamId);
      }
      return true;
    },
    {
      message: t('validation.invalidTeamId'),
      path: ['teamId'],
    }
  );
}

type SettingsFormValues = z.infer<ReturnType<typeof createSettingsSchema>>;

interface SettingsFormProps {
  template: TestTemplate;
}

// Goal configuration for visual display
const goalConfig: Record<AssessmentGoal, { icon: typeof Briefcase; color: string }> = {
  [AssessmentGoal.JOB_FIT]: {
    icon: Briefcase,
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  },
  [AssessmentGoal.TEAM_FIT]: {
    icon: Users,
    color: 'border-violet-500 bg-violet-50 dark:bg-violet-950/30',
  },
  [AssessmentGoal.OVERVIEW]: {
    icon: Crosshair,
    color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  },
};

export function SettingsForm({ template }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('template');
  const tCommon = useTranslations('common');

  // Published/Archived templates are read-only — must create a new version to edit
  const isReadOnly = template.status === 'PUBLISHED' || template.status === 'ARCHIVED';

  // Extract blueprint values with sensible defaults
  const blueprint = template.blueprint || {};

  const settingsSchema = useMemo(() => createSettingsSchema(t as (key: string, values?: any) => string), [t]);
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: template.name,
      description: template.description || '',
      goal: template.goal,
      questionsPerIndicator: template.questionsPerIndicator,
      timeLimitMinutes: template.timeLimitMinutes,
      passingScore: template.passingScore,
      isActive: template.isActive,
      shuffleQuestions: template.shuffleQuestions,
      shuffleOptions: template.shuffleOptions,
      allowSkip: template.allowSkip,
      allowBackNavigation: template.allowBackNavigation,
      showResultsImmediately: template.showResultsImmediately,
      // Blueprint fields for OVERVIEW goal
      includeBigFive: (blueprint.include_big_five as boolean) ?? true,
      preferredDifficulty: (blueprint.preferred_difficulty as 'BASIC' | 'INTERMEDIATE' | 'ADVANCED') ?? 'INTERMEDIATE',
      // Blueprint fields for JOB_FIT goal
      onetSocCode: (blueprint.onet_soc_code as string) ?? '',
      strictnessLevel: (blueprint.strictness_level as number) ?? 60,
      enableDeltaTesting: (blueprint.enable_delta_testing as boolean) ?? false,
      candidateClerkUserId: (blueprint.candidate_clerk_user_id as string) ?? '',
      // Blueprint fields for TEAM_FIT goal
      teamId: (blueprint.team_id as string) ?? '',
      saturationThreshold: (blueprint.saturation_threshold as number) ?? 0.7,
    },
    mode: 'onBlur',
  });

  const isDirty = form.formState.isDirty;

  const handleSave = (values: SettingsFormValues) => {
    startTransition(async () => {
      const result = await updateTemplateSettings(template.id, values);
      if (result.success) {
        toast.success(t('settingsSaved'));
        form.reset(values);
        router.refresh();
      } else {
        toast.error(result.error || t('settingsSaveError'));
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveTemplate(template.id);
      if (result.success) {
        toast.success(t('templateArchived'));
        router.refresh();
      } else {
        toast.error(result.error || t('archiveError'));
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTemplate(template.id);
    });
  };

  const handleReset = () => {
    form.reset();
    toast.info(t('changesDiscarded'));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)}>
        {/* Read-only banner for published/archived templates */}
        {isReadOnly && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border-2 border-amber-500/50 bg-amber-50 p-4 dark:bg-amber-950/30">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('readOnlyTitle')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  {t('readOnlyDescription')}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0 border-amber-500/50 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950/50"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await createNewVersion(template.id, false);
                });
              }}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GitBranch className="h-3.5 w-3.5" />
              )}
              {t('createNewVersion')}
            </Button>
          </div>
        )}

        {/* Main 2-column grid */}
        <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8", isReadOnly && "opacity-60 pointer-events-none")}>

          {/* LEFT COLUMN: Main Content (8/12) */}
          <div className="space-y-6 lg:col-span-8">

            {/* Section 1: General Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      {t('generalInformation')}
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      {t('generalInformationDesc')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t('templateNameLabel')}</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {field.value.length}/100
                        </span>
                      </div>
                      <FormControl>
                        <Input {...field} placeholder={t('testNamePlaceholder')} className="h-11" />
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
                      <div className="flex items-center justify-between">
                        <FormLabel>{t('descriptionLabel')}</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/500
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t('descriptionHelp')}
                          rows={3}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section 2: Assessment Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('assessmentGoal')}
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {t('assessmentGoalDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                          {Object.values(AssessmentGoal).map((goal) => {
                            // Safe: goal is from Object.values(AssessmentGoal), a typed enum
                            // eslint-disable-next-line security/detect-object-injection
                            const info = AssessmentGoalInfo[goal];
                            // eslint-disable-next-line security/detect-object-injection
                            const config = goalConfig[goal];
                            const GoalIcon = config.icon;
                            const isSelected = field.value === goal;

                            return (
                              <div key={goal} className="relative group">
                                <RadioGroupItem value={goal} id={`goal-${goal}`} className="sr-only" />
                                <Label
                                  htmlFor={`goal-${goal}`}
                                  className={cn(
                                    'flex flex-col gap-3 rounded-xl border-2 p-5 cursor-pointer',
                                    'transition-all duration-200 ease-out',
                                    'hover:shadow-lg hover:-translate-y-0.5',
                                    isSelected
                                      ? `border-primary shadow-md ${config.color}`
                                      : 'border-border hover:border-primary/50 bg-card'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isSelected ? "bg-primary/10" : "bg-muted"
                                      )}>
                                        <GoalIcon className={cn(
                                          "h-5 w-5 transition-colors",
                                          isSelected ? "text-primary" : "text-muted-foreground"
                                        )} />
                                      </div>
                                      <span className="font-semibold text-sm">
                                        {info.displayName}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-5 w-5 text-primary animate-in fade-in zoom-in duration-200" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.5rem]">
                                    {info.description}
                                  </p>
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section 2.5: Goal-Specific Configuration */}
            <GoalConfigSection
              selectedCompetencyCount={template.competencyIds?.length || 0}
            />

            {/* Section 3: Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  {t('testConfiguration')}
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {t('testConfigurationDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="questionsPerIndicator"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <div className="p-1.5 rounded-md bg-primary/10">
                            <ListChecks className="h-4 w-4 text-primary" />
                          </div>
                          {t('questionsPerIndicatorLabel')}
                        </FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(v) => field.onChange(parseInt(v))}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 5].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} {n === 1 ? t('question') : t('questionsPlural')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs leading-relaxed">
                          {t('questionsPerIndicatorDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeLimitMinutes"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <div className="p-1.5 rounded-md bg-amber-500/10">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                          </div>
                          {t('timeLimitLabel')}
                        </FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(v) => field.onChange(parseInt(v))}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[15, 30, 45, 60, 90, 120].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} {t('minutes')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs leading-relaxed">
                          {t('timeLimitDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <div className="p-1.5 rounded-md bg-emerald-500/10">
                            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                          </div>
                          {t('passingScoreLabel')}
                        </FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(v) => field.onChange(parseInt(v))}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[50, 60, 70, 80, 90].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs leading-relaxed">
                          {t('passingScoreDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Test Behavior */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ToggleRight className="h-5 w-5" />
                  {t('testBehavior')}
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {t('testBehaviorDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      name: 'shuffleQuestions' as const,
                      labelKey: 'shuffleQuestionsLabel',
                      descriptionKey: 'shuffleQuestionsDescription',
                      icon: Shuffle,
                    },
                    {
                      name: 'shuffleOptions' as const,
                      labelKey: 'shuffleOptionsLabel',
                      descriptionKey: 'shuffleOptionsDescription',
                      icon: Shuffle,
                    },
                    {
                      name: 'allowSkip' as const,
                      labelKey: 'allowSkipLabel',
                      descriptionKey: 'allowSkipDescription',
                      icon: SkipForward,
                    },
                    {
                      name: 'allowBackNavigation' as const,
                      labelKey: 'allowBackNavigationLabel',
                      descriptionKey: 'allowBackNavigationDescription',
                      icon: ArrowLeftRight,
                    },
                    {
                      name: 'showResultsImmediately' as const,
                      labelKey: 'showResultsLabel',
                      descriptionKey: 'showResultsDescription',
                      icon: Eye,
                    },
                  ].map((setting) => {
                    const Icon = setting.icon;
                    return (
                      <FormField
                        key={setting.name}
                        control={form.control}
                        name={setting.name}
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-muted shrink-0">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  {t(setting.labelKey)}
                                </FormLabel>
                                <FormDescription className="text-xs leading-relaxed">
                                  {t(setting.descriptionKey)}
                                </FormDescription>
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="shrink-0"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Sidebar (4/12) */}
          <div className="space-y-6 lg:col-span-4">

            {/* Publication Status (Sticky) */}
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-base">{t('publicationStatus')}</CardTitle>
                <CardDescription className="text-xs mt-1.5">
                  {t('publicationStatusDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <div className={cn(
                        "flex items-center justify-between rounded-lg border-2 p-4 transition-colors",
                        field.value
                          ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30"
                          : "border-border bg-muted/30"
                      )}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              field.value ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                            )} />
                            <FormLabel className="text-sm font-semibold cursor-pointer">
                              {field.value ? t('published') : t('draft')}
                            </FormLabel>
                          </div>
                          <FormDescription className="text-xs leading-relaxed">
                            {field.value
                              ? t('publishedDesc')
                              : t('draftDesc')}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Template Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('templateInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('created')}</span>
                  <span className="font-medium">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('lastModified')}</span>
                  <span className="font-medium">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('competencies')}</span>
                  <Badge variant="secondary" className="font-medium">
                    {template.competencyIds?.length || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {t('dangerZone')}
                </CardTitle>
                <CardDescription className="text-xs mt-1.5">
                  {t('dangerZoneDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Archive */}
                {template.isActive && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-sm h-9"
                          size="sm"
                        >
                          <Archive className="h-4 w-4" />
                          {t('archiveTemplate')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('archiveTemplateTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('archiveTemplateDesc')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleArchive} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t('archive')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Separator />
                  </>
                )}

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2 text-sm h-9"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('deleteForever')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteTemplateTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteTemplateDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {t('deleteForever')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sticky Save Bar - Full Width (hidden for read-only templates) */}
        {!isReadOnly && <div className="sticky bottom-0 z-10 mt-6 -mx-4 lg:-mx-6 border-t bg-background/95 backdrop-blur-sm">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left side: Status indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isDirty ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="hidden sm:inline">{t('unsavedChanges')}</span>
                    <span className="sm:hidden">{t('unsaved')}</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="hidden sm:inline">{t('allChangesSaved')}</span>
                    <span className="sm:hidden">{t('saved')}</span>
                  </>
                )}
              </div>

              {/* Right side: Action buttons */}
              <div className="flex gap-3">
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isPending}
                    size="sm"
                  >
                    {t('discard')}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isPending || !isDirty}
                  className="gap-2 min-w-[120px]"
                  size="sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t('saveChanges')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>}
      </form>
    </Form>
  );
}
