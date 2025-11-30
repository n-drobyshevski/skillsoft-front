"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  User,
  UserRole,
  getUserInitials,
  getUserFullName,
  getRoleBadgeColor,
  getRoleDisplayName,
  getUserStatus,
  canUserAccess,
} from "@/types/user";
import {
  ArrowUpDown,
  Eye,
  ExternalLink,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  UserX,
  UserCheck,
  Clock,
  Calendar,
  Search,
  Ban,
  Lock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Download,
  Users,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import UserDrawer from "./UserDrawer";

interface UsersTableProps {
  users: User[];
}

type RoleFilter = "all" | UserRole;

export default function UsersTable({ users }: UsersTableProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const isMobile = useIsMobile();

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <ShieldAlert className="h-3.5 w-3.5" />;
      case UserRole.EDITOR:
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case UserRole.USER:
        return <Shield className="h-3.5 w-3.5" />;
      default:
        return <Shield className="h-3.5 w-3.5" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Filter data by role
  const filteredData = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter(user => user.role === roleFilter);
  }, [users, roleFilter]);

  // Role counts for tabs
  const roleCounts = useMemo(() => ({
    all: users.length,
    [UserRole.ADMIN]: users.filter(u => u.role === UserRole.ADMIN).length,
    [UserRole.EDITOR]: users.filter(u => u.role === UserRole.EDITOR).length,
    [UserRole.USER]: users.filter(u => u.role === UserRole.USER).length,
  }), [users]);

  const columns: ColumnDef<User>[] = [
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
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={getUserFullName(user)} />}
                <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary text-sm font-semibold">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              {(user.banned || user.locked) && (
                <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center ${user.banned ? 'bg-red-500' : 'bg-amber-500'}`}>
                  {user.banned ? <Ban className="h-2.5 w-2.5 text-white" /> : <Lock className="h-2.5 w-2.5 text-white" />}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">
                  {getUserFullName(user)}
                </span>
                {user.username && (
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                )}
              </div>
              {user.email && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                  <Mail className="h-3 w-3 shrink-0 opacity-70" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA = getUserFullName(rowA.original).toLowerCase();
        const nameB = getUserFullName(rowB.original).toLowerCase();
        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return (
          <Badge
            variant="outline"
            className={`gap-1.5 font-medium px-2.5 py-0.5 ${getRoleBadgeColor(role)}`}
          >
            {getRoleIcon(role)}
            <span>{getRoleDisplayName(role)}</span>
          </Badge>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id) as string);
      },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original;
        const status = getUserStatus(user);
        
        const getStatusStyles = () => {
          switch (status.variant) {
            case 'success':
              return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
            case 'warning':
              return "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
            case 'destructive':
              return "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400";
            default:
              return "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
          }
        };

        const getDotColor = () => {
          switch (status.variant) {
            case 'success': return 'bg-emerald-500';
            case 'warning': return 'bg-amber-500';
            case 'destructive': return 'bg-red-500';
            default: return 'bg-gray-400';
          }
        };

        return (
          <Badge
            variant="secondary"
            className={`font-medium ${getStatusStyles()}`}
          >
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getDotColor()}`} />
            {status.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lastSignInAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden md:flex"
        >
          Last Sign In
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const lastSignInAt = row.original.lastSignInAt;
        return (
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span>{formatRelativeTime(lastSignInAt)}</span>
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
          className="hidden lg:flex"
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
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
        const user = row.original;
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(user.id);
                }}
              >
                Copy User ID
              </DropdownMenuItem>
              {user.email && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(user.email!);
                  }}
                >
                  Copy Email
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(user);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Quick View
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/users/${user.id}`} className="flex items-center cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <UserCog className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.isActive ? (
                <DropdownMenuItem 
                  className="text-orange-600 dark:text-orange-400 focus:text-orange-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate
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
      {/* suppressHydrationWarning: browser extensions (e.g., Proton Pass) may inject attributes */}
      <div className="flex flex-col gap-4" suppressHydrationWarning>
        {/* Role Filter Tabs */}
        <Tabs 
          value={roleFilter} 
          onValueChange={(value) => setRoleFilter(value as RoleFilter)}
          className="w-full"
        >
          <TabsList className="h-auto p-1 bg-muted/50 w-full grid grid-cols-4 gap-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <Users className="h-3.5 w-3.5 hidden sm:inline" />
              All
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {roleCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value={UserRole.ADMIN}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <ShieldAlert className="h-3.5 w-3.5 hidden sm:inline text-red-500" />
              Admin
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {roleCounts[UserRole.ADMIN]}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value={UserRole.EDITOR}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5 hidden sm:inline text-blue-500" />
              Editor
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {roleCounts[UserRole.EDITOR]}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value={UserRole.USER}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm"
            >
              <Shield className="h-3.5 w-3.5 hidden sm:inline text-green-500" />
              User
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {roleCounts[UserRole.USER]}
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
              placeholder="Search users by name or email..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 w-full"
            />
          </div>

          {/* Bulk Actions (show when rows selected) */}
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 ml-auto">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
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
                      {column.id === "isActive" ? "Status" : column.id}
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
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs text-muted-foreground">
                        {globalFilter 
                          ? "Try adjusting your search query" 
                          : "No users match the current filter"}
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
            Showing{" "}
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
            {" "}of{" "}
            <span className="font-medium text-foreground">
              {table.getFilteredRowModel().rows.length}
            </span>
            {" "}users
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

      {/* User Drawer */}
      {selectedUser && (
        <UserDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          user={selectedUser}
        />
      )}
    </div>
  );
}
