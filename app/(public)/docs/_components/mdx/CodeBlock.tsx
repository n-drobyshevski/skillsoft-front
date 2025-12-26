"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  CopyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

interface CodeBlockProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting label */
  language?: string;
  /** Optional filename to display in header */
  filename?: string;
  /** Maximum number of visible lines before truncation (default: 15) */
  maxLines?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show line numbers (default: false) */
  showLineNumbers?: boolean;
  /** Highlight specific lines (1-indexed) */
  highlightLines?: number[];
}

/**
 * CodeBlock Component for Documentation
 *
 * Mobile-optimized code block with:
 * - One-tap copy button (44x44px touch target)
 * - Expand/collapse for long code
 * - Horizontal scroll with momentum
 * - Language label and optional filename
 * - Line numbers support
 * - Syntax highlighting (via CSS classes)
 *
 * @example
 * ```tsx
 * <CodeBlock
 *   code={`{"key": "value"}`}
 *   language="json"
 *   filename="config.json"
 *   maxLines={10}
 * />
 * ```
 */
export function CodeBlock({
  code,
  language = "text",
  filename,
  maxLines = 15,
  className,
  showLineNumbers = false,
  highlightLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const lines = code.split("\n");
  const isLong = lines.length > maxLines;
  const displayLines = expanded ? lines : lines.slice(0, maxLines);
  const hiddenLinesCount = lines.length - maxLines;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg border bg-neutral-900 overflow-hidden my-4",
        className
      )}
    >
      {/* Header with filename, language label, and copy button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700 bg-neutral-800/80">
        <div className="flex items-center gap-2 min-w-0">
          {filename && (
            <span className="text-xs font-medium text-neutral-300 truncate max-w-[200px]">
              {filename}
            </span>
          )}
          <span className="text-xs text-neutral-500 uppercase shrink-0">
            {language}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          className={cn(
            "h-8 w-8 p-0 touch-manipulation shrink-0",
            "hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100"
          )}
          aria-label={copied ? "Скопировано" : "Копировать код"}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-emerald-400" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Code content with horizontal scroll */}
      <div
        className="overflow-x-auto scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
        tabIndex={0}
        role="region"
        aria-label="Code block, scrollable"
      >
        <pre className="p-3 text-xs sm:text-sm leading-relaxed">
          <code className={cn("block whitespace-pre min-w-max", `language-${language}`)}>
            {displayLines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightLines.includes(lineNumber);

              return (
                <div
                  key={index}
                  className={cn(
                    "table-row",
                    isHighlighted && "bg-primary/10 -mx-3 px-3"
                  )}
                >
                  {showLineNumbers && (
                    <span className="table-cell pr-4 text-right text-neutral-600 select-none w-8">
                      {lineNumber}
                    </span>
                  )}
                  <span
                    className={cn(
                      "table-cell text-neutral-300",
                      isHighlighted && "text-neutral-100"
                    )}
                  >
                    {line || " "}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Expand/collapse for long code */}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full py-2.5 px-3 border-t border-neutral-700",
            "flex items-center justify-center gap-1.5",
            "text-xs text-neutral-400 hover:text-neutral-200",
            "bg-neutral-800/50 hover:bg-neutral-800 transition-colors",
            "min-h-[44px] touch-manipulation"
          )}
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="h-4 w-4" />
              <span>Свернуть</span>
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-4 w-4" />
              <span>Показать ещё {hiddenLinesCount} строк</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * InlineCode Component
 *
 * For inline code snippets within text.
 * Touch-friendly with slightly larger hit area.
 */
export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "text-xs sm:text-sm font-mono",
        "bg-muted px-1.5 py-0.5 rounded",
        "text-foreground",
        className
      )}
    >
      {children}
    </code>
  );
}
