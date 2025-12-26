'use client';

import React from 'react';
import { Sparkles, Shuffle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimulationProfile } from './types';

const personaConfig: Record<
  SimulationProfile,
  {
    icon: React.ElementType;
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  PERFECT_CANDIDATE: {
    icon: Sparkles,
    label: 'Perfect',
    description: 'Ideal candidate',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
  },
  RANDOM_GUESSER: {
    icon: Shuffle,
    label: 'Random',
    description: 'Random answers',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
  },
  FAILING_CANDIDATE: {
    icon: TrendingDown,
    label: 'Failing',
    description: 'Poor performer',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
  },
};

interface PersonaSelectorProps {
  selected: SimulationProfile;
  onSelect: (profile: SimulationProfile) => void;
  disabled?: boolean;
}

export function PersonaSelector({ selected, onSelect, disabled }: PersonaSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(personaConfig) as SimulationProfile[]).map((profile) => {
        const config = personaConfig[profile];
        const Icon = config.icon;
        const isSelected = selected === profile;

        return (
          <button
            key={profile}
            onClick={() => onSelect(profile)}
            disabled={disabled}
            className={cn(
              // Mobile: larger touch targets
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
              'min-h-[72px]',
              'hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'active:scale-95',
              isSelected ? config.bgColor : 'bg-background border-border hover:border-border/80',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className={cn('h-5 w-5', isSelected ? config.color : 'text-muted-foreground')} />
            <span
              className={cn(
                'text-xs font-medium',
                isSelected ? config.color : 'text-muted-foreground'
              )}
            >
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
