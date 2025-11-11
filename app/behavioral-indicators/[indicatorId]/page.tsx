import { notFound } from "next/navigation";
import { behavioralIndicatorsApi, assessmentQuestionsApi } from "@/services/api";
import type {
	BehavioralIndicator,
	AssessmentQuestion,
} from "../../interfaces/domain-interfaces";
import IndicatorDetailContent from "./components/IndicatorDetailContent";
import IndicatorDetailClient from "./components/IndicatorDetailClient";
import { EntityDetailLayout } from "../../components/EntityDetailLayout";
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
		<EntityDetailLayout>
			<IndicatorDetailClient indicator={indicator}>
				<IndicatorDetailContent indicator={indicator} assessmentQuestions={assessmentQuestions} />
			</IndicatorDetailClient>
		</EntityDetailLayout>
	);
}
