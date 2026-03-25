'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';
import Link from 'next/link';
import { useActiveLens } from '@/hooks/useLens';
import { useTranslations } from 'next-intl';

interface DashboardHeaderProps {
  currentUser?: {
    firstName?: string;
    role: 'ADMIN' | 'EDITOR' | 'USER';
  };
  /** Server-resolved lens state — overrides client hydration to prevent flash */
  isUserLensServer?: boolean;
}

/**
 * DashboardHeader - Renders the dashboard greeting and action buttons.
 *
 * Extracted from DashboardContent to allow immediate rendering in the
 * streaming shell (no data dependencies beyond currentUser).
 */
export default function DashboardHeader({ currentUser, isUserLensServer }: DashboardHeaderProps) {
  const activeLens = useActiveLens();
  // Use server-resolved lens if provided (prevents hydration flash),
  // fall back to client-side lens store
  const isUserLens = isUserLensServer ?? (activeLens === 'user');
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('dashboard');

  const isAdmin = currentUser?.role === 'ADMIN';
  const isEditor = currentUser?.role === 'EDITOR' || isAdmin;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <motion.header
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          {greeting()}{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isUserLens
            ? t('userSubtitle')
            : t('overviewSubtitle')}
        </p>
      </div>
      {/* Action buttons - stack on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {isEditor && !isUserLens && (
          <Button asChild variant="outline" size="default" className="w-full sm:w-auto gap-2 min-h-11 justify-center">
            <Link href="/hr/competencies/new">
              <Plus className="w-4 h-4" />
              <span>{t('addCompetency')}</span>
            </Link>
          </Button>
        )}
        <Button asChild size="default" className="w-full sm:w-auto gap-2 min-h-11 justify-center">
          <Link href="/test-templates">
            <Play className="w-4 h-4" />
            <span>{isUserLens ? t('browseAssessments') : t('takeAssessment')}</span>
          </Link>
        </Button>
      </div>
    </motion.header>
  );
}
