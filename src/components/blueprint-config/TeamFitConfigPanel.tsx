'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';
import {
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  Target,
  UserPlus,
} from 'lucide-react';
import { teamsApi } from '@/services/api';
import type { Team, TeamProfile } from '@/types/domain';

// Types

interface TeamFitConfigPanelProps {
  className?: string;
}

// Saturation Status

type SaturationStatus = 'full' | 'adequate' | 'gap' | 'critical';

function getSaturationStatus(value: number, threshold: number): SaturationStatus {
  if (value >= 0.9) return 'full';
  if (value >= threshold) return 'adequate';
  if (value >= threshold * 0.5) return 'gap';
  return 'critical';
}

function getSaturationColor(status: SaturationStatus): string {
  switch (status) {
    case 'full':
      return 'bg-green-500';
    case 'adequate':
      return 'bg-yellow-500';
    case 'gap':
      return 'bg-orange-500';
    case 'critical':
      return 'bg-red-500';
  }
}

function getSaturationBadgeVariant(
  status: SaturationStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'full':
      return 'default';
    case 'adequate':
      return 'secondary';
    case 'gap':
      return 'outline';
    case 'critical':
      return 'destructive';
  }
}

// Component

export function TeamFitConfigPanel({ className }: TeamFitConfigPanelProps) {
  const form = useFormContext();
  const t = useTranslations('help.scenario.teamFit');
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const selectedTeamId = form.watch('teamId');
  const saturationThreshold = form.watch('saturationThreshold') ?? 0.7;

  // Load teams on mount
  useEffect(() => {
    async function loadTeams() {
      setIsLoadingTeams(true);
      try {
        const data = await teamsApi.getAllTeams();
        setTeams(data || []);
      } catch {
        setTeams([]);
      } finally {
        setIsLoadingTeams(false);
      }
    }
    loadTeams();
  }, []);

  // Load team profile when team changes
  useEffect(() => {
    if (!selectedTeamId) {
      setTeamProfile(null);
      return;
    }

    async function loadProfile() {
      setIsLoadingProfile(true);
      try {
        const profile = await teamsApi.getTeamProfile(selectedTeamId);
        setTeamProfile(profile);
      } catch {
        setTeamProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [selectedTeamId]);

  // Calculate saturation stats
  const saturationStats = React.useMemo(() => {
    if (!teamProfile) return null;

    const entries = Object.entries(teamProfile.saturation);
    const undersaturated = entries.filter(([, v]) => v < saturationThreshold);
    const critical = entries.filter(([, v]) => v < saturationThreshold * 0.5);

    const avgSaturation =
      entries.reduce((sum, [, v]) => sum + v, 0) / entries.length || 0;

    return {
      total: entries.length,
      undersaturated: undersaturated.length,
      critical: critical.length,
      avgSaturation,
      entries,
    };
  }, [teamProfile, saturationThreshold]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Team Selector */}
      <FormField
        control={form.control}
        name="teamId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              {t('ui.targetTeam')}
              <HelpTooltip content={t('team')} variant="help" />
            </FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger
                  className={cn(
                    'h-12',
                    selectedTeamId && 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30'
                  )}
                >
                  <SelectValue placeholder={t('ui.selectTeam')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoadingTeams ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {t('ui.loadingTeams')}
                  </div>
                ) : teams.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {t('ui.noTeams')}
                  </div>
                ) : (
                  teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        <span>{team.name}</span>
                        <Badge variant="secondary" className="h-4 text-[10px]">
                          {t('ui.members', { count: team.memberCount })}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              {t('ui.teamDescription')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Team Profile Card */}
      {teamProfile && saturationStats && (
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <CardTitle className="text-sm">{teamProfile.teamName}</CardTitle>
              </div>
              <Badge
                variant={saturationStats.critical > 0 ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {t('ui.gaps', { count: saturationStats.undersaturated })}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {t('ui.skillCoverage')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Overall saturation gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('ui.overallSaturation')}</span>
                <span className="font-mono font-medium">
                  {(saturationStats.avgSaturation * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    saturationStats.avgSaturation >= 0.8
                      ? 'bg-green-500'
                      : saturationStats.avgSaturation >= 0.6
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  )}
                  style={{ width: `${saturationStats.avgSaturation * 100}%` }}
                />
              </div>
            </div>

            {/* Saturation bars for top gaps */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                <span>{t('ui.skillGaps')}</span>
              </div>
              {saturationStats.entries
                .filter(([, v]) => v < saturationThreshold)
                .sort((a, b) => a[1] - b[1])
                .slice(0, 5)
                .map(([name, value]) => {
                  const status = getSaturationStatus(value, saturationThreshold);
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md bg-background/50"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Target className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span className="text-xs font-medium truncate">{name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              getSaturationColor(status)
                            )}
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={getSaturationBadgeVariant(status)}
                                className="h-4 text-[9px] px-1.5 cursor-help"
                              >
                                {status === 'critical' ? t('ui.statusCritical') : t('ui.statusGap')}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs text-xs">
                              {t(`gapStatus.${status}`)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saturation Threshold Slider */}
      <FormField
        control={form.control}
        name="saturationThreshold"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                {t('ui.gapThreshold')}
                <HelpTooltip content={t('saturation.description')} variant="help" />
              </FormLabel>
              <Badge variant="outline" className="text-xs font-mono">
                {((field.value ?? 0.7) * 100).toFixed(0)}%
              </Badge>
            </div>
            <FormControl>
              <div className="pt-4 pb-2 px-1">
                <Slider
                  value={[field.value ?? 0.7]}
                  onValueChange={([v]) => field.onChange(v)}
                  min={0.3}
                  max={0.9}
                  step={0.05}
                  className="touch-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">30%</span>
                  <span className="text-[10px] text-muted-foreground">90%</span>
                </div>
              </div>
            </FormControl>
            <FormDescription className="text-xs">
              {t('ui.thresholdHelp')}
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Info card about team fit */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-3">
          <div className="flex items-start gap-3">
            <UserPlus className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                {t('ui.assessmentTitle')}
                <HelpTooltip content={t('assessment')} variant="tip" size="sm" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('ui.assessmentDesc')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning if no team selected */}
      {!selectedTeamId && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="text-amber-800 dark:text-amber-200">
            {t('ui.noTeamWarning')}
          </span>
        </div>
      )}
    </div>
  );
}

export default TeamFitConfigPanel;
