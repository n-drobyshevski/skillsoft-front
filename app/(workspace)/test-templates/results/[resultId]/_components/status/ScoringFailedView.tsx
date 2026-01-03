'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  Home,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BaseResultViewProps } from '../shared/types';
import { retryScoring } from '@/services/api.client';

/**
 * Error details for display and support.
 */
interface ErrorContext {
  resultId: string;
  sessionId: string;
  templateName: string;
  completedAt: string;
  questionsAnswered: number;
  totalTimeSeconds: number;
}

/**
 * Format error context for support ticket.
 */
function formatErrorContext(context: ErrorContext): string {
  return `
Result ID: ${context.resultId}
Session ID: ${context.sessionId}
Assessment: ${context.templateName}
Completed At: ${context.completedAt}
Questions Answered: ${context.questionsAnswered}
Time Spent: ${Math.floor(context.totalTimeSeconds / 60)}m ${context.totalTimeSeconds % 60}s
  `.trim();
}

/**
 * ScoringFailedView - Error recovery interface for failed scoring.
 *
 * Displayed when backend scoring exhausts all retries and enters FAILED status.
 *
 * Features:
 * - Clear error messaging with empathetic tone
 * - Retry functionality with loading state
 * - Contact support link with pre-filled context
 * - Technical details collapsible for advanced users
 * - Copy-to-clipboard for support information
 * - Navigation options (home, retake assessment)
 *
 * Recovery Flow:
 * 1. User sees error with explanation
 * 2. User can retry (triggers backend re-calculation)
 * 3. If retry succeeds, page refreshes to show results
 * 4. If retry fails, user can contact support
 *
 * @param result - TestResult with FAILED status
 * @param template - TestTemplate for context
 */
export function ScoringFailedView({ result, template }: BaseResultViewProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorContext: ErrorContext = {
    resultId: result.id,
    sessionId: result.sessionId,
    templateName: template.name,
    completedAt: result.completedAt,
    questionsAnswered: result.questionsAnswered,
    totalTimeSeconds: result.totalTimeSeconds,
  };

  /**
   * Handle retry button click.
   * Triggers backend to re-attempt scoring calculation.
   */
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryError(null);

    try {
      const updatedResult = await retryScoring(result.id);

      if (updatedResult.status === 'COMPLETED') {
        // Success - refresh page to show results
        router.refresh();
      } else if (updatedResult.status === 'PENDING') {
        // Scoring started - refresh to show pending view
        router.refresh();
      } else {
        // Still failed
        setRetryError('Scoring calculation failed again. Please contact support.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setRetryError(err.message);
      } else {
        setRetryError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsRetrying(false);
    }
  }, [result.id, router]);

  /**
   * Copy error context to clipboard.
   */
  const handleCopyContext = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatErrorContext(errorContext));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      console.error('Failed to copy to clipboard');
    }
  }, [errorContext]);

  /**
   * Generate support email link with pre-filled context.
   */
  const supportEmailHref = `mailto:support@skillsoft.com?subject=${encodeURIComponent(
    `Scoring Error - ${template.name}`
  )}&body=${encodeURIComponent(
    `Hi Support Team,\n\nI encountered an error while calculating my assessment results.\n\n${formatErrorContext(errorContext)}\n\nPlease help me resolve this issue.\n\nThank you.`
  )}`;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive/20">
        <CardHeader className="text-center pb-4">
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-4 w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </motion.div>

          <CardTitle className="text-xl">Unable to Calculate Results</CardTitle>
          <CardDescription className="text-base mt-2">
            We encountered an issue while processing your assessment results.
            Don&apos;t worry - your answers have been saved securely.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Retry Error Alert */}
          {retryError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Retry Failed</AlertTitle>
              <AlertDescription>{retryError}</AlertDescription>
            </Alert>
          )}

          {/* Assessment Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Assessment</span>
              <span className="font-medium">{template.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Questions Answered</span>
              <Badge variant="secondary">{result.questionsAnswered}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time Spent</span>
              <Badge variant="secondary">
                {Math.floor(result.totalTimeSeconds / 60)}m {result.totalTimeSeconds % 60}s
              </Badge>
            </div>
          </div>

          {/* What Happened Section */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              What happened?
            </h4>
            <p className="text-sm text-muted-foreground">
              Our scoring system processes your answers through multiple stages.
              Occasionally, high server load or temporary issues can interrupt this process.
              The system attempted to recover automatically but was unsuccessful.
            </p>
          </div>

          {/* Technical Details (Collapsible) */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-muted-foreground text-xs">Technical Details</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-muted rounded-md p-3 mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-xs">Result ID</code>
                  <code className="text-xs text-muted-foreground">{result.id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs">Session ID</code>
                  <code className="text-xs text-muted-foreground">{result.sessionId}</code>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs">Completed At</code>
                  <code className="text-xs text-muted-foreground">
                    {new Date(result.completedAt).toLocaleString()}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleCopyContext}
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy for Support
                    </>
                  )}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          {/* Primary Action: Retry */}
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
            size="lg"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </>
            )}
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/test-templates')}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <a href={supportEmailHref}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </div>

          {/* Estimated Wait Time Notice */}
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Support typically responds within 24 hours
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
