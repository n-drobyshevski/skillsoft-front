
import { AssessmentQuestion } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { DifficultyLevel } from "@/types/domain";

function QuestionCard({ question, index }: { question: AssessmentQuestion; index: number }) {
  return (
    <div className="group relative flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 bg-background/50 hover:bg-background hover:border-primary/30 transition-all duration-150">
      {/* Question number */}
      <div className="w-5 h-5 bg-muted/60 group-hover:bg-primary/20 rounded flex items-center justify-center shrink-0 transition-colors">
        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">
          {index + 1}
        </span>
      </div>
      
      {/* Question content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
          {question.questionText}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
          <span>{question.questionType.replace("_", " ")}</span>
          {question.timeLimit && (
            <>
              <span>•</span>
              <span>{question.timeLimit}s</span>
            </>
          )}
          {question.answerOptions && question.answerOptions.length > 0 && (
            <>
              <span>•</span>
              <span>{question.answerOptions.length} opts</span>
            </>
          )}
        </div>
      </div>
      
      {/* Difficulty badge */}
      <Badge
        variant="secondary"
        className={`text-[10px] h-4 px-1 shrink-0 ${
          question.difficultyLevel === DifficultyLevel.FOUNDATIONAL
            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
            : question.difficultyLevel === DifficultyLevel.INTERMEDIATE
            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
            : question.difficultyLevel === DifficultyLevel.ADVANCED
            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            : question.difficultyLevel === DifficultyLevel.SPECIALIZED
            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
        }`}
      >
        {question.difficultyLevel}
      </Badge>
    </div>
  );
}

export default function QuestionsList({ questions }: { questions: AssessmentQuestion[] }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Questions
          </h4>
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {questions.length}
          </Badge>
        </div>
      </div>
      
      {/* Questions list */}
      <div className="space-y-1.5">
        {questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} index={index} />
        ))}
      </div>
    </div>
  );
}
