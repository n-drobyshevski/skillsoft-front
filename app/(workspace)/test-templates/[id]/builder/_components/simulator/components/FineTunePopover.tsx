'use client';

import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FineTunePopoverProps {
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

export function FineTunePopover(props: FineTunePopoverProps) {
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{t('fineTune.tune')}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-80 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('fineTune.title')}</span>
          </div>

          {/* Strictness */}
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

          {/* Saturation */}
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

          {/* Backtracking toggle */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/30">
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

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onApply}
              disabled={disabled}
            >
              {t('fineTune.saveSettings')}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={onRun}
              disabled={disabled}
            >
              {disabled ? t('running') : t('fineTune.applyAndRerun')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
