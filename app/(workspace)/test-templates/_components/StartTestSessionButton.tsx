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
import { testSessionsApi } from "@/services/api";
import { Loader2, AlertTriangle, PlayCircle, Rocket } from "lucide-react";
import { toast } from "sonner";

interface StartTestSessionButtonProps {
  templateId: string;
  templateName: string;
  fullWidth?: boolean;
  variant?: "default" | "hero";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function StartTestSessionButton({
  templateId,
  templateName,
  fullWidth = false,
  variant = "default",
  size = "lg",
}: StartTestSessionButtonProps) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const t = useTranslations('template');
  const tCommon = useTranslations('common');

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

  // Hero variant - prominent, gradient styling
  if (variant === "hero") {
    return (
      <>
        <Button
          onClick={handleStartTest}
          disabled={isLoading}
          className={`${fullWidth ? "w-full" : ""} bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group min-h-11`}
          size={size}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('take.loading.preparing')}
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
              <span className="font-semibold">{t('testDrive.button')}</span>
              <PlayCircle className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
        {alertDialog}
      </>
    );
  }

  // Default variant - standard button
  return (
    <>
      <Button
        onClick={handleStartTest}
        disabled={isLoading}
        className={`${fullWidth ? "w-full" : ""} shadow-sm hover:shadow-md transition-all group`}
        size={size}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {tCommon('loading')}
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="font-medium">{tCommon('startTest')}</span>
          </>
        )}
      </Button>
      {alertDialog}
    </>
  );
}
