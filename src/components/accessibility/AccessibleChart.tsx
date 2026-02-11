'use client';

import * as React from 'react';
import { Table, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/**
 * AccessibleChart - Wrapper that provides data table alternatives for charts
 *
 * Features:
 * - Collapsible data table for screen reader users
 * - Keyboard accessible toggle
 * - CSV export functionality
 * - ARIA live regions for dynamic updates
 * - Focus management
 */

export interface ChartDataColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

export interface AccessibleChartProps {
  /** The chart component to render */
  children: React.ReactNode;

  /** Chart title for accessibility */
  title: string;

  /** Optional description for screen readers */
  description?: string;

  /** Data array to display in table */
  data: Record<string, unknown>[];

  /** Column definitions for the data table */
  columns: ChartDataColumn[];

  /** Whether to show the data table toggle by default */
  showTableToggle?: boolean;

  /** Whether to show export button */
  showExport?: boolean;

  /** Custom class name */
  className?: string;

  /** ID for ARIA relationships */
  id?: string;
}

/**
 * Format a value for display
 */
function formatValue(value: unknown, format?: (v: unknown) => string): string {
  if (format) {
    return format(value);
  }
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }
  return String(value);
}

/**
 * Generate CSV content from data
 */
function generateCSV(data: Record<string, unknown>[], columns: ChartDataColumn[]): string {
  const headers = columns.map(c => `"${c.label}"`).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const value = formatValue(row[col.key], col.format);
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AccessibleChart({
  children,
  title,
  description,
  data,
  columns,
  showTableToggle = true,
  showExport = true,
  className,
  id,
}: AccessibleChartProps) {
  const [isTableExpanded, setIsTableExpanded] = React.useState(false);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const chartId = id || React.useId();
  const tableId = `${chartId}-table`;
  const descriptionId = `${chartId}-description`;

  // Focus management when table expands
  React.useEffect(() => {
    if (isTableExpanded && tableRef.current) {
      const firstCell = tableRef.current.querySelector('th, td');
      if (firstCell instanceof HTMLElement) {
        firstCell.focus();
      }
    }
  }, [isTableExpanded]);

  const handleExport = () => {
    const csv = generateCSV(data, columns);
    const filename = `${title.replace(/\s+/g, '_').toLowerCase()}_data.csv`;
    downloadCSV(csv, filename);
  };

  return (
    <figure
      className={cn('relative', className)}
      role="figure"
      aria-labelledby={chartId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Screen reader description */}
      {description && (
        <p id={descriptionId} className="sr-only">
          {description}
        </p>
      )}

      {/* Chart content */}
      <div
        role="img"
        aria-label={`${title}. ${data.length} data points. Use the "View data as table" button for detailed data.`}
      >
        {children}
      </div>

      {/* Accessibility controls */}
      {(showTableToggle || showExport) && (
        <div className="flex items-center gap-2 mt-3" role="toolbar" aria-label="Chart accessibility controls">
          {showTableToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              aria-expanded={isTableExpanded}
              aria-controls={tableId}
              className="gap-2 text-xs"
            >
              <Table className="h-3.5 w-3.5" aria-hidden="true" />
              <span>View data as table</span>
              {isTableExpanded ? (
                <ChevronUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              )}
            </Button>
          )}

          {showExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="gap-2 text-xs"
              aria-label={`Download ${title} data as CSV`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          )}
        </div>
      )}

      {/* Expandable data table */}
      {showTableToggle && (
        <div
          id={tableId}
          ref={tableRef}
          className={cn(
            'overflow-hidden transition-all duration-200',
            isTableExpanded ? 'mt-4 max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}
          aria-hidden={!isTableExpanded}
        >
          <div className="border rounded-lg overflow-auto max-h-[360px]">
            <UITable>
              <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm">
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className="text-xs font-medium">
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-muted-foreground py-8"
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((col) => (
                        <TableCell key={col.key} className="text-xs">
                          {formatValue(row[col.key], col.format)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </UITable>
          </div>

          {/* Table summary for screen readers */}
          <div className="sr-only" aria-live="polite">
            Table showing {data.length} rows of data for {title}
          </div>
        </div>
      )}

      {/* Caption */}
      <figcaption id={chartId} className="sr-only">
        {title}
        {description && `. ${description}`}
      </figcaption>
    </figure>
  );
}

/**
 * ChartSummary - Screen reader summary for complex charts
 */
export interface ChartSummaryProps {
  title: string;
  totalItems: number;
  highlights?: Array<{
    label: string;
    value: string | number;
  }>;
}

export function ChartSummary({ title, totalItems, highlights }: ChartSummaryProps) {
  return (
    <div className="sr-only" role="region" aria-label={`${title} summary`}>
      <h3>{title}</h3>
      <p>Total items: {totalItems}</p>
      {highlights && highlights.length > 0 && (
        <ul>
          {highlights.map((h, i) => (
            <li key={i}>
              {h.label}: {h.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * useChartAnnouncer - Hook for announcing chart updates to screen readers
 */
export function useChartAnnouncer() {
  const [announcement, setAnnouncement] = React.useState('');

  const announce = React.useCallback((message: string) => {
    // Clear first to ensure re-announcement
    setAnnouncement('');
    requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  }, []);

  const Announcer = React.useCallback(() => (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  ), [announcement]);

  return { announce, Announcer };
}

export default AccessibleChart;
