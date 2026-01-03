'use client';

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import {
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
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

import {
	ArrowUpDown,
	MoreHorizontal,
	Search,
	Settings2,
	Eye,
	Download,
	Filter,
	Plus,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
} from "lucide-react";

// Helper functions
const levelToColor = (level: string): string => {
	const colors: { [key: string]: string } = {
		NOVICE:
			"border-red-500/20 text-red-700 bg-red-50/90 dark:bg-red-950/90 dark:text-red-200 dark:border-red-400/30",
		DEVELOPING:
			"border-amber-500/20 text-amber-700 bg-amber-50/90 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-400/30",
		PROFICIENT:
			"border-emerald-500/20 text-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-400/30",
		ADVANCED:
			"border-blue-500/20 text-blue-700 bg-blue-50/90 dark:bg-blue-950/90 dark:text-blue-200 dark:border-blue-400/30",
		EXPERT:
			"border-violet-500/20 text-violet-700 bg-violet-50/90 dark:bg-violet-950/90 dark:text-violet-200 dark:border-violet-400/30",
	};
	return colors[level] || colors["NOVICE"];
};

interface BehavioralIndicator {
	id: string;
	title: string;
	description: string;
	observabilityLevel: string;
	measurementType: string;
	weight: number;
	examples: string;
	counterExamples: string;
	isActive: boolean;
	approvalStatus: string;
	orderIndex: number;
	competency: {
		id: string;
		name: string;
		category: string;
	};
}

const BehavioralIndicatorsPage: React.FC = () => {
	const t = useTranslations("table");
	const tIndicator = useTranslations("indicator");
	const tStatus = useTranslations("status");
	const tCompetency = useTranslations("competency");

	const [indicators, setIndicators] = useState<BehavioralIndicator[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	// Column definitions - inside component for translations
	const columns: ColumnDef<BehavioralIndicator>[] = [
		{
			accessorKey: "title",
			header: ({ column }: { column: any }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						size="sm"
						className="-ml-4"
					>
						{t("title")}
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }: { row: any }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.getValue("title")}</span>
					<span className="text-sm text-muted-foreground">
						{row.original.description}
					</span>
				</div>
			),
		},
		{
			accessorKey: "competency",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{tCompetency("title")}
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }: { row: any }) => (
				<div className="flex items-center gap-2">
					<Link
						href={`/hr/competencies/${row.original.competency.id}`}
						className="text-primary hover:underline"
					>
						{row.original.competency.name}
					</Link>
					<Badge variant="secondary" className="capitalize">
						{row.original.competency.category.toLowerCase().replace("_", " ")}
					</Badge>
				</div>
			),
			sortingFn: (a: any, b: any) =>
				a.original.competency.name.localeCompare(b.original.competency.name),
		},
		{
			accessorKey: "observabilityLevel",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{t("level")}
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }: { row: any }) => {
				const level = row.getValue("observabilityLevel") as string;
				return (
					<Badge variant="outline" className={levelToColor(level)}>
						{level}
					</Badge>
				);
			},
		},
		{
			accessorKey: "weight",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{t("weight")}
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const weight = row.getValue("weight") as number;
				return <span className="font-medium">{weight.toFixed(2)}</span>;
			},
		},
		{
			accessorKey: "isActive",
			header: t("status"),
			cell: ({ row }) => {
				const isActive = row.getValue("isActive") as boolean;
				return (
					<Badge variant={isActive ? "default" : "secondary"}>
						{isActive ? tStatus("active") : tStatus("inactive")}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const indicator = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">{t("openMenu")}</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => navigator.clipboard.writeText(indicator.id)}
							>
								{t("copyId")}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<Eye className="mr-2 h-4 w-4" />
								{t("viewDetails")}
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings2 className="mr-2 h-4 w-4" />
								{tIndicator("edit")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	useEffect(() => {
		const fetchIndicators = async () => {
			try {
				const response = await fetch(
					"http://localhost:8080/api/behavioral-indicators",
				);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setIndicators(data);
			} catch (error) {
				console.error("Error fetching indicators:", error);
				// You might want to add error state handling here
			} finally {
				setLoading(false);
			}
		};

		fetchIndicators();
	}, []);

	// The memoized filtering and sorting is now handled by the table

	// Initialize table
	const table = useReactTable({
		data: indicators,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
					<p className="text-[var(--text-secondary)]">
						{t("loadingIndicators")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full p-8 space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{tIndicator("title")}
					</h1>
					<p className="text-muted-foreground">
						{t("manageIndicators")}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Download className="mr-2 h-4 w-4" />
						{t("exportAll")}
					</Button>
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						{t("newIndicator")}
					</Button>
				</div>
			</div>

			<div className="space-y-4">
				{/* Filters */}
				<div className="flex flex-1 items-center space-x-2">
					<div className="flex items-center gap-2 flex-1">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={t("searchIndicators")}
								value={
									(table.getColumn("title")?.getFilterValue() as string) ?? ""
								}
								onChange={(event) =>
									table.getColumn("title")?.setFilterValue(event.target.value)
								}
								className="pl-9"
							/>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="ml-auto">
									<Filter className="mr-2 h-4 w-4" />
									{t("view")}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{table
									.getAllColumns()
									.filter((column) => column.getCanHide())
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value: boolean) =>
													column.toggleVisibility(value)
												}
											>
												{column.id}
											</DropdownMenuCheckboxItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										{t("noIndicatorsFound")}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<div className="flex items-center justify-between px-2">
					<div className="flex-1 text-sm text-muted-foreground">
						{t("rowsSelected", {
							selected: table.getFilteredSelectedRowModel().rows.length,
							total: table.getFilteredRowModel().rows.length
						})}
					</div>
					<div className="flex items-center space-x-6 lg:space-x-8">
						<div className="flex items-center space-x-2">
							<p className="text-sm font-medium">{t("rowsPerPage")}</p>
							<select
								value={table.getState().pagination.pageSize}
								onChange={(e) => {
									table.setPageSize(Number(e.target.value));
								}}
								className="h-8 w-[70px] rounded-md border border-input bg-transparent"
							>
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<option key={pageSize} value={pageSize}>
										{pageSize}
									</option>
								))}
							</select>
						</div>
						<div className="flex w-[100px] items-center justify-center text-sm font-medium">
							{t("pageOf", {
								current: table.getState().pagination.pageIndex + 1,
								total: table.getPageCount()
							})}
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">{t("firstPage")}</span>
								<ChevronLeftIcon className="h-4 w-4" />
								<ChevronLeftIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">{t("previousPage")}</span>
								<ChevronLeftIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">{t("nextPage")}</span>
								<ChevronRightIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">{t("lastPage")}</span>
								<ChevronRightIcon className="h-4 w-4" />
								<ChevronRightIcon className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BehavioralIndicatorsPage;
