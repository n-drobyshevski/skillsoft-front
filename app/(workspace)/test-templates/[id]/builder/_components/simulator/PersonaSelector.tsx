'use client';

import React from 'react';
import { Sparkles, Shuffle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimulationProfile, personaConfig } from './types';

const PERSONA_ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Shuffle,
  TrendingDown,
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
        const Icon = PERSONA_ICON_MAP[config.icon] ?? Sparkles;
        const isSelected = selected === profile;

        return (
          <button
            key={profile}
            onClick={() => onSelect(profile)}
            disabled={disabled}
            className={cn(
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
