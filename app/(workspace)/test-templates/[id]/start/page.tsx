import { Metadata } from "next";
import { testTemplatesApi, testSessionsApi } from "@/services/api";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, HelpCircle, Play, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

interface StartPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    mode?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Start Assessment - SkillSoft",
  description: "Begin your competency assessment.",
};

export default async function StartPage({ params, searchParams }: StartPageProps) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const template = await testTemplatesApi.getTemplateById(id);
  if (!template) notFound();

  // Check for existing session (may not exist, which is fine)
  let existingSession = null;
  try {
    existingSession = await testSessionsApi.getInProgressSession(userId, id);
  } catch (error) {
    // No existing session, which is expected for new starts
    existingSession = null;
  }
  
  async function startSessionAction() {
    "use server";
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
    
    const session = await testSessionsApi.startSession({
        templateId: id,
        clerkUserId: userId,
    });
    redirect(`/test-templates/take/${session.id}`);
  }

  return (
    <div className="container max-w-3xl py-12 flex flex-col gap-8">
        <Link href="/test-templates" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Assessments
        </Link>

        <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary ml-1" />
                </div>
                <Badge variant="outline" className="mx-auto mb-2 w-fit">
                    {template.goal}
                </Badge>
                <CardTitle className="text-3xl font-bold">{template.name}</CardTitle>
                <CardDescription className="text-lg mt-2 max-w-xl mx-auto">
                    {template.description || "This assessment measures your competencies in specific areas."}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg text-center">
                        <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="font-semibold">{template.timeLimitMinutes} Minutes</span>
                        <span className="text-xs text-muted-foreground">Time Limit</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg text-center">
                        <HelpCircle className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="font-semibold">~{template.competencyIds.length * 3} Questions</span>
                        <span className="text-xs text-muted-foreground">Estimated</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg text-center">
                        <CheckCircle2 className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="font-semibold">{template.passingScore}%</span>
                        <span className="text-xs text-muted-foreground">Passing Score</span>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">Before you begin:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Ensure you have a stable internet connection.</li>
                            <li>Find a quiet place where you won't be disturbed.</li>
                            <li>Once started, the timer cannot be paused.</li>
                            {template.goal === 'OVERVIEW' && (
                                <li>There are no wrong answers. Be honest for the best results.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2 pb-8">
                {existingSession ? (
                    <Button size="lg" className="w-full max-w-md mx-auto text-lg h-12" asChild>
                        <Link href={`/test-templates/take/${existingSession.id}`}>
                            Resume Assessment
                        </Link>
                    </Button>
                ) : (
                    <form action={startSessionAction} className="w-full max-w-md mx-auto">
                        <Button 
                            size="lg" 
                            className="w-full text-lg h-14 shadow-xl hover:shadow-2xl transition-all bg-primary hover:bg-primary/90 animate-pulse hover:animate-none font-bold tracking-wide"
                        >
                            Begin Assessment
                            <Play className="ml-2 h-5 w-5 fill-current" />
                        </Button>
                    </form>
                )}
                <p className="text-xs text-center text-muted-foreground">
                    By starting, you agree to our assessment terms and conditions.
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
