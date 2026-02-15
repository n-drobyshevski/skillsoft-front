import { Suspense } from "react";
import { assessmentQuestionsApi, behavioralIndicatorsApi } from "@/services/api";
import { notFound } from "next/navigation";
import EditQuestionForm from "./_components/EditQuestionForm";
import Loading from "./loading";

async function getQuestionData(questionId: string) {
  const question = await assessmentQuestionsApi.getQuestionById(questionId);
  if (!question) {
    notFound();
  }

  const indicator = await behavioralIndicatorsApi.getIndicatorById(question.behavioralIndicatorId);
  if (!indicator) {
    notFound();
  }

  return { question, competencyId: indicator.competencyId };
}

/**
 * Async data-fetching component for edit question.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function EditQuestionData({ questionId }: { questionId: string }) {
  const { question, competencyId } = await getQuestionData(questionId);

  return (
    <EditQuestionForm question={question} competencyId={competencyId} />
  );
}

export default async function EditQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;

  return (
    <Suspense fallback={<Loading />}>
      <EditQuestionData questionId={questionId} />
    </Suspense>
  );
}
