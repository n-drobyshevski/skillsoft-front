'use client';

import { assessmentQuestionsApi, behavioralIndicatorsApi } from "@/services/api";
import { QuestionForm } from "../../components/QuestionForm";
import { notFound, useParams } from "next/navigation";
import QuestionPreview from "../../components/QuestionPreview";
import { AssessmentQuestion } from "../../../interfaces/domain-interfaces";
import { useEffect, useState } from "react";
import { EditQuestionPageSkeleton } from "../../components/EditQuestionPageSkeleton";

export default function EditQuestionPage() {
  const params = useParams();
  const questionId = params.questionId as string;

  const [question, setQuestion] = useState<AssessmentQuestion | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<AssessmentQuestion | null>(null);
  const [competencyId, setCompetencyId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestion() {
      const fetchedQuestion = await assessmentQuestionsApi.getQuestionById(questionId);
      if (!fetchedQuestion) {
        notFound();
      }
      setQuestion(fetchedQuestion);
      setPreviewQuestion(fetchedQuestion);

      const indicator = await behavioralIndicatorsApi.getIndicatorById(fetchedQuestion.behavioralIndicatorId);
      if (indicator) {
        setCompetencyId(indicator.competencyId);
      }
    }
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const handleUpdatePreview = (data: Partial<AssessmentQuestion>) => {
    if (previewQuestion) {
      setPreviewQuestion({ ...previewQuestion, ...data });
    }
  };

  if (!question || !competencyId) {
    return <EditQuestionPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <QuestionForm
            question={question}
            competencyId={competencyId}
            behavioralIndicatorId={question.behavioralIndicatorId}
            onUpdatePreview={handleUpdatePreview}
          />
        </div>
        <div className="hidden lg:block">
          {previewQuestion && <QuestionPreview question={previewQuestion} />}
        </div>
      </div>
    </div>
  );
}
