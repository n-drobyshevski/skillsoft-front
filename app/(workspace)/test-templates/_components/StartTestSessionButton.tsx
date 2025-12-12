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
import { Loader2, AlertTriangle, PlayCircle, Rocket } from "lucide-react";
import { toast } from "sonner";

interface StartTestSessionButtonProps {
  templateId: string;
  templateName: string;
  fullWidth?: boolean;
  variant?: "default" | "hero";
}

export default function StartTestSessionButton({
  templateId,
  templateName,
  fullWidth = false,
  variant = "default"
}: StartTestSessionButtonProps) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleStartTest = async () => {
    if (!isSignedIn || !userId) {
      toast.error("Необходимо войти в систему для прохождения теста");
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
        
        toast.success("Тест начат!");
        router.push(`/test-templates/take/${session.id}`);
      } catch (error: any) {
        console.error("Failed to start test:", error);
        
        if (error.message?.includes("already has an in-progress session")) {
          toast.error("У вас уже есть незавершённый тест. Завершите его или откажитесь перед началом нового.");
        } else {
          toast.error("Не удалось начать тест. Попробуйте позже.");
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
        toast.info("Предыдущая сессия отменена");
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
            Незавершённый тест
          </AlertDialogTitle>
          <AlertDialogDescription>
            У вас уже есть незавершённая сессия для теста &quot;{templateName}&quot;.
            Вы хотите продолжить её или начать заново?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <Button variant="outline" onClick={handleStartNew}>
            Начать заново
          </Button>
          <AlertDialogAction onClick={handleContinueExisting}>
            Продолжить
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
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Подготовка теста...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
              <span className="font-semibold">Начать тест-драйв</span>
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
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка...
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="font-medium">Начать тест</span>
          </>
        )}
      </Button>
      {alertDialog}
    </>
  );
}
