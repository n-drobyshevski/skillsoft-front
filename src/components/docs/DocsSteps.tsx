"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Step {
  /**
   * Step title
   */
  title: string;

  /**
   * Step content - can be text or JSX
   */
  content: React.ReactNode;
}

interface DocsStepsProps {
  /**
   * Array of steps to display
   */
  steps: Step[];

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DocsSteps Component
 *
 * A step-by-step guide component with numbered steps and visual timeline.
 *
 * @example
 * ```tsx
 * <DocsSteps
 *   steps={[
 *     { title: "Install dependencies", content: "Run npm install to get started." },
 *     { title: "Configure settings", content: "Update your config file." },
 *     { title: "Run the application", content: "Start with npm run dev." },
 *   ]}
 * />
 * ```
 */
export function DocsSteps({ steps, className }: DocsStepsProps) {
  return (
    <div className={cn("docs-steps", className)} role="list">
      {steps.map((step, index) => (
        <div
          key={index}
          className="docs-step"
          role="listitem"
          aria-label={`Step ${index + 1}: ${step.title}`}
        >
          <div className="docs-step-number" aria-hidden="true">
            {index + 1}
          </div>
          <div className="docs-step-title">{step.title}</div>
          <div className="docs-step-content">{step.content}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Individual step component for more control
 */
interface DocsStepProps {
  /**
   * Step number (1-indexed)
   */
  number: number;

  /**
   * Step title
   */
  title: string;

  /**
   * Step content
   */
  children: React.ReactNode;

  /**
   * Whether this is the last step
   */
  isLast?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function DocsStep({
  number,
  title,
  children,
  isLast = false,
  className,
}: DocsStepProps) {
  return (
    <div
      className={cn("docs-step", isLast && "pb-0", className)}
      role="listitem"
      aria-label={`Step ${number}: ${title}`}
    >
      <div className="docs-step-number" aria-hidden="true">
        {number}
      </div>
      <div className="docs-step-title">{title}</div>
      <div className="docs-step-content">{children}</div>
    </div>
  );
}

/**
 * Container for individual DocsStep components
 */
export function DocsStepsContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("docs-steps", className)} role="list">
      {children}
    </div>
  );
}
