import { Suspense } from "react";
import { notFound } from "next/navigation";
import { behavioralIndicatorsApi, assessmentQuestionsApi } from "@/services/api";
import type {
	BehavioralIndicator,
	AssessmentQuestion,
} from "../../interfaces/domain-interfaces";
import IndicatorPage from "./components/IndicatorPage";
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

export default async function Page({ params }: IndicatorDetailPageProps) {
		const { indicatorId } = await params;
	const { indicator, assessmentQuestions } = await getIndicatorData(indicatorId);


	if (!indicator) {
		notFound();
	}

	return (
				<Suspense fallback={<Loading />}>

		<IndicatorPage indicator={indicator} assessmentQuestions={assessmentQuestions} />
				</Suspense>
	);
}
