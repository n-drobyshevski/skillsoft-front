import { assessmentQuestionsApi, behavioralIndicatorsApi } from "@/services/api";
import { notFound } from "next/navigation";
import EditQuestionForm from "./_components/EditQuestionForm";

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

export default async function EditQuestionPage({ params }: { params: { questionId: string } }) {
  const { questionId } = await params;
  const { question, competencyId } = await getQuestionData(questionId);

  return (
    <EditQuestionForm question={question} competencyId={competencyId} />
  );
}
