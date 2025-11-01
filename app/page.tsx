import React from "react";
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
import CompetencyTable from "./components/CompetencyTable";
import PageHeader from "./components/PageHeader";

async function getDashboardData() {
	try {
		const competenciesData: Array<Competency> | null = await competenciesApi.getAllCompetencies();
		
		if (!Array.isArray(competenciesData)) {
			// In a real app, you might want to log this error to a service
			console.error('Invalid response from server: data is not an array');
			return { competencies: [], stats: null, error: "Failed to load competencies. Invalid data format." };
		}
		
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
			stats.totalBehavioralIndicators > 0 && stats.totalCompetencies > 0
				? stats.totalBehavioralIndicators / stats.totalCompetencies
				: 0;

		return { competencies: competenciesData, stats, error: null };
	} catch (error) {
		console.error("Failed to fetch data:", error);
		return { competencies: [], stats: null, error: "Failed to load competencies. Please try again." };
	}
}

// Main Dashboard Component
export default async function Page() {
	const { competencies, stats, error } = await getDashboardData();

	if (error) {
		return <ErrorCard error={error} />;
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2 mobile-container">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 no-mobile-overflow">
				{/* Page Header */}
				<PageHeader 
					title="Dashboard"
					description="Here's what's happening with your competency management today."
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
							<CompetencyTable competencies={competencies} />
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