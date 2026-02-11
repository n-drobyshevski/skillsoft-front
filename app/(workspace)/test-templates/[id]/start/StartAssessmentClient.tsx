'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, ArrowRight, Target, Loader2 } from "lucide-react";
import { ExistingSessionDialog } from "@/components/assessment/ExistingSessionDialog";
import { ReadinessAlert } from "@/components/assessment/ReadinessAlert";
import { AssemblyProgressModal } from "@/components/test-assembly";
import { TestTemplate, TestSession } from "@/types/domain";
import { useTemplateReadiness } from "@/hooks/useTemplateReadiness";
import { useAssemblyProgress } from "@/hooks/useAssemblyProgress";

interface StartAssessmentClientProps {
  template: TestTemplate;
  existingSession: TestSession | null;
  errorMessage?: string;
  estimatedQuestions: number;
  estimatedMinutes: number;
  startAssessment: (formData: FormData) => Promise<void>;
  abandonAndStartNew: (sessionId: string) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
}

export function StartAssessmentClient({
  template,
  existingSession,
  errorMessage,
  estimatedQuestions,
  estimatedMinutes,
  startAssessment,
  abandonAndStartNew,
}: StartAssessmentClientProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const t = useTranslations('template.start');
  const [showDialog, setShowDialog] = useState(!!existingSession);
  const [showAssemblyModal, setShowAssemblyModal] = useState(false);

  // Pre-flight readiness check
  const { readiness, isReady, isLoading: isCheckingReadiness } = useTemplateReadiness(template.id);

  // Assembly progress tracking
  const {
    phase,
    progress,
    isAssembling,
    isComplete,
    isFailed,
    error,
    sessionId,
    retryCount,
    startAssembly,
    retry,
    reset,
  } = useAssemblyProgress({
    onComplete: (newSessionId) => {
      // Navigate to test after short delay for UX
      setTimeout(() => {
        router.push(`/test-templates/take/${newSessionId}`);
      }, 500);
    },
    onError: (err) => {
      console.error('Assembly failed:', err);
    },
  });

  // Handle resume existing session
  const handleResume = () => {
    if (existingSession) {
      router.push(`/test-templates/take/${existingSession.id}`);
    }
  };

  // Handle start new session (abandon existing)
  const handleStartNew = async () => {
    if (existingSession) {
      return await abandonAndStartNew(existingSession.id);
    }
    return { success: false, error: 'No existing session to abandon' };
  };

  // Handle start assessment with assembly progress
  const handleStartClick = useCallback(async () => {
    setShowAssemblyModal(true);
    await startAssembly(template.id, userId);
  }, [template.id, userId, startAssembly]);

  // Handle continue to test after assembly
  const handleContinueToTest = useCallback((newSessionId: string) => {
    router.push(`/test-templates/take/${newSessionId}`);
  }, [router]);

  // Handle cancel assembly
  const handleCancelAssembly = useCallback(() => {
    reset();
    setShowAssemblyModal(false);
  }, [reset]);

  // Handle retry assembly
  const handleRetryAssembly = useCallback(() => {
    retry();
  }, [retry]);

  const goalType = template.goal || 'ASSESSMENT';

  // If there's an existing session, show the dialog
  if (showDialog && existingSession) {
    return (
      <ExistingSessionDialog
        session={existingSession}
        onResume={handleResume}
        onStartNew={handleStartNew}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Error Alert */}
        {errorMessage && (
          <Card className="mb-6 bg-red-500/10 border-red-500/50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-400 mb-1">{t('failedToStart')}</h3>
                <p className="text-sm text-red-300/90">{decodeURIComponent(errorMessage)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Readiness Alert - Pre-flight check */}
        {readiness && !isReady && (
          <ReadinessAlert
            readiness={readiness}
            isLoading={isCheckingReadiness}
            onGoBack={() => router.push('/test-templates')}
            className="mb-6"
          />
        )}

        {/* Main Card */}
        <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            {/* Header Section */}
            <div className="space-y-4 text-center">
              {/* Type Badge */}
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="bg-neutral-800/50 border-neutral-700 text-neutral-300 px-3 py-1 text-xs font-medium uppercase tracking-wide"
                >
                  {goalType.replace('_', ' ')}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                {template.name}
              </h1>

              {/* Description */}
              {template.description && (
                <p className="text-neutral-400 text-base leading-relaxed max-w-xl mx-auto">
                  {template.description}
                </p>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-8 py-4 border-y border-neutral-800">
              <StatItem
                icon={Clock}
                label={t('labels.time')}
                value={`${estimatedMinutes} ${t('labels.min')}`}
              />
              <div className="h-8 w-px bg-neutral-800" />
              <StatItem
                icon={FileQuestion}
                label={t('labels.questions')}
                value={estimatedQuestions.toString()}
              />
              {template.competencyIds?.length > 0 && (
                <>
                  <div className="h-8 w-px bg-neutral-800" />
                  <StatItem
                    icon={Target}
                    label={t('labels.competencies')}
                    value={template.competencyIds.length.toString()}
                  />
                </>
              )}
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartClick}
              size="lg"
              disabled={isCheckingReadiness || !isReady || isAssembling}
              aria-label={`${t('begin')} - ${template.name}`}
              className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCheckingReadiness ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" aria-hidden="true" />
                  {t('checking')}
                </>
              ) : !isReady ? (
                <>
                  {t('notAvailable')}
                </>
              ) : (
                <>
                  {t('begin')}
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </>
              )}
            </Button>

            {/* Footer Note */}
            <p className="text-center text-neutral-500 text-sm leading-relaxed">
              {t('progressSaved')}
            </p>
          </div>
        </Card>
      </div>

      {/* Assembly Progress Modal */}
      <AssemblyProgressModal
        open={showAssemblyModal}
        onOpenChange={setShowAssemblyModal}
        progress={progress}
        phase={phase}
        isAssembling={isAssembling}
        isComplete={isComplete}
        isFailed={isFailed}
        error={error}
        sessionId={sessionId}
        retryCount={retryCount}
        onRetry={handleRetryAssembly}
        onContinue={handleContinueToTest}
        onCancel={handleCancelAssembly}
      />
    </div>
  );
}

/**
 * Minimal stat display component
 */
function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType | null;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {Icon && <Icon className="w-4 h-4 text-neutral-500" />}
      <div className="text-center">
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
