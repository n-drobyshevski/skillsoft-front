'use client';

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
import { Loader2, AlertTriangle, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface StartTestDriveButtonProps {
  templateId: string;
  templateName: string;
  fullWidth?: boolean;
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
}: StartTestDriveButtonProps) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleStartTestDrive = async () => {
    if (!isSignedIn || !userId) {
      toast.error("Необходимо войти в систему для тест-драйва");
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

        toast.success("Тест-драйв начат!");
        // Navigate with testDrive=true parameter
        router.push(`/test-templates/take/${session.id}?testDrive=true`);
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error("Failed to start test-drive:", error);

        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage?.includes("already has an in-progress session")) {
          toast.error("У вас уже есть незавершённый тест. Завершите его или откажитесь перед началом нового.");
        } else {
          toast.error("Не удалось начать тест-драйв. Попробуйте позже.");
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
        toast.info("Предыдущая сессия отменена");
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
        className={`${fullWidth ? "w-full" : ""} border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/50 transition-all group`}
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка...
          </>
        ) : (
          <>
            <Eye className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="font-medium">HR Тест-драйв</span>
            <Sparkles className="ml-1.5 h-3 w-3 text-amber-500" />
          </>
        )}
      </Button>

      {/* Existing session dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Незавершённая сессия
            </AlertDialogTitle>
            <AlertDialogDescription>
              У вас уже есть незавершённая сессия для теста &quot;{templateName}&quot;.
              Вы хотите продолжить её в режиме тест-драйва или начать заново?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <Button variant="outline" onClick={handleStartNewTestDrive}>
              Начать заново
            </Button>
            <AlertDialogAction
              onClick={handleContinueExistingInTestDrive}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Eye className="mr-2 h-4 w-4" />
              Продолжить тест-драйв
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
