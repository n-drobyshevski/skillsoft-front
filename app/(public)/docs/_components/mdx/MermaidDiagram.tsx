"use client";

import { useEffect, useRef, useState, useId } from "react";
import { cn } from "@/lib/utils";

interface MermaidDiagramProps {
  /** Mermaid diagram definition */
  chart: string;
  /** Optional title/caption for the diagram */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MermaidDiagram Component for Documentation
 *
 * Renders Mermaid diagrams with proper theming and accessibility.
 * Supports flowcharts, sequence diagrams, class diagrams, etc.
 *
 * @example
 * ```tsx
 * <MermaidDiagram
 *   title="Processing Pipeline"
 *   chart={`
 *     flowchart LR
 *       A[Input] --> B[Process] --> C[Output]
 *   `}
 * />
 * ```
 */
export function MermaidDiagram({
  chart,
  title,
  className,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const uniqueId = useId().replace(/:/g, "-");

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to avoid SSR issues
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            padding: 15,
            nodeSpacing: 50,
            rankSpacing: 50,
          },
          themeVariables: {
            // Dark theme colors (neutral palette)
            primaryColor: "#262626",
            primaryTextColor: "#f5f5f5",
            primaryBorderColor: "#525252",
            lineColor: "#737373",
            secondaryColor: "#404040",
            tertiaryColor: "#262626",
            background: "#171717",
            mainBkg: "#262626",
            nodeBorder: "#525252",
            clusterBkg: "#262626",
            clusterBorder: "#525252",
            titleColor: "#fafafa",
            edgeLabelBackground: "#262626",
            // Node colors
            nodeTextColor: "#f5f5f5",
            // Subgraph colors
            subgraph_bg: "#262626",
          },
        });

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(
          `mermaid-${uniqueId}`,
          chart.trim()
        );

        if (isMounted) {
          setSvg(renderedSvg);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Mermaid rendering error:", err);
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  return (
    <figure className={cn("my-6", className)}>
      <div
        ref={containerRef}
        className={cn(
          "overflow-x-auto rounded-lg border p-6",
          "bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700",
          "flex items-center justify-center min-h-[120px]"
        )}
        role="img"
        aria-label={title || "Mermaid diagram"}
      >
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Loading diagram...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <p className="font-medium">Diagram Error</p>
            <p className="mt-1 text-xs opacity-80">{error}</p>
          </div>
        )}

        {!isLoading && !error && svg && (
          <div
            className="mermaid-container w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      {title && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {title}
        </figcaption>
      )}
    </figure>
  );
}
