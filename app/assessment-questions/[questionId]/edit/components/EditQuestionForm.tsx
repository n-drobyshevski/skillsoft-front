'use client';

import { useState } from "react";
import { AssessmentQuestion } from "../../../../interfaces/domain-interfaces";
import { QuestionForm } from "../../../components/QuestionForm";
import QuestionPreview from "../../../components/QuestionPreview";

interface EditQuestionFormProps {
  question: AssessmentQuestion;
  competencyId: string;
}

export default function EditQuestionForm({ question, competencyId }: EditQuestionFormProps) {
  const [previewQuestion, setPreviewQuestion] = useState<AssessmentQuestion>(question);

  const handleUpdatePreview = (data: Partial<AssessmentQuestion>) => {
    setPreviewQuestion({ ...previewQuestion, ...data });
  };

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
          <QuestionPreview question={previewQuestion} />
        </div>
      </div>
    </div>
  );
}
