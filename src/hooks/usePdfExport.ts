'use client';

import { useState, useCallback, useRef } from 'react';
import { pdfExportApi, type PdfExportRequest } from '@/services/api/exports';

type ExportState = 'idle' | 'requesting' | 'polling' | 'downloading' | 'complete' | 'error';

interface UsePdfExportReturn {
  state: ExportState;
  error: string | null;
  generate: (request: PdfExportRequest) => void;
  retry: () => void;
  cancel: () => void;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

export function usePdfExport(): UsePdfExportReturn {
  const [state, setState] = useState<ExportState>('idle');
  const [error, setError] = useState<string | null>(null);
  const lastRequestRef = useRef<PdfExportRequest | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const cleanup = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (exportId: string, pollCount: number) => {
    if (cancelledRef.current) { setState('idle'); return; }
    if (pollCount >= MAX_POLLS) {
      setError('Export timed out. Please try again.');
      setState('error');
      return;
    }

    try {
      const status = await pdfExportApi.getStatus(exportId);
      if (cancelledRef.current) { setState('idle'); return; }

      switch (status.status) {
        case 'COMPLETED':
          setState('downloading');
          await pdfExportApi.download(exportId);
          setState('complete');
          setTimeout(() => setState('idle'), 3000);
          break;
        case 'FAILED':
          setError('PDF generation failed. Please try again.');
          setState('error');
          break;
        case 'CANCELLED':
          setState('idle');
          break;
        default:
          pollTimerRef.current = setTimeout(() => pollStatus(exportId, pollCount + 1), POLL_INTERVAL_MS);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  }, []);

  const generate = useCallback(async (request: PdfExportRequest) => {
    lastRequestRef.current = request;
    cancelledRef.current = false;
    cleanup();
    setError(null);
    setState('requesting');

    try {
      const response = await pdfExportApi.create(request);
      if (response.status === 'COMPLETED') {
        setState('downloading');
        await pdfExportApi.download(response.exportId);
        setState('complete');
        setTimeout(() => setState('idle'), 3000);
      } else {
        setState('polling');
        pollStatus(response.exportId, 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start export');
      setState('error');
    }
  }, [cleanup, pollStatus]);

  const retry = useCallback(() => {
    if (lastRequestRef.current) generate(lastRequestRef.current);
  }, [generate]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    cleanup();
    setState('idle');
    setError(null);
  }, [cleanup]);

  return { state, error, generate, retry, cancel };
}
