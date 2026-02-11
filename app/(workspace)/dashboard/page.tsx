import { Metadata } from "next";
import { competenciesApi, testTemplatesApi, usersApi, assessmentQuestionsApi } from "@/services/api";
import { Competency, DashboardStats, TestTemplateSummary } from "@/types/domain";
import { UserStats, User } from "@/types/user";
import ErrorCard from "@/components/feedback/ErrorCard";
import DashboardContent from "./_components/dashboard-content";
import { currentUser } from "@clerk/nextjs/server";
import { getPsychometricsDashboardCached } from "@/services/api.cache.psychometrics";
import { calculatePsychometricSummary, type PsychometricSummary } from "@/types/dashboard";

export const metadata: Metadata = {
  title: "Dashboard - SkillSoft",
  description: "Your SkillSoft dashboard - manage competencies, track progress, and develop skills.",
};

async function getDashboardData() {
	try {
		// Fetch all data in parallel for performance
		const [competenciesData, templatesData, questionsData] = await Promise.all([
			competenciesApi.getAllCompetencies().catch(() => []),
			testTemplatesApi.getActiveTemplates().catch(() => []),
			assessmentQuestionsApi.getAllQuestions().catch(() => []),
		]);

		const competencies = Array.isArray(competenciesData) ? competenciesData : [];
		const templates = Array.isArray(templatesData) ? templatesData : [];
		const questions = Array.isArray(questionsData) ? questionsData : [];

		// Calculate stats
		const stats: DashboardStats = {
			totalCompetencies: competencies.length,
			totalBehavioralIndicators: competencies.reduce(
				(sum: number, comp: Competency) => sum + (comp.behavioralIndicators?.length || 0),
				0,
			),
			totalAssessmentQuestions: questions.length,
			competenciesByCategory: {},
			competenciesByLevel: {},
			averageIndicatorsPerCompetency: 0,
		};

		// Calculate distributions
		competencies.forEach((comp: Competency) => {
			stats.competenciesByCategory[comp.category] =
				(stats.competenciesByCategory[comp.category] || 0) + 1;
		});

		stats.averageIndicatorsPerCompetency =
			stats.totalBehavioralIndicators > 0 && stats.totalCompetencies > 0
				? stats.totalBehavioralIndicators / stats.totalCompetencies
				: 0;

		return {
			stats,
			testTemplates: templates,
			error: null
		};
	} catch {
		return {
			stats: null,
			testTemplates: [],
			error: "Failed to load dashboard data. Please try again."
		};
	}
}

async function getUserData(): Promise<{ userStats: UserStats | null; recentUsers: User[] }> {
	try {
		const [statsData, usersData] = await Promise.all([
			usersApi.getUserStats().catch(() => null),
			usersApi.getAllUsers().catch(() => []),
		]);

		// Map the API response to our UserStats type
		const userStats: UserStats | null = statsData ? {
			totalUsers: statsData.totalUsers,
			activeUsers: statsData.activeUsers,
			byRole: {
				admin: statsData.byRole?.ADMIN || 0,
				editor: statsData.byRole?.EDITOR || 0,
				user: statsData.byRole?.USER || 0,
			},
			recentlyActive: statsData.activeUsers,
		} : null;

		return {
			userStats,
			recentUsers: Array.isArray(usersData) ? usersData.slice(0, 5) : [],
		};
	} catch {
		return { userStats: null, recentUsers: [] };
	}
}

async function getCurrentUserInfo() {
	try {
		const user = await currentUser();
		if (!user) return null;

		// Get role from metadata or default to USER
		const role = (user.publicMetadata?.role as 'ADMIN' | 'EDITOR' | 'USER') || 'USER';

		return {
			firstName: user.firstName || undefined,
			role,
		};
	} catch {
		return null;
	}
}

/**
 * Fetch psychometric data for editors/admins.
 * Returns null if user doesn't have permission or if fetch fails.
 */
async function getPsychometricData(role: string | undefined): Promise<PsychometricSummary | null> {
	// Only fetch for editors and admins
	if (!role || role === 'USER') return null;

	try {
		const report = await getPsychometricsDashboardCached();
		if (!report) return null;

		return calculatePsychometricSummary(report);
	} catch {
		// Silently fail - psychometrics widget will show empty state
		return null;
	}
}

// Main Dashboard Component
export default async function DashboardPage() {
	// Fetch all data in parallel
	const [dashboardData, userData, userInfo] = await Promise.all([
		getDashboardData(),
		getUserData(),
		getCurrentUserInfo(),
	]);

	const { stats, testTemplates, error } = dashboardData;
	const { userStats } = userData;

	// Fetch psychometric data based on user role
	const psychometrics = await getPsychometricData(userInfo?.role);

	if (error || !stats) {
		return <ErrorCard error={error || "Failed to load dashboard"} />;
	}

	return (
		<DashboardContent
			stats={stats}
			testTemplates={testTemplates}
			userStats={userStats}
			currentUser={userInfo || undefined}
			psychometrics={psychometrics}
		/>
	);
}
