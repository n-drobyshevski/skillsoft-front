'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Shuffle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimulationProfile, personaConfig } from './types';

const PERSONA_ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Shuffle,
  TrendingDown,
};

const PERSONA_GLOW_CSS_VAR: Record<SimulationProfile, string> = {
  PERFECT_CANDIDATE: 'rgba(52, 211, 153, 0.4)',
  RANDOM_GUESSER: 'rgba(251, 191, 36, 0.4)',
  FAILING_CANDIDATE: 'rgba(248, 113, 113, 0.4)',
};

interface PersonaSelectorProps {
  selected: SimulationProfile;
  onSelect: (profile: SimulationProfile) => void;
  disabled?: boolean;
}

export function PersonaSelector({ selected, onSelect, disabled }: PersonaSelectorProps) {
  const t = useTranslations('builder.simulator');
  const prevSelectedRef = useRef<SimulationProfile>(selected);
  const justChanged = prevSelectedRef.current !== selected;
  if (justChanged) prevSelectedRef.current = selected;

  return (
    <div className="@container">
      <div className="flex flex-col gap-2 @[280px]:grid @[280px]:grid-cols-3">
        {(Object.keys(personaConfig) as SimulationProfile[]).map((profile, index) => {
          const config = personaConfig[profile];
          const Icon = PERSONA_ICON_MAP[config.icon] ?? Sparkles;
          const isSelected = selected === profile;
          const isNewlySelected = isSelected && justChanged;

          return (
            <button
              key={profile}
              onClick={() => onSelect(profile)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl border',
                'transition-all duration-200 ease-out',
                '@[280px]:flex-col @[280px]:items-center @[280px]:gap-1.5 @[280px]:p-3 @[280px]:min-h-[72px]',
                'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'active:scale-95',
                'opacity-0 animate-fade-in-up',
                isSelected
                  ? cn(config.bgColor, 'shadow-sm scale-[1.02]')
                  : 'bg-background border-border hover:border-border/80 hover:scale-[1.01]',
                isNewlySelected && 'animate-persona-glow',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'forwards',
                ...(isSelected
                  ? { '--persona-glow-color': PERSONA_GLOW_CSS_VAR[profile] } as React.CSSProperties
                  : {}),
              }}
            >
              <Icon
                key={isNewlySelected ? `${profile}-anim` : profile}
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-300',
                  isSelected ? cn(config.color, 'scale-110') : 'text-muted-foreground scale-100',
                  isNewlySelected && config.iconAnimation,
                )}
              />
              <span
                className={cn(
                  'text-sm @[280px]:text-xs font-medium transition-colors duration-200',
                  isSelected ? config.color : 'text-muted-foreground'
                )}
              >
                {t(config.labelKey as Parameters<typeof t>[0])}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
