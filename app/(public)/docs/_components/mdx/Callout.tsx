import { ReactNode } from "react";
import {
  InfoIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  StickyNoteIcon,
  AlertOctagonIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "tip" | "note" | "danger";

interface CalloutProps {
  /** Type of callout - determines color scheme and icon */
  type?: CalloutType;
  /** Optional title for the callout */
  title?: string;
  /** Content of the callout */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: typeof InfoIcon;
    containerClass: string;
    iconClass: string;
    titleClass: string;
  }
> = {
  info: {
    icon: InfoIcon,
    containerClass: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-800 dark:text-blue-200",
  },
  warning: {
    icon: AlertTriangleIcon,
    containerClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    iconClass: "text-amber-600 dark:text-amber-400",
    titleClass: "text-amber-800 dark:text-amber-200",
  },
  tip: {
    icon: LightbulbIcon,
    containerClass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    titleClass: "text-emerald-800 dark:text-emerald-200",
  },
  note: {
    icon: StickyNoteIcon,
    containerClass: "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700",
    iconClass: "text-slate-600 dark:text-slate-400",
    titleClass: "text-slate-800 dark:text-slate-200",
  },
  danger: {
    icon: AlertOctagonIcon,
    containerClass: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    iconClass: "text-red-600 dark:text-red-400",
    titleClass: "text-red-800 dark:text-red-200",
  },
};

/**
 * Callout Component for Documentation
 *
 * Displays important information with visual emphasis.
 * Types: info (blue), warning (amber), tip (emerald), note (slate), danger (red)
 *
 * @example
 * <Callout type="info" title="Note">
 *   This is important information.
 * </Callout>
 */
export function Callout({
  type = "info",
  title,
  children,
  className,
}: CalloutProps) {
  const config = calloutConfig[type as keyof typeof calloutConfig];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-6 rounded-lg border p-4",
        config.containerClass,
        className
      )}
      role="note"
    >
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClass)} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn("mb-2 font-semibold", config.titleClass)}>
              {title}
            </p>
          )}
          <div className="text-sm text-foreground/90 [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
