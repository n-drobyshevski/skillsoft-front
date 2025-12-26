"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TableColumn {
  key: string;
  header: string;
  /** If true, this column becomes the card title on mobile */
  isPrimary?: boolean;
  /** Optional render function for custom cell content */
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  /** Breakpoint at which to switch from cards to table (default: md = 768px) */
  breakpoint?: "sm" | "md" | "lg";
  /** Enable sticky first column on horizontal scroll (desktop) */
  stickyFirstColumn?: boolean;
  /** Custom class names */
  className?: string;
  /** Card variant for mobile display */
  cardVariant?: "default" | "compact" | "bordered";
}

/**
 * ResponsiveTable Component for Documentation
 *
 * Automatically transforms tables to card layouts on mobile devices.
 * Supports:
 * - Card transformation for mobile (< breakpoint)
 * - Horizontal scroll with sticky first column for desktop
 * - Progressive disclosure with expandable cards
 * - Touch-friendly 44px minimum tap targets
 *
 * @example
 * ```tsx
 * <ResponsiveTable
 *   columns={[
 *     { key: "name", header: "Parameter", isPrimary: true },
 *     { key: "type", header: "Type" },
 *     { key: "default", header: "Default" },
 *     { key: "description", header: "Description" }
 *   ]}
 *   data={[
 *     { name: "threshold", type: "float", default: "0.25", description: "..." }
 *   ]}
 * />
 * ```
 */
export function ResponsiveTable({
  columns,
  data,
  breakpoint = "md",
  stickyFirstColumn = true,
  className,
  cardVariant = "bordered",
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(
    new Set()
  );

  const breakpointClass = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
  }[breakpoint];

  const tableBreakpointClass = {
    sm: "hidden sm:block",
    md: "hidden md:block",
    lg: "hidden lg:block",
  }[breakpoint];

  const primaryColumn = columns.find((col) => col.isPrimary) || columns[0];
  const secondaryColumns = columns.filter((col) => col.key !== primaryColumn.key);

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderCellValue = (
    column: TableColumn,
    row: Record<string, unknown>
  ) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    return String(value ?? "—");
  };

  const cardVariantClasses = {
    default: "bg-card",
    compact: "bg-muted/50",
    bordered: "bg-card border",
  };

  return (
    <div className={cn("my-4", className)}>
      {/* Mobile Card View */}
      <div className={cn("space-y-3", breakpointClass)}>
        {data.map((row, rowIndex) => {
          const isExpanded = expandedRows.has(rowIndex);
          const hasMoreContent = secondaryColumns.length > 2;

          return (
            <Card
              key={rowIndex}
              className={cn(
                "overflow-hidden transition-all duration-200",
                cardVariantClasses[cardVariant]
              )}
            >
              <CardContent className="p-0">
                {/* Primary content - always visible */}
                <button
                  type="button"
                  onClick={() => hasMoreContent && toggleRow(rowIndex)}
                  className={cn(
                    "w-full text-left p-3 flex items-start justify-between gap-3",
                    "min-h-[52px] touch-manipulation",
                    hasMoreContent && "cursor-pointer hover:bg-muted/50",
                    !hasMoreContent && "cursor-default"
                  )}
                  aria-expanded={hasMoreContent ? isExpanded : undefined}
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Primary value */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded break-all">
                        {renderCellValue(primaryColumn, row)}
                      </code>
                      {/* Show first secondary column as badge if short */}
                      {secondaryColumns[0] && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {renderCellValue(secondaryColumns[0], row)}
                        </Badge>
                      )}
                    </div>

                    {/* Always show first 2 secondary columns */}
                    <div className="space-y-1.5">
                      {secondaryColumns.slice(1, 3).map((col) => (
                        <div key={col.key} className="text-sm">
                          <span className="text-muted-foreground">
                            {col.header}:{" "}
                          </span>
                          <span className="text-foreground break-words">
                            {renderCellValue(col, row)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expand indicator */}
                  {hasMoreContent && (
                    <div className="shrink-0 mt-1">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </button>

                {/* Expanded content */}
                {hasMoreContent && isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t bg-muted/30 space-y-2">
                    {secondaryColumns.slice(3).map((col) => (
                      <div key={col.key} className="text-sm">
                        <span className="text-muted-foreground font-medium">
                          {col.header}:{" "}
                        </span>
                        <span className="text-foreground break-words">
                          {renderCellValue(col, row)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className={cn("relative", tableBreakpointClass)}>
        {/* Scroll hint gradient */}
        <div
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-200"
          aria-hidden="true"
        />

        {/* Horizontal scroll container */}
        <div
          className="overflow-x-auto scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
          tabIndex={0}
          role="region"
          aria-label="Scrollable table"
        >
          <table className="w-full border-collapse text-sm min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column, colIndex) => (
                  <th
                    key={column.key}
                    className={cn(
                      "text-left p-3 font-semibold whitespace-nowrap",
                      stickyFirstColumn &&
                        colIndex === 0 &&
                        "sticky left-0 bg-muted/50 z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={cn(
                        "p-3",
                        stickyFirstColumn &&
                          colIndex === 0 &&
                          "sticky left-0 bg-background z-10 font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                      )}
                    >
                      {renderCellValue(column, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile scroll hint */}
        <p className="text-xs text-center text-muted-foreground mt-2 lg:hidden">
          Swipe to see more columns →
        </p>
      </div>
    </div>
  );
}

/**
 * Simple wrapper for existing tables that adds horizontal scroll on mobile
 * Use when you don't need card transformation, just scroll handling
 */
export function ScrollableTable({
  children,
  className,
  showHint = true,
}: {
  children: React.ReactNode;
  className?: string;
  showHint?: boolean;
}) {
  return (
    <div className={cn("my-4", className)}>
      <div className="relative">
        {/* Scroll hint gradient - right edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 md:hidden"
          aria-hidden="true"
        />

        <div
          className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
          tabIndex={0}
          role="region"
          aria-label="Scrollable table"
        >
          {children}
        </div>
      </div>

      {showHint && (
        <p className="text-xs text-center text-muted-foreground mt-2 md:hidden">
          Swipe to see more →
        </p>
      )}
    </div>
  );
}
