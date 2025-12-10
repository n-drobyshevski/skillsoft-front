'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useUIStore } from "@/store/ui-store";
import { SessionHeader } from "@/components/layout/session-header";
import { cn } from "@/lib/utils";
import { testSessionsApi } from '@/services/api';
import { 
  TestSession, 
  CurrentQuestionResponse, 
  SessionQuestion,
  SubmitAnswerRequest,
  TestAnswer
} from '@/types/domain';
import { SessionStatus, QuestionType } from '@/types/domain';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  SkipForward
} from 'lucide-react';
import { toast } from 'sonner';

// Question type components
import SingleChoiceQuestion from './_components/SingleChoiceQuestion';
import MultipleChoiceQuestion from './_components/MultipleChoiceQuestion';
import LikertScaleQuestion from './_components/LikertScaleQuestion';
import OpenTextQuestion from './_components/OpenTextQuestion';

export default function TestTakePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { userId, isSignedIn, isLoaded } = useAuth();
  
  // Use Zustand store directly for immersive mode
  const enterImmersiveMode = useUIStore((state) => state.enterImmersiveMode);
  const exitImmersiveMode = useUIStore((state) => state.exitImmersiveMode);

  // Trigger Zen Mode on mount, exit on unmount
  useEffect(() => {
    enterImmersiveMode();
    return () => exitImmersiveMode();
  }, [enterImmersiveMode, exitImmersiveMode]);

  // State
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Answer state
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [likertValue, setLikertValue] = useState<number | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dialog state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);

  // Reset answer state when question changes
  const resetAnswerState = useCallback((previousAnswer?: TestAnswer | null) => {
    if (previousAnswer) {
      // Restore previous answer based on what was stored
      if (previousAnswer.selectedOptionIds && previousAnswer.selectedOptionIds.length > 0) {
        setSelectedOptions(previousAnswer.selectedOptionIds);
      } else {
        setSelectedOptions([]);
      }
      
      if (previousAnswer.likertValue !== undefined && previousAnswer.likertValue !== null) {
        setLikertValue(previousAnswer.likertValue);
      } else {
        setLikertValue(null);
      }
      
      if (previousAnswer.textResponse) {
        setTextResponse(previousAnswer.textResponse);
      } else {
        setTextResponse('');
      }
    } else {
      setSelectedOptions([]);
      setLikertValue(null);
      setTextResponse('');
    }
  }, []);

  // Load session and current question
  const loadSessionData = useCallback(async () => {
    if (!sessionId || !userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [sessionData, questionData] = await Promise.all([
        testSessionsApi.getSessionById(sessionId),
        testSessionsApi.getCurrentQuestion(sessionId),
      ]);

      setSession(sessionData);
      setCurrentQuestion(questionData);
      resetAnswerState(questionData?.previousAnswer);
      setQuestionStartTime(Date.now());

      // Initialize timer if session has time limit
      if (sessionData?.timeRemainingSeconds && sessionData.timeRemainingSeconds > 0) {
        setTimeRemaining(sessionData.timeRemainingSeconds);
      }
    } catch (err: any) {
      console.error('Failed to load session:', err);
      setError(err.message || 'Failed to load assessment session');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userId, resetAnswerState]);

  // Initial load
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadSessionData();
    }
  }, [isLoaded, isSignedIn, loadSessionData]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowTimeoutDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if current answer is valid
  const isAnswerValid = useCallback((): boolean => {
    if (!currentQuestion) return false;
    
    const questionType = currentQuestion.question.questionType as string;
    
    switch (questionType) {
      case 'SINGLE_CHOICE':
      case 'SJT':
      case 'SITUATIONAL_JUDGMENT':
        return selectedOptions.length === 1;
      case 'MULTIPLE_CHOICE':
      case 'MCQ':
        return selectedOptions.length > 0;
      case 'LIKERT_SCALE':
      case 'LIKERT':
        return likertValue !== null;
      case 'OPEN_TEXT':
      case 'BEHAVIORAL_EXAMPLE':
      case 'SELF_REFLECTION':
      case 'PEER_FEEDBACK':
        return textResponse.trim().length > 0;
      default:
        return false;
    }
  }, [currentQuestion, selectedOptions, likertValue, textResponse]);

  // Submit answer and move to next question
  const handleSubmitAnswer = async (isSkipped: boolean = false) => {
    if (!currentQuestion || !session || isSubmitting) return;
    if (!isSkipped && !isAnswerValid()) return;

    try {
      setIsSubmitting(true);
      
      const timeSpentSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
      
      const request: SubmitAnswerRequest = {
        sessionId: session.id,
        questionId: currentQuestion.question.id,
        selectedOptionIds: selectedOptions.length > 0 ? selectedOptions : undefined,
        likertValue: likertValue ?? undefined,
        textResponse: textResponse || undefined,
        timeSpentSeconds,
        skip: isSkipped,
      };

      await testSessionsApi.submitAnswer(sessionId, request);

      // Check if this was the last question
      if (currentQuestion.questionNumber >= currentQuestion.totalQuestions) {
        setShowCompleteDialog(true);
      } else {
        // Load next question
        const nextQuestion = await testSessionsApi.getCurrentQuestion(sessionId);
        setCurrentQuestion(nextQuestion);
        resetAnswerState(nextQuestion?.previousAnswer);
        setQuestionStartTime(Date.now());
        
        if (isSkipped) {
          toast.info('Вопрос пропущен');
        }
      }
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      toast.error('Не удалось сохранить ответ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = async () => {
    if (!currentQuestion || !session || session.currentQuestionIndex <= 0 || isSubmitting) return;
    
    // Check if back navigation is allowed
    if (!currentQuestion.allowBackNavigation) {
      toast.error('Возврат к предыдущим вопросам запрещён');
      return;
    }

    try {
      setIsSubmitting(true);
      // Navigate to previous question index
      const prevIndex = session.currentQuestionIndex - 1;
      await testSessionsApi.navigateToQuestion(sessionId, prevIndex);
      // Fetch the question after navigation
      const prevQuestion = await testSessionsApi.getCurrentQuestion(sessionId);
      setCurrentQuestion(prevQuestion);
      resetAnswerState(prevQuestion?.previousAnswer);
      setQuestionStartTime(Date.now());
      // Update session state
      setSession(prev => prev ? { ...prev, currentQuestionIndex: prevIndex } : null);
    } catch (err: any) {
      console.error('Failed to navigate back:', err);
      toast.error('Не удалось вернуться к предыдущему вопросу');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete the test
  const handleCompleteTest = async () => {
    try {
      setIsSubmitting(true);
      const result = await testSessionsApi.completeSession(sessionId);
      router.push(`/test-templates/results/${result.id}`);
    } catch (err: any) {
      console.error('Failed to complete test:', err);
      toast.error('Не удалось завершить тест');
    } finally {
      setIsSubmitting(false);
      setShowCompleteDialog(false);
    }
  };

  // Abandon the test
  const handleAbandonTest = async () => {
    try {
      await testSessionsApi.abandonSession(sessionId);
      router.push('/test-templates');
    } catch (err: any) {
      console.error('Failed to abandon test:', err);
      toast.error('Не удалось отменить тест');
    } finally {
      setShowAbandonDialog(false);
    }
  };

  // Render the appropriate question component
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const { question } = currentQuestion;
    const questionType = question.questionType as string;

    switch (questionType) {
      case 'SINGLE_CHOICE':
      case 'SJT':
      case 'SITUATIONAL_JUDGMENT':
        return (
          <SingleChoiceQuestion
            question={question}
            selectedOption={selectedOptions[0] || null}
            onSelectionChange={(id) => setSelectedOptions(id ? [id] : [])}
          />
        );
      case 'MULTIPLE_CHOICE':
      case 'MCQ':
        return (
          <MultipleChoiceQuestion
            question={question}
            selectedOptions={selectedOptions}
            onSelectionChange={setSelectedOptions}
          />
        );
      case 'LIKERT_SCALE':
      case 'LIKERT':
        return (
          <LikertScaleQuestion
            question={question}
            value={likertValue}
            onChange={setLikertValue}
          />
        );
      case 'OPEN_TEXT':
      case 'BEHAVIORAL_EXAMPLE':
      case 'SELF_REFLECTION':
      case 'PEER_FEEDBACK':
        return (
          <OpenTextQuestion
            question={question}
            value={textResponse}
            onChange={setTextResponse}
          />
        );
      default:
        return <p className="text-muted-foreground">Неизвестный тип вопроса</p>;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && isAnswerValid() && !isSubmitting) {
        e.preventDefault();
        handleSubmitAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerValid, isSubmitting]);

  // Loading state
  if (!isLoaded || isLoading) {
    return <TestTakeSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Ошибка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/test-templates')}>
              Вернуться к шаблонам
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return <TestTakeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionHeader 
        currentQuestion={currentQuestion.questionNumber} 
        totalQuestions={currentQuestion.totalQuestions}
        timeLeft={timeRemaining !== null ? formatTime(timeRemaining) : undefined}
        onQuit={() => setShowAbandonDialog(true)}
      />

      <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6">
        <div 
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" 
          key={currentQuestion.question.id}
        >
          {/* Question Text */}
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-center leading-tight">
            {currentQuestion.question.questionText}
          </h1>

          {/* Answer Options */}
          <div className="w-full max-w-2xl mx-auto">
            {renderQuestion()}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 p-4 border-t bg-background/95 backdrop-blur safe-area-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={handlePreviousQuestion}
            disabled={
              !currentQuestion.allowBackNavigation || 
              currentQuestion.questionNumber <= 1 || 
              isSubmitting
            }
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Назад</span>
          </Button>

          {/* Keyboard hint */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            Press <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">Enter ↵</kbd>
          </div>

          {/* Next/Submit button */}
          <Button 
            onClick={() => handleSubmitAnswer(false)} 
            disabled={isSubmitting || !isAnswerValid()}
            size="lg"
            className="min-w-[140px] rounded-xl shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : currentQuestion.questionNumber >= currentQuestion.totalQuestions ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Завершить
              </>
            ) : (
              <>
                Далее 
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </footer>

      {/* Complete confirmation dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Завершить тест?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы ответили на все вопросы. После завершения вы не сможете изменить свои ответы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Проверить ответы</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteTest} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Завершить тест
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Abandon confirmation dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Выйти из теста?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ваш прогресс будет сохранён. Вы сможете продолжить позже.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить тест</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAbandonTest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timeout dialog */}
      <AlertDialog open={showTimeoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Время истекло
            </AlertDialogTitle>
            <AlertDialogDescription>
              Отведённое время на тест закончилось. Ваши ответы будут сохранены автоматически.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCompleteTest}>
              Посмотреть результаты
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Question type label helper
function getQuestionTypeLabel(type: QuestionType | string): string {
  const labels: Record<string, string> = {
    SINGLE_CHOICE: 'Один вариант',
    MULTIPLE_CHOICE: 'Несколько вариантов',
    MCQ: 'Несколько вариантов',
    LIKERT_SCALE: 'Шкала',
    LIKERT: 'Шкала',
    OPEN_TEXT: 'Открытый ответ',
    BEHAVIORAL_EXAMPLE: 'Пример поведения',
    SELF_REFLECTION: 'Самооценка',
    PEER_FEEDBACK: 'Обратная связь',
    SJT: 'Ситуационный',
    SITUATIONAL_JUDGMENT: 'Ситуационный',
  };
  return labels[type as string] || String(type);
}

// Loading skeleton
function TestTakeSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6">
        <div className="space-y-8">
          <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <div className="space-y-3 max-w-2xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="sticky bottom-0 p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </footer>
    </div>
  );
}
