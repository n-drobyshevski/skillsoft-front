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
    <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
      {/* Back to list - always first */}
      <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial">
        <Link href="/test-templates">
          <Home className="h-4 w-4 mr-2" />
          Back to Tests
        </Link>
      </Button>

      {/* Retake button - always second if present */}
      {actions.includes('retake') && (
        <Button asChild size="sm" className="flex-1 sm:flex-initial">
          <Link href={`/test-templates/${templateId}/start`}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Test
          </Link>
        </Button>
      )}

      {/* Other actions */}
      {actions
        .filter(action => action !== 'retake' && action !== 'back_to_list')
        .map(action => {
          const config = ACTION_CONFIG[action];
          if (!config) return null;

          const Icon = config.icon;

          return (
            <Button
              key={action}
              variant={config.variant}
              size="sm"
              className="flex-1 sm:flex-initial sm:ml-auto"
              onClick={() => handleAction(action)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.label}
            </Button>
          );
        })}
    </div>
  );
}
