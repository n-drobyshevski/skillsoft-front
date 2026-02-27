'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Brain,
  ClipboardList,
  FileText,
  Zap,
  ChevronRight,
  Play,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useActiveLens } from '@/hooks/useLens';
import { useTranslations } from 'next-intl';

/**
 * Action item configuration
 */
interface ActionItem {
  icon: React.ElementType;
  titleKey: string;
  subtitleKey?: string;
  href: string;
  /** Which lenses can see this action */
  lenses: ('admin' | 'editor' | 'user')[];
}

/**
 * Available actions grouped by role/lens
 */
const ACTIONS: ActionItem[] = [
  // Admin/Editor actions
  {
    icon: Plus,
    titleKey: 'newCompetency',
    subtitleKey: 'defineSkills',
    href: '/hr/competencies/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: Brain,
    titleKey: 'addIndicator',
    subtitleKey: 'createBehavioralMarkers',
    href: '/hr/behavioral-indicators/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: ClipboardList,
    titleKey: 'createQuestion',
    subtitleKey: 'buildAssessmentItems',
    href: '/hr/assessment-questions/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: FileText,
    titleKey: 'newTemplate',
    subtitleKey: 'designAssessment',
    href: '/test-templates/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: BarChart3,
    titleKey: 'viewAnalytics',
    subtitleKey: 'checkPsychometricMetrics',
    href: '/psychometrics',
    lenses: ['admin', 'editor'],
  },

  // Admin-only actions
  {
    icon: Users,
    titleKey: 'manageUsers',
    subtitleKey: 'userAdministration',
    href: '/admin/users',
    lenses: ['admin'],
  },
  {
    icon: Settings,
    titleKey: 'settings',
    subtitleKey: 'systemConfiguration',
    href: '/admin/settings',
    lenses: ['admin'],
  },

  // User actions
  {
    icon: Play,
    titleKey: 'takeAssessment',
    subtitleKey: 'startAssessment',
    href: '/test-templates',
    lenses: ['user'],
  },
  {
    icon: BarChart3,
    titleKey: 'myResults',
    subtitleKey: 'viewPastAssessments',
    href: '/my-results',
    lenses: ['user'],
  },
];

/**
 * Props for QuickActionsWidget
 */
export interface QuickActionsWidgetProps {
  /** Maximum number of actions to display */
  maxActions?: number;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuickActionsWidget - Role-based action shortcuts.
 *
 * Displays relevant quick actions based on the current lens:
 * - Admin: Full CRUD + user management + settings
 * - Editor: CRUD actions for entities
 * - User: Assessment taking and results viewing
 *
 * @example
 * ```tsx
 * <QuickActionsWidget maxActions={5} />
 * ```
 */
export function QuickActionsWidget({
  maxActions = 5,
  loading = false,
  className,
}: QuickActionsWidgetProps) {
  const activeLens = useActiveLens();
  const t = useTranslations('dashboard');

  if (loading) {
    return <QuickActionsWidgetSkeleton className={className} />;
  }

  // Filter actions by current lens
  const visibleActions = ACTIONS.filter((action) =>
    action.lenses.includes(activeLens as 'admin' | 'editor' | 'user')
  ).slice(0, maxActions);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center">
            <Zap className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">{t('quickActions')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-0.5">
          {visibleActions.map((action) => (
            <ActionRow key={action.href} action={action} t={t} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Individual action row component
 */
function ActionRow({
  action,
  t,
}: {
  action: ActionItem;
  t: ReturnType<typeof useTranslations<'dashboard'>>;
}) {
  const Icon = action.icon;
  return (
    <Link href={action.href}>
      <div
        className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-muted/50 group cursor-pointer min-h-[48px] touch-manipulation hover:translate-x-0.5 active:scale-[0.99] transition-all duration-200 motion-reduce:transition-none"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{t(action.titleKey as Parameters<typeof t>[0])}</p>
          {action.subtitleKey && (
            <p className="text-xs text-muted-foreground truncate">{t(action.subtitleKey as Parameters<typeof t>[0])}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

/**
 * Loading skeleton for QuickActionsWidget
 */
function QuickActionsWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('h-full animate-pulse', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-0.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
