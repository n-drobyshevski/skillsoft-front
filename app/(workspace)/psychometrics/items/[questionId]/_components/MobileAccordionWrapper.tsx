'use client';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface MobileAccordionWrapperProps {
  /** Unique ID for the accordion item */
  id: string;
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Optional badge count/text */
  badge?: string | number;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Content to render */
  children: React.ReactNode;
  /** Whether to start expanded on mobile */
  defaultExpanded?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * MobileAccordionWrapper - Progressive disclosure component
 *
 * Renders:
 * - **Mobile:** Collapsible accordion with optional badge
 * - **Desktop:** Always-expanded Card (unchanged behavior)
 *
 * This reduces cognitive load on mobile by hiding secondary content
 * behind a single tap, while keeping the full experience on desktop.
 */
export function MobileAccordionWrapper({
  id,
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant = 'secondary',
  children,
  defaultExpanded = false,
  className,
}: MobileAccordionWrapperProps) {
  const isMobile = useIsMobile();

  // Desktop: Render as always-visible Card
  if (!isMobile) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {title}
            {badge != null && (
              <Badge variant={badgeVariant} className="ml-auto">
                {badge}
              </Badge>
            )}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  // Mobile: Render as collapsible accordion
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultExpanded ? id : undefined}
      className={cn('rounded-lg border bg-card', className)}
    >
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className="font-medium truncate">{title}</span>
            {badge != null && (
              <Badge variant={badgeVariant} className="ml-auto mr-2">
                {badge}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {description && (
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
          )}
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * MobileAccordionGroup - Group multiple accordions with multi-expand capability
 */
interface MobileAccordionGroupProps {
  /** Accordion items to group */
  children: React.ReactNode;
  /** Default expanded items (array of IDs) */
  defaultExpanded?: string[];
  /** Additional className */
  className?: string;
}

export function MobileAccordionGroup({
  children,
  defaultExpanded = [],
  className,
}: MobileAccordionGroupProps) {
  const isMobile = useIsMobile();

  // Desktop: Just render children in a flex column
  if (!isMobile) {
    return <div className={cn('space-y-4', className)}>{children}</div>;
  }

  // Mobile: Render as multi-accordion group
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultExpanded}
      className={cn('space-y-2', className)}
    >
      {children}
    </Accordion>
  );
}

/**
 * MobileAccordionItem - Individual item within MobileAccordionGroup
 */
interface MobileAccordionItemProps {
  /** Unique ID for the accordion item */
  id: string;
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Optional badge count/text */
  badge?: string | number;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Content to render */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export function MobileAccordionItem({
  id,
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant = 'secondary',
  children,
  className,
}: MobileAccordionItemProps) {
  const isMobile = useIsMobile();

  // Desktop: Render as Card
  if (!isMobile) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {title}
            {badge != null && (
              <Badge variant={badgeVariant} className="ml-auto">
                {badge}
              </Badge>
            )}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  // Mobile: Render as AccordionItem (must be inside MobileAccordionGroup's Accordion)
  return (
    <AccordionItem
      value={id}
      className={cn('rounded-lg border bg-card', className)}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span className="font-medium truncate">{title}</span>
          {badge != null && (
            <Badge variant={badgeVariant} className="ml-auto mr-2">
              {badge}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

export default MobileAccordionWrapper;
