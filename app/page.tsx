"use client";
import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
	ArrowUpDown, 
	MoreHorizontal
} from "lucide-react";
import { competenciesApi } from "@/services/api";
import { Competency, DashboardStats } from "./interfaces/domain-interfaces";
import DashboardStatsCards from "./components/DasboardStatsCards";
import ResponsiveStatsCards from "./components/ResponsiveStatsCards";
import FlexibleStatsCards from "./components/FlexibleStatsCards";
import ErrorCard from "./components/ErrorCard";
import CompetencyByCategoryBarChart from "@/components/charts/CompetencyByCategoryBarChart";
import CompetencyByLevelBarChart from "@/components/charts/CompetencyByLevelBarChart";
import AverageIndicatorsGauge from "@/components/charts/AverageIndicatorsGauge";
import WeightDistributionPie from "@/components/charts/WeightDistributionPie";
import RecentActivityCard from "@/components/RecentActivityCard";
import QuickActionsCard from "@/components/QuickActionsCard";
import EntityTable from "./components/Table";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import TopCompetenciesCard from "@/components/TopCompetenciesCard";
import PageHeader from "./components/PageHeader";

// Main Dashboard Component
export default function Page() {
	const [competencies, setCompetencies] = useState<Competency[]>([]);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch competencies and stats
	const fetchData = async () => {
		try {
			setLoading(true);
			const competenciesData: Array<Competency> | null = await competenciesApi.getAllCompetencies();
			
			if (!Array.isArray(competenciesData)) {
				throw new Error('Invalid response from server: data is not an array');
			}
			
			setCompetencies(competenciesData);

			// Calculate stats
			const stats: DashboardStats = {
				totalCompetencies: competenciesData.length,
				totalBehavioralIndicators: competenciesData.reduce(
					(sum: number, comp: Competency) => sum + (comp.behavioralIndicators?.length || 0),
					0,
				),
				totalAssessmentQuestions: competenciesData.length * 8, // Estimate
				competenciesByCategory: {},
				competenciesByLevel: {},
				averageIndicatorsPerCompetency: 0,
			};

			// Calculate distributions
			competenciesData.forEach((comp: Competency) => {
				stats.competenciesByCategory[comp.category] =
					(stats.competenciesByCategory[comp.category] || 0) + 1;
				stats.competenciesByLevel[comp.level] =
					(stats.competenciesByLevel[comp.level] || 0) + 1;
			});

			stats.averageIndicatorsPerCompetency =
				stats.totalBehavioralIndicators / stats.totalCompetencies;
			setStats(stats);
		} catch (error) {
			console.error("Failed to fetch data:", error);
			setError("Failed to load competencies. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

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

	if (error) {
		return <ErrorCard error={error} callback={fetchData} />;
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2 mobile-container">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 no-mobile-overflow">
				{/* Page Header */}
				<PageHeader 
					title="Dashboard"
					description="Here&apos;s what&apos;s happening with your competency management today."
				/>

				{/* Overview Cards */}
				{stats && (
					<FlexibleStatsCards
						data={{
							type: "dashboard",
							stats: stats
						}}
						loading={false}
					/>
				)}

				{/* Main Dashboard Grid */}
				<div className="@container/main-grid flex flex-wrap gap-4 px-4 lg:px-6">
					{/* Chart Section */}
					<Card className="@container/chart flex-1 min-w-[500px] max-w-none card-mobile-padding">
						<CardHeader>
							<CardTitle className="text-responsive-lg">Competency Overview</CardTitle>
							<CardDescription className="text-responsive">
								Showing distribution of competencies across different categories
							</CardDescription>
						</CardHeader>
						<CardContent className="pl-2">
							{stats && (
								<CompetencyByCategoryBarChart
									data={Object.entries(stats.competenciesByCategory).map(([name, value]) => ({ name, value }))}
								/>
							)}
						</CardContent>
					</Card>

					{/* Recent Activity */}
					<Card className="@container/activity flex-1 min-w-[400px] lg:max-w-[400px] card-mobile-padding">
						<CardHeader>
							<CardTitle className="text-responsive-lg">Recent Activity</CardTitle>
							<CardDescription className="text-responsive">
								Latest updates and changes in your competency framework
							</CardDescription>
						</CardHeader>
						<CardContent>
							<RecentActivityCard />
						</CardContent>
					</Card>
				</div>

				{/* Secondary Grid */}
				<div className="@container/secondary-grid flex flex-wrap gap-4 px-4 lg:px-6">
					{/* Data Table */}
					<Card className="@container/table flex-1 min-w-[600px] max-w-none card-mobile-padding">
						<CardHeader>
							<CardTitle className="text-responsive-lg">Competencies</CardTitle>
							<CardDescription className="text-responsive">
								Manage your competency framework here.
							</CardDescription>
						</CardHeader>
						<CardContent className="overflow-x-auto">
							<EntityTable columns={competencyColumns} data={competencies} />
						</CardContent>
					</Card>

					{/* Side Content */}
					<div className="@container/sidebar flex-1 min-w-[350px] max-w-[450px] space-y-4">
						{/* Quick Actions */}
						<Card className="@container/quick-actions card-mobile-padding">
							<CardHeader>
								<CardTitle className="text-responsive-lg">Quick Actions</CardTitle>
								<CardDescription className="text-responsive">
									Frequently used actions and shortcuts.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<QuickActionsCard />
							</CardContent>
						</Card>

						{/* Performance Metrics */}
						{stats && (
							<Card className="@container/performance card-mobile-padding">
								<CardHeader>
									<CardTitle className="text-responsive-lg">Performance</CardTitle>
									<CardDescription className="text-responsive">
										Average indicators per competency
									</CardDescription>
								</CardHeader>
								<CardContent>
									<AverageIndicatorsGauge value={stats.averageIndicatorsPerCompetency} />
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}