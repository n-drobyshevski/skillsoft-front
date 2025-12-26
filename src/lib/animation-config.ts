/**
 * Animation Configuration
 *
 * Centralized animation timing, easing, and spring physics configuration
 * for consistent motion design across the SkillSoft application.
 *
 * Based on Material Design motion guidelines and Apple HIG.
 */

/**
 * Duration values in milliseconds
 * Used for CSS transitions and Framer Motion animations
 */
export const timing = {
  /** Instant feedback (50ms) - micro-interactions */
  instant: 50,
  /** Fast transitions (100ms) - hover states, small reveals */
  fast: 100,
  /** Normal transitions (200ms) - standard UI changes */
  normal: 200,
  /** Slow transitions (300ms) - major UI changes, navigation */
  slow: 300,
  /** Extra slow (400ms) - modals, sheets, overlays */
  extraSlow: 400,
} as const;

/**
 * CSS timing in seconds (for Framer Motion duration prop)
 */
export const duration = {
  instant: timing.instant / 1000,
  fast: timing.fast / 1000,
  normal: timing.normal / 1000,
  slow: timing.slow / 1000,
  extraSlow: timing.extraSlow / 1000,
} as const;

/**
 * Cubic bezier easing curves
 * Array format: [x1, y1, x2, y2]
 */
export const easing = {
  /**
   * Standard easing - general purpose
   * Follows Material Design standard curve
   */
  standard: [0.4, 0, 0.2, 1] as const,

  /**
   * Emphasized easing - for important transitions
   * More dramatic curve for attention-grabbing motion
   */
  emphasized: [0.4, 0, 0, 1] as const,

  /**
   * Decelerate - entering elements
   * Starts fast, ends slowly
   */
  decelerate: [0, 0, 0.2, 1] as const,

  /**
   * Accelerate - exiting elements
   * Starts slow, ends fast
   */
  accelerate: [0.4, 0, 1, 1] as const,

  /**
   * Spring-like easing - bouncy feel
   * Overshoots slightly for playful motion
   */
  spring: [0.34, 1.56, 0.64, 1] as const,

  /**
   * Gentle spring - subtle bounce
   * Less overshoot than spring
   */
  gentleSpring: [0.25, 1.1, 0.5, 1] as const,

  /**
   * Linear - constant speed
   * Use sparingly, mainly for loading indicators
   */
  linear: [0, 0, 1, 1] as const,
} as const;

/**
 * CSS easing string format
 * For use in CSS transition properties
 */
export const easingCSS = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.4, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  gentleSpring: 'cubic-bezier(0.25, 1.1, 0.5, 1)',
  linear: 'linear',
} as const;

/**
 * Spring physics configuration for Framer Motion
 * Higher stiffness = snappier, higher damping = less bounce
 */
export const springConfig = {
  /**
   * Stiff spring - snappy, minimal bounce
   * Use for UI elements that need immediate response
   */
  stiff: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  /**
   * Default spring - balanced feel
   * Good for most animations
   */
  default: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 1,
  },

  /**
   * Gentle spring - soft, relaxed motion
   * Use for subtle reveals, ambient motion
   */
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 1,
  },

  /**
   * Bouncy spring - playful, visible bounce
   * Use sparingly for delightful micro-interactions
   */
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
    mass: 1,
  },

  /**
   * Slow spring - deliberate, smooth motion
   * Use for large elements, page transitions
   */
  slow: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 25,
    mass: 1,
  },

  /**
   * Snap spring - very stiff, almost instant
   * Use for snap points, quick position changes
   */
  snap: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },
} as const;

/**
 * Tween configuration for Framer Motion
 * Alternative to springs for more predictable timing
 */
export const tweenConfig = {
  /** Fast tween with standard easing */
  fast: {
    type: 'tween' as const,
    duration: duration.fast,
    ease: easing.standard,
  },

  /** Normal tween with standard easing */
  normal: {
    type: 'tween' as const,
    duration: duration.normal,
    ease: easing.standard,
  },

  /** Slow tween with emphasized easing */
  slow: {
    type: 'tween' as const,
    duration: duration.slow,
    ease: easing.emphasized,
  },

  /** Enter animation with decelerate easing */
  enter: {
    type: 'tween' as const,
    duration: duration.normal,
    ease: easing.decelerate,
  },

  /** Exit animation with accelerate easing */
  exit: {
    type: 'tween' as const,
    duration: duration.fast,
    ease: easing.accelerate,
  },
} as const;

/**
 * Pre-defined animation variants for common UI patterns
 */
export const variants = {
  /**
   * Fade in/out animation
   */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /**
   * Scale up animation (for modals, popovers)
   */
  scaleUp: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  /**
   * Slide up from bottom (for bottom sheets, toasts)
   */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  /**
   * Slide down (for dropdowns, menus)
   */
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },

  /**
   * Slide from right (for side panels)
   */
  slideFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  /**
   * Collapse/expand animation
   */
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
  },
} as const;

/**
 * Navigation-specific animation configuration
 */
export const navAnimation = {
  /** Bottom nav hide/show transition */
  bottomNav: {
    duration: duration.slow,
    ease: easing.standard,
  },

  /** Header collapse transition */
  header: {
    duration: duration.normal,
    ease: easing.emphasized,
  },

  /** Active indicator pill animation */
  indicator: {
    ...springConfig.stiff,
  },
} as const;

/**
 * Helper to create CSS transition string
 */
export function createTransition(
  properties: string | string[],
  durationKey: keyof typeof timing = 'normal',
  easingKey: keyof typeof easingCSS = 'standard'
): string {
  const props = Array.isArray(properties) ? properties : [properties];
  const dur = timing[durationKey];
  const ease = easingCSS[easingKey];

  return props.map((prop) => `${prop} ${dur}ms ${ease}`).join(', ');
}

/**
 * Common transition presets as CSS strings
 */
export const transitions = {
  /** Transform transition for position changes */
  transform: createTransition('transform', 'slow', 'standard'),

  /** Opacity transition for visibility changes */
  opacity: createTransition('opacity', 'fast', 'standard'),

  /** Background color transition for hover states */
  background: createTransition('background-color', 'fast', 'standard'),

  /** All common properties for comprehensive transitions */
  all: createTransition(
    ['transform', 'opacity', 'background-color', 'color'],
    'normal',
    'standard'
  ),

  /** Navigation-specific transform transition */
  nav: createTransition('transform', 'slow', 'standard'),
} as const;

export type TimingKey = keyof typeof timing;
export type EasingKey = keyof typeof easing;
export type SpringConfigKey = keyof typeof springConfig;
