// Common components barrel export
export { default as BehavioralIndicatorsPage } from './BehavioralIndicatorsPage';
export { ClientOnly } from './ClientOnly';
export { EntityDetailHeader } from './EntityDetailHeader';
export { EntityDetailLayout } from './EntityDetailLayout';
export { default as Header } from './Header';
export { default as PageHeader } from './PageHeader';
export { SkillMapper, default as SkillMapperDefault } from './skill-mapper';

// Accessibility components
export {
  ScreenReaderProvider,
  ScreenReaderOnly,
  QuestionProgressAnnouncer,
  SelectionAnnouncer,
  useScreenReader,
  useNavigationAnnounce,
  useErrorAnnounce,
  useLoadingAnnounce,
} from './ScreenReaderAnnounce';
export type { AnnouncePoliteNess } from './ScreenReaderAnnounce';

// Keyboard shortcuts
export {
  KeyboardShortcutsModal,
  useKeyboardShortcuts,
  TEST_PLAYER_SHORTCUTS,
  FLAGGED_ITEMS_SHORTCUTS,
  INSIGHTS_PANEL_SHORTCUTS,
} from './KeyboardShortcutsModal';
export type { ShortcutDefinition, KeyboardShortcutsModalProps } from './KeyboardShortcutsModal';

// Undo functionality
export { UndoToast, useUndoToast } from './UndoToast';
export type { UndoToastProps, UseUndoToastConfig, UseUndoToastReturn } from './UndoToast';

// Entity utilities
export * from './entity-utils';

// Error Boundaries
export { ChartErrorBoundary, SectionErrorBoundary } from './ChartErrorBoundary';

// Network status
export { OfflineIndicator, CompactNetworkStatus } from './OfflineIndicator';
