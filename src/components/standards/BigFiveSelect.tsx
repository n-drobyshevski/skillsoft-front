/**
 * BigFiveSelect Component
 * 
 * A select component for choosing Big Five personality dimensions.
 * Features auto-detection suggestion based on O*NET code mapping.
 * 
 * @example
 * ```tsx
 * <BigFiveSelect
 *   value="CONSCIENTIOUSNESS"
 *   onChange={(value) => console.log(value)}
 *   suggestion="EXTRAVERSION"
 *   suggestionConfidence={0.85}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Target, 
  Users, 
  Heart, 
  Shield,
  Sparkles,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  type BigFiveDimension, 
  BigFiveInfo,
  BIG_FIVE_DIMENSIONS 
} from '@/types/domain';

// Types

interface BigFiveSelectProps {
  /** Current selected value */
  value?: BigFiveDimension | null;
  /** Callback when selection changes */
  onChange: (value: BigFiveDimension | null) => void;
  /** Auto-detected suggestion from O*NET mapping */
  suggestion?: BigFiveDimension | null;
  /** Confidence score for the suggestion (0-1) */
  suggestionConfidence?: number;
  /** Source of the suggestion (e.g., O*NET element name) */
  suggestionSource?: string | null;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** CSS class name */
  className?: string;
  /** Whether to show clear button */
  allowClear?: boolean;
}

// Icon Mapping

const BigFiveIcons: Record<BigFiveDimension, React.ComponentType<{ className?: string }>> = {
  OPENNESS: Brain,
  CONSCIENTIOUSNESS: Target,
  EXTRAVERSION: Users,
  AGREEABLENESS: Heart,
  EMOTIONAL_STABILITY: Shield,
};

// Trait → colour mapping mirrors DESIGN.md §"Big Five personality traits" and the
// /profile PersonalitySection so the same trait reads the same colour everywhere.
const BigFiveColors: Record<BigFiveDimension, string> = {
  OPENNESS: 'text-violet-600 dark:text-violet-400',
  CONSCIENTIOUSNESS: 'text-blue-600 dark:text-blue-400',
  EXTRAVERSION: 'text-amber-600 dark:text-amber-400',
  AGREEABLENESS: 'text-emerald-600 dark:text-emerald-400',
  EMOTIONAL_STABILITY: 'text-cyan-600 dark:text-cyan-400',
};

const BigFiveBgColors: Record<BigFiveDimension, string> = {
  OPENNESS: 'bg-violet-50 dark:bg-violet-950/40',
  CONSCIENTIOUSNESS: 'bg-blue-50 dark:bg-blue-950/40',
  EXTRAVERSION: 'bg-amber-50 dark:bg-amber-950/40',
  AGREEABLENESS: 'bg-emerald-50 dark:bg-emerald-950/40',
  EMOTIONAL_STABILITY: 'bg-cyan-50 dark:bg-cyan-950/40',
};

// Component

export function BigFiveSelect({
  value,
  onChange,
  suggestion,
  suggestionConfidence = 0,
  suggestionSource,
  placeholder = 'Select personality dimension...',
  disabled = false,
  className,
  allowClear = true,
}: BigFiveSelectProps) {
  // Show suggestion if it differs from current value
  const showSuggestion = suggestion && suggestion !== value && suggestionConfidence > 0;

  const handleApplySuggestion = () => {
    if (suggestion) {
      onChange(suggestion);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  const selectedIcon = value ? BigFiveIcons[value] : null;
  const SelectedIcon = selectedIcon;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Select
          value={value || ''}
          onValueChange={(val) => onChange(val as BigFiveDimension)}
          disabled={disabled}
        >
          <SelectTrigger 
            className={cn(
              "w-full",
              value && BigFiveBgColors[value]
            )}
          >
            <SelectValue placeholder={placeholder}>
              {value && SelectedIcon && (
                <span className="flex items-center gap-2">
                  <SelectedIcon className={cn("h-4 w-4", BigFiveColors[value])} />
                  <span>{BigFiveInfo[value].displayName}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {BIG_FIVE_DIMENSIONS.map((dimension) => {
              const Icon = BigFiveIcons[dimension];
              const info = BigFiveInfo[dimension];
              const isSuggested = dimension === suggestion;
              
              return (
                <SelectItem 
                  key={dimension} 
                  value={dimension}
                  className={cn(
                    "py-2.5",
                    isSuggested && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4", BigFiveColors[dimension])} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{info.displayName}</span>
                        {isSuggested && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            <Sparkles className="h-3 w-3 mr-0.5" />
                            Suggested
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {allowClear && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-9 px-2 text-muted-foreground hover:text-destructive"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Auto-detect suggestion */}
      {showSuggestion && (
        <div className={cn(
          "flex items-center gap-2 p-2.5 rounded-lg border border-dashed",
          BigFiveBgColors[suggestion],
          "border-primary/20"
        )}>
          <Sparkles className={cn("h-4 w-4", BigFiveColors[suggestion])} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Auto-detect: <span className={BigFiveColors[suggestion]}>{BigFiveInfo[suggestion].displayName}</span>
            </p>
            {suggestionSource && (
              <p className="text-xs text-muted-foreground truncate">
                Based on {suggestionSource}
                {suggestionConfidence > 0 && ` (${Math.round(suggestionConfidence * 100)}% match)`}
              </p>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleApplySuggestion}
                  className="h-7 px-2.5 text-xs"
                >
                  Apply
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Use suggested dimension</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  {BigFiveInfo[suggestion].description}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

export default BigFiveSelect;
