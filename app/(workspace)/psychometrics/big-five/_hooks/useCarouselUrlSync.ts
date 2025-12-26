'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BigFiveTrait } from '@/types/psychometrics';

/**
 * Trait abbreviations for URL-friendly parameters
 */
const TRAIT_TO_PARAM: Record<BigFiveTrait, string> = {
  [BigFiveTrait.OPENNESS]: 'o',
  [BigFiveTrait.CONSCIENTIOUSNESS]: 'c',
  [BigFiveTrait.EXTRAVERSION]: 'e',
  [BigFiveTrait.AGREEABLENESS]: 'a',
  [BigFiveTrait.EMOTIONAL_STABILITY]: 'es',
};

const PARAM_TO_TRAIT: Record<string, BigFiveTrait> = {
  'o': BigFiveTrait.OPENNESS,
  'c': BigFiveTrait.CONSCIENTIOUSNESS,
  'e': BigFiveTrait.EXTRAVERSION,
  'a': BigFiveTrait.AGREEABLENESS,
  'es': BigFiveTrait.EMOTIONAL_STABILITY,
};

/**
 * Trait order for index mapping
 */
const TRAIT_ORDER: BigFiveTrait[] = [
  BigFiveTrait.OPENNESS,
  BigFiveTrait.CONSCIENTIOUSNESS,
  BigFiveTrait.EXTRAVERSION,
  BigFiveTrait.AGREEABLENESS,
  BigFiveTrait.EMOTIONAL_STABILITY,
];

interface UseCarouselUrlSyncProps {
  /** Current carousel index (0-4) */
  currentIndex: number;
  /** Callback when URL param changes */
  onIndexChange: (index: number) => void;
  /** Whether to enable URL sync */
  enabled?: boolean;
}

interface UseCarouselUrlSyncReturn {
  /** Current trait from URL (if any) */
  urlTrait: BigFiveTrait | null;
  /** Update URL to reflect current carousel position */
  syncToUrl: (index: number) => void;
  /** Get shareable URL for a specific trait */
  getTraitUrl: (trait: BigFiveTrait) => string;
}

/**
 * Hook to sync carousel position with URL search params.
 *
 * Enables:
 * - Deep linking to specific traits (e.g., ?trait=c for Conscientiousness)
 * - Shareable URLs for referencing specific traits
 * - Browser back/forward navigation support
 *
 * Usage:
 * ```tsx
 * const { syncToUrl, getTraitUrl } = useCarouselUrlSync({
 *   currentIndex: activeIndex,
 *   onIndexChange: setActiveIndex,
 * });
 *
 * // When carousel changes
 * const handleScroll = (newIndex: number) => {
 *   setActiveIndex(newIndex);
 *   syncToUrl(newIndex);
 * };
 *
 * // Generate share link
 * const shareUrl = getTraitUrl(BigFiveTrait.CONSCIENTIOUSNESS);
 * ```
 */
export function useCarouselUrlSync({
  currentIndex,
  onIndexChange,
  enabled = true,
}: UseCarouselUrlSyncProps): UseCarouselUrlSyncReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Refs to prevent circular updates and stale closures
  const isSyncingFromUrlRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const currentIndexRef = useRef(currentIndex);
  const pathnameRef = useRef(pathname);

  // Keep refs in sync
  currentIndexRef.current = currentIndex;
  pathnameRef.current = pathname;

  // Parse trait from URL
  const traitParam = searchParams.get('trait');
  const urlTrait = enabled && traitParam
    ? PARAM_TO_TRAIT[traitParam.toLowerCase()] ?? null
    : null;

  // Sync URL param to carousel index ONLY on initial mount
  useEffect(() => {
    if (!enabled || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (!urlTrait) return;

    const urlIndex = TRAIT_ORDER.indexOf(urlTrait);
    if (urlIndex !== -1 && urlIndex !== currentIndexRef.current) {
      isSyncingFromUrlRef.current = true;
      onIndexChange(urlIndex);
      // Reset flag after a tick to allow the state to settle
      requestAnimationFrame(() => {
        isSyncingFromUrlRef.current = false;
      });
    }
  }, [enabled, urlTrait, onIndexChange]);

  // Update URL when carousel changes (stable callback using refs)
  const syncToUrl = useCallback((index: number) => {
    if (!enabled) return;
    // Don't sync back to URL if we're currently syncing FROM URL
    if (isSyncingFromUrlRef.current) return;

    const trait = TRAIT_ORDER[index];
    if (!trait) return;

    const param = TRAIT_TO_PARAM[trait];

    // Check current URL without triggering re-renders
    const currentUrl = new URL(window.location.href);
    const currentParam = currentUrl.searchParams.get('trait');

    // Only update if different from current
    if (currentParam === param) return;

    currentUrl.searchParams.set('trait', param);

    // Use shallow routing to avoid full page reload
    router.replace(`${pathnameRef.current}?${currentUrl.searchParams.toString()}`, { scroll: false });
  }, [enabled, router]);

  // Generate shareable URL for a trait (stable callback)
  const getTraitUrl = useCallback((trait: BigFiveTrait): string => {
    const param = TRAIT_TO_PARAM[trait];
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${pathnameRef.current}?trait=${param}`;
  }, []);

  return {
    urlTrait,
    syncToUrl,
    getTraitUrl,
  };
}

/**
 * Get trait index from URL param (static helper)
 */
export function getTraitIndexFromParam(param: string | null): number | null {
  if (!param) return null;
  const trait = PARAM_TO_TRAIT[param.toLowerCase()];
  if (!trait) return null;
  return TRAIT_ORDER.indexOf(trait);
}

/**
 * Get URL param from trait index (static helper)
 */
export function getParamFromTraitIndex(index: number): string | null {
  const trait = TRAIT_ORDER[index];
  if (!trait) return null;
  return TRAIT_TO_PARAM[trait];
}
