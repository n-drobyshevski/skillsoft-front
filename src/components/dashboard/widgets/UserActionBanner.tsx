'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { TestSessionSummary } from '@/types/domain';

interface UserActionBannerProps {
  sessions: TestSessionSummary[];
}

export function UserActionBanner({ sessions }: UserActionBannerProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('dashboard');

  if (sessions.length === 0) return null;

  const primary = sessions[0];
  const remaining = sessions.length - 1;
  const isInProgress = primary.status === 'IN_PROGRESS';
  const progress = primary.totalQuestions > 0
    ? Math.round((primary.answeredQuestions / primary.totalQuestions) * 100)
    : 0;

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' } };

  return (
    <motion.div {...motionProps}>
      <Card className="bg-linear-to-br from-blue-500/5 via-transparent to-indigo-500/5 border-blue-500/20 hover:shadow-md hover:border-blue-500/30 transition-all duration-200 motion-reduce:transition-none">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              {isInProgress ? (
                <RotateCcw className="w-5 h-5 text-blue-500" />
              ) : (
                <Play className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h4 className="font-semibold text-sm truncate">{primary.templateName}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('userDashboard.actionBanner.questionsProgress', {
                    answered: primary.answeredQuestions,
                    total: primary.totalQuestions,
                  })}
                  {' \u00B7 '}{progress}%
                </p>
              </div>
              <Progress value={progress} className="h-1.5" />
              {remaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('userDashboard.actionBanner.moreWaiting', { count: remaining })}
                </p>
              )}
            </div>
            <Button asChild size="sm" className="gap-2 min-h-[44px] sm:min-h-0 shrink-0">
              <Link href={`/test-templates/take/${primary.id}`}>
                {isInProgress
                  ? t('userDashboard.actionBanner.resume')
                  : t('userDashboard.actionBanner.start')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
