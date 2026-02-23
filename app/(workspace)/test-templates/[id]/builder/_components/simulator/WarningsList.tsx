'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimulationResult } from './types';

interface WarningsListProps {
  warnings: SimulationResult['warnings'];
}

export function WarningsList({ warnings }: WarningsListProps) {
  const t = useTranslations('builder.simulator');

  if (warnings.length === 0) return null;

  // Separate inventory warnings (competency-specific) from assembly warnings (message-based)
  const inventoryWarnings = warnings.filter((w) => w.competencyId);
  const assemblyWarnings = warnings.filter((w) => !w.competencyId && w.message);

  return (
    <div className="space-y-3">
      {/* Assembly Warnings */}
      {assemblyWarnings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium">
              {t('warnings.assemblyWarnings')}
            </span>
          </div>
          <div className="space-y-1.5">
            {assemblyWarnings.map((warning, i) => (
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
                <span className="flex-1">{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Warnings (existing) */}
      {inventoryWarnings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium">{t('warnings.inventoryWarnings')}</span>
          </div>

          <div className="space-y-1.5">
            {inventoryWarnings.slice(0, 5).map((warning) => (
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
