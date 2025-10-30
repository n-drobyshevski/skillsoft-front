import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function QuestionFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
