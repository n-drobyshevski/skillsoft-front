"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ManagedTeamSummary,
  TeamStatus,
  getTeamStatusKey,
  getTeamStatusBadgeVariant,
} from "@/types/team";
import { useFormattedDates } from "@/hooks/useFormattedDates";
import {
  ArrowUpDown,
  Eye,
  ExternalLink,
  MoreHorizontal,
  Users,
  UserCog,
  Clock,
  Calendar,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Download,
  UsersRound,
  FileEdit,
  CheckCircle,
  Archive,
  Play,
  Crown,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import TeamDrawer from "./TeamDrawer";

interface TeamsTableProps {
  teams: ManagedTeamSummary[];
}

type StatusFilter = "all" | TeamStatus;

export default function TeamsTable({ teams }: TeamsTableProps) {
  const router = useRouter();
  const t = useTranslations('teams');
  const { formatDate, formatRelativeTime } = useFormattedDates();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ManagedTeamSummary | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const isMobile = useIsMobile();

  const handleViewDetails = (team: ManagedTeamSummary) => {
    setSelectedTeam(team);
    setIsDrawerOpen(true);
  };

  const getStatusIcon = (status: TeamStatus) => {
    switch (status) {
      case TeamStatus.DRAFT:
        return <FileEdit className="h-3.5 w-3.5" />;
      case TeamStatus.ACTIVE:
        return <CheckCircle className="h-3.5 w-3.5" />;
      case TeamStatus.ARCHIVED:
        return <Archive className="h-3.5 w-3.5" />;
      default:
        return <FileEdit className="h-3.5 w-3.5" />;
    }
  };

  const getStatusStyles = (status: TeamStatus) => {
    const variant = getTeamStatusBadgeVariant(status);
    switch (variant) {
      case 'success':
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
      case 'secondary':
        return "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  const getDotColor = (status: TeamStatus) => {
    const variant = getTeamStatusBadgeVariant(status);
    switch (variant) {
      case 'success': return 'bg-emerald-500';
      case 'secondary': return 'bg-gray-400';
      default: return 'bg-amber-500';
    }
  };

  // Filter data by status
  const filteredData = useMemo(() => {
    if (statusFilter === "all") return teams;
    return teams.filter(team => team.status === statusFilter);
  }, [teams, statusFilter]);

  // Status counts for tabs
  const statusCounts = useMemo(() => ({
    all: teams.length,
    [TeamStatus.DRAFT]: teams.filter(t => t.status === TeamStatus.DRAFT).length,
    [TeamStatus.ACTIVE]: teams.filter(t => t.status === TeamStatus.ACTIVE).length,
    [TeamStatus.ARCHIVED]: teams.filter(t => t.status === TeamStatus.ARCHIVED).length,
  }), [teams]);

  const getTeamInitials = (name: string): string => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const columns: ColumnDef<ManagedTeamSummary>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean | "indeterminate") => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t('table.columns.team')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const team = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary text-sm font-semibold">
                {getTeamInitials(team.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">
                  {team.name}
                </span>
              </div>
              {team.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {team.description}
                </p>
              )}
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA = rowA.original.name.toLowerCase();
        const nameB = rowB.original.name.toLowerCase();
        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('table.columns.status')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as TeamStatus;
        const statusKey = getTeamStatusKey(status);
        return (
          <Badge
            variant="secondary"
            className={`font-medium gap-1.5 ${getStatusStyles(status)}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${getDotColor(status)}`} />
            {t(`status.${statusKey}`)}
          </Badge>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id) as string);
      },
    },
    {
      accessorKey: "memberCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('table.columns.members')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const team = row.original;
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{team.memberCount}</span>
            {team.leader && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Crown className="h-3 w-3 text-amber-500" />
                <span className="truncate max-w-[100px]">{team.leader.fullName}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden md:flex"
        >
          {t('table.columns.created')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            <span>{formatDate(createdAt)}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const team = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>{t('table.columns.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(team.id);
                }}
              >
                {t('table.menu.copyTeamId')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(team);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                {t('table.menu.quickView')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/teams/${team.id}`);
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('table.menu.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/teams/${team.id}/edit`);
                }}
              >
                <UserCog className="mr-2 h-4 w-4" />
                {t('table.menu.editTeam')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {team.status === TeamStatus.DRAFT && (
                <DropdownMenuItem
                  className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t('table.menu.activate')}
                </DropdownMenuItem>
              )}
              {team.status !== TeamStatus.ARCHIVED && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {t('table.menu.archive')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
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
    globalFilterFn: "includesString",
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

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* Toolbar with Tabs and Search */}
      <div className="flex flex-col gap-4" suppressHydrationWarning>
        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          className="w-full"
        >
          <TabsList className="h-auto p-1 bg-muted/50 w-full grid grid-cols-4 gap-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <UsersRound className="h-3.5 w-3.5 hidden sm:inline" />
              {t('table.filters.all')}
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value={TeamStatus.DRAFT}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <FileEdit className="h-3.5 w-3.5 hidden sm:inline text-amber-500" />
              {t('table.filters.draft')}
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {statusCounts[TeamStatus.DRAFT]}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value={TeamStatus.ACTIVE}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <CheckCircle className="h-3.5 w-3.5 hidden sm:inline text-emerald-500" />
              {t('table.filters.active')}
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {statusCounts[TeamStatus.ACTIVE]}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value={TeamStatus.ARCHIVED}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <Archive className="h-3.5 w-3.5 hidden sm:inline text-gray-500" />
              {t('table.filters.archived')}
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {statusCounts[TeamStatus.ARCHIVED]}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Actions Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('table.search.placeholder')}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 w-full"
            />
          </div>

          {/* Bulk Actions (show when rows selected) */}
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">
                {t('table.bulk.selected', { count: selectedCount })}
              </span>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t('table.bulk.export')}</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('table.bulk.archive')}</span>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 ml-auto">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('table.view.toggleColumns')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>{t('table.view.toggleColumns')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 font-semibold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleViewDetails(row.original)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <UsersRound className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{t('table.empty.noTeams')}</p>
                      <p className="text-xs text-muted-foreground">
                        {globalFilter
                          ? t('table.empty.adjustSearch')
                          : t('table.empty.createFirst')}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {t('table.pagination.showing')}{" "}
            <span className="font-medium text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
            {" "}-{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>
            {" "}{t('table.pagination.of')}{" "}
            <span className="font-medium text-foreground">
              {table.getFilteredRowModel().rows.length}
            </span>
            {" "}{t('table.pagination.teams')}
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center gap-1 text-sm px-2">
              <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{table.getPageCount()}</span>
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Team Drawer */}
      {selectedTeam && (
        <TeamDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          team={selectedTeam}
        />
      )}
    </div>
  );
}
