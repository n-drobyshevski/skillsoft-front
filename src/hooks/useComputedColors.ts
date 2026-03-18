'use client';

import { useState, useEffect } from 'react';

/**
 * Resolves CSS custom properties to computed RGB values for SVG compatibility.
 * SVG elements don't properly resolve oklch() CSS variables in some browsers.
 *
 * @param colorConfig - Map of { colorName: [cssVariable, fallbackHex] }
 * @returns Record with the same keys, resolved to computed color strings
 *
 * @example
 * const colors = useComputedColors({
 *   primary: ['--primary', '#3b82f6'],
 *   border: ['--border', '#e5e7eb'],
 * });
 * // colors.primary → "rgb(59, 130, 246)" (or fallback)
 */
export function useComputedColors<T extends Record<string, [cssVar: string, fallback: string]>>(
  colorConfig: T
): Record<keyof T, string> {
  type ColorResult = Record<keyof T, string>;

  const [colors, setColors] = useState<ColorResult>(() => {
    const initial = {} as Record<string, string>;
    for (const [key, [, fallback]] of Object.entries(colorConfig)) {
      initial[key] = fallback;
    }
    return initial as ColorResult;
  });

  useEffect(() => {
    const computeColors = () => {
      if (typeof window === 'undefined') return;

      const tempEl = document.createElement('div');
      tempEl.style.display = 'none';
      document.body.appendChild(tempEl);

      const resolved = {} as Record<string, string>;
      for (const [key, [cssVar, fallback]] of Object.entries(colorConfig)) {
        tempEl.style.color = `var(${cssVar})`;
        const computed = getComputedStyle(tempEl).color;
        resolved[key] = computed && computed !== 'inherit' && computed !== ''
          ? computed
          : fallback;
      }

      document.body.removeChild(tempEl);
      setColors(resolved as ColorResult);
    };

    computeColors();

    // Re-compute on theme change
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
          computeColors();
          break;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => computeColors();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- colorConfig is a static object literal per call site
  }, []);

  return colors;
}
