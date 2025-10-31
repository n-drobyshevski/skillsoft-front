"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

import { Competency } from "@/interfaces/domain-interfaces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EntityTable from "../components/Table";

interface CompetencyTableProps {
	data: Competency[];
}

const CompetencyTable: React.FC<CompetencyTableProps> = ({ data }) => {
	const competencyColumns: ColumnDef<Competency>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<Button
					variant="link"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 text-muted-foreground"
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => (
				<Link href={`/competencies/${row.original.id}`} className="font-medium text-primary hover:underline">
					{row.getValue("name")}
				</Link>
			),
		},
		{
			accessorKey: "category",
			header: "Category",
		},
		{
			accessorKey: "level",
			header: "Level",
		},
		{
			accessorKey: "behavioralIndicators",
			header: "Indicators",
			cell: ({ row }) => row.original.behavioralIndicators?.length || 0,
		},
		{
			accessorKey: "isActive",
			header: "Status",
			cell: ({ row }) => {
				const isActive = row.getValue("isActive") as boolean;
				return (
					<Badge variant={isActive ? "default" : "secondary"}>
						{isActive ? "Active" : "Inactive"}
					</Badge>
				);
			},
		},
	];

	return <EntityTable columns={competencyColumns} data={data} />;
};

export default CompetencyTable;