/**
 * Routing Constants
 *
 * This file contains shared constants for Next.js App Router routing logic,
 * including reserved route segments that should not be treated as dynamic parameters.
 */

/**
 * Reserved route segments under /test-templates/ that should not be treated as template IDs.
 *
 * These segments correspond to static routes at the same level as the dynamic [id] route:
 * - 'results': General results listing (/test-templates/results/[resultId])
 * - 'history': Test history listing (/test-templates/history)
 * - 'new': Create new template form (/test-templates/new)
 * - 'take': Take assessment page (/test-templates/take/[sessionId])
 *
 * When these strings are encountered as the [id] parameter in dynamic routes,
 * they should be rejected to prevent routing conflicts and allow Next.js to
 * fall back to the correct static routes.
 *
 * @see ROUTING_FIX.md for detailed explanation of the routing conflict and solution
 */
export const RESERVED_TEST_TEMPLATE_SEGMENTS = [
  'results',
  'history',
  'new',
  'take',
] as const;

/**
 * Type for reserved test template segments
 */
export type ReservedTestTemplateSegment = typeof RESERVED_TEST_TEMPLATE_SEGMENTS[number];

/**
 * Check if a string is a reserved test template segment
 *
 * @param segment - The route segment to check
 * @returns true if the segment is reserved, false otherwise
 *
 * @example
 * ```typescript
 * isReservedTestTemplateSegment('results') // true
 * isReservedTestTemplateSegment('abc123')  // false
 * ```
 */
export function isReservedTestTemplateSegment(segment: string): segment is ReservedTestTemplateSegment {
  return RESERVED_TEST_TEMPLATE_SEGMENTS.includes(segment.toLowerCase() as ReservedTestTemplateSegment);
}

/**
 * Validate that a string is not a reserved test template segment
 *
 * @param id - The template ID to validate
 * @returns true if valid (not reserved), false if invalid (reserved)
 *
 * @example
 * ```typescript
 * validateTemplateId('abc-123-def')  // true - valid UUID
 * validateTemplateId('results')      // false - reserved segment
 * ```
 */
export function validateTemplateId(id: string): boolean {
  return !isReservedTestTemplateSegment(id);
}
