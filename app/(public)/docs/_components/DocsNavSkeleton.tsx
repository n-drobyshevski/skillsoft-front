import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Skeleton fallback for DocsNavServer
 *
 * Matches the structure of the navigation sidebar:
 * - Search input skeleton at top
 * - 4 navigation groups with 3 items each
 *
 * Used as Suspense fallback for streaming SSR.
 */
export function DocsNavSkeleton() {
  // Navigation section configuration matching actual structure
  const sections = [
    { titleWidth: 'w-28', itemCount: 3 },
    { titleWidth: 'w-36', itemCount: 4 },
    { titleWidth: 'w-32', itemCount: 4 },
    { titleWidth: 'w-24', itemCount: 1 },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Search Button Skeleton */}
      <div className="p-4 border-b">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Navigation Sections Skeleton */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {/* Section Title Skeleton */}
              <div className="px-2 py-1.5">
                <Skeleton className={`h-4 ${section.titleWidth}`} />
              </div>

              {/* Navigation Items Skeleton */}
              <ul className="space-y-1">
                {Array.from({ length: section.itemCount }).map((_, itemIndex) => (
                  <li key={itemIndex}>
                    <Skeleton className="h-9 w-full rounded-md" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
