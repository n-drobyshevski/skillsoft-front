'use client';

/**
 * PrefetchLink - Hover-triggered route and data prefetching
 *
 * Wraps Next.js Link to implement the official hover-prefetch pattern:
 * - Route JS is prefetched only when the user hovers (not on viewport entry)
 * - Optionally triggers React Query data prefetching via onPrefetchData callback
 *
 * This reduces unnecessary network requests for sidebar links that the user
 * may never click, while still providing instant navigation for hovered links.
 *
 * @see https://nextjs.org/docs/app/guides/prefetching#hover-prefetch
 */

import Link from 'next/link';
import { useState, useCallback } from 'react';

interface PrefetchLinkProps extends React.ComponentProps<typeof Link> {
  /** Optional data prefetch function to call on hover */
  onPrefetchData?: () => void;
}

export function PrefetchLink({
  onPrefetchData,
  onMouseEnter,
  ...props
}: PrefetchLinkProps) {
  const [active, setActive] = useState(false);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      setActive(true);
      onPrefetchData?.();
      if (typeof onMouseEnter === 'function') {
        (onMouseEnter as (e: React.MouseEvent<HTMLAnchorElement>) => void)(e);
      }
    },
    [onPrefetchData, onMouseEnter]
  );

  return (
    <Link
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={handleMouseEnter}
    />
  );
}
