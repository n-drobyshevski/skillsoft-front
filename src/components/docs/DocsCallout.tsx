"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Info,
  AlertTriangle,
  Lightbulb,
  FileText,
  AlertOctagon,
} from "lucide-react";

/**
 * Callout variant configuration
 */
const calloutVariants = {
  info: {
    icon: Info,
    className: "docs-callout-info",
    defaultTitle: "Information",
  },
  warning: {
    icon: AlertTriangle,
    className: "docs-callout-warning",
    defaultTitle: "Warning",
  },
  tip: {
    icon: Lightbulb,
    className: "docs-callout-tip",
    defaultTitle: "Tip",
  },
  note: {
    icon: FileText,
    className: "docs-callout-note",
    defaultTitle: "Note",
  },
  danger: {
    icon: AlertOctagon,
    className: "docs-callout-danger",
    defaultTitle: "Danger",
  },
} as const;

type CalloutVariant = keyof typeof calloutVariants;

interface DocsCalloutProps {
  /**
   * The visual variant of the callout
   * @default "info"
   */
  variant?: CalloutVariant;

  /**
   * Optional title for the callout
   * If not provided, uses the default title for the variant
   */
  title?: string;

  /**
   * Hide the title completely
   * @default false
   */
  hideTitle?: boolean;

  /**
   * The content of the callout
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DocsCallout Component
 *
 * A callout box for highlighting important information in documentation.
 * Supports multiple variants: info, warning, tip, note, danger.
 *
 * @example
 * ```tsx
 * <DocsCallout variant="warning" title="Important">
 *   This action cannot be undone.
 * </DocsCallout>
 * ```
 */
export function DocsCallout({
  variant = "info",
  title,
  hideTitle = false,
  children,
  className,
}: DocsCalloutProps) {
  const config = calloutVariants[variant];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <aside
      role="note"
      aria-label={displayTitle}
      className={cn("docs-callout", config.className, className)}
    >
      <Icon className="docs-callout-icon" aria-hidden="true" />
      <div className="docs-callout-body">
        {!hideTitle && (
          <div className="docs-callout-title">{displayTitle}</div>
        )}
        <div className="docs-callout-content">{children}</div>
      </div>
    </aside>
  );
}

// Named exports for convenience
export const InfoCallout = (props: Omit<DocsCalloutProps, "variant">) => (
  <DocsCallout variant="info" {...props} />
);

export const WarningCallout = (props: Omit<DocsCalloutProps, "variant">) => (
  <DocsCallout variant="warning" {...props} />
);

export const TipCallout = (props: Omit<DocsCalloutProps, "variant">) => (
  <DocsCallout variant="tip" {...props} />
);

export const NoteCallout = (props: Omit<DocsCalloutProps, "variant">) => (
  <DocsCallout variant="note" {...props} />
);

export const DangerCallout = (props: Omit<DocsCalloutProps, "variant">) => (
  <DocsCallout variant="danger" {...props} />
);
