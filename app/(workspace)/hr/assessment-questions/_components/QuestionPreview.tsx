'use client';

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { AssessmentQuestion } from "@/types/domain";
import { questionDifficultyToColor, questionTypeToIcon } from "@/lib/ui-utils";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

export default function QuestionPreview({ question }: { question: AssessmentQuestion }) {
  const renderAnswerOptions = () => {
    if (!question.answerOptions || question.answerOptions.length === 0) {
      return null;
    }

    const questionType = question.questionType;

    switch (questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <div>
            <h3 className="text-lg font-medium">Answer Options</h3>
            <div className="mt-3 space-y-3">
              {question.answerOptions.map((option, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    {option.correct ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {String.fromCharCode(65 + index)}. {option.text || `Option ${index + 1}`}
                    </span>
                  </div>
                  <Badge variant={option.correct ? "default" : "secondary"}>
                    {option.score} pts
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        );

      case 'LIKERT_SCALE':
        return (
          <div>
            <h3 className="text-lg font-medium">Likert Scale</h3>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground">
                <span>Strongly Disagree</span>
                <span>Neutral</span>
                <span>Strongly Agree</span>
              </div>
              <div className="flex justify-between space-x-2">
                {question.answerOptions.map((option, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 border-2 border-muted-foreground rounded-full flex items-center justify-center">
                      {option.score || index + 1}
                    </div>
                    <span className="text-xs text-center max-w-12">
                      {option.text || `${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'SITUATIONAL_JUDGMENT':
        return (
          <div>
            <h3 className="text-lg font-medium">Situation Response Options</h3>
            <div className="mt-3 space-y-3">
              {question.answerOptions.map((option, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">Response {index + 1}</div>
                      <p className="text-sm text-muted-foreground">
                        {option.text || "Situational response description..."}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {option.score || 0} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h3 className="text-lg font-medium">Answer Options</h3>
            <ul className="mt-2 space-y-2">
              {question.answerOptions.map((option, index) => (
                <li key={index} className="flex items-center justify-between text-sm text-muted-foreground p-2 border rounded">
                  <span>{index + 1}. {option.text || `Option ${index + 1}`}</span>
                  <Badge variant="secondary">Score: {option.score || 0}</Badge>
                </li>
              ))}
            </ul>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {question.questionText}
        </CardTitle>
        <CardDescription className="text-base">
          Live preview of the assessment question.
        </CardDescription>
        <div className="flex items-center justify-start gap-2 pt-4">
          <Badge variant={question.isActive ? "default" : "secondary"}>
            {question.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant="outline"
            className={questionDifficultyToColor(question.difficultyLevel)}
          >
            {question.difficultyLevel}
          </Badge>
          <div className="flex items-center gap-2">
            <span>{questionTypeToIcon(question.questionType)}</span>
            <span className="font-medium">
              {question.questionType
                .split("_")
                .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                .join(" ")}
            </span>
          </div>
          {question.timeLimit && (
            <Badge variant="outline" className="text-orange-600">
              {question.timeLimit}min
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-6 space-y-6">
        {renderAnswerOptions()}
        
        <div>
          <h3 className="text-lg font-medium">Scoring Rubric</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {question.scoringRubric || "No scoring rubric provided."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
