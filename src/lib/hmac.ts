/**
 * HMAC-SHA256 Signing Utility for Backend Authentication Headers
 *
 * Signs the X-User-Id and X-User-Role headers with a shared secret so the
 * Spring Boot backend can verify that headers were not spoofed.
 *
 * The message format is:  userId + ":" + userRole + ":" + timestamp
 * The signature is hex-encoded HMAC-SHA256.
 *
 * NOTE: This module uses the Node.js `crypto` module and must only run
 * on the server (Server Components, Server Actions, middleware).
 * Never import this in client components.
 *
 * @module lib/hmac
 */

import { createHmac } from 'crypto';

/**
 * HMAC-signed authentication headers to include in requests to the backend.
 */
export interface HmacAuthHeaders {
  'X-Auth-Timestamp': string;
  'X-Auth-Signature': string;
}

/**
 * Generate HMAC-SHA256 signature headers for backend authentication.
 *
 * Supports two message formats:
 * - With effective role: "userId:userRole:effectiveRole:timestamp"
 * - Without effective role: "userId:userRole:timestamp" (backward compat)
 *
 * @param userId        - The Clerk user ID (X-User-Id header value)
 * @param userRole      - The user's actual role string (X-User-Role header value)
 * @param effectiveRole - The lens-downgraded role (X-Effective-Role), omit if same as userRole
 * @returns An object with X-Auth-Timestamp and X-Auth-Signature headers,
 *          or an empty object if HMAC_SHARED_SECRET is not configured.
 */
export function signAuthHeaders(
  userId: string,
  userRole: string,
  effectiveRole?: string
): HmacAuthHeaders | Record<string, never> {
  const secret = process.env.HMAC_SHARED_SECRET;

  // If no secret is configured, skip signing (backward compatible dev mode)
  if (!secret) {
    return {};
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = effectiveRole && effectiveRole !== userRole
    ? `${userId}:${userRole}:${effectiveRole}:${timestamp}`
    : `${userId}:${userRole}:${timestamp}`;

  const signature = createHmac('sha256', secret)
    .update(message, 'utf8')
    .digest('hex');

  return {
    'X-Auth-Timestamp': timestamp,
    'X-Auth-Signature': signature,
  };
}
