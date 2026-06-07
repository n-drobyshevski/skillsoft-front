'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { teamsApi } from '@/services/api';
import type { Team } from '@/types/domain';

interface TeamPickerProps {
  /** Currently selected team id (controlled). */
  value?: string;
  /** Called with the full team when a team is selected. */
  onSelect: (team: Team) => void;
  /** Team ids to hide from the list (e.g. teams already granted access). */
  excludeTeamIds?: string[];
  disabled?: boolean;
  placeholder?: string;
  size?: 'sm' | 'default';
  className?: string;
}

/**
 * TeamPicker - select an organization team.
 *
 * Mirrors the team selector used in the Team Fit blueprint config, packaged as a
 * reusable control for sharing flows. Shows team name + member count, filters out
 * already-granted teams, and returns the full team object on selection.
 */
export function TeamPicker({
  value,
  onSelect,
  excludeTeamIds = [],
  disabled = false,
  placeholder,
  size = 'default',
  className,
}: TeamPickerProps) {
  const t = useTranslations('template.access.people.form');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    teamsApi
      .getAllTeams()
      .then((data) => {
        if (active) setTeams(data ?? []);
      })
      .catch(() => {
        if (active) setTeams([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const availableTeams = useMemo(
    () => teams.filter((team) => !excludeTeamIds.includes(team.id)),
    [teams, excludeTeamIds]
  );

  const handleChange = (teamId: string) => {
    const team = teams.find((candidate) => candidate.id === teamId);
    if (team) onSelect(team);
  };

  return (
    <Select value={value ?? ''} onValueChange={handleChange} disabled={disabled || isLoading}>
      <SelectTrigger
        className={cn(size === 'default' && 'h-12', className)}
        aria-label={placeholder ?? t('teamPlaceholder')}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <SelectValue placeholder={placeholder ?? t('teamPlaceholder')} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t('teamLoading')}
          </div>
        ) : availableTeams.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {t('noTeams')}
          </div>
        ) : (
          availableTeams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              <span className="flex items-center gap-2">
                <span className="truncate">{team.name}</span>
                <Badge variant="secondary" className="h-4 text-[10px]">
                  {t('teamMemberCount', { count: team.memberCount })}
                </Badge>
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

export default TeamPicker;
