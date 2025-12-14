/**
 * Viewport constants for mobile responsiveness testing.
 * These represent common device viewport sizes for visual regression tests.
 */

export const VIEWPORTS = {
  // Mobile devices
  iPhoneSE: { width: 320, height: 568, name: 'iPhone SE' },
  iPhone8: { width: 375, height: 667, name: 'iPhone 8' },
  iPhone12: { width: 390, height: 844, name: 'iPhone 12/13' },
  iPhoneMax: { width: 428, height: 926, name: 'iPhone Pro Max' },

  // Android devices
  pixel5: { width: 393, height: 851, name: 'Pixel 5' },
  samsungS21: { width: 360, height: 800, name: 'Samsung S21' },

  // Tablets
  iPadMini: { width: 768, height: 1024, name: 'iPad Mini' },
  iPadAir: { width: 820, height: 1180, name: 'iPad Air' },

  // Desktop
  laptop: { width: 1280, height: 800, name: 'Laptop' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
} as const;

/**
 * Mobile viewport breakpoints based on Tailwind CSS
 */
export const BREAKPOINTS = {
  xs: 320,   // Extra small devices
  sm: 640,   // Small devices
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops)
  xl: 1280,  // Extra large devices (desktops)
  '2xl': 1536, // 2XL devices
} as const;

/**
 * Common mobile viewports for testing core functionality
 */
export const MOBILE_VIEWPORTS = [
  VIEWPORTS.iPhoneSE,    // 320px - smallest supported
  VIEWPORTS.iPhone8,     // 375px - common mobile
  VIEWPORTS.iPhone12,    // 390px - modern iPhone
];

/**
 * Tablet viewports for testing
 */
export const TABLET_VIEWPORTS = [
  VIEWPORTS.iPadMini,   // 768px - md breakpoint
  VIEWPORTS.iPadAir,    // 820px - common tablet
];

/**
 * Full viewport matrix for comprehensive testing
 */
export const ALL_VIEWPORTS = [
  VIEWPORTS.iPhoneSE,
  VIEWPORTS.iPhone8,
  VIEWPORTS.iPhone12,
  VIEWPORTS.iPadMini,
  VIEWPORTS.laptop,
];

/**
 * Pages to test with visual regression
 */
export const PAGES_TO_TEST = [
  { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
  { path: '/hr/competencies', name: 'Competencies List', requiresAuth: true },
  { path: '/hr/behavioral-indicators', name: 'Indicators List', requiresAuth: true },
  { path: '/hr/assessment-questions', name: 'Questions List', requiresAuth: true },
  { path: '/admin/users', name: 'Users List', requiresAuth: true },
  { path: '/test-templates', name: 'Test Templates', requiresAuth: true },
  { path: '/sign-in', name: 'Sign In', requiresAuth: false },
];

/**
 * Helper to check if a viewport is mobile
 */
export function isMobileViewport(width: number): boolean {
  return width < BREAKPOINTS.md;
}

/**
 * Helper to check if a viewport is tablet
 */
export function isTabletViewport(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Helper to check if a viewport is desktop
 */
export function isDesktopViewport(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}
