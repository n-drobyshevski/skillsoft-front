'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface UserOnboardingCardProps {
  firstName?: string;
}

export function UserOnboardingCard({ firstName }: UserOnboardingCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('dashboard');

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' as const } };

  return (
    <motion.div {...motionProps}>
      <Card className="bg-linear-to-br from-primary/5 via-transparent to-purple-500/5 border-primary/20">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
                {t('userDashboard.onboarding.welcome', { name: firstName || '' })}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t('userDashboard.onboarding.description')}
              </p>
            </div>
            <Button asChild size="lg" className="gap-2 min-h-[44px]">
              <Link href="/test-templates">
                {t('userDashboard.onboarding.cta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
