'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { SimulationResult } from './types';

interface WarningsListProps {
  warnings: SimulationResult['warnings'];
}

export function WarningsList({ warnings }: WarningsListProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium">Inventory Warnings</span>
      </div>

      <div className="space-y-1.5">
        {warnings.slice(0, 5).map((warning) => (
          <div
            key={warning.competencyId}
            className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs"
          >
            <span className="flex-1 truncate text-amber-700 dark:text-amber-300">
              {warning.competencyName}
            </span>
            <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600">
              {warning.currentCount} questions
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
