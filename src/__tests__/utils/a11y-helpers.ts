/**
 * Accessibility Test Helpers
 * Phase 6: Utility functions for accessibility testing
 *
 * Provides helpers for:
 * - Focus management testing
 * - ARIA attribute verification
 * - Keyboard navigation simulation
 * - Screen reader compatibility checks
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// FOCUS MANAGEMENT HELPERS
// ============================================

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
}

/**
 * Test tab order of focusable elements
 */
export async function testTabOrder(
  user: ReturnType<typeof userEvent.setup>,
  expectedOrder: HTMLElement[]
): Promise<boolean> {
  for (const element of expectedOrder) {
    await user.tab();
    if (document.activeElement !== element) {
      return false;
    }
  }
  return true;
}

/**
 * Test reverse tab order
 */
export async function testReverseTabOrder(
  user: ReturnType<typeof userEvent.setup>,
  expectedOrder: HTMLElement[]
): Promise<boolean> {
  for (const element of expectedOrder) {
    await user.tab({ shift: true });
    if (document.activeElement !== element) {
      return false;
    }
  }
  return true;
}

/**
 * Check if an element is currently focused
 */
export function isFocused(element: HTMLElement): boolean {
  return document.activeElement === element;
}

/**
 * Check if focus is contained within a specific element
 */
export function isFocusWithin(container: HTMLElement): boolean {
  return container.contains(document.activeElement);
}

// ============================================
// ARIA ATTRIBUTE HELPERS
// ============================================

/**
 * Check if an element has required ARIA attributes
 */
export function hasRequiredAriaAttributes(
  element: HTMLElement,
  requiredAttributes: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredAttributes.filter(
    attr => !element.hasAttribute(attr)
  );
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get ARIA live region elements
 */
export function getLiveRegions(container: HTMLElement = document.body): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[aria-live], [role="alert"], [role="status"]')
  );
}

/**
 * Check if element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const title = element.getAttribute('title');
  const textContent = element.textContent?.trim();

  return !!(ariaLabel || ariaLabelledBy || title || textContent);
}

/**
 * Get accessible name of an element
 */
export function getAccessibleName(element: HTMLElement): string | null {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElements = ariaLabelledBy
      .split(' ')
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (labelElements.length > 0) {
      return labelElements.map(el => el.textContent).join(' ');
    }
  }

  // Check title
  const title = element.getAttribute('title');
  if (title) return title;

  // Fall back to text content
  return element.textContent?.trim() || null;
}

// ============================================
// KEYBOARD NAVIGATION HELPERS
// ============================================

/**
 * Simulate keyboard navigation through a list
 */
export async function navigateWithArrowKeys(
  user: ReturnType<typeof userEvent.setup>,
  direction: 'up' | 'down' | 'left' | 'right',
  times: number = 1
): Promise<void> {
  const keyMap = {
    up: '{ArrowUp}',
    down: '{ArrowDown}',
    left: '{ArrowLeft}',
    right: '{ArrowRight}',
  };

  for (let i = 0; i < times; i++) {
    await user.keyboard(keyMap[direction]);
  }
}

/**
 * Test Enter key activation
 */
export async function activateWithEnter(
  user: ReturnType<typeof userEvent.setup>
): Promise<void> {
  await user.keyboard('{Enter}');
}

/**
 * Test Space key activation
 */
export async function activateWithSpace(
  user: ReturnType<typeof userEvent.setup>
): Promise<void> {
  await user.keyboard(' ');
}

/**
 * Test Escape key press
 */
export async function pressEscape(
  user: ReturnType<typeof userEvent.setup>
): Promise<void> {
  await user.keyboard('{Escape}');
}

// ============================================
// LANDMARK HELPERS
// ============================================

/**
 * Get all landmark elements
 */
export function getLandmarks(
  container: HTMLElement = document.body
): Record<string, HTMLElement[]> {
  return {
    banner: Array.from(container.querySelectorAll<HTMLElement>('[role="banner"], header')),
    navigation: Array.from(container.querySelectorAll<HTMLElement>('[role="navigation"], nav')),
    main: Array.from(container.querySelectorAll<HTMLElement>('[role="main"], main')),
    complementary: Array.from(container.querySelectorAll<HTMLElement>('[role="complementary"], aside')),
    contentinfo: Array.from(container.querySelectorAll<HTMLElement>('[role="contentinfo"], footer')),
    search: Array.from(container.querySelectorAll<HTMLElement>('[role="search"]')),
    form: Array.from(container.querySelectorAll<HTMLElement>('[role="form"], form[aria-label], form[aria-labelledby]')),
    region: Array.from(container.querySelectorAll<HTMLElement>('[role="region"][aria-label], [role="region"][aria-labelledby]')),
  };
}

/**
 * Check if page has required landmarks
 */
export function hasRequiredLandmarks(
  container: HTMLElement = document.body
): { valid: boolean; missing: string[] } {
  const landmarks = getLandmarks(container);
  const required = ['main'];
  const recommended = ['banner', 'navigation', 'contentinfo'];

  const missing = required.filter(landmark => landmarks[landmark].length === 0);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// ============================================
// HEADING STRUCTURE HELPERS
// ============================================

/**
 * Get heading structure of a page
 */
export function getHeadingStructure(
  container: HTMLElement = document.body
): Array<{ level: number; text: string; element: HTMLElement }> {
  const headings = container.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6');

  return Array.from(headings).map(heading => ({
    level: parseInt(heading.tagName[1], 10),
    text: heading.textContent?.trim() || '',
    element: heading,
  }));
}

/**
 * Check if heading structure is valid (no skipped levels)
 */
export function isHeadingStructureValid(
  container: HTMLElement = document.body
): { valid: boolean; issues: string[] } {
  const headings = getHeadingStructure(container);
  const issues: string[] = [];

  if (headings.length === 0) {
    issues.push('No headings found');
    return { valid: false, issues };
  }

  // Check for h1
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count === 0) {
    issues.push('No h1 heading found');
  } else if (h1Count > 1) {
    issues.push(`Multiple h1 headings found (${h1Count})`);
  }

  // Check for skipped levels
  for (let i = 1; i < headings.length; i++) {
    const currentLevel = headings[i].level;
    const previousLevel = headings[i - 1].level;

    if (currentLevel > previousLevel + 1) {
      issues.push(
        `Skipped heading level: h${previousLevel} to h${currentLevel} ("${headings[i].text}")`
      );
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ============================================
// FORM ACCESSIBILITY HELPERS
// ============================================

/**
 * Check if form inputs have associated labels
 */
export function areInputsLabeled(
  container: HTMLElement = document.body
): { valid: boolean; unlabeled: HTMLElement[] } {
  const inputs = container.querySelectorAll<HTMLInputElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
  );

  const unlabeled = Array.from(inputs).filter(input => {
    const hasAriaLabel = input.hasAttribute('aria-label');
    const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
    const hasTitle = input.hasAttribute('title');
    const hasAssociatedLabel = input.id
      ? container.querySelector(`label[for="${input.id}"]`) !== null
      : false;
    const hasWrappingLabel = input.closest('label') !== null;

    return !(hasAriaLabel || hasAriaLabelledBy || hasTitle || hasAssociatedLabel || hasWrappingLabel);
  });

  return {
    valid: unlabeled.length === 0,
    unlabeled,
  };
}

/**
 * Check if required fields are properly indicated
 */
export function areRequiredFieldsIndicated(
  container: HTMLElement = document.body
): { valid: boolean; issues: HTMLElement[] } {
  const requiredInputs = container.querySelectorAll<HTMLInputElement>(
    'input[required], textarea[required], select[required]'
  );

  const issues = Array.from(requiredInputs).filter(input => {
    const hasAriaRequired = input.getAttribute('aria-required') === 'true';
    const hasRequiredAttr = input.hasAttribute('required');
    const label = input.id
      ? container.querySelector(`label[for="${input.id}"]`)
      : input.closest('label');
    const labelIndicatesRequired = label?.textContent?.includes('*') ||
      label?.textContent?.toLowerCase().includes('required');

    return hasRequiredAttr && !hasAriaRequired && !labelIndicatesRequired;
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ============================================
// COLOR CONTRAST HELPERS (Pattern-based)
// ============================================

/**
 * Check if element relies only on color for meaning
 * (Pattern check - actual contrast would need computed styles)
 */
export function hasNonColorIndicator(element: HTMLElement): boolean {
  const text = element.textContent?.trim();
  const ariaLabel = element.getAttribute('aria-label');
  const hasIcon = element.querySelector('svg, [class*="icon"]') !== null;
  const hasBorder = element.className.includes('border');
  const hasUnderline = element.className.includes('underline');

  return !!(text || ariaLabel || hasIcon || hasBorder || hasUnderline);
}

// ============================================
// SCREEN READER HELPERS
// ============================================

/**
 * Check if element is hidden from screen readers
 */
export function isHiddenFromScreenReader(element: HTMLElement): boolean {
  const ariaHidden = element.getAttribute('aria-hidden') === 'true';
  const hasRolePresentation = element.getAttribute('role') === 'presentation';
  const hasRoleNone = element.getAttribute('role') === 'none';
  const isInert = element.hasAttribute('inert');

  return ariaHidden || hasRolePresentation || hasRoleNone || isInert;
}

/**
 * Get all elements visible to screen readers
 */
export function getScreenReaderVisibleElements(
  container: HTMLElement = document.body
): HTMLElement[] {
  const allElements = container.querySelectorAll<HTMLElement>('*');

  return Array.from(allElements).filter(
    element => !isHiddenFromScreenReader(element)
  );
}
