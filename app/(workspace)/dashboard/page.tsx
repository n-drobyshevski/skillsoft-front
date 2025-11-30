
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { competenciesApi } from "@/services/api";
import { Competency, DashboardStats } from "@/types/domain";
import FlexibleStatsCards from "@/components/data-display/FlexibleStatsCards";
import ErrorCard from "@/components/feedback/ErrorCard";
import CompetencyByCategoryBarChart from "@/components/data-display/charts/CompetencyByCategoryBarChart";
import AverageIndicatorsGauge from "@/components/data-display/charts/AverageIndicatorsGauge";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import CompetencyTable from "@/components/data-display/CompetencyTable";
import PageHeader from "@/components/common/PageHeader";
import { ClientOnly } from "@/components/common/ClientOnly";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Dashboard - SkillSoft",
  description: "Your SkillSoft dashboard - manage competencies, track progress, and develop skills.",
};

async function getDashboardData() {
	try {
		const competenciesData: Array<Competency> | null = await competenciesApi.getAllCompetencies();
		
		if (!Array.isArray(competenciesData)) {
			// In a real app, you might want to log this error to a service
			// Invalid response from server: data is not an array
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
	} catch {
		// Failed to fetch data - error handled
		return { competencies: [], stats: null, error: "Failed to load competencies. Please try again." };
	}
}

// Main Dashboard Component
export default async function DashboardPage() {
  

	const { competencies, stats, error } = await getDashboardData();

	if (error) {
		return <ErrorCard error={error} />;
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
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
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Chart Section */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Competency Overview</CardTitle>
						<CardDescription>
							Showing distribution of competencies across different categories
						</CardDescription>
					</CardHeader>
					<CardContent className="pl-2">
						{stats && (
							<ClientOnly fallback={
								<div className="h-[300px] flex items-center justify-center text-muted-foreground">
									Loading chart...
								</div>
							}>
								<CompetencyByCategoryBarChart
									data={Object.entries(stats.competenciesByCategory).map(([name, value]) => ({ name, value }))}
								/>
							</ClientOnly>
						)}
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Latest updates and changes in your competency framework
						</CardDescription>
					</CardHeader>
					<CardContent>
						<RecentActivityCard />
					</CardContent>
				</Card>
			</div>

			{/* Secondary Grid */}
			<div className="grid gap-4 md:grid-cols-3">
				{/* Data Table */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Competencies</CardTitle>
						<CardDescription>
							Manage your competency framework here.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ClientOnly fallback={
							<div className="h-[200px] flex items-center justify-center text-muted-foreground">
								Loading table...
							</div>
						}>
							<CompetencyTable competencies={competencies} />
						</ClientOnly>
					</CardContent>
				</Card>

				{/* Side Content */}
				<div className="space-y-4">
					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
							<CardDescription>
								Frequently used actions and shortcuts.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<QuickActionsCard />
						</CardContent>
					</Card>

					{/* Performance Metrics */}
					{stats && (
						<Card>
							<CardHeader>
								<CardTitle>Performance</CardTitle>
								<CardDescription>
									Average indicators per competency
								</CardDescription>
							</CardHeader>
						<CardContent>
							<ClientOnly fallback={
								<div className="h-[150px] flex items-center justify-center text-muted-foreground">
									Loading gauge...
								</div>
							}>
								<AverageIndicatorsGauge value={stats.averageIndicatorsPerCompetency} />
							</ClientOnly>
						</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}