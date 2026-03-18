'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { usePdfExport } from '@/hooks/usePdfExport';
import type { PdfExportRequest } from '@/services/api/exports';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultId: string;
}

export function ExportDialog({ open, onOpenChange, resultId }: ExportDialogProps) {
  const t = useTranslations('results.actions.exportDialog');
  const locale = useLocale();
  const [format, setFormat] = useState<PdfExportRequest['format']>('MANAGER_SUMMARY');
  const { state, error, generate, retry, cancel } = usePdfExport();

  function handleGenerate() {
    generate({ resultId, format, locale });
  }

  function handleClose() {
    if (state === 'requesting' || state === 'polling' || state === 'downloading') cancel();
    onOpenChange(false);
  }

  const isProcessing = state === 'requesting' || state === 'polling' || state === 'downloading';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('format')}</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as PdfExportRequest['format'])}
              disabled={isProcessing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MANAGER_SUMMARY" id="fmt-summary" />
                <Label htmlFor="fmt-summary">{t('formatManagerSummary')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FULL_REPORT" id="fmt-full" />
                <Label htmlFor="fmt-full">{t('formatFullReport')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CANDIDATE_BRIEF" id="fmt-brief" />
                <Label htmlFor="fmt-brief">{t('formatCandidateBrief')}</Label>
              </div>
            </RadioGroup>
          </div>

          {state === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error ?? t('error')}</span>
            </div>
          )}

          {state === 'complete' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{t('complete')}</span>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          {state === 'error' ? (
            <Button onClick={retry}>{t('retry')}</Button>
          ) : (
            <Button onClick={handleGenerate} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {state === 'downloading' ? t('downloading') : t('generating')}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {t('generate')}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
