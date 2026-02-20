/**
 * ChartsBundle -- Re-exports the three primary result-view chart components
 * from a single module entry point.
 *
 * By co-locating these exports in one file, Next.js / webpack will produce a
 * single chunk for all three charts when dynamically imported via
 * `LazyChartsBundle.tsx`. This replaces three separate `next/dynamic` calls
 * that each created their own network request (and their own copy of recharts).
 *
 * @see LazyChartsBundle.tsx -- the lazy wrapper consumed by result views.
 */

export { BigFiveRadarSimple } from '@/components/charts/BigFiveRadar';
export { default as CompetencyRadarChart } from '@/components/data-display/charts/CompetencyRadarChart';
export { IndicatorHeatmap } from '@/components/results/IndicatorHeatmap';
