import { QuestionFormSkeleton } from "./QuestionFormSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function EditQuestionPageSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <QuestionFormSkeleton />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
