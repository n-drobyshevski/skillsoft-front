'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const handleSync = async () => {
    setIsSyncing(true);
    
    const toastId = toast.loading('Syncing users from Clerk...', {
      description: 'Fetching user data and updating the database',
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
        toast.success('Users synced successfully!', {
          id: toastId,
          description: `Created: ${result.created ?? 0}, Updated: ${result.updated ?? 0}, Total: ${result.total ?? 0}`,
          icon: <CheckCircle className="h-4 w-4" />,
        });

        // Refresh the router to re-fetch server components with fresh data
        router.refresh();
      } else {
        toast.error('Sync failed', {
          id: toastId,
          description: result.error || 'Unknown error occurred',
          icon: <AlertCircle className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.error('Sync failed', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Network error occurred',
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
                <span className="hidden sm:inline">Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Sync from Clerk</span>
                <span className="sm:hidden">Sync</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Manually sync all users from Clerk to the database</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
