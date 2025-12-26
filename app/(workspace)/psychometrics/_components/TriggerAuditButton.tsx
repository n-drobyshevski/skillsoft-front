'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { RefreshCw, Loader2 } from 'lucide-react';
import { psychometricsApi } from '@/services/api';
import { revalidatePsychometricsAfterAudit } from '@/app/actions/psychometrics';

export function TriggerAuditButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleTriggerAudit = async () => {
    setIsLoading(true);
    try {
      const result = await psychometricsApi.triggerAudit();
      toast.success('Audit completed', {
        description: result.message || `Processed: ${result.itemsRecalculated} items, ${result.competenciesRecalculated} competencies`,
      });

      // Revalidate all psychometrics cached data using server action
      startTransition(async () => {
        await revalidatePsychometricsAfterAudit();
        // Refresh the page to show updated data
        router.refresh();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run audit';
      toast.error('Audit error', {
        description: message,
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const isProcessing = isLoading || isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 min-h-[44px]" disabled={isProcessing}>
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Run Audit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Run Psychometric Audit?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                The audit will recalculate all psychometric metrics:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Difficulty and discrimination indices for all questions</li>
                <li>Cronbach's Alpha coefficients for competencies</li>
                <li>Big Five trait scale reliability</li>
                <li>Automatic item status updates</li>
              </ul>
              <p className="text-amber-600 dark:text-amber-400">
                This may take several minutes depending on data volume.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing} className="min-h-[44px]">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleTriggerAudit} disabled={isProcessing} className="min-h-[44px]">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Run Audit'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
