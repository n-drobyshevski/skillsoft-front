'use client';

/**
 * FineTuneSheet
 *
 * A bottom sheet for Fine Tune settings on mobile devices.
 * Features a floating action button that's always accessible,
 * allowing users to quickly adjust simulation parameters and re-run.
 */

import React, { memo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Strategy, STRATEGY_CONFIG } from '../strategy-context';

// ============================================
// TYPES
// ============================================

interface FineTuneSheetProps {
  /** Current strategy for theming */
  strategy: Strategy;
  /** Strictness value (0-100) */
  strictness: number;
  /** Callback when strictness changes */
  onStrictnessChange: (value: number) => void;
  /** Saturation value (10-100) */
  saturation: number;
  /** Callback when saturation changes */
  onSaturationChange: (value: number) => void;
  /** Whether backtracking is allowed */
  allowBacktracking: boolean;
  /** Callback when backtracking setting changes */
  onAllowBacktrackingChange: (value: boolean) => void;
  /** Ability level (0-100) for IRT persona curves */
  abilityLevel?: number;
  /** Callback when ability level changes */
  onAbilityLevelChange?: (value: number) => void;
  /** Callback to apply settings */
  onApply: () => void;
  /** Callback to apply and re-run simulation */
  onRun: () => void;
  /** Whether simulation is running */
  isSimulating: boolean;
}

// ============================================
// FLOATING TRIGGER BUTTON
// ============================================

interface FloatingTriggerProps {
  strategy: Strategy;
}

const FloatingTrigger = memo(function FloatingTrigger({ strategy }: FloatingTriggerProps) {
  const t = useTranslations('builder.simulator');
  const config = STRATEGY_CONFIG[strategy];

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'fixed bottom-32 right-4 z-40',
        'h-14 w-14 rounded-full shadow-lg',
        'bg-background/95 backdrop-blur-sm',
        'border-2 transition-all duration-200',
        'hover:scale-105 active:scale-95',
        config.border
      )}
      aria-label={t('fineTune.openSettings')}
    >
      <SlidersHorizontal className={cn('h-6 w-6', config.iconText)} />
    </Button>
  );
});

// ============================================
// SETTINGS CONTENT
// ============================================

interface SettingsContentProps {
  strictness: number;
  onStrictnessChange: (value: number) => void;
  saturation: number;
  onSaturationChange: (value: number) => void;
  allowBacktracking: boolean;
  onAllowBacktrackingChange: (value: boolean) => void;
  abilityLevel?: number;
  onAbilityLevelChange?: (value: number) => void;
  isSimulating: boolean;
}

const SettingsContent = memo(function SettingsContent({
  strictness,
  onStrictnessChange,
  saturation,
  onSaturationChange,
  allowBacktracking,
  onAllowBacktrackingChange,
  abilityLevel = 50,
  onAbilityLevelChange,
  isSimulating,
}: SettingsContentProps) {
  const t = useTranslations('builder.simulator');

  return (
    <div className="space-y-6 px-4">
      {/* Strictness Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{t('fineTune.strictness')}</Label>
          <span className="text-sm font-semibold tabular-nums bg-muted px-2 py-0.5 rounded">
            {strictness}
          </span>
        </div>
        <Slider
          value={[strictness]}
          min={0}
          max={100}
          step={1}
          onValueChange={(val) => onStrictnessChange(val[0])}
          disabled={isSimulating}
          className="[&_[data-slot=slider-thumb]]:h-6 [&_[data-slot=slider-thumb]]:w-6"
        />
        <p className="text-xs text-muted-foreground">
          {t('fineTune.strictnessDescription')}
        </p>
      </div>

      {/* Saturation Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{t('fineTune.saturation')}</Label>
          <span className="text-sm font-semibold tabular-nums bg-muted px-2 py-0.5 rounded">
            {saturation}%
          </span>
        </div>
        <Slider
          value={[saturation]}
          min={10}
          max={100}
          step={5}
          onValueChange={(val) => onSaturationChange(val[0])}
          disabled={isSimulating}
          className="[&_[data-slot=slider-thumb]]:h-6 [&_[data-slot=slider-thumb]]:w-6"
        />
        <p className="text-xs text-muted-foreground">
          {t('fineTune.saturationDescription')}
        </p>
      </div>

      {/* Ability Level Slider */}
      {onAbilityLevelChange && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t('fineTune.abilityLevel')}</Label>
            <span className="text-sm font-semibold tabular-nums bg-muted px-2 py-0.5 rounded">
              {abilityLevel}
            </span>
          </div>
          <Slider
            value={[abilityLevel]}
            min={0}
            max={100}
            step={1}
            onValueChange={(val) => onAbilityLevelChange(val[0])}
            disabled={isSimulating}
            className="[&_[data-slot=slider-thumb]]:h-6 [&_[data-slot=slider-thumb]]:w-6"
          />
          <p className="text-xs text-muted-foreground">
            {t('fineTune.abilityLevelDescription')}
          </p>
        </div>
      )}

      {/* Backtracking Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
        <div className="space-y-1 pr-4">
          <Label className="text-sm font-medium">{t('fineTune.allowBacktracking')}</Label>
          <p className="text-xs text-muted-foreground">
            {t('fineTune.allowBacktrackingDescription')}
          </p>
        </div>
        <Switch
          checked={allowBacktracking}
          onCheckedChange={onAllowBacktrackingChange}
          disabled={isSimulating}
          className="scale-110"
        />
      </div>
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const FineTuneSheet = memo(function FineTuneSheet({
  strategy,
  strictness,
  onStrictnessChange,
  saturation,
  onSaturationChange,
  allowBacktracking,
  onAllowBacktrackingChange,
  abilityLevel,
  onAbilityLevelChange,
  onApply,
  onRun,
  isSimulating,
}: FineTuneSheetProps) {
  const t = useTranslations('builder.simulator');
  const [isOpen, setIsOpen] = useState(false);
  const config = STRATEGY_CONFIG[strategy];

  const handleApplyAndClose = () => {
    onApply();
    setIsOpen(false);
  };

  const handleRunAndClose = () => {
    onRun();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <FloatingTrigger strategy={strategy} />
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[70dvh] flex flex-col">
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
        </div>

        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className={cn('h-5 w-5', config.iconText)} />
            {t('fineTune.title')}
          </SheetTitle>
          <SheetDescription>
            {t('fineTune.description')}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <SettingsContent
            strictness={strictness}
            onStrictnessChange={onStrictnessChange}
            saturation={saturation}
            onSaturationChange={onSaturationChange}
            allowBacktracking={allowBacktracking}
            onAllowBacktrackingChange={onAllowBacktrackingChange}
            abilityLevel={abilityLevel}
            onAbilityLevelChange={onAbilityLevelChange}
            isSimulating={isSimulating}
          />
        </div>

        {/* Footer Actions */}
        <SheetFooter className="flex-row gap-3 border-t pt-4">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={handleApplyAndClose}
            disabled={isSimulating}
          >
            {t('fineTune.saveSettings')}
          </Button>
          <Button
            className={cn('flex-1 h-12 gap-2', config.badgeBg)}
            onClick={handleRunAndClose}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('running')}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {t('fineTune.applyAndRerun')}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

export default FineTuneSheet;
