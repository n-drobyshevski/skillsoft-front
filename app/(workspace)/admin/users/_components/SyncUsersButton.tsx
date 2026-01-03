'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SyncResult {
  success: boolean;
  message?: string;
  created?: number;
  updated?: number;
  failed?: number;
  total?: number;
  error?: string;
  errors?: string[];
}

export function SyncUsersButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const t = useTranslations('users');

  const handleSync = async () => {
    setIsSyncing(true);

    const toastId = toast.loading(t('sync.toast.syncing'), {
      description: t('sync.toast.syncingDesc'),
    });

    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json() as SyncResult;

      if (result.success) {
        toast.success(t('sync.toast.success'), {
          id: toastId,
          description: t('sync.toast.successDesc', {
            created: result.created ?? 0,
            updated: result.updated ?? 0,
            total: result.total ?? 0,
          }),
          icon: <CheckCircle className="h-4 w-4" />,
        });

        // Refresh the router to re-fetch server components with fresh data
        router.refresh();
      } else {
        toast.error(t('sync.toast.failed'), {
          id: toastId,
          description: result.error || t('sync.toast.failedDesc'),
          icon: <AlertCircle className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.error(t('sync.toast.failed'), {
        id: toastId,
        description: error instanceof Error ? error.message : t('sync.toast.failedDesc'),
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="default"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-2 shadow-sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">{t('sync.syncing')}</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">{t('sync.button')}</span>
                <span className="sm:hidden">{t('sync.buttonShort')}</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('sync.tooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
