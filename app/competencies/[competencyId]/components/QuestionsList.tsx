
import { AssessmentQuestion } from "../../../interfaces/domain-interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function QuestionCard({ question }: { question: AssessmentQuestion }) {
  return (
    <Card className="bg-card shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:border-border/80">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
              {question.questionText}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {question.questionType}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {question.difficultyLevel}
              </Badge>
              {question.timeLimit && (
                <Badge variant="outline" className="text-xs">
                  {question.timeLimit}s
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {question.answerOptions && question.answerOptions.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t border-border pt-3 sm:pt-4">
            <p className="text-sm text-muted-foreground mb-2">Answer options:</p>
            <div className="space-y-1">
              {question.answerOptions.slice(0, 3).map((option, index) => (
                <div key={index} className="text-sm text-foreground bg-muted/50 rounded px-2 py-1">
                  {option.text || option.label}
                </div>
              ))}
              {question.answerOptions.length > 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{question.answerOptions.length - 3} more options
                </p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function QuestionsList({ questions }: { questions: AssessmentQuestion[] }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
          Assessment Questions ({questions.length})
        </h3>
        <p className="text-sm text-muted-foreground">
          Questions for evaluating behavioral indicators
        </p>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
