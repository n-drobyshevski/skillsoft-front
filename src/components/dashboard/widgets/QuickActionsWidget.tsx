'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
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

/**
 * Action item configuration
 */
interface ActionItem {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
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
    title: 'New Competency',
    subtitle: 'Define skills and behaviors',
    href: '/hr/competencies/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: Brain,
    title: 'Add Indicator',
    subtitle: 'Create behavioral markers',
    href: '/hr/behavioral-indicators/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: ClipboardList,
    title: 'Create Question',
    subtitle: 'Build assessment items',
    href: '/hr/assessment-questions/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: FileText,
    title: 'New Template',
    subtitle: 'Design an assessment',
    href: '/test-templates/new',
    lenses: ['admin', 'editor'],
  },
  {
    icon: BarChart3,
    title: 'View Analytics',
    subtitle: 'Check psychometric metrics',
    href: '/psychometrics',
    lenses: ['admin', 'editor'],
  },

  // Admin-only actions
  {
    icon: Users,
    title: 'Manage Users',
    subtitle: 'User administration',
    href: '/admin/users',
    lenses: ['admin'],
  },
  {
    icon: Settings,
    title: 'Settings',
    subtitle: 'System configuration',
    href: '/admin/settings',
    lenses: ['admin'],
  },

  // User actions
  {
    icon: Play,
    title: 'Take Assessment',
    subtitle: 'Start a new evaluation',
    href: '/test-templates',
    lenses: ['user'],
  },
  {
    icon: BarChart3,
    title: 'My Results',
    subtitle: 'View past assessments',
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
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Zap className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-0.5">
          {visibleActions.map((action) => (
            <ActionRow key={action.href} {...action} />
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
  icon: Icon,
  title,
  subtitle,
  href,
}: ActionItem) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer min-h-[48px] touch-manipulation"
      >
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
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
        <div className="flex items-center gap-2">
          <Skeleton className="w-9 h-9 rounded-lg" />
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
