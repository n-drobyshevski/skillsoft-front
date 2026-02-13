import { Metadata } from "next";
import { DashboardStats as DomainDashboardStats } from "@/types/domain";
import ErrorCard from "@/components/feedback/ErrorCard";
import DashboardContent from "./_components/dashboard-content";
import { currentUser } from "@clerk/nextjs/server";
import { getDashboardDataCached } from "@/services/api.cache.dashboard";

export const metadata: Metadata = {
  title: "Dashboard - SkillSoft",
  description: "Your SkillSoft dashboard - manage competencies, track progress, and develop skills.",
};

async function getCurrentUserInfo() {
	try {
		const user = await currentUser();
		if (!user) return null;

		// Get role from metadata or default to USER
		const role = (user.publicMetadata?.role as 'ADMIN' | 'EDITOR' | 'USER') || 'USER';

		return {
			id: user.id,
			firstName: user.firstName || undefined,
			role,
		};
	} catch {
		return null;
	}
}

// Main Dashboard Component
export default async function DashboardPage() {
	// Fetch current user info (dynamic, outside cache)
	const userInfo = await getCurrentUserInfo();

	// Fetch all dashboard data via cached aggregated function
	const dashboardSummary = await getDashboardDataCached(userInfo?.id, userInfo?.role);

	if (!dashboardSummary?.stats) {
		return <ErrorCard error="Failed to load dashboard" />;
	}

	// Map DashboardSummary stats to the shape DashboardContent expects
	const stats: DomainDashboardStats = {
		totalCompetencies: dashboardSummary.stats.totalCompetencies,
		totalBehavioralIndicators: dashboardSummary.stats.totalIndicators,
		totalAssessmentQuestions: dashboardSummary.stats.totalQuestions,
		competenciesByCategory: dashboardSummary.stats.competenciesByCategory,
		competenciesByLevel: {},
		averageIndicatorsPerCompetency: dashboardSummary.stats.averageIndicatorsPerCompetency,
	};

	return (
		<DashboardContent
			stats={stats}
			testTemplates={dashboardSummary.activeTemplates ?? []}
			userStats={dashboardSummary.userStats ?? null}
			currentUser={userInfo ? { firstName: userInfo.firstName, role: userInfo.role } : undefined}
			psychometrics={dashboardSummary.psychometrics}
		/>
	);
}
