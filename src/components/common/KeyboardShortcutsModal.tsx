'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command } from 'lucide-react';
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
// Keyboard Key Component
// ============================================================================

function KeyboardKey({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[28px] h-7 px-2',
        'bg-muted border border-border rounded-md shadow-sm',
        'font-mono text-xs font-medium text-foreground',
        className
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * Render a key combination with proper formatting
 */
function KeyCombination({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-muted-foreground text-xs">+</span>}
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
    Shift: 'Shift',
    Meta: '⌘',
    Command: '⌘',
  };

  return keyMap[key] ?? key;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * KeyboardShortcutsModal - Displays available keyboard shortcuts
 *
 * Features:
 * - Triggered by pressing `?` key (optional)
 * - Groups shortcuts by category
 * - Proper key formatting with visual kbd elements
 * - Accessible dialog
 *
 * @example
 * ```tsx
 * // In a page or component
 * <KeyboardShortcutsModal
 *   shortcuts={[
 *     { keys: ['→'], description: 'Next question', category: 'Navigation' },
 *     { keys: ['←'], description: 'Previous question', category: 'Navigation' },
 *     { keys: ['Enter'], description: 'Submit answer', category: 'Actions' },
 *     { keys: ['S'], description: 'Skip question', category: 'Actions' },
 *   ]}
 *   context="Test Player"
 *   enableKeyboardTrigger
 * />
 * ```
 */
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

  // Use controlled or uncontrolled state
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Handle `?` key to open the modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Open on `?` key (Shift + /)
    if (event.key === '?' || (event.shiftKey && event.key === '/')) {
      event.preventDefault();
      setOpen(true);
    }

    // Close on Escape (dialog handles this too, but for safety)
    if (event.key === 'Escape' && isOpen) {
      setOpen(false);
    }
  }, [isOpen, setOpen]);

  // Register keyboard listener
  useEffect(() => {
    if (!enableKeyboardTrigger) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardTrigger, handleKeyDown]);

  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, ShortcutDefinition[]> = {};

    shortcuts.forEach((shortcut) => {
      const category = shortcut.category ?? 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
    });

    return groups;
  }, [shortcuts]);

  const categoryNames = Object.keys(groupedShortcuts);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {title}
            {context && (
              <Badge variant="secondary" className="ml-2 font-normal">
                {context}
              </Badge>
            )}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {categoryNames.map((category) => (
            <div key={category}>
              {categoryNames.length > 1 && (
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </h4>
              )}
              <div className="space-y-2">
                {groupedShortcuts[category].map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 py-1.5"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <KeyCombination keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <span>Press</span>
          <KeyboardKey>?</KeyboardKey>
          <span>anytime to see shortcuts</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Hook for using shortcuts
// ============================================================================

/**
 * Hook to manage keyboard shortcuts modal state
 *
 * @example
 * ```tsx
 * const { isOpen, setIsOpen, shortcuts } = useKeyboardShortcuts([
 *   { keys: ['→'], description: 'Next', category: 'Navigation' },
 * ]);
 *
 * return <KeyboardShortcutsModal open={isOpen} onOpenChange={setIsOpen} shortcuts={shortcuts} />;
 * ```
 */
export function useKeyboardShortcuts(initialShortcuts: ShortcutDefinition[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(initialShortcuts);

  const addShortcut = useCallback((shortcut: ShortcutDefinition) => {
    setShortcuts((prev) => [...prev, shortcut]);
  }, []);

  const removeShortcut = useCallback((keys: string[]) => {
    setShortcuts((prev) =>
      prev.filter((s) => JSON.stringify(s.keys) !== JSON.stringify(keys))
    );
  }, []);

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

/**
 * Common shortcuts for the test player
 */
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

/**
 * Common shortcuts for the flagged items page
 */
export const FLAGGED_ITEMS_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ['↑', '↓'], description: 'Navigate between items', category: 'Navigation' },
  { keys: ['Enter'], description: 'Open item details', category: 'Navigation' },
  { keys: ['Space'], description: 'Toggle item selection', category: 'Selection' },
  { keys: ['Ctrl', 'A'], description: 'Select all items', category: 'Selection' },
  { keys: ['Escape'], description: 'Exit selection mode', category: 'Selection' },
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

/**
 * Common shortcuts for the test-drive insights panel
 */
export const INSIGHTS_PANEL_SHORTCUTS: ShortcutDefinition[] = [
  { keys: ['Alt', 'I'], description: 'Toggle insights panel', category: 'Panel' },
  { keys: ['←', '→'], description: 'Navigate between tabs', category: 'Navigation' },
  { keys: ['Home'], description: 'Go to first tab', category: 'Navigation' },
  { keys: ['End'], description: 'Go to last tab', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close panel', category: 'Panel' },
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

export default KeyboardShortcutsModal;
