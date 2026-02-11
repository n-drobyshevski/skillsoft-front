"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface CollapsibleSectionProps {
  /** Unique ID for the section (used for accordion state) */
  id: string;
  /** Section title */
  title: string;
  /** Optional badge text (e.g., "New", "Advanced") */
  badge?: string;
  /** Badge variant */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  /** Icon component to display before title */
  icon?: React.ReactNode;
  /** Whether to start expanded (default: false on mobile, configurable on desktop) */
  defaultOpen?: boolean;
  /** Priority level affects default open state on different screen sizes */
  priority?: "high" | "medium" | "low";
  /** Additional CSS classes */
  className?: string;
  /** Children content */
  children: React.ReactNode;
}

/**
 * CollapsibleSection Component for Documentation
 *
 * Progressive disclosure component with:
 * - Touch-friendly 52px minimum trigger height
 * - Responsive default open states based on priority
 * - Smooth animations with reduced motion support
 * - Icon and badge support
 * - Nested content support
 *
 * @example
 * ```tsx
 * <CollapsibleSection
 *   id="algorithm"
 *   title="Algorithm Details"
 *   badge="Advanced"
 *   icon={<CodeIcon />}
 *   priority="medium"
 * >
 *   <p>Algorithm explanation...</p>
 * </CollapsibleSection>
 * ```
 */
export function CollapsibleSection({
  id,
  title,
  badge,
  badgeVariant = "secondary",
  icon,
  defaultOpen = false,
  priority = "medium",
  className,
  children,
}: CollapsibleSectionProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  // Check for mobile on mount
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine if section should be open by default
  const shouldDefaultOpen = React.useMemo(() => {
    if (defaultOpen) return true;
    if (isMobile) {
      // On mobile, only high priority sections are open by default
      return priority === "high";
    }
    // On desktop, high and medium priority sections are open
    return priority === "high" || priority === "medium";
  }, [defaultOpen, isMobile, priority]);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={shouldDefaultOpen ? id : undefined}
      className={cn("border rounded-lg", className)}
    >
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger
          className={cn(
            "px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg",
            "min-h-[52px] touch-manipulation",
            "[&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0"
          )}
        >
          <div className="flex items-center gap-3 text-left flex-1 min-w-0">
            {icon && (
              <span className="shrink-0 text-muted-foreground">{icon}</span>
            )}
            <span className="font-semibold text-sm sm:text-base truncate">
              {title}
            </span>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs shrink-0">
                {badge}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * CollapsibleGroup Component
 *
 * Groups multiple collapsible sections with shared state.
 * Only one section can be open at a time.
 */
interface CollapsibleGroupProps {
  /** Default open section ID */
  defaultValue?: string;
  /** Additional CSS classes */
  className?: string;
  /** Children (CollapsibleGroupItem components) */
  children: React.ReactNode;
}

export function CollapsibleGroup({
  defaultValue,
  className,
  children,
}: CollapsibleGroupProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultValue}
      className={cn("space-y-2", className)}
    >
      {children}
    </Accordion>
  );
}

interface CollapsibleGroupItemProps {
  /** Unique ID for the item */
  id: string;
  /** Item title */
  title: string;
  /** Optional badge */
  badge?: string;
  /** Badge variant */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  /** Icon component */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Children content */
  children: React.ReactNode;
}

export function CollapsibleGroupItem({
  id,
  title,
  badge,
  badgeVariant = "secondary",
  icon,
  className,
  children,
}: CollapsibleGroupItemProps) {
  return (
    <AccordionItem
      value={id}
      className={cn("border rounded-lg px-4", className)}
    >
      <AccordionTrigger
        className={cn(
          "py-3 min-h-[48px] touch-manipulation",
          "[&>svg]:h-5 [&>svg]:w-5"
        )}
      >
        <div className="flex items-center gap-3 text-left">
          {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
          <span className="text-sm font-medium">{title}</span>
          {badge && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

/**
 * AlgorithmSteps Component
 *
 * Specialized component for displaying algorithm steps with progressive disclosure.
 * Each step is numbered and expandable.
 */
interface AlgorithmStep {
  /** Step title */
  title: string;
  /** Step description/content (can be JSX) */
  content: React.ReactNode;
  /** Optional code snippet */
  code?: string;
}

interface AlgorithmStepsProps {
  /** Array of algorithm steps */
  steps: AlgorithmStep[];
  /** Default expanded step (1-indexed, or 0 for none) */
  defaultStep?: number;
  /** Additional CSS classes */
  className?: string;
}

export function AlgorithmSteps({
  steps,
  defaultStep = 0,
  className,
}: AlgorithmStepsProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultStep > 0 ? `step-${defaultStep - 1}` : undefined}
      className={cn("space-y-2", className)}
    >
      {steps.map((step, index) => (
        <AccordionItem
          key={index}
          value={`step-${index}`}
          className="border rounded-lg overflow-hidden"
        >
          <AccordionTrigger
            className={cn(
              "px-4 py-3 min-h-[52px] touch-manipulation hover:no-underline hover:bg-muted/50",
              "[&>svg]:h-5 [&>svg]:w-5"
            )}
          >
            <div className="flex items-center gap-3 text-left">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  "bg-primary text-primary-foreground text-sm font-bold shrink-0"
                )}
              >
                {index + 1}
              </span>
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pl-14">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{step.content}</div>
              {step.code && (
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                  <code>{step.code}</code>
                </pre>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
