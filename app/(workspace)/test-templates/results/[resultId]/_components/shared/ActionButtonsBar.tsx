'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Home,
  RotateCcw,
  Download,
  UserPlus,
  Share2,
  Users,
  Send,
  Loader2,
  Check,
  Printer,
  Link2,
} from 'lucide-react';
import { ActionButtonsBarProps, ActionType } from './types';

/**
 * Action button icon/variant configuration (labels come from i18n).
 */
const ACTION_STYLE: Record<ActionType, {
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'outline' | 'secondary' | 'ghost';
}> = {
  download_profile: {
    labelKey: 'downloadProfile',
    icon: Download,
    variant: 'secondary'
  },
  download_report: {
    labelKey: 'downloadReport',
    icon: Printer,
    variant: 'secondary'
  },
  retake: {
    labelKey: 'retakeTest',
    icon: RotateCcw,
    variant: 'default'
  },
  save_to_profile: {
    labelKey: 'saveToProfile',
    icon: UserPlus,
    variant: 'secondary'
  },
  share: {
    labelKey: 'share',
    icon: Share2,
    variant: 'outline'
  },
  back_to_list: {
    labelKey: 'backToTests',
    icon: Home,
    variant: 'outline'
  },
  team_dashboard: {
    labelKey: 'teamDashboard',
    icon: Users,
    variant: 'secondary'
  },
  share_with_team: {
    labelKey: 'shareWithTeam',
    icon: Send,
    variant: 'outline'
  }
};

/**
 * Triggers browser print dialog for PDF export.
 * The result page renders with print-optimized styles.
 */
function downloadAsPrint() {
  window.print();
}

/**
 * Reusable action buttons bar for test results pages.
 * Renders scenario-appropriate action buttons with real handlers.
 * Includes Export PDF and Copy Link actions with i18n support.
 */
export function ActionButtonsBar({ templateId, resultId, actions }: ActionButtonsBarProps) {
  const router = useRouter();
  const t = useTranslations('results.actions');
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  /**
   * Copies the result share URL to clipboard.
   * Falls back to the Web Share API on mobile if available.
   */
  async function shareResult(action: 'share' | 'share_with_team') {
    const shareUrl = `${window.location.origin}/test-templates/results/${resultId}`;

    // Try native share on mobile first
    if (navigator.share && action === 'share') {
      try {
        await navigator.share({
          title: 'Assessment Result',
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('linkCopied'), {
        description: shareUrl,
        duration: 3000,
      });
    } catch {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(t('linkCopied'));
    }
  }

  /**
   * Copies the current page URL to clipboard and shows confirmation.
   */
  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setLinkCopied(true);
    toast.success(t('linkCopied'));
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const handleAction = async (action: ActionType) => {
    setLoadingAction(action);

    try {
      switch (action) {
        case 'download_profile':
        case 'download_report':
          downloadAsPrint();
          break;

        case 'save_to_profile':
          // TODO: Call passport API when POST /api/v1/passports/save-result/{resultId} is available
          toast.success(t('resultSaved'), {
            icon: <Check className="h-4 w-4" />,
          });
          break;

        case 'share':
        case 'share_with_team':
          await shareResult(action);
          break;

        case 'team_dashboard':
          router.push('/test-templates');
          break;
      }
    } catch {
      toast.error(t('actionFailed'));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 pt-4 sm:pt-6 border-t print:hidden">
      {/* Back to list - always first */}
      <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial h-9 sm:h-10">
        <Link href="/test-templates">
          <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
          <span className="truncate">{t('back')}</span>
        </Link>
      </Button>

      {/* Retake button - always second if present */}
      {actions.includes('retake') && (
        <Button asChild size="sm" className="flex-1 sm:flex-initial h-9 sm:h-10">
          <Link href={`/test-templates/${templateId}/start`}>
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
            <span className="truncate">{t('retake')}</span>
          </Link>
        </Button>
      )}

      {/* Export PDF button */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-initial h-9 sm:h-10 hidden sm:flex"
        onClick={downloadAsPrint}
      >
        <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
        <span className="truncate text-xs sm:text-sm">{t('exportPdf')}</span>
      </Button>

      {/* Copy Link button */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-initial h-9 sm:h-10 hidden sm:flex"
        onClick={copyLink}
      >
        {linkCopied ? (
          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0 text-emerald-600" />
        ) : (
          <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
        )}
        <span className="truncate text-xs sm:text-sm">
          {linkCopied ? t('linkCopied') : t('copyLink')}
        </span>
      </Button>

      {/* Other actions - only show first 2 on desktop */}
      {actions
        .filter(action => action !== 'retake' && action !== 'back_to_list')
        .slice(0, 2)
        .map((action, idx) => {
          const style = ACTION_STYLE[action];
          if (!style) return null;

          const Icon = style.icon;
          const isLoading = loadingAction === action;

          return (
            <Button
              key={action}
              variant={style.variant}
              size="sm"
              disabled={isLoading}
              className={`flex-1 sm:flex-initial h-9 sm:h-10 ${idx > 0 ? 'hidden sm:flex' : ''} ${idx === 0 ? 'sm:ml-auto' : ''}`}
              onClick={() => handleAction(action)}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
              )}
              <span className="truncate text-xs sm:text-sm">
                {t(style.labelKey)}
              </span>
            </Button>
          );
        })}
    </div>
  );
}
