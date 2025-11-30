'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { testSessionsApi } from '@/services/api';
import { 
  TestSession, 
  CurrentQuestionResponse, 
  SessionQuestion,
  SubmitAnswerRequest 
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

      if (!sessionData) {
        setError('Сессия не найдена');
        return;
      }

      // Check if user owns this session
      if (sessionData.clerkUserId !== userId) {
        setError('У вас нет доступа к этой сессии');
        return;
      }

      // Check session status
      if (sessionData.status === SessionStatus.COMPLETED) {
        // Redirect to results
        router.replace(`/test-templates/results/${sessionId}`);
        return;
      }

      if (sessionData.status === SessionStatus.ABANDONED) {
        setError('Эта сессия была отменена');
        return;
      }

      if (sessionData.status === SessionStatus.TIMED_OUT) {
        setError('Время на прохождение теста истекло');
        return;
      }

      setSession(sessionData);
      setCurrentQuestion(questionData);
      
      // Set timer from session
      if (sessionData.timeRemainingSeconds != null) {
        setTimeRemaining(sessionData.timeRemainingSeconds);
      }

      // Reset answer state for new question
      resetAnswerState(questionData?.previousAnswer);
      setQuestionStartTime(Date.now());

    } catch (err: any) {
      console.error('Failed to load session:', err);
      setError(err.message || 'Не удалось загрузить тест');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userId, router]);

  // Reset answer state based on previous answer
  const resetAnswerState = (previousAnswer?: CurrentQuestionResponse['previousAnswer']) => {
    if (previousAnswer) {
      setSelectedOptions(previousAnswer.selectedOptionIds || []);
      setLikertValue(previousAnswer.likertValue ?? null);
      setTextResponse(previousAnswer.textResponse || '');
    } else {
      setSelectedOptions([]);
      setLikertValue(null);
      setTextResponse('');
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          return 0;
        }
        
        const newTime = prev - 1;
        
        // Show warning at 5 minutes
        if (newTime === 300) {
          toast.warning('Осталось 5 минут!');
        }
        
        // Show warning at 1 minute
        if (newTime === 60) {
          toast.warning('Осталась 1 минута!');
        }
        
        // Time's up
        if (newTime <= 0) {
          setShowTimeoutDialog(true);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining]);

  // Periodically sync time with server
  useEffect(() => {
    if (!sessionId || timeRemaining === null) return;

    const syncInterval = setInterval(async () => {
      if (timeRemaining > 0) {
        try {
          await testSessionsApi.updateTime(sessionId, timeRemaining);
        } catch (err) {
          console.error('Failed to sync time:', err);
        }
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [sessionId, timeRemaining]);

  // Load data on mount
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      loadSessionData();
    } else if (isLoaded && !isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn, userId, loadSessionData, router]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate time spent on current question
  const getTimeSpentSeconds = (): number => {
    return Math.floor((Date.now() - questionStartTime) / 1000);
  };

  // Check if answer is valid
  const isAnswerValid = (): boolean => {
    if (!currentQuestion) return false;
    
    const questionType = currentQuestion.question.questionType;
    
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.SITUATIONAL_JUDGMENT:
        return selectedOptions.length > 0;
      case QuestionType.LIKERT_SCALE:
      case QuestionType.FREQUENCY_SCALE:
        return likertValue !== null;
      case QuestionType.OPEN_TEXT:
      case QuestionType.BEHAVIORAL_EXAMPLE:
      case QuestionType.SELF_REFLECTION:
        return textResponse.trim().length > 0;
      default:
        return selectedOptions.length > 0 || likertValue !== null || textResponse.trim().length > 0;
    }
  };

  // Build answer request
  const buildAnswerRequest = (isSkipped = false): SubmitAnswerRequest => {
    if (!currentQuestion) {
      throw new Error('No current question');
    }

    return {
      sessionId,
      questionId: currentQuestion.question.id,
      selectedOptionIds: selectedOptions.length > 0 ? selectedOptions : undefined,
      likertValue: likertValue ?? undefined,
      textResponse: textResponse.trim() || undefined,
      timeSpentSeconds: getTimeSpentSeconds(),
      isSkipped,
    };
  };

  // Submit answer and go to next question
  const handleSubmitAnswer = async (isSkipped = false) => {
    if (!currentQuestion || isSubmitting) return;
    
    // Validate answer if not skipping
    if (!isSkipped && !isAnswerValid()) {
      toast.error('Пожалуйста, выберите или введите ответ');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const answerRequest = buildAnswerRequest(isSkipped);
      await testSessionsApi.submitAnswer(sessionId, answerRequest);

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
    if (!currentQuestion || !session?.currentQuestionIndex || isSubmitting) return;
    
    // Check if back navigation is allowed
    if (!currentQuestion.allowBackNavigation) {
      toast.error('Возврат к предыдущим вопросам недоступен');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // First save current answer if any
      if (isAnswerValid()) {
        const answerRequest = buildAnswerRequest(false);
        await testSessionsApi.submitAnswer(sessionId, answerRequest);
      }

      // Navigate to previous
      await testSessionsApi.navigateToQuestion(sessionId, session.currentQuestionIndex - 1);
      
      // Load updated question
      const prevQuestion = await testSessionsApi.getCurrentQuestion(sessionId);
      setCurrentQuestion(prevQuestion);
      resetAnswerState(prevQuestion?.previousAnswer);
      setQuestionStartTime(Date.now());
      
    } catch (err: any) {
      console.error('Failed to navigate:', err);
      toast.error('Не удалось перейти к предыдущему вопросу');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete test
  const handleCompleteTest = async () => {
    try {
      setIsSubmitting(true);
      const result = await testSessionsApi.completeSession(sessionId);
      toast.success('Тест завершён!');
      router.replace(`/test-templates/results/${result.id}`);
    } catch (err: any) {
      console.error('Failed to complete test:', err);
      toast.error('Не удалось завершить тест');
    } finally {
      setIsSubmitting(false);
      setShowCompleteDialog(false);
    }
  };

  // Abandon test
  const handleAbandonTest = async () => {
    try {
      setIsSubmitting(true);
      await testSessionsApi.abandonSession(sessionId);
      toast.info('Тест отменён');
      router.replace('/test-templates');
    } catch (err: any) {
      console.error('Failed to abandon test:', err);
      toast.error('Не удалось отменить тест');
    } finally {
      setIsSubmitting(false);
      setShowAbandonDialog(false);
    }
  };

  // Handle timeout
  const handleTimeout = async () => {
    try {
      setIsSubmitting(true);
      const result = await testSessionsApi.completeSession(sessionId);
      toast.info('Время истекло. Тест завершён автоматически.');
      router.replace(`/test-templates/results/${result.id}`);
    } catch (err: any) {
      console.error('Failed to complete timed out test:', err);
      router.replace('/test-templates');
    } finally {
      setIsSubmitting(false);
      setShowTimeoutDialog(false);
    }
  };

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    const question = currentQuestion.question;
    
    switch (question.questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.SITUATIONAL_JUDGMENT:
      case QuestionType.CAPABILITY_ASSESSMENT:
        // Check if single or multiple choice based on answer options
        const hasMultipleCorrect = question.answerOptions?.filter(o => o.score && o.score > 0).length! > 1;
        if (hasMultipleCorrect) {
          return (
            <MultipleChoiceQuestion
              question={question}
              selectedOptions={selectedOptions}
              onSelectionChange={setSelectedOptions}
            />
          );
        }
        return (
          <SingleChoiceQuestion
            question={question}
            selectedOption={selectedOptions[0] || null}
            onSelectionChange={(id) => setSelectedOptions(id ? [id] : [])}
          />
        );
        
      case QuestionType.LIKERT_SCALE:
      case QuestionType.FREQUENCY_SCALE:
        return (
          <LikertScaleQuestion
            question={question}
            value={likertValue}
            onChange={setLikertValue}
          />
        );
        
      case QuestionType.OPEN_TEXT:
      case QuestionType.BEHAVIORAL_EXAMPLE:
      case QuestionType.SELF_REFLECTION:
      case QuestionType.PEER_FEEDBACK:
        return (
          <OpenTextQuestion
            question={question}
            value={textResponse}
            onChange={setTextResponse}
          />
        );
        
      default:
        // Fallback to single choice
        return (
          <SingleChoiceQuestion
            question={question}
            selectedOption={selectedOptions[0] || null}
            onSelectionChange={(id) => setSelectedOptions(id ? [id] : [])}
          />
        );
    }
  };

  // Loading state
  if (!isLoaded || isLoading) {
    return <TestTakeSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card className="border-destructive">
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

  const progressPercent = (currentQuestion.questionNumber / currentQuestion.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header - sticky with mobile-first design */}
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container max-w-4xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Test name and progress */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold truncate">{session.templateName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={progressPercent} className="flex-1 h-2" />
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
                </span>
              </div>
            </div>
            
            {/* Timer */}
            {timeRemaining !== null && (
              <Badge 
                variant={timeRemaining <= 300 ? "destructive" : "secondary"}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-base font-mono shrink-0"
              >
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
            
            {/* Exit button - touch-friendly */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAbandonDialog(true)}
              className="min-h-10 min-w-10 p-2 sm:px-3"
            >
              <Flag className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - mobile-optimized padding */}
      <main className="container max-w-3xl mx-auto py-4 px-3 sm:py-6 sm:px-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription className="text-base">
                  Вопрос {currentQuestion.questionNumber} из {currentQuestion.totalQuestions}
                </CardDescription>
                <Badge variant="outline" className="mt-2">
                  {getQuestionTypeLabel(currentQuestion.question.questionType)}
                </Badge>
              </div>
              {currentQuestion.question.timeLimit && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentQuestion.question.timeLimit} сек.
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question text */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-lg">{currentQuestion.question.questionText}</p>
            </div>
            
            {/* Answer options */}
            {renderQuestion()}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            {/* Navigation buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              {currentQuestion.allowBackNavigation && currentQuestion.questionNumber > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={isSubmitting}
                  className="min-h-11 flex-1 sm:flex-initial"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Назад
                </Button>
              )}
              
              {currentQuestion.allowSkip && (
                <Button
                  variant="ghost"
                  onClick={() => handleSubmitAnswer(true)}
                  disabled={isSubmitting}
                  className="min-h-11 flex-1 sm:flex-initial"
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Пропустить
                </Button>
              )}
            </div>
            
            {/* Submit button */}
            <Button
              className="w-full sm:w-auto sm:ml-auto min-h-11"
              onClick={() => handleSubmitAnswer(false)}
              disabled={isSubmitting || !isAnswerValid()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : currentQuestion.questionNumber >= currentQuestion.totalQuestions ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Завершить тест
                </>
              ) : (
                <>
                  Далее
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>

      {/* Complete confirmation dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Завершить тест?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы ответили на все вопросы. После завершения вы не сможете изменить ответы.
              Вы уверены, что хотите завершить тест?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Вернуться к вопросам</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteTest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Завершение...
                </>
              ) : (
                'Завершить тест'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Abandon confirmation dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Выйти из теста?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите выйти? Ваш прогресс будет сохранён, и вы сможете продолжить позже.
              Если вы хотите полностью отменить тест, выберите «Отменить тест».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Продолжить тест</AlertDialogCancel>
            <Button variant="outline" onClick={() => router.push('/test-templates')}>
              Выйти (продолжить позже)
            </Button>
            <Button variant="destructive" onClick={handleAbandonTest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отмена...
                </>
              ) : (
                'Отменить тест'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timeout dialog */}
      <AlertDialog open={showTimeoutDialog} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Время истекло
            </AlertDialogTitle>
            <AlertDialogDescription>
              Время на прохождение теста закончилось. Тест будет завершён автоматически с вашими текущими ответами.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleTimeout} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Завершение...
                </>
              ) : (
                'Завершить тест'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Question type label helper
function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case QuestionType.LIKERT_SCALE:
      return 'Шкала оценки';
    case QuestionType.SITUATIONAL_JUDGMENT:
      return 'Ситуационный вопрос';
    case QuestionType.BEHAVIORAL_EXAMPLE:
      return 'Поведенческий пример';
    case QuestionType.MULTIPLE_CHOICE:
      return 'Выбор ответа';
    case QuestionType.CAPABILITY_ASSESSMENT:
      return 'Оценка способностей';
    case QuestionType.SELF_REFLECTION:
      return 'Самоанализ';
    case QuestionType.PEER_FEEDBACK:
      return 'Обратная связь';
    case QuestionType.FREQUENCY_SCALE:
      return 'Шкала частоты';
    case QuestionType.OPEN_TEXT:
      return 'Открытый ответ';
    default:
      return 'Вопрос';
  }
}

// Loading skeleton
function TestTakeSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-3 mt-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
