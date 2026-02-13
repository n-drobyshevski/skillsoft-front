'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  FileText,
  Shield,
  AlertTriangle,
  Brain,
  type LucideIcon,
} from 'lucide-react';

// Icon map for string-based lookup (Server Components can only pass plain objects)
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Shield,
  AlertTriangle,
  Brain,
};

interface QuickNavCardProps {
  href: string;
  icon: keyof typeof iconMap;
  title: string;
  description?: string;
  count?: number;
  iconColor: string;
}

/**
 * QuickNavCard - Navigation card with hover prefetching
 *
 * Prefetches the target route on hover/touch to improve navigation speed.
 * Mobile-optimized with compact layout for narrow screens.
 */
export function QuickNavCard({
  href,
  icon,
  title,
  count,
  iconColor,
}: QuickNavCardProps) {
  const router = useRouter();
  const Icon = iconMap[icon];

  // Prefetch on hover/touch
  const handlePrefetch = () => {
    router.prefetch(href);
  };

  return (
    <Link
      href={href}
      className="block w-full min-w-0"
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <Card className="hover:shadow-sm transition-all hover:border-primary/20 cursor-pointer group w-full active:scale-[0.98] !py-0 !gap-0 min-w-0">
        {/* Desktop layout */}
        <CardContent className="hidden sm:flex !p-4 items-center gap-3 min-w-0 w-full">
          <div className={`p-2 rounded-lg ${iconColor} shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{title}</h3>
          </div>
          {count !== undefined && (
            <span className="text-lg font-bold tabular-nums">{count}</span>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </CardContent>
        {/* Mobile layout - compact for narrow screens */}
        <CardContent className="flex sm:hidden !p-2.5 flex-col gap-1 min-h-14 min-w-0 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1 rounded-md ${iconColor} shrink-0`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium truncate min-w-0">{title}</span>
          </div>
          {count !== undefined && (
            <span className="text-sm font-bold tabular-nums text-muted-foreground">{count}</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default QuickNavCard;
