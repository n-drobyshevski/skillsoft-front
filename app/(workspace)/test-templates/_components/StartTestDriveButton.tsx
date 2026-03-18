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
import { Loader2, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StartTestDriveButtonProps {
  templateId: string;
  templateName: string;
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * StartTestDriveButton - Launches test in HR Test-Drive mode
 *
 * Test-Drive mode enables the insights panel showing:
 * - Psychometric properties
 * - Scoring rubrics
 * - Competency mapping
 * - Question metadata
 *
 * This is for HR administrators to preview and analyze test questions.
 */
export default function StartTestDriveButton({
  templateId,
  templateName,
  fullWidth = false,
  className,
  icon,
}: StartTestDriveButtonProps) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const t = useTranslations('template');
  const tCommon = useTranslations('common');

  const handleStartTestDrive = async () => {
    if (!isSignedIn || !userId) {
      toast.error(t('testSession.testDriveLoginRequired'));
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

      // No existing session, start new one in test-drive mode
      await startNewTestDriveSession();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error checking session:", error);
      // If check fails, try to start new session anyway
      await startNewTestDriveSession();
    }
  };

  const startNewTestDriveSession = async () => {
    if (!userId) return;

    startTransition(async () => {
      try {
        const session = await testSessionsApi.startSession({
          templateId,
          clerkUserId: userId,
        });

        toast.success(t('take.toasts.testDriveStarted'));
        // Navigate with testDrive=true parameter
        router.push(`/test-templates/take/${session.id}?testDrive=true`);
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error("Failed to start test-drive:", error);

        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage?.includes("already has an in-progress session")) {
          toast.error(t('take.toasts.existingSessionError'));
        } else {
          toast.error(t('take.toasts.failedToStartTestDrive'));
        }
      } finally {
        setIsChecking(false);
      }
    });
  };

  const handleContinueExistingInTestDrive = () => {
    if (existingSessionId) {
      // Continue existing session but in test-drive mode
      router.push(`/test-templates/take/${existingSessionId}?testDrive=true`);
    }
    setShowDialog(false);
  };

  const handleStartNewTestDrive = async () => {
    setShowDialog(false);

    if (existingSessionId) {
      try {
        // Abandon the existing session first
        await testSessionsApi.abandonSession(existingSessionId);
        toast.info(t('take.toasts.previousSessionCancelled'));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to abandon session:", error);
      }
    }

    await startNewTestDriveSession();
  };

  const isLoading = isPending || isChecking;

  return (
    <>
      <Button
        onClick={handleStartTestDrive}
        disabled={isLoading}
        variant="outline"
        className={cn(
          "border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/50 transition-all group",
          "min-h-[44px] sm:min-h-0 touch-manipulation active:scale-[0.98] motion-reduce:transition-none",
          fullWidth && "w-full",
          className
        )}
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t('testDrive.loading')}</span>
          </>
        ) : (
          <>
            {icon ?? <Eye className="h-3.5 w-3.5 sm:mr-1.5 transition-transform group-hover:scale-110 shrink-0" aria-hidden="true" />}
            <span className="hidden sm:inline font-medium">{t('testDrive.button')}</span>
            <span className="sm:hidden font-medium">{t('testDrive.buttonShort')}</span>
          </>
        )}
      </Button>

      {/* Existing session dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('take.dialogs.existingSessionWithName.titleWithWarning')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('take.dialogs.existingSessionWithName.descriptionTestDrive', { name: templateName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <Button variant="outline" onClick={handleStartNewTestDrive}>
              {t('take.dialogs.existingSessionWithName.startNew')}
            </Button>
            <AlertDialogAction
              onClick={handleContinueExistingInTestDrive}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Eye className="mr-2 h-4 w-4" />
              {t('take.dialogs.existingSessionWithName.continueTestDrive')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
