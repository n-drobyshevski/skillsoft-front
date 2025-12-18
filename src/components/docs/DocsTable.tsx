"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DocsTableProps {
  /**
   * Table content
   */
  children: React.ReactNode;

  /**
   * Optional caption for the table
   */
  caption?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DocsTable Component
 *
 * A responsive table wrapper with horizontal scroll on mobile.
 *
 * @example
 * ```tsx
 * <DocsTable caption="API Parameters">
 *   <DocsTableHeader>
 *     <DocsTableRow>
 *       <DocsTableHead>Parameter</DocsTableHead>
 *       <DocsTableHead>Type</DocsTableHead>
 *       <DocsTableHead>Description</DocsTableHead>
 *     </DocsTableRow>
 *   </DocsTableHeader>
 *   <DocsTableBody>
 *     <DocsTableRow>
 *       <DocsTableCell>id</DocsTableCell>
 *       <DocsTableCell>string</DocsTableCell>
 *       <DocsTableCell>Unique identifier</DocsTableCell>
 *     </DocsTableRow>
 *   </DocsTableBody>
 * </DocsTable>
 * ```
 */
export function DocsTable({ children, caption, className }: DocsTableProps) {
  return (
    <div className={cn("docs-table-wrapper", className)}>
      <table className="docs-table">{children}</table>
      {caption && <div className="docs-table-caption">{caption}</div>}
    </div>
  );
}

/**
 * Table header container
 */
export function DocsTableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <thead className={className}>{children}</thead>;
}

/**
 * Table body container
 */
export function DocsTableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={className}>{children}</tbody>;
}

/**
 * Table row
 */
export function DocsTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={className}>{children}</tr>;
}

/**
 * Table header cell
 */
export function DocsTableHead({
  children,
  className,
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <th className={className} style={{ textAlign: align }}>
      {children}
    </th>
  );
}

/**
 * Table data cell
 */
export function DocsTableCell({
  children,
  className,
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <td className={className} style={{ textAlign: align }}>
      {children}
    </td>
  );
}

/**
 * Simple table component for markdown-style tables
 */
interface SimpleTableProps {
  /**
   * Column headers
   */
  headers: string[];

  /**
   * Table data rows
   */
  rows: (string | React.ReactNode)[][];

  /**
   * Optional caption
   */
  caption?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function DocsSimpleTable({
  headers,
  rows,
  caption,
  className,
}: SimpleTableProps) {
  return (
    <DocsTable caption={caption} className={className}>
      <DocsTableHeader>
        <DocsTableRow>
          {headers.map((header, index) => (
            <DocsTableHead key={index}>{header}</DocsTableHead>
          ))}
        </DocsTableRow>
      </DocsTableHeader>
      <DocsTableBody>
        {rows.map((row, rowIndex) => (
          <DocsTableRow key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <DocsTableCell key={cellIndex}>{cell}</DocsTableCell>
            ))}
          </DocsTableRow>
        ))}
      </DocsTableBody>
    </DocsTable>
  );
}
