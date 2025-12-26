/**
 * Competency Detail Page Components
 *
 * Barrel export for all components specific to the [competencyId] detail page.
 */

// Hero section components
export { HeroAlphaGauge, InlineAlphaDisplay, MiniAlphaGauge } from './HeroAlphaGauge';
export { CompetencyHeroMobile } from './CompetencyHeroMobile';

// Interpretation components
export { AlphaInterpretationScale, AlphaInterpretationBadge } from './AlphaInterpretationScale';

// Threshold components
export { ThresholdSummaryBadge, ThresholdIndicators } from './ThresholdSummaryBadge';

// Data quality guidance
export { InsufficientDataGuidance, DataQualityBadge } from './InsufficientDataGuidance';

// Accordion wrapper for mobile-first progressive disclosure
export { CompetencyDetailAccordion } from './CompetencyDetailAccordion';

// Re-export utilities
export * from '../_lib/competency-detail.utils';
