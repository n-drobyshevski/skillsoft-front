'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTestDriveStore } from '@/store/test-drive-store';
import { PsychometricsTab, ScoringTab, MappingTab, MetadataTab } from './tabs';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';
import {
  Gauge,
  Calculator,
  GitBranch,
  Tag,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * TestDriveInsights - Enhanced side panel for HR test-drive mode insights
 *
 * Features (NEW):
 * - Icon-only mode for very small screens (< 480px)
 * - Swipe gestures for mobile tab navigation
 * - Smooth animated transitions between tabs
 * - Keyboard navigation (arrow keys, Home, End)
 * - Enhanced visual states with amber theme
 * - ARIA live regions for screen reader announcements
 * - Improved accessibility with focus management
 *
 * Features (EXISTING):
 * - Sheet panel on the right side (480px width)
 * - Four tabs: Psychometrics, Scoring, Mapping, Metadata
 * - Amber theme to distinguish from standard emerald
 * - Keyboard accessible with proper ARIA
 */

const TAB_CONFIG = [
  {
    value: 'psychometrics' as const,
    label: 'Психометрика',
    shortLabel: 'Психо',
    icon: Gauge,
  },
  {
    value: 'scoring' as const,
    label: 'Скоринг',
    shortLabel: 'Баллы',
    icon: Calculator,
  },
  {
    value: 'mapping' as const,
    label: 'Маппинг',
    shortLabel: 'Связи',
    icon: GitBranch,
  },
  {
    value: 'metadata' as const,
    label: 'Метаданные',
    shortLabel: 'Мета',
    icon: Tag,
  },
] as const;

type TabValue = (typeof TAB_CONFIG)[number]['value'];

export function TestDriveInsights() {
  const isTestDriveMode = useTestDriveStore((state) => state.isTestDriveMode);
  const isPanelOpen = useTestDriveStore((state) => state.isPanelOpen);
  const activeTab = useTestDriveStore((state) => state.activeTab);
  const closePanel = useTestDriveStore((state) => state.closePanel);
  const setActiveTab = useTestDriveStore((state) => state.setActiveTab);
  const isMobile = useIsMobile();

  // Screen reader announcements
  const [announcement, setAnnouncement] = useState('');

  // Very small screen detection (< 480px)
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsVerySmallScreen(window.innerWidth < 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Tab navigation helper
  const tabOrder = TAB_CONFIG.map((tab) => tab.value);
  const currentIndex = tabOrder.indexOf(activeTab);

  const goToTab = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < tabOrder.length) {
        setActiveTab(tabOrder[newIndex]);
      }
    },
    [setActiveTab, tabOrder]
  );

  // Swipe gesture support (mobile only)
  const { swipeState, handlers } = useSwipeNavigation({
    enabled: isMobile && isPanelOpen,
    minSwipeDistance: 60,
    onSwipeLeft: () => {
      // Swipe left = next tab
      if (currentIndex < tabOrder.length - 1) {
        goToTab(currentIndex + 1);
      }
    },
    onSwipeRight: () => {
      // Swipe right = previous tab
      if (currentIndex > 0) {
        goToTab(currentIndex - 1);
      }
    },
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard nav when panel is open
      if (!isPanelOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (currentIndex > 0) {
            e.preventDefault();
            goToTab(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < tabOrder.length - 1) {
            e.preventDefault();
            goToTab(currentIndex + 1);
          }
          break;
        case 'Home':
          e.preventDefault();
          goToTab(0);
          break;
        case 'End':
          e.preventDefault();
          goToTab(tabOrder.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, currentIndex, goToTab, tabOrder.length]);

  // Announce tab changes to screen readers
  useEffect(() => {
    const tabLabels: Record<TabValue, string> = {
      psychometrics: 'Психометрика',
      scoring: 'Скоринг',
      mapping: 'Маппинг',
      metadata: 'Метаданные',
    };

    setAnnouncement(`Открыта вкладка: ${tabLabels[activeTab]}`);
  }, [activeTab]);

  // Don't render if not in test-drive mode
  if (!isTestDriveMode) {
    return null;
  }

  // Shared header content
  const headerContent = (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/30',
          isMobile ? 'w-8 h-8' : 'w-10 h-10'
        )}
      >
        <Eye className={cn('text-amber-400', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
      </div>
      <div className="flex-1">
        <div className="text-white flex items-center gap-2 font-semibold">
          Панель анализа
          <Badge
            variant="outline"
            className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px]"
          >
            Test-Drive
          </Badge>
        </div>
        <p className="text-neutral-400 text-sm">
          Детальная информация о текущем вопросе
        </p>
      </div>
    </div>
  );

  // Shared tabs content
  const tabsContent = (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const newIndex = tabOrder.indexOf(value as TabValue);
        goToTab(newIndex);
      }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* ARIA live region for screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Tab List */}
      <TabsList
        className={cn(
          'w-full justify-start bg-neutral-900/50 border-b border-neutral-800 rounded-none shrink-0 h-auto',
          // Mobile: scrollable with snap, allow overflow
          isMobile
            ? 'px-2 py-2 gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory'
            : 'px-4 py-3 gap-1'
        )}
        role="tablist"
        aria-label="Вкладки анализа вопроса"
      >
        {TAB_CONFIG.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.value}`}
              id={`tab-${tab.value}`}
              aria-label={`${tab.label}, вкладка ${index + 1} из ${TAB_CONFIG.length}`}
              className={cn(
                'relative flex items-center gap-1.5 rounded-lg font-medium shrink-0 transition-all duration-300',
                // Size adjustments based on screen size
                isVerySmallScreen
                  ? 'px-3 py-2.5 min-w-[56px] snap-center' // Icon only
                  : isMobile
                    ? 'px-2.5 py-2 min-w-[72px] snap-center' // Icon + short label
                    : 'px-3 py-2', // Icon + full label

                // Active state - prominent amber theme
                isActive && [
                  'bg-amber-500/25 text-amber-200 shadow-lg shadow-amber-500/20 scale-105',
                  // Underline indicator
                  'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                  'after:bg-amber-400 after:shadow-[0_0_8px_rgba(251,191,36,0.6)]',
                  'motion-safe:after:animate-tab-underline-slide',
                ],

                // Inactive state
                !isActive && [
                  'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50',
                  'active:bg-neutral-800/70', // Touch feedback
                ],

                // Touch target (WCAG AAA)
                'touch-target-min'
              )}
            >
              <Icon
                className={cn('shrink-0', isVerySmallScreen ? 'h-5 w-5' : isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5')}
                aria-hidden="true"
              />

              {/* Label visibility based on screen size */}
              {isVerySmallScreen ? (
                // Icon only - label hidden for screen readers
                <span className="sr-only">{tab.label}</span>
              ) : (
                // Show short or full label
                <span className={cn('whitespace-nowrap', isMobile ? 'text-[11px]' : 'text-xs')}>
                  {isMobile ? tab.shortLabel : tab.label}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab Content with Swipe Support */}
      <div
        {...handlers}
        className={cn(
          'flex-1 overflow-y-auto relative',
          isMobile && 'swipe-container' // Enable swipe gestures
        )}
      >
        {/* Swipe visual feedback */}
        {swipeState.isSwiping && (
          <div
            className="absolute inset-y-0 pointer-events-none z-10 flex items-center transition-opacity duration-150"
            style={{
              left: swipeState.direction === 1 ? '1rem' : undefined,
              right: swipeState.direction === -1 ? '1rem' : undefined,
              opacity: Math.min(Math.abs(swipeState.offsetX) / 100, 0.6),
            }}
          >
            <div className="bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-500/30">
              {swipeState.direction === 1 ? (
                <ChevronLeft className="w-6 h-6 text-amber-400" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-6 h-6 text-amber-400" aria-hidden="true" />
              )}
            </div>
          </div>
        )}

        {/* Tab content - render all tabs, let Radix handle visibility */}
        <TabsContent
          value="psychometrics"
          role="tabpanel"
          id="tabpanel-psychometrics"
          aria-labelledby="tab-psychometrics"
          tabIndex={0}
          className={cn(
            'm-0 focus-visible:outline-none focus-visible:ring-0',
            isMobile ? 'p-3' : 'p-4',
            // Animation classes
            'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-2',
            'data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:hidden'
          )}
        >
          <PsychometricsTab />
        </TabsContent>

        <TabsContent
          value="scoring"
          role="tabpanel"
          id="tabpanel-scoring"
          aria-labelledby="tab-scoring"
          tabIndex={0}
          className={cn(
            'm-0 focus-visible:outline-none focus-visible:ring-0',
            isMobile ? 'p-3' : 'p-4',
            'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-2',
            'data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:hidden'
          )}
        >
          <ScoringTab />
        </TabsContent>

        <TabsContent
          value="mapping"
          role="tabpanel"
          id="tabpanel-mapping"
          aria-labelledby="tab-mapping"
          tabIndex={0}
          className={cn(
            'm-0 focus-visible:outline-none focus-visible:ring-0',
            isMobile ? 'p-3' : 'p-4',
            'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-2',
            'data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:hidden'
          )}
        >
          <MappingTab />
        </TabsContent>

        <TabsContent
          value="metadata"
          role="tabpanel"
          id="tabpanel-metadata"
          aria-labelledby="tab-metadata"
          tabIndex={0}
          className={cn(
            'm-0 focus-visible:outline-none focus-visible:ring-0',
            isMobile ? 'p-3' : 'p-4',
            'data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-2',
            'data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:hidden'
          )}
        >
          <MetadataTab />
        </TabsContent>
      </div>
    </Tabs>
  );

  // Shared footer content
  const footerContent = (
    <div
      className={cn(
        'border-t border-neutral-800 bg-neutral-900/50 shrink-0',
        isMobile ? 'px-3 py-2 pb-safe' : 'px-4 py-3'
      )}
    >
      <p className="text-xs text-neutral-500 text-center">
        {isMobile ? (
          'Свайпните вниз для закрытия / Свайп влево-вправо между вкладками'
        ) : (
          <>
            Нажмите{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
              Alt
            </kbd>{' '}
            +{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
              I
            </kbd>{' '}
            для переключения / Стрелки для навигации между вкладками
          </>
        )}
      </p>
    </div>
  );

  // Mobile: use Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={isPanelOpen} onOpenChange={(open) => !open && closePanel()}>
        <DrawerContent
          id="test-drive-insights-panel"
          className={cn(
            'max-h-[85vh] bg-neutral-900/95 border-t border-amber-500/30',
            'backdrop-blur-xl',
            'flex flex-col'
          )}
        >
          {/* Accessibility title (required for screen readers) */}
          <DrawerTitle className="sr-only">Панель анализа Test-Drive</DrawerTitle>
          <DrawerDescription className="sr-only">
            Детальная информация о текущем вопросе: психометрика, скоринг, маппинг и метаданные
          </DrawerDescription>

          {/* Header */}
          <DrawerHeader className="px-3 py-3 border-b border-amber-500/20 bg-amber-500/5 shrink-0">
            {headerContent}
          </DrawerHeader>

          {/* Tabs */}
          {tabsContent}

          {/* Footer */}
          {footerContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Sheet (right side)
  return (
    <Sheet open={isPanelOpen} onOpenChange={(open) => !open && closePanel()}>
      <SheetContent
        id="test-drive-insights-panel"
        side="right"
        className={cn(
          'w-full sm:w-[480px] sm:max-w-[480px]',
          'bg-neutral-900/95 border-l border-amber-500/30',
          'backdrop-blur-xl',
          'p-0 flex flex-col'
        )}
      >
        {/* Accessibility title (required for screen readers) */}
        <SheetTitle className="sr-only">Панель анализа Test-Drive</SheetTitle>
        <SheetDescription className="sr-only">
          Детальная информация о текущем вопросе: психометрика, скоринг, маппинг и метаданные
        </SheetDescription>

        {/* Header */}
        <SheetHeader className="px-4 py-4 border-b border-amber-500/20 bg-amber-500/5 shrink-0">
          {headerContent}
        </SheetHeader>

        {/* Tabs */}
        {tabsContent}

        {/* Footer */}
        {footerContent}
      </SheetContent>
    </Sheet>
  );
}
