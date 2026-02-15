import { Suspense } from "react";
import { notFound } from "next/navigation";
import { behavioralIndicatorsApi, assessmentQuestionsApi } from "@/services/api";
import type {
	BehavioralIndicator,
	AssessmentQuestion,
} from "@/types/domain";
import IndicatorDetailContent from "./_components/IndicatorDetailContent";
import IndicatorDetailClient from "./_components/IndicatorDetailClient";
import { EntityDetailLayout } from "@/components/common/EntityDetailLayout";
import Loading from "./loading";

interface IndicatorDetailPageProps {
	params: { indicatorId: string };
}

async function getIndicatorData(indicatorId: string) {
	const indicator = await behavioralIndicatorsApi.getIndicatorById(indicatorId);
	if (!indicator) {
		return { indicator: null, assessmentQuestions: [] };
	}

	const assessmentQuestions = await assessmentQuestionsApi.getIndicatorQuestions(
		indicator.competencyId,
		indicatorId
	);

	return { indicator, assessmentQuestions: assessmentQuestions || [] };
}

/**
 * Async data-fetching component for indicator detail.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function IndicatorDetailData({ indicatorId }: { indicatorId: string }) {
	const { indicator, assessmentQuestions } = await getIndicatorData(indicatorId);

	if (!indicator) {
		notFound();
	}

	return (
		<EntityDetailLayout>
			<IndicatorDetailClient indicator={indicator}>
				<IndicatorDetailContent indicator={indicator} assessmentQuestions={assessmentQuestions} />
			</IndicatorDetailClient>
		</EntityDetailLayout>
	);
}

export default async function Page({ params }: IndicatorDetailPageProps) {
	const { indicatorId } = await params;

	return (
		<Suspense fallback={<Loading />}>
			<IndicatorDetailData indicatorId={indicatorId} />
		</Suspense>
	);
}
