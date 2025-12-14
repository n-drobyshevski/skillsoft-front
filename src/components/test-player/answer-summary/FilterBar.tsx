'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterType = 'all' | 'answered' | 'skipped' | 'flagged';
type SortOrder = 'order' | 'status' | 'competency';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  counts: {
    all: number;
    answered: number;
    skipped: number;
    flagged: number;
  };
}

const filters: Array<{ id: FilterType; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'answered', label: 'Отвечено' },
  { id: 'skipped', label: 'Пропущено' },
  { id: 'flagged', label: 'Отмечено' },
];

/**
 * FilterBar - Filter tabs and sort dropdown for answer list
 *
 * Sticky bar with:
 * - Filter tabs (All, Answered, Skipped, Flagged) with counts
 * - Sort dropdown (By Order, By Status, By Competency)
 */
export function FilterBar({
  activeFilter,
  onFilterChange,
  sortOrder,
  onSortChange,
  counts,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800 px-3 sm:px-4 py-2.5">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {filters.map((filter) => {
            const count = counts[filter.id];
            const isActive = activeFilter === filter.id;
            const isDisabled = filter.id !== 'all' && count === 0;

            return (
              <button
                key={filter.id}
                onClick={() => !isDisabled && onFilterChange(filter.id)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                  "transition-all whitespace-nowrap min-h-[32px]",
                  isActive
                    ? "bg-neutral-800 text-white"
                    : isDisabled
                      ? "text-neutral-600 cursor-not-allowed"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] tabular-nums min-w-[20px] text-center",
                    isActive
                      ? "bg-neutral-700"
                      : "bg-neutral-800/50"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown - desktop only */}
        <div className="hidden sm:block shrink-0">
          <Select value={sortOrder} onValueChange={(v) => onSortChange(v as SortOrder)}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-neutral-800 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">По порядку</SelectItem>
              <SelectItem value="status">По статусу</SelectItem>
              <SelectItem value="competency">По компетенции</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
