"use client";
import React, { useState, useMemo } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
  Search,
  SlidersHorizontal,
  X,
  Filter,
  ChevronDown,
  LayoutList,
  TableIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface EntitiesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  filterableColumns?: { [key: string]: string[] }; // Column ID to possible filter values
  /** Primary columns to always show in mobile card view (max 4 recommended) */
  mobileCardPrimaryColumns?: string[];
  /** Force table view even on mobile */
  forceTableView?: boolean;
}

export default function EntitiesTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  filterableColumns = {},
  mobileCardPrimaryColumns,
  forceTableView = false,
}: EntitiesTableProps<TData, TValue>) {
  const t = useTranslations("table");
  const tFilter = useTranslations("filter");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string }>({});
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const isMobile = useIsMobile();

  // Determine if we should show cards view
  const showCardsView = isMobile && !forceTableView && viewMode === "cards";

  // Get unique values for filterable columns
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    
    Object.keys(filterableColumns).forEach(columnId => {
      if (filterableColumns.hasOwnProperty(columnId)) {
        const uniqueValues = new Set<string>();
        data.forEach(row => {
          const rowRecord = row as Record<string, unknown>;
          if (rowRecord.hasOwnProperty(columnId)) {
            const value = rowRecord[columnId];
            if (value !== null && value !== undefined && value !== '') {
              uniqueValues.add(String(value));
            }
          }
        });
        options[columnId] = Array.from(uniqueValues).sort();
      }
    });
    
    return options;
  }, [data, filterableColumns]);
  
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: isMobile ? 8 : 10,
      },
    },
  });

  // Handle global search
  const handleSearch = (value: string) => {
    setGlobalFilter(value);
  };

  // Handle column-specific filters
  const handleColumnFilter = (columnId: string, value: string) => {
    setSelectedFilters(prev => ({ ...prev, [columnId]: value }));
    table.getColumn(columnId)?.setFilterValue(value === 'all' ? '' : value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalFilter('');
    setSelectedFilters({});
    setColumnFilters([]);
    table.resetColumnFilters();
  };
  return (
    <div className="@container/table space-y-4">
      {/* Enhanced Table Controls */}
      <div className="flex flex-col gap-3 @md/table:flex-row @md/table:items-center @md/table:justify-between">
        <div className="flex flex-col gap-3 @sm/table:flex-row @sm/table:items-center flex-1">
          {/* Global Search Input with Column Settings */}
          <div className="flex items-center gap-2 flex-grow justify-between" suppressHydrationWarning>
            <div className="relative flex-grow max-w-lg ">
              <Search className="absolute left-3 top-1/2 h-4 max-w-2xl -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={!isMobile ? t("searchPlaceholder") : t("searchPlaceholderShort")}
                value={globalFilter}
                onChange={(event) => handleSearch(event.target.value)}
                className="pl-9 h-9 bg-background border-input"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
                  onClick={() => handleSearch('')}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">{t("clearSearch")}</span>
                </Button>
              )}
            </div>

            {/* Column Settings Icon Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label={t("columnSettings")}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  {t("toggleColumns")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-sm"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {(column.columnDef.meta as Record<string, string> | undefined)?.label ?? column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters Display */}
          {(table.getState().columnFilters.length > 0 || globalFilter) && (
            <div className="flex items-center gap-2 flex-wrap">
              {globalFilter && (
                <Badge variant="secondary" className="h-6 px-2 text-xs">
                  Search: &ldquo;{globalFilter}&rdquo;
                </Badge>
              )}
              {Object.entries(selectedFilters).map(([columnId, value]) => (
                value !== 'all' && value && (
                  <Badge key={columnId} variant="secondary" className="h-6 px-2 text-xs flex items-center gap-1">
                    {columnId}: {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 hover:bg-muted"
                      onClick={() => handleColumnFilter(columnId, 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )
              ))}
              {(table.getState().columnFilters.length > 0 || globalFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  {t("clearAll")}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Additional Controls (Filters + View Toggle) */}
        <div className="flex items-center gap-2">
          {/* Mobile View Toggle */}
          {isMobile && !forceTableView && (
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="h-9 w-9 p-0 rounded-r-none"
                onClick={() => setViewMode("cards")}
                aria-label={t("cardView")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-9 w-9 p-0 rounded-l-none border-l"
                onClick={() => setViewMode("table")}
                aria-label={t("tableView")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Column Filters Dropdown */}
          {Object.keys(filterOptions).length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden @sm/table:inline">{t("filters")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  {t("filterByColumns")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(filterOptions).map(([columnId, options]) => (
                  <div key={columnId} className="px-2 py-1">
                    <label className="text-xs font-medium capitalize block mb-1">
                      {columnId.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <Select
                      value={selectedFilters[columnId as keyof typeof selectedFilters] ?? 'all'}
                      onValueChange={(value) => handleColumnFilter(columnId, value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={tFilter("all")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{tFilter("all")}</SelectItem>
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      {showCardsView ? (
        <div className="space-y-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const visibleCells = row.getVisibleCells();
              // Determine which columns to show prominently
              const primaryColumnIds = mobileCardPrimaryColumns ||
                visibleCells.slice(0, 4).map(cell => cell.column.id);
              const primaryCells = visibleCells.filter(cell =>
                primaryColumnIds.includes(cell.column.id)
              );
              const secondaryCells = visibleCells.filter(cell =>
                !primaryColumnIds.includes(cell.column.id)
              );

              return (
                <Card
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "transition-all duration-150 active:scale-[0.99]",
                    onRowClick && "cursor-pointer hover:shadow-md hover:border-primary/30"
                  )}
                >
                  <CardHeader className="p-3 pb-2">
                    {/* Primary cell as title (first column) */}
                    {primaryCells[0] && (
                      <div className="font-medium text-sm line-clamp-2">
                        {flexRender(
                          primaryCells[0].column.columnDef.cell,
                          primaryCells[0].getContext()
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {/* Show other primary cells in a grid */}
                    {primaryCells.length > 1 && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {primaryCells.slice(1).map((cell) => (
                          <div key={cell.id} className="space-y-0.5">
                            <div className="text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
                              {(cell.column.columnDef.meta as Record<string, string> | undefined)?.label
                                ?? (typeof cell.column.columnDef.header === 'string'
                                  ? cell.column.columnDef.header
                                  : cell.column.id)}
                            </div>
                            <div className="text-foreground">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Expandable secondary cells */}
                    {secondaryCells.length > 0 && (
                      <details className="group">
                        <summary className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1">
                          <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                          <span>{t("moreFields", { count: secondaryCells.length })}</span>
                        </summary>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t mt-2">
                          {secondaryCells.map((cell) => (
                            <div key={cell.id} className="space-y-0.5">
                              <div className="text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
                                {typeof cell.column.columnDef.header === 'string'
                                  ? cell.column.columnDef.header
                                  : cell.column.id.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-foreground">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="p-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("noResultsFound")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("adjustSearch")}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Modern Table Container */
        <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
          {/* Mobile scroll hint */}
          {isMobile && (
            <div className="flex items-center justify-center gap-1 py-1.5 px-3 bg-muted/30 text-xs text-muted-foreground border-b">
              <ChevronLeft className="h-3 w-3" />
              <span>{t("swipeHint")}</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b bg-muted/30 hover:bg-muted/30">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="h-10 px-3 text-xs font-semibold text-muted-foreground bg-muted/30 @lg/table:px-4 @lg/table:h-12 @lg/table:text-sm first:pl-4 last:pr-4"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => onRowClick?.(row.original)}
                      className={`
                        group cursor-pointer border-b border-border/40 transition-all duration-150
                        hover:bg-muted/40 active:bg-muted/50
                        data-[state=selected]:bg-muted/50
                        ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                      `}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-3 py-3 text-sm @lg/table:px-4 @lg/table:py-4 first:pl-4 last:pr-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t("noResultsFound")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("adjustSearch")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Enhanced Pagination */}
      <div className="flex flex-col gap-4 @md/table:flex-row @md/table:items-center @md/table:justify-between">
        {/* Results Info */}
        <div className="flex flex-col gap-2 @sm/table:flex-row @sm/table:items-center @sm/table:gap-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length === 0 ? (
              t("noItems")
            ) : (
              t("showing", {
                from: table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
                to: Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                ),
                total: table.getFilteredRowModel().rows.length
              })
            )}
          </div>

          {/* Selected Count */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {t("rowsSelected", {
                selected: table.getFilteredSelectedRowModel().rows.length,
                total: table.getFilteredRowModel().rows.length
              })}
            </div>
          )}
        </div>
        
        {/* Navigation Controls */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-center @md/table:justify-end">
            {/* Mobile: Simplified navigation with larger touch targets */}
            <div className="flex @lg/table:hidden items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-10 w-10 p-0 min-w-[44px] min-h-[44px]"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">{t("previousPage")}</span>
              </Button>

              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/30 rounded-md min-w-[80px] justify-center">
                <span className="text-sm font-semibold">
                  {table.getState().pagination.pageIndex + 1}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {table.getPageCount()}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-10 w-10 p-0 min-w-[44px] min-h-[44px]"
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">{t("nextPage")}</span>
              </Button>
            </div>

            {/* Desktop: Full navigation */}
            <div className="hidden @lg/table:flex @lg/table:items-center @lg/table:gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">{t("firstPage")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">{t("previousPage")}</span>
                </Button>
              </div>

              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium">
                  {t("pageOf", { current: table.getState().pagination.pageIndex + 1, total: table.getPageCount() })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">{t("nextPage")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">{t("lastPage")}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}