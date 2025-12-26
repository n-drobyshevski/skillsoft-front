'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BigFiveReliability } from '@/types/psychometrics';
import { BigFiveTraitCard } from './BigFiveTraitCard';

interface MobileTraitCarouselProps {
  reliabilityData: BigFiveReliability[];
  className?: string;
}

/**
 * Mobile-optimized horizontal carousel for Big Five trait cards.
 * Features:
 * - Scroll indicators (dots)
 * - Snap scrolling
 * - Touch-friendly navigation buttons
 * - Accessibility improvements
 */
export function MobileTraitCarousel({ reliabilityData, className }: MobileTraitCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll state on scroll
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const cardWidth = 288; // 280px card + 8px gap
    const newIndex = Math.round(scrollLeft / cardWidth);

    setActiveIndex(Math.min(newIndex, reliabilityData.length - 1));
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 288;
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  // Navigation handlers
  const scrollPrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const scrollNext = () => scrollToIndex(Math.min(reliabilityData.length - 1, activeIndex + 1));

  // Initialize scroll listeners
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial state

    return () => container.removeEventListener('scroll', handleScroll);
  }, [reliabilityData.length]);

  return (
    <div className={cn('relative', className)}>
      {/* Screen reader live region for carousel navigation announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {reliabilityData[activeIndex] && (
          `Showing ${reliabilityData[activeIndex].traitDisplayName}, trait ${activeIndex + 1} of ${reliabilityData.length}`
        )}
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="region"
        aria-label="Big Five trait cards"
      >
        {reliabilityData.map((reliability, index) => (
          <div
            key={reliability.id}
            className="snap-start shrink-0 w-[280px]"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${reliabilityData.length}`}
          >
            <BigFiveTraitCard reliability={reliability} />
          </div>
        ))}
        {/* Spacer for scroll padding */}
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>

      {/* Navigation Buttons (visible on touch devices) */}
      <div className="flex items-center justify-between mt-2 sm:hidden">
        <button
          onClick={scrollPrev}
          disabled={!canScrollLeft}
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full',
            'bg-muted hover:bg-accent transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'touch-manipulation'
          )}
          aria-label="Previous trait"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Pagination Dots - 44px touch targets with 10px visual dots */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Carousel pagination">
          {reliabilityData.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`${item.traitDisplayName}, trait ${index + 1} of ${reliabilityData.length}`}
              className={cn(
                'flex items-center justify-center w-11 h-11', // 44px touch target
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
          aria-label="Next trait"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop: Dot indicators with proper touch targets */}
      <div className="hidden sm:flex justify-center gap-1 mt-3">
        {reliabilityData.map((item, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={cn(
              'flex items-center justify-center w-8 h-8', // Touch-friendly
              'transition-transform hover:scale-110'
            )}
            aria-label={`${item.traitDisplayName}, trait ${index + 1} of ${reliabilityData.length}`}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === activeIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
