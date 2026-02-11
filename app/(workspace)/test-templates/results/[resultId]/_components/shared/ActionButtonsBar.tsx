'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Home,
  RotateCcw,
  Download,
  UserPlus,
  Share2,
  Users,
  Send
} from 'lucide-react';
import { ActionButtonsBarProps, ActionType } from './types';

/**
 * Action button configuration
 */
const ACTION_CONFIG: Record<ActionType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'outline' | 'secondary' | 'ghost';
}> = {
  download_profile: {
    label: 'Download Profile',
    icon: Download,
    variant: 'secondary'
  },
  download_report: {
    label: 'Download Report',
    icon: Download,
    variant: 'secondary'
  },
  retake: {
    label: 'Retake Test',
    icon: RotateCcw,
    variant: 'default'
  },
  save_to_profile: {
    label: 'Save to Profile',
    icon: UserPlus,
    variant: 'secondary'
  },
  share: {
    label: 'Share',
    icon: Share2,
    variant: 'outline'
  },
  back_to_list: {
    label: 'Back to Tests',
    icon: Home,
    variant: 'outline'
  },
  team_dashboard: {
    label: 'Team Dashboard',
    icon: Users,
    variant: 'secondary'
  },
  share_with_team: {
    label: 'Share with Team',
    icon: Send,
    variant: 'outline'
  }
};

/**
 * Reusable action buttons bar for test results pages.
 * Renders scenario-appropriate action buttons.
 */
export function ActionButtonsBar({ templateId, resultId, actions }: ActionButtonsBarProps) {
  const handleAction = (action: ActionType) => {
    switch (action) {
      case 'download_profile':
      case 'download_report':
        // TODO: Implement PDF download
        console.log(`Downloading ${action} for result ${resultId}`);
        break;
      case 'save_to_profile':
        // TODO: Save to user profile
        console.log(`Saving result ${resultId} to profile`);
        break;
      case 'share':
      case 'share_with_team':
        // TODO: Implement share functionality
        console.log(`Sharing result ${resultId}`);
        break;
      case 'team_dashboard':
        // TODO: Navigate to team dashboard
        console.log(`Navigating to team dashboard`);
        break;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 pt-4 sm:pt-6 border-t">
      {/* Back to list - always first */}
      <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial h-9 sm:h-10">
        <Link href="/test-templates">
          <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
          <span className="truncate">Back</span>
        </Link>
      </Button>

      {/* Retake button - always second if present */}
      {actions.includes('retake') && (
        <Button asChild size="sm" className="flex-1 sm:flex-initial h-9 sm:h-10">
          <Link href={`/test-templates/${templateId}/start`}>
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
            <span className="truncate">Retake</span>
          </Link>
        </Button>
      )}

      {/* Other actions - only show first action on mobile */}
      {actions
        .filter(action => action !== 'retake' && action !== 'back_to_list')
        .slice(0, 2)
        .map((action, idx) => {
          const config = ACTION_CONFIG[action];
          if (!config) return null;

          const Icon = config.icon;

          return (
            <Button
              key={action}
              variant={config.variant}
              size="sm"
              className={`flex-1 sm:flex-initial h-9 sm:h-10 ${idx > 0 ? 'hidden sm:flex' : ''} ${idx === 0 ? 'sm:ml-auto' : ''}`}
              onClick={() => handleAction(action)}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 shrink-0" />
              <span className="truncate text-xs sm:text-sm">{config.label}</span>
            </Button>
          );
        })}
    </div>
  );
}
