
import { AssessmentQuestion } from "@/app/interfaces/domain-interfaces";
import { Badge } from "@/components/ui/badge";
import { DifficultyLevel } from "@/app/enums/domain_enums";

function QuestionCard({ question, index }: { question: AssessmentQuestion; index: number }) {
  return (
    <div className="group relative bg-background/50 border border-border/50 rounded-lg hover:bg-background hover:border-primary/40 hover:shadow-sm transition-all duration-200 overflow-hidden">
      {/* Main content area */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Question number indicator */}
          <div className="w-6 h-6 bg-muted/60 group-hover:bg-primary/20 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
              {index + 1}
            </span>
          </div>
          
          {/* Question content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Question text */}
            <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
              {question.questionText}
            </p>
            
            {/* Question metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{question.questionType.replace("_", " ")}</span>
              {question.timeLimit && (
                <>
                  <span>•</span>
                  <span>{question.timeLimit}s</span>
                </>
              )}
              {question.answerOptions && question.answerOptions.length > 0 && (
                <>
                  <span>•</span>
                  <span>{question.answerOptions.length} options</span>
                </>
              )}
            </div>
          </div>
          
          {/* Difficulty badge */}
          <div className="shrink-0">
            <Badge
              variant="secondary"
              className={`text-xs px-2 py-1 font-medium ${
                question.difficultyLevel === DifficultyLevel.FOUNDATIONAL
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : question.difficultyLevel === DifficultyLevel.INTERMEDIATE
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                  : question.difficultyLevel === DifficultyLevel.ADVANCED
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                  : question.difficultyLevel === DifficultyLevel.SPECIALIZED
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              }`}
            >
              {question.difficultyLevel}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}

export default function QuestionsList({ questions }: { questions: AssessmentQuestion[] }) {
  return (
    <div className="space-y-4">
      {/* Header with better spacing */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Assessment Questions
          </h4>
          <Badge variant="secondary" className="text-xs">
            {questions.length}
          </Badge>
        </div>
      </div>
      
      {/* Questions list with compact spacing */}
      <div className="space-y-2">
        {questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} index={index} />
        ))}
      </div>
    </div>
  );
}
