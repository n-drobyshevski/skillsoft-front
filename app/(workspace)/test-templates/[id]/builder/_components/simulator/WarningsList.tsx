'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import type { InventoryWarning } from '@/types/blueprint';
import { SimulationResult } from './types';

const DEFAULT_VISIBLE = 4;

interface WarningsListProps {
  warnings: SimulationResult['warnings'];
}

export function WarningsList({ warnings }: WarningsListProps) {
  const t = useTranslations('builder.simulator');
  const [expanded, setExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const assemblyWarnings = warnings.filter((w) => !w.competencyId && w.message);
  const inventoryWarnings = warnings.filter((w) => w.competencyId);
  const totalCount = assemblyWarnings.length + inventoryWarnings.length;
  const hiddenCount = totalCount - DEFAULT_VISIBLE;
  const isCollapsible = totalCount > DEFAULT_VISIBLE;

  // Compute how many of each section to show when collapsed
  let visibleAssembly = assemblyWarnings.length;
  let visibleInventory = inventoryWarnings.length;
  if (!expanded && isCollapsible) {
    visibleAssembly = Math.min(assemblyWarnings.length, DEFAULT_VISIBLE);
    visibleInventory = Math.min(inventoryWarnings.length, Math.max(0, DEFAULT_VISIBLE - visibleAssembly));
  }

  const hasHelpText = (code?: string | null) =>
    code && code !== 'GENERIC';

  /**
   * Resolve a localized message for a warning.
   * Uses i18n template from `warnings.messages.<CODE>` with params interpolation.
   * Falls back to the raw `warning.message` from the backend (English).
   */
  const getWarningMessage = (warning: InventoryWarning): string => {
    const { code, params, message } = warning;
    if (!code || code === 'GENERIC') return message ?? '';

    try {
      return t(`warnings.messages.${code}`, params ?? {});
    } catch {
      // i18n key missing — fall back to backend message
      return message ?? '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Assembly Warnings */}
      {visibleAssembly > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium">
              {t('warnings.assemblyWarnings')}
            </span>
          </div>
          <div className="space-y-1.5">
            {assemblyWarnings.slice(0, visibleAssembly).map((warning, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg text-xs",
                  warning.level === 'ERROR'
                    ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                    : warning.level === 'WARNING'
                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                      : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                )}
              >
                {warning.level === 'ERROR' ? (
                  <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                ) : warning.level === 'WARNING' ? (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{getWarningMessage(warning)}</span>
                {hasHelpText(warning.code) && (
                  <HelpTooltip
                    content={t(`warnings.help.${warning.code}`)}
                    variant="help"
                    size="sm"
                    side="left"
                    maxWidth={320}
                    className="shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Warnings */}
      {visibleInventory > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium">{t('warnings.inventoryWarnings')}</span>
          </div>

          <div className="space-y-1.5">
            {inventoryWarnings.slice(0, visibleInventory).map((warning) => (
              <div
                key={`${warning.competencyId}-${warning.difficulty}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs"
              >
                <span className="flex-1 truncate text-amber-700 dark:text-amber-300">
                  {warning.competencyName}
                </span>
                <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600">
                  {t('warnings.questions', { count: warning.currentCount ?? 0 })}
                </Badge>
                {hasHelpText(warning.code) && (
                  <HelpTooltip
                    content={t(`warnings.help.${warning.code}`)}
                    variant="help"
                    size="sm"
                    side="left"
                    maxWidth={320}
                    className="shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand / Collapse toggle */}
      {isCollapsible && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              {t('warnings.showLess')}
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              {t('warnings.showMore', { count: hiddenCount })}
            </>
          )}
        </button>
      )}
    </div>
  );
}
