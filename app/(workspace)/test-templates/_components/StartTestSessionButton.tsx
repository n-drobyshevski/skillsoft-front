'use client';

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { testSessionsApi } from "@/services/api";
import { Loader2, AlertTriangle, PlayCircle, Rocket, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface StartTestSessionButtonProps {
  templateId: string;
  templateName: string;
  fullWidth?: boolean;
  variant?: "default" | "hero";
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * Whether the template has a valid blueprint for test assembly.
   * When false, the button is disabled with a helpful tooltip.
   */
  hasValidBlueprint?: boolean;
}

export default function StartTestSessionButton({
  templateId,
  templateName,
  fullWidth = false,
  variant = "default",
  size = "lg",
  hasValidBlueprint = true, // Default to true for backward compatibility
}: StartTestSessionButtonProps) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const t = useTranslations('template');
  const tCommon = useTranslations('common');

  // Blueprint validation - prevent starting tests without valid blueprint
  const blueprintMissing = hasValidBlueprint === false;

  const handleStartTest = async () => {
    if (!isSignedIn || !userId) {
      toast.error(t('testSession.loginRequired'));
      router.push("/sign-in");
      return;
    }

    setIsChecking(true);
    
    try {
      // Check for existing in-progress session
      const existingSession = await testSessionsApi.getInProgressSession(userId, templateId);
      
      if (existingSession) {
        setExistingSessionId(existingSession.id);
        setShowDialog(true);
        setIsChecking(false);
        return;
      }

      // No existing session, start new one
      await startNewSession();
    } catch (error) {
      console.error("Error checking session:", error);
      // If check fails, try to start new session anyway
      await startNewSession();
    }
  };

  const startNewSession = async () => {
    if (!userId) return;

    startTransition(async () => {
      try {
        const session = await testSessionsApi.startSession({
          templateId,
          clerkUserId: userId,
        });

        toast.success(t('take.toasts.testStarted'));
        router.push(`/test-templates/take/${session.id}`);
      } catch (error: unknown) {
        console.error("Failed to start test:", error);

        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage?.includes("already has an in-progress session")) {
          toast.error(t('take.toasts.existingSessionError'));
        } else {
          toast.error(t('take.toasts.failedToStart'));
        }
      } finally {
        setIsChecking(false);
      }
    });
  };

  const handleContinueExisting = () => {
    if (existingSessionId) {
      router.push(`/test-templates/take/${existingSessionId}`);
    }
    setShowDialog(false);
  };

  const handleStartNew = async () => {
    setShowDialog(false);

    if (existingSessionId) {
      try {
        // Abandon the existing session first
        await testSessionsApi.abandonSession(existingSessionId);
        toast.info(t('take.toasts.previousSessionCancelled'));
      } catch (error) {
        console.error("Failed to abandon session:", error);
      }
    }

    await startNewSession();
  };

  const isLoading = isPending || isChecking;
  const isDisabled = isLoading || blueprintMissing;

  // Shared dialog component
  const alertDialog = (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t('take.dialogs.existingSessionWithName.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('take.dialogs.existingSessionWithName.description', { name: templateName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <Button variant="outline" onClick={handleStartNew}>
            {t('take.dialogs.existingSessionWithName.startNew')}
          </Button>
          <AlertDialogAction onClick={handleContinueExisting}>
            {t('take.dialogs.existingSessionWithName.continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Helper to wrap button in tooltip when blueprint is missing
  const wrapWithBlueprintTooltip = (button: React.ReactNode) => {
    if (!blueprintMissing) return button;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={fullWidth ? "w-full" : "inline-block"}>
              {button}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t('testSession.blueprintRequired.title')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('testSession.blueprintRequired.description')}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Hero variant - prominent, gradient styling
  if (variant === "hero") {
    const heroButton = (
      <Button
        onClick={handleStartTest}
        disabled={isDisabled}
        className={`${fullWidth ? "w-full" : ""} bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group min-h-11 ${blueprintMissing ? "opacity-50 cursor-not-allowed" : ""}`}
        size={size}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('take.loading.preparing')}
          </>
        ) : blueprintMissing ? (
          <>
            <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
            <span className="font-semibold">{t('testSession.blueprintRequired.button')}</span>
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
            <span className="font-semibold">{tCommon('startTest')}</span>
            <PlayCircle className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    );

    return (
      <>
        {wrapWithBlueprintTooltip(heroButton)}
        {alertDialog}
      </>
    );
  }

  // Default variant - standard button
  const defaultButton = (
    <Button
      onClick={handleStartTest}
      disabled={isDisabled}
      className={`${fullWidth ? "w-full" : ""} shadow-sm hover:shadow-md transition-all group ${blueprintMissing ? "opacity-50 cursor-not-allowed" : ""}`}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {tCommon('loading')}
        </>
      ) : blueprintMissing ? (
        <>
          <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
          <span className="font-medium">{t('testSession.blueprintRequired.button')}</span>
        </>
      ) : (
        <>
          <PlayCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="font-medium">{tCommon('startTest')}</span>
        </>
      )}
    </Button>
  );

  return (
    <>
      {wrapWithBlueprintTooltip(defaultButton)}
      {alertDialog}
    </>
  );
}
