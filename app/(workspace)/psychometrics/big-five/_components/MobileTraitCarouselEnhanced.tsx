'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BigFiveReliability } from '@/types/psychometrics';
import { MobileTraitCardSimple } from './MobileTraitCardSimple';
import { TraitDetailDrawer } from './TraitDetailDrawer';
import { useCarouselIndex, useSetCarouselIndex, useDrawerState } from '@/store/big-five-page-store';
import { useCarouselUrlSync } from '../_hooks';
import { useTranslations } from 'next-intl';
import { getTraitKey } from './BigFiveTraitCard';

interface MobileTraitCarouselEnhancedProps {
  reliabilityData: BigFiveReliability[];
  className?: string;
}

/**
 * Enhanced mobile carousel with simplified cards and bottom sheet details.
 * Features:
 * - Simplified cards (reduced cognitive load)
 * - Tap to open detail drawer
 * - Scroll snap navigation
 * - Screen reader announcements
 * - 44px touch targets for accessibility
 * - URL sync for deep linking
 * - Zustand state persistence
 */
export function MobileTraitCarouselEnhanced({
  reliabilityData,
  className
}: MobileTraitCarouselEnhancedProps) {
  const t = useTranslations('psychometrics.bigFivePage');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Use Zustand selector hooks for granular subscriptions
  const carouselIndex = useCarouselIndex();
  const setCarouselIndex = useSetCarouselIndex();
  const {
    selectedTrait: selectedTraitFromStore,
    isOpen: isDrawerOpen,
    open: openDrawer,
    close: closeDrawer,
  } = useDrawerState();

  // Local active index state (synced with store)
  const [activeIndex, setActiveIndex] = useState(carouselIndex);

  // Refs for stable callbacks (prevent infinite loops)
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  // Scroll to specific index (immediate, for URL sync)
  const scrollToIndexImmediate = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 264;
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'auto',
    });
  }, []);

  // URL sync hook
  const { syncToUrl } = useCarouselUrlSync({
    currentIndex: activeIndex,
    onIndexChange: (index) => {
      setActiveIndex(index);
      setCarouselIndex(index);
      scrollToIndexImmediate(index);
    },
    enabled: true,
  });

  // Ref for syncToUrl to avoid stale closures
  const syncToUrlRef = useRef(syncToUrl);
  syncToUrlRef.current = syncToUrl;

  // Drawer state - map trait to reliability data
  const selectedTrait = selectedTraitFromStore
    ? reliabilityData.find(r => r.trait === selectedTraitFromStore) ?? null
    : null;

  // Scroll to specific index (with animation)
  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 264;
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });

    // Sync to store and URL
    setActiveIndex(index);
    setCarouselIndex(index);
    syncToUrlRef.current(index);
  }, [setCarouselIndex]);

  // Update scroll state on scroll (stable callback using refs)
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const cardWidth = 264; // 256px card + 8px gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    const clampedIndex = Math.min(Math.max(0, newIndex), reliabilityData.length - 1);

    if (clampedIndex !== activeIndexRef.current) {
      activeIndexRef.current = clampedIndex;
      setActiveIndex(clampedIndex);
      setCarouselIndex(clampedIndex);
      syncToUrlRef.current(clampedIndex);
    }

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, [reliabilityData.length, setCarouselIndex]);

  // Navigation handlers
  const scrollPrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const scrollNext = () => scrollToIndex(Math.min(reliabilityData.length - 1, activeIndex + 1));

  // Handle card tap - open drawer via store
  const handleCardTap = (reliability: BigFiveReliability) => {
    openDrawer(reliability.trait);
  };

  // Handle drawer close
  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      closeDrawer();
    }
  };

  // Initialize scroll listeners
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial state

    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Sync with store's carousel index on mount
  useEffect(() => {
    if (carouselIndex !== activeIndexRef.current) {
      setActiveIndex(carouselIndex);
      activeIndexRef.current = carouselIndex;
      scrollToIndexImmediate(carouselIndex);
    }
  }, [carouselIndex, scrollToIndexImmediate]);

  return (
    <div className={cn('relative', className)}>
      {/* Screen reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {reliabilityData[activeIndex] && (
          t('carousel.showing', {
            trait: t(`traits.${getTraitKey(reliabilityData[activeIndex].trait)}.label`),
            index: activeIndex + 1,
            total: reliabilityData.length
          })
        )}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('carousel.traitDetails')}
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {activeIndex + 1} / {reliabilityData.length}
        </span>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="region"
        aria-label={t('carousel.cardsLabel')}
      >
        {reliabilityData.map((reliability, index) => (
          <div
            key={reliability.id}
            className="snap-start shrink-0 w-[256px]"
            role="group"
            aria-roledescription="slide"
            aria-label={t('carousel.slideLabel', { index: index + 1, total: reliabilityData.length })}
          >
            <MobileTraitCardSimple
              reliability={reliability}
              onClick={() => handleCardTap(reliability)}
              isActive={index === activeIndex}
            />
          </div>
        ))}
        {/* Spacer for scroll padding */}
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={scrollPrev}
          disabled={!canScrollLeft}
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full',
            'bg-muted hover:bg-accent transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'touch-manipulation'
          )}
          aria-label={t('carousel.previousTrait')}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Pagination Dots - 44px touch targets */}
        <div className="flex items-center gap-1" role="tablist" aria-label={t('carousel.paginationLabel')}>
          {reliabilityData.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={t('carousel.showing', { trait: t(`traits.${getTraitKey(item.trait)}.label`), index: index + 1, total: reliabilityData.length })}
              className={cn(
                'flex items-center justify-center w-11 h-11',
                'touch-manipulation transition-transform',
                'hover:scale-105 active:scale-95'
              )}
            >
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all duration-200',
                  index === activeIndex
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/30'
                )}
              />
            </button>
          ))}
        </div>

        <button
          onClick={scrollNext}
          disabled={!canScrollRight}
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full',
            'bg-muted hover:bg-accent transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'touch-manipulation'
          )}
          aria-label={t('carousel.nextTrait')}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Trait Detail Drawer */}
      <TraitDetailDrawer
        reliability={selectedTrait}
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />
    </div>
  );
}
