'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal } from 'lucide-react';

interface FineTuneTabProps {
  strictness: number;
  onStrictnessChange: (value: number) => void;
  saturation: number;
  onSaturationChange: (value: number) => void;
  allowBacktracking: boolean;
  onAllowBacktrackingChange: (value: boolean) => void;
  onApply: () => void;
  onRun: () => void;
  disabled: boolean;
}

export default function FineTuneTab(props: FineTuneTabProps) {
  const t = useTranslations('builder.simulator');
  const {
    strictness,
    saturation,
    allowBacktracking,
    onStrictnessChange,
    onSaturationChange,
    onAllowBacktrackingChange,
    onApply,
    onRun,
    disabled,
  } = props;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border bg-muted/30 space-y-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('fineTune.title')}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('fineTune.strictness')}</span>
            <span className="font-semibold text-foreground">{strictness}</span>
          </div>
          <Slider
            value={[strictness]}
            min={0}
            max={100}
            step={1}
            onValueChange={(val) => onStrictnessChange(val[0])}
            disabled={disabled}
            className="[&_[role=slider]]:min-h-[24px] [&_[role=slider]]:min-w-[24px]"
          />
          <p className="text-[11px] text-muted-foreground">
            {t('fineTune.strictnessDescription')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('fineTune.saturation')}</span>
            <span className="font-semibold text-foreground">{saturation}%</span>
          </div>
          <Slider
            value={[saturation]}
            min={10}
            max={100}
            step={5}
            onValueChange={(val) => onSaturationChange(val[0])}
            disabled={disabled}
            className="[&_[role=slider]]:min-h-[24px] [&_[role=slider]]:min-w-[24px]"
          />
          <p className="text-[11px] text-muted-foreground">
            {t('fineTune.saturationDescription')}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-background/60">
          <div className="space-y-0.5">
            <Label className="text-sm">{t('fineTune.allowBacktracking')}</Label>
            <p className="text-[11px] text-muted-foreground">
              {t('fineTune.allowBacktrackingDescription')}
            </p>
          </div>
          <Switch
            checked={allowBacktracking}
            onCheckedChange={onAllowBacktrackingChange}
            disabled={disabled}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 min-h-[44px] md:min-h-0"
            onClick={onApply}
            disabled={disabled}
          >
            {t('fineTune.saveSettings')}
          </Button>
          <Button
            className="flex-1 min-h-[44px] md:min-h-0"
            onClick={onRun}
            disabled={disabled}
          >
            {disabled ? t('running') : t('fineTune.applyAndRerun')}
          </Button>
        </div>
      </div>
    </div>
  );
}
