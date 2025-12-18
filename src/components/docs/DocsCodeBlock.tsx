"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, FileCode } from "lucide-react";

interface DocsCodeBlockProps {
  /**
   * The code content to display
   */
  code: string;

  /**
   * Programming language for syntax highlighting
   */
  language?: string;

  /**
   * Optional filename to display in the header
   */
  filename?: string;

  /**
   * Show line numbers
   * @default false
   */
  showLineNumbers?: boolean;

  /**
   * Array of line numbers to highlight
   */
  highlightLines?: number[];

  /**
   * Optional caption below the code block
   */
  caption?: string;

  /**
   * Hide the copy button
   * @default false
   */
  hideCopyButton?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DocsCodeBlock Component
 *
 * A code block with optional syntax highlighting, line numbers,
 * copy functionality, and line highlighting.
 *
 * @example
 * ```tsx
 * <DocsCodeBlock
 *   code="const greeting = 'Hello, World!';"
 *   language="javascript"
 *   filename="example.js"
 *   showLineNumbers
 *   highlightLines={[1]}
 * />
 * ```
 */
export function DocsCodeBlock({
  code,
  language = "text",
  filename,
  showLineNumbers = false,
  highlightLines = [],
  caption,
  hideCopyButton = false,
  className,
}: DocsCodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [code]);

  const lines = code.split("\n");
  const highlightSet = new Set(highlightLines);
  const hasHeader = filename || language !== "text" || !hideCopyButton;

  return (
    <div className={cn("docs-code-block", className)}>
      {hasHeader && (
        <div className="docs-code-header">
          <div className="flex items-center gap-2">
            {filename ? (
              <>
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <span className="docs-code-filename">{filename}</span>
              </>
            ) : (
              language !== "text" && (
                <span className="docs-code-language">{language}</span>
              )
            )}
          </div>

          {!hideCopyButton && (
            <button
              type="button"
              onClick={handleCopy}
              className="docs-code-copy"
              aria-label={copied ? "Copied!" : "Copy code"}
            >
              {copied ? (
                <>
                  <Check className="docs-code-copy-icon" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="docs-code-copy-icon" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      <pre
        className="docs-code-content"
        aria-label={`Code block in ${language}`}
      >
        <code className={`language-${language}`}>
          {showLineNumbers ? (
            <div className="docs-code-lines">
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = highlightSet.has(lineNumber);

                return (
                  <div
                    key={lineNumber}
                    className={cn(
                      "docs-code-line",
                      isHighlighted && "docs-code-line-highlighted"
                    )}
                  >
                    <span className="docs-code-line-number">{lineNumber}</span>
                    <span className="docs-code-line-content">
                      {line || " "}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightSet.has(lineNumber);

              return (
                <div
                  key={lineNumber}
                  className={cn(isHighlighted && "docs-code-line-highlighted")}
                >
                  {line || " "}
                </div>
              );
            })
          )}
        </code>
      </pre>

      {caption && <div className="docs-code-caption">{caption}</div>}
    </div>
  );
}

/**
 * Inline code component for use within text
 */
export function DocsInlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <code className={cn("docs-inline-code", className)}>{children}</code>;
}
