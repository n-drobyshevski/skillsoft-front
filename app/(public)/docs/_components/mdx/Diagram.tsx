import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DiagramProps {
  /** Diagram content (usually ASCII art or text) */
  children: ReactNode;
  /** Optional title/caption for the diagram */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Diagram Component for Documentation
 *
 * Displays ASCII/text diagrams with proper formatting.
 * Uses monospace font and preserves whitespace.
 *
 * @example
 * <Diagram title="System Architecture">
 * {`
 * ┌─────────┐     ┌─────────┐
 * │ Client  │────>│  API    │
 * └─────────┘     └─────────┘
 * `}
 * </Diagram>
 */
export function Diagram({ children, title, className }: DiagramProps) {
  return (
    <figure className={cn("my-6", className)}>
      <div className="overflow-x-auto rounded-lg border bg-muted/50 p-4">
        <pre className="font-mono text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre overflow-x-auto">
          {children}
        </pre>
      </div>
      {title && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {title}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Simple flow diagram using flexbox
 * For simple linear flows without ASCII art
 */
interface FlowDiagramProps {
  /** Array of step labels */
  steps: string[];
  /** Additional CSS classes */
  className?: string;
}

export function FlowDiagram({ steps, className }: FlowDiagramProps) {
  return (
    <div
      className={cn(
        "my-6 flex flex-wrap items-center justify-center gap-2",
        className
      )}
      role="img"
      aria-label={`Flow diagram: ${steps.join(" -> ")}`}
    >
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="rounded-md border bg-card px-3 py-1.5 text-sm font-medium shadow-sm">
            {step}
          </div>
          {index < steps.length - 1 && (
            <span className="text-muted-foreground" aria-hidden="true">
              -&gt;
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Hierarchy diagram for showing tree structures
 */
interface HierarchyDiagramProps {
  /** Root node data */
  data: HierarchyNode;
  /** Additional CSS classes */
  className?: string;
}

interface HierarchyNode {
  label: string;
  children?: HierarchyNode[];
}

export function HierarchyDiagram({ data, className }: HierarchyDiagramProps) {
  return (
    <div className={cn("my-6 overflow-x-auto", className)}>
      <div className="inline-block min-w-full">
        <HierarchyNodeComponent node={data} isRoot />
      </div>
    </div>
  );
}

function HierarchyNodeComponent({
  node,
  isRoot = false,
}: {
  node: HierarchyNode;
  isRoot?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2", !isRoot && "mt-2")}>
      <div className="rounded-md border bg-card px-3 py-1.5 text-sm font-medium shadow-sm">
        {node.label}
      </div>
      {node.children && node.children.length > 0 && (
        <>
          <div className="h-4 w-0.5 bg-border" />
          <div className="flex gap-4">
            {node.children.map((child, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="h-4 w-0.5 bg-border" />
                <HierarchyNodeComponent node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
