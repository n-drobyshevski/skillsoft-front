import { Metadata } from "next";
import { testTemplatesApi, testSessionsApi } from "@/services/api";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { StartAssessmentClient } from "./StartAssessmentClient";

interface StartPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    mode?: string;
    error?: string;
  }>;
}

// Dynamic metadata generation with template data
export async function generateMetadata({ params }: StartPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const template = await testTemplatesApi.getTemplateById(id);

    if (!template) {
      return {
        title: "Start Assessment - SkillSoft",
        description: "Begin your competency assessment.",
      };
    }

    return {
      title: `${template.name} - Start Assessment | SkillSoft`,
      description: template.description || "Begin your competency assessment.",
      openGraph: {
        title: template.name,
        description: template.description || "Begin your competency assessment.",
        type: 'website',
      },
    };
  } catch {
    return {
      title: "Start Assessment - SkillSoft",
      description: "Begin your competency assessment.",
    };
  }
}

export default async function StartPage({ params, searchParams }: StartPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const template = await testTemplatesApi.getTemplateById(id);
  if (!template) notFound();

  // Check for existing in-progress session
  let existingSession = null;
  try {
    existingSession = await testSessionsApi.getInProgressSession(userId, id);
  } catch (error) {
    // If there's an error checking for session, log it but continue
    console.error('Error checking for existing session:', error);
  }

  // Server action: Start new assessment (no existing session check here)
  async function startAssessment(formData: FormData) {
    'use server';
    const { userId: serverUserId } = await auth();
    if (!serverUserId) {
      redirect("/sign-in");
    }

    try {
      const session = await testSessionsApi.startSession({
        templateId: id,
        clerkUserId: serverUserId,
      });

      redirect(`/test-templates/take/${session.id}`);
    } catch (error) {
      console.error('Failed to start assessment:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to start assessment. Please try again.';
      redirect(`/test-templates/${id}/start?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  // Server action: Abandon existing session and start new one
  // Returns session ID for client-side navigation (avoids NEXT_REDIRECT error)
  async function abandonAndStartNew(sessionId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    'use server';
    const { userId: serverUserId } = await auth();
    if (!serverUserId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // First abandon the existing session
      await testSessionsApi.abandonSession(sessionId);

      // Then start a new session
      const session = await testSessionsApi.startSession({
        templateId: id,
        clerkUserId: serverUserId,
      });

      return { success: true, sessionId: session.id };
    } catch (error) {
      console.error('Failed to abandon and start new session:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to start new session. Please try again.';
      return { success: false, error: errorMessage };
    }
  }

  // Calculate metadata
  const estimatedQuestions = template.questionsPerIndicator * template.competencyIds.length * 3;
  const totalQuestions = estimatedQuestions || 10;
  const estimatedMinutes = template.timeLimitMinutes
    ? template.timeLimitMinutes
    : Math.ceil(totalQuestions * 1.5);

  return (
    <StartAssessmentClient
      template={template}
      existingSession={existingSession}
      errorMessage={errorMessage}
      estimatedQuestions={totalQuestions}
      estimatedMinutes={estimatedMinutes}
      startAssessment={startAssessment}
      abandonAndStartNew={abandonAndStartNew}
    />
  );
}
