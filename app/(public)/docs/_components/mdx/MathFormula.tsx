"use client";

import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MathFormulaProps {
  /** LaTeX expression to render */
  tex: string;
  /** Display mode (block) or inline */
  display?: boolean;
  /** Accessible label describing the formula */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show the LaTeX source on error */
  showSourceOnError?: boolean;
}

/**
 * MathFormula Component for Documentation
 *
 * Renders LaTeX math expressions using KaTeX with proper accessibility.
 * Supports both inline and display (block) modes.
 *
 * @example
 * ```tsx
 * // Inline math
 * <MathFormula tex="E = mc^2" />
 *
 * // Block/display math
 * <MathFormula
 *   tex="\\frac{\\sum_{i=1}^{n} C_i \\times W_i}{\\sum_{i=1}^{n} W_i}"
 *   display
 *   label="Weighted average formula"
 * />
 * ```
 */
export function MathFormula({
  tex,
  display = false,
  label,
  className,
  showSourceOnError = true,
}: MathFormulaProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      katex.render(tex, containerRef.current, {
        displayMode: display,
        throwOnError: false,
        errorColor: "#ef4444",
        trust: false,
        strict: false,
        output: "html",
        // Accessibility options
        fleqn: false, // Left-align equations in display mode
      });
      // Only update error state if it was previously set (avoid synchronous setState)
      if (error !== null) {
        setError(null);
      }
    } catch (err) {
      console.error("KaTeX rendering error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to render formula";
      // Only update if error changed
      if (error !== errorMessage) {
        setError(errorMessage);
      }
    }
  }, [tex, display, error]);

  // Error state
  if (error) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 text-red-500 text-sm",
          className
        )}
        role="img"
        aria-label={label || `Math formula: ${tex}`}
      >
        <span className="text-xs bg-red-500/10 px-2 py-1 rounded">
          Formula Error
        </span>
        {showSourceOnError && (
          <code className="font-mono text-xs text-neutral-400">{tex}</code>
        )}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className={cn(
        display ? "block my-4 text-center overflow-x-auto" : "inline",
        // Custom styling for dark theme compatibility
        "[&_.katex]:text-inherit",
        "[&_.katex-display]:my-0",
        "[&_.katex-display]:overflow-x-auto",
        "[&_.katex-display]:overflow-y-hidden",
        "[&_.katex-display]:py-2",
        className
      )}
      role="math"
      aria-label={label || `Math formula: ${tex}`}
    />
  );
}

/**
 * MathBlock Component - Styled container for display math
 *
 * Wraps MathFormula with a styled container for documentation.
 *
 * @example
 * ```tsx
 * <MathBlock
 *   tex="\\text{Score} = \\frac{\\sum_{i=1}^{n} C_i \\times W_i}{\\sum_{i=1}^{n} W_i}"
 *   label="Weighted average formula for scoring"
 *   title="Формула агрегации"
 * />
 * ```
 */
interface MathBlockProps extends Omit<MathFormulaProps, "display"> {
  /** Optional title above the formula */
  title?: string;
  /** Color variant for the container */
  variant?: "default" | "blue" | "purple" | "amber" | "emerald";
}

const variantStyles = {
  default: "bg-neutral-900/50 border-neutral-800",
  blue: "bg-blue-900/20 border-blue-800/50",
  purple: "bg-purple-900/20 border-purple-800/50",
  amber: "bg-amber-900/20 border-amber-800/50",
  emerald: "bg-emerald-900/20 border-emerald-800/50",
};

const variantTextStyles = {
  default: "text-neutral-100",
  blue: "text-blue-300",
  purple: "text-purple-300",
  amber: "text-amber-300",
  emerald: "text-emerald-300",
};

export function MathBlock({
  tex,
  label,
  title,
  variant = "default",
  className,
  showSourceOnError = true,
}: MathBlockProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 my-4 overflow-x-auto",
        variantStyles[variant as keyof typeof variantStyles],
        className
      )}
    >
      {title && (
        <div className="text-xs text-neutral-500 mb-2 font-medium">{title}</div>
      )}
      <div className={cn("text-center min-w-fit", variantTextStyles[variant as keyof typeof variantTextStyles])}>
        <MathFormula
          tex={tex}
          display
          label={label}
          showSourceOnError={showSourceOnError}
        />
      </div>
    </div>
  );
}

/**
 * InlineMath - Shorthand for inline math expressions
 */
export function InlineMath({
  children,
  label,
  className,
}: {
  children: string;
  label?: string;
  className?: string;
}) {
  return (
    <MathFormula tex={children} label={label} className={className} />
  );
}
