'use client';

import * as React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Keyboard,
  Globe,
  Eye,
  Compass,
  HelpCircle,
  Layers,
  MousePointerClick,
  PanelLeft,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface ShortcutDefinition {
  /** Key combination (e.g., "Enter", "Ctrl+S", "ArrowRight") */
  keys: string[];
  /** Description of what the shortcut does */
  description: string;
  /** Optional category for grouping */
  category?: string;
}

export interface KeyboardShortcutsModalProps {
  /** List of shortcuts to display */
  shortcuts: ShortcutDefinition[];
  /** Title for the modal */
  title?: string;
  /** Description for the modal */
  description?: string;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Enable the `?` key to open the modal */
  enableKeyboardTrigger?: boolean;
  /** Additional context for the shortcuts (e.g., "Test Player") */
  context?: string;
}

// ============================================================================
// Category Metadata
// ============================================================================

interface CategoryMeta {
  icon: LucideIcon;
  color: string;
  accent: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  Preferences: {
    icon: Palette,
    color: 'text-violet-500 dark:text-violet-400',
    accent: 'bg-violet-500/15 dark:bg-violet-400/10',
  },
  Lens: {
    icon: Eye,
    color: 'text-sky-500 dark:text-sky-400',
    accent: 'bg-sky-500/15 dark:bg-sky-400/10',
  },
  Navigation: {
    icon: Compass,
    color: 'text-emerald-500 dark:text-emerald-400',
    accent: 'bg-emerald-500/15 dark:bg-emerald-400/10',
  },
  Actions: {
    icon: MousePointerClick,
    color: 'text-amber-500 dark:text-amber-400',
    accent: 'bg-amber-500/15 dark:bg-amber-400/10',
  },
  Selection: {
    icon: Layers,
    color: 'text-indigo-500 dark:text-indigo-400',
    accent: 'bg-indigo-500/15 dark:bg-indigo-400/10',
  },
  Panel: {
    icon: PanelLeft,
    color: 'text-cyan-500 dark:text-cyan-400',
    accent: 'bg-cyan-500/15 dark:bg-cyan-400/10',
  },
  Help: {
    icon: HelpCircle,
    color: 'text-muted-foreground',
    accent: 'bg-muted/60',
  },
  General: {
    icon: Keyboard,
    color: 'text-muted-foreground',
    accent: 'bg-muted/60',
  },
};

const DEFAULT_META: CategoryMeta = {
  icon: Keyboard,
  color: 'text-muted-foreground',
  accent: 'bg-muted/60',
};

function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category] ?? DEFAULT_META;
}

// ============================================================================
// Keyboard Key Component
// ============================================================================

function KeyboardKey({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5',
        'bg-muted/70 border border-border/60 rounded-md',
        'font-mono text-[11px] font-semibold text-foreground/80',
        'select-none',
        className
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * Render a key combination with proper formatting.
 * Uses "+" for modifier combos (Ctrl+K) and "–" for ranges (1–5).
 */
function KeyCombination({ keys, isRange = false }: { keys: string[]; isRange?: boolean }) {
  const separator = isRange ? (
    <span className="text-muted-foreground/60 text-[10px] font-medium mx-0.5">–</span>
  ) : (
    <span className="text-muted-foreground/50 text-[10px] font-medium mx-0.5">+</span>
  );

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && separator}
          <KeyboardKey>{formatKeyName(key)}</KeyboardKey>
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Format key name for display (e.g., "ArrowRight" -> "→")
 */
function formatKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Enter: '↵',
    Escape: 'Esc',
    Space: '␣',
    Backspace: '⌫',
    Delete: 'Del',
    Tab: '⇥',
    Home: 'Home',
    End: 'End',
    PageUp: 'PgUp',
    PageDown: 'PgDn',
    Ctrl: 'Ctrl',
    Alt: 'Alt',
    Shift: '⇧',
    Meta: '⌘',
    Command: '⌘',
  };

  return keyMap[key] ?? key;
}

/**
 * Detect if a key combo is a range (e.g., 1–5, ↑/↓) vs a modifier combo.
 */
function isRangeCombo(keys: string[]): boolean {
  if (keys.length !== 2) return false;
  const modifiers = ['Ctrl', 'Alt', 'Shift', 'Meta', 'Command'];
  // If neither key is a modifier, treat as range
  return !modifiers.includes(keys[0]) && !modifiers.includes(keys[1]);
}

// ============================================================================
// Shortcut Row (compact vertical layout for card columns)
// ============================================================================

function ShortcutRow({
  shortcut,
  index,
}: {
  shortcut: ShortcutDefinition;
  index: number;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 py-1.5 px-2 -mx-2 rounded-md',
        'transition-colors duration-150',
        'hover:bg-accent/50',
        'animate-in fade-in-0 slide-in-from-bottom-1 duration-200 fill-mode-both',
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <span className="text-[13px] leading-tight text-foreground/80 min-w-0">
        {shortcut.description}
      </span>
      <KeyCombination keys={shortcut.keys} isRange={isRangeCombo(shortcut.keys)} />
    </div>
  );
}

// ============================================================================
// Category Card (one column in the grid)
// ============================================================================

function CategoryCard({
  category,
  shortcuts,
  startIndex,
  columnIndex,
}: {
  category: string;
  shortcuts: ShortcutDefinition[];
  startIndex: number;
  columnIndex: number;
}) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border/50 bg-card/50',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-250 fill-mode-both',
      )}
      style={{ animationDelay: `${columnIndex * 60}ms` }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
        <div className={cn('flex items-center justify-center w-6 h-6 rounded-md', meta.accent)}>
          <Icon className={cn('w-3.5 h-3.5', meta.color)} />
        </div>
        <h4 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
          {category}
        </h4>
      </div>

      {/* Card body */}
      <div className="px-2 py-1.5 flex-1">
        {shortcuts.map((shortcut, i) => (
          <ShortcutRow
            key={i}
            shortcut={shortcut}
            index={startIndex + i}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function KeyboardShortcutsModal({
  shortcuts,
  title = 'Keyboard Shortcuts',
  description,
  open: controlledOpen,
  onOpenChange,
  enableKeyboardTrigger = true,
  context,
}: KeyboardShortcutsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        setOpen(!isOpen);
        return;
      }

      if (event.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    },
    [isOpen, setOpen],
  );

  useEffect(() => {
    if (!enableKeyboardTrigger) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardTrigger, handleKeyDown]);

  // Group shortcuts by category with running index for stagger
  const { groups, categoryNames } = useMemo(() => {
    const g: Record<string, ShortcutDefinition[]> = {};
    for (const shortcut of shortcuts) {
      const cat = shortcut.category ?? 'General';
      (g[cat] ??= []).push(shortcut);
    }
    return { groups: g, categoryNames: Object.keys(g) };
  }, [shortcuts]);

  // Compute cumulative start indices for stagger animation
  const startIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    let running = 0;
    for (const name of categoryNames) {
      indices[name] = running;
      running += groups[name].length;
    }
    return indices;
  }, [categoryNames, groups]);

  // 2×2 grid: 1 col on mobile, 2 cols on sm+
  const colCount = categoryNames.length;
  const gridClass = colCount <= 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';
  const widthClass = colCount <= 1 ? 'sm:max-w-md' : 'sm:max-w-[640px]';

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          widthClass,
          'p-0 gap-0 overflow-hidden',
          'border-border/60',
          'shadow-xl dark:shadow-2xl dark:shadow-black/40',
        )}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/15">
              <Keyboard className="h-4 w-4 text-primary" />
            </div>
            <span>{title}</span>
            {context && (
              <Badge
                variant="secondary"
                className="ml-auto font-normal text-[10px] px-2 py-0.5"
              >
                {context}
              </Badge>
            )}
          </DialogTitle>
          {description && (
            <DialogDescription className="mt-1.5 text-[13px]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Divider */}
        <div className="h-px bg-border/60" />

        {/* Shortcut Grid */}
        <div className="px-4 py-3 max-h-[60vh] overflow-y-auto overscroll-contain">
          <div className={cn('grid gap-3', gridClass)}>
            {categoryNames.map((category, colIdx) => (
              <CategoryCard
                key={category}
                category={category}
                shortcuts={groups[category]}
                startIndex={startIndices[category]}
                columnIndex={colIdx}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="h-px bg-border/60" />
        <div className="flex items-center justify-center gap-2 px-5 py-2.5 bg-muted/30">
          <span className="text-[11px] text-muted-foreground/70">Press</span>
          <KeyboardKey className="h-[22px] min-w-[22px] px-1 text-[10px]">?</KeyboardKey>
          <span className="text-[11px] text-muted-foreground/70">anytime to view shortcuts</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Hook for using shortcuts
// ============================================================================

export function useKeyboardShortcuts(initialShortcuts: ShortcutDefinition[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(initialShortcuts);

  const addShortcut = (shortcut: ShortcutDefinition) => {
    setShortcuts((prev) => [...prev, shortcut]);
  };

  const removeShortcut = (keys: string[]) => {
    setShortcuts((prev) =>
      prev.filter((s) => JSON.stringify(s.keys) !== JSON.stringify(keys))
    );
  };

  return {
    isOpen,
    setIsOpen,
    shortcuts,
    addShortcut,
    removeShortcut,
  };
}

// ============================================================================
// Preset Shortcut Definitions
// ============================================================================

export const TEST_PLAYER_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ['→'], description: 'Go to next question', category: 'Navigation' },
  { keys: ['←'], description: 'Go to previous question', category: 'Navigation' },
  { keys: ['Home'], description: 'Go to first question', category: 'Navigation' },
  { keys: ['End'], description: 'Go to last answered question', category: 'Navigation' },
  { keys: ['Enter'], description: 'Submit current answer', category: 'Actions' },
  { keys: ['S'], description: 'Skip current question', category: 'Actions' },
  { keys: ['1', '5'], description: 'Quick Likert selection', category: 'Actions' },
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

export const FLAGGED_ITEMS_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ['↑', '↓'], description: 'Navigate between items', category: 'Navigation' },
  { keys: ['Enter'], description: 'Open item details', category: 'Navigation' },
  { keys: ['Space'], description: 'Toggle item selection', category: 'Selection' },
  { keys: ['Ctrl', 'A'], description: 'Select all items', category: 'Selection' },
  { keys: ['Escape'], description: 'Exit selection mode', category: 'Selection' },
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

export const GLOBAL_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ['Shift', 'D'], description: 'Toggle theme (light/dark)', category: 'Preferences' },
  { keys: ['Shift', 'L'], description: 'Toggle language (EN/RU)', category: 'Preferences' },
  { keys: ['Alt', '1'], description: 'Switch to User lens', category: 'Lens' },
  { keys: ['Alt', '2'], description: 'Switch to Editor lens', category: 'Lens' },
  { keys: ['Alt', '3'], description: 'Switch to Admin lens', category: 'Lens' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['Ctrl', 'K'], description: 'Open command palette', category: 'Navigation' },
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

export const INSIGHTS_PANEL_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ['Alt', 'I'], description: 'Toggle insights panel', category: 'Panel' },
  { keys: ['←', '→'], description: 'Navigate between tabs', category: 'Navigation' },
  { keys: ['Home'], description: 'Go to first tab', category: 'Navigation' },
  { keys: ['End'], description: 'Go to last tab', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close panel', category: 'Panel' },
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

export default KeyboardShortcutsModal;
