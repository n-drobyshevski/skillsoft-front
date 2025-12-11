'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, Target, Sparkles, ArrowRight, Shield, Brain, Users } from "lucide-react";
import { ExistingSessionDialog } from "@/components/assessment/ExistingSessionDialog";
import { TestTemplate, TestSession } from "@/types/domain";

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
  const [showDialog, setShowDialog] = useState(!!existingSession);

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

  // Scenario type badge color mapping with calming colors
  const scenarioColors: Record<string, string> = {
    'HIRING': 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
    'DEVELOPMENT': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
    'CERTIFICATION': 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400',
    'ASSESSMENT': 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  };

  const goalType = template.goal || 'ASSESSMENT';
  const badgeColor = scenarioColors[goalType] || scenarioColors['ASSESSMENT'];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <Card className="bg-destructive/10 border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Failed to Start Assessment</h3>
                  <p className="text-sm text-destructive/90">{decodeURIComponent(errorMessage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Card */}
        <Card className="bg-card/95 backdrop-blur-sm border shadow-xl overflow-hidden">
          {/* Gradient accent bar - calming blue gradient */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

          <CardHeader className="space-y-4 pb-2">
            {/* Badge and category */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className={`${badgeColor} px-3 py-1 text-xs font-medium`}
              >
                {goalType.replace('_', ' ')}
              </Badge>
              {template.competencyIds?.length > 0 && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {template.competencyIds.length} компетенций
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
              {template.name}
            </h1>

            {/* Description */}
            {template.description && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                {template.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-3 gap-4">
              <MetadataCard
                icon={Clock}
                label="Time Limit"
                value={`${estimatedMinutes} min`}
                accent="emerald"
              />
              <MetadataCard
                icon={FileQuestion}
                label="Questions"
                value={estimatedQuestions.toString()}
                accent="blue"
              />
              <MetadataCard
                icon={Target}
                label="Type"
                value={goalType.charAt(0) + goalType.slice(1).toLowerCase()}
                accent="violet"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Motivational Section */}
            <div className="bg-muted/50 rounded-xl p-5 space-y-4 border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Professional Competency Assessment
                </h2>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                This assessment will help create your professional profile by evaluating
                your competencies across multiple dimensions. Answer honestly — there are
                no right or wrong answers, only insights into your unique strengths.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <FeatureItem
                  icon={Shield}
                  text="Confidential"
                />
                <FeatureItem
                  icon={Brain}
                  text="Adaptive"
                />
                <FeatureItem
                  icon={Users}
                  text="Peer-Normed"
                />
              </div>
            </div>

            {/* Start Button - Simplified with direct form */}
            <form action={startAssessment} aria-label="Start assessment form">
              <Button
                type="submit"
                size="lg"
                aria-label={`Start ${template.name} assessment`}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                Begin My Assessment
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-muted-foreground text-sm">
          By starting, you agree to complete the assessment in one session.
          <br />
          Your progress will be saved automatically.
        </p>
      </div>
    </div>
  );
}

/**
 * Metadata display card component
 */
function MetadataCard({
  icon: Icon,
  label,
  value,
  accent
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: 'emerald' | 'blue' | 'violet';
}) {
  const accentColors = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="bg-muted/50 rounded-xl p-4 text-center space-y-2 border">
      <div className={`mx-auto w-10 h-10 rounded-lg flex items-center justify-center ${accentColors[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

/**
 * Feature highlight item
 */
function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
