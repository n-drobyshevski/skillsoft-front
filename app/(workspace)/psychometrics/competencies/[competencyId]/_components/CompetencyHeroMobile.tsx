'use client';

/**
 * CompetencyHeroMobile - Mobile-first hero section for competency detail page
 *
 * Features:
 * - Mobile: Stacked layout with centered gauge and stats pills below
 * - Desktop: Side-by-side layout with gauge and stats grid
 * - Uses StatPillGroup for compact metrics
 * - Full ARIA accessibility
 * - Gradient background based on reliability status
 */

import { cn } from '@/lib/utils';
import { Users, FileText, TrendingUp } from 'lucide-react';
import { ReliabilityStatusBadge, StatPill, StatPillGroup } from '../../../_components';
import PageHeader from '@/components/common/PageHeader';
import { HeroAlphaGauge } from './HeroAlphaGauge';
import { getStatusGradient, getAlphaQuality } from '../_lib/competency-detail.utils';
import type { CompetencyReliabilityDetail } from '@/types/psychometrics';

interface CompetencyHeroMobileProps {
  /** Competency reliability detail data */
  data: CompetencyReliabilityDetail;
  /** Optional className for container */
  className?: string;
}

/**
 * Get variant for stat pill based on value thresholds
 */
function getSampleSizeVariant(sampleSize: number | null): 'success' | 'warning' | 'danger' | 'muted' {
  if (sampleSize === null) return 'muted';
  if (sampleSize >= 100) return 'success';
  if (sampleSize >= 30) return 'warning';
  return 'danger';
}

function getItemCountVariant(itemCount: number | null): 'success' | 'warning' | 'danger' | 'muted' {
  if (itemCount === null) return 'muted';
  if (itemCount >= 5) return 'success';
  if (itemCount >= 3) return 'warning';
  return 'danger';
}

function getAlphaVariant(alpha: number | null): 'success' | 'warning' | 'danger' | 'muted' {
  if (alpha === null) return 'muted';
  if (alpha >= 0.7) return 'success';
  if (alpha >= 0.6) return 'warning';
  return 'danger';
}

export function CompetencyHeroMobile({ data, className }: CompetencyHeroMobileProps) {
  const statusConfig = getStatusGradient(data.reliabilityStatus);
  const alphaQuality = getAlphaQuality(data.cronbachAlpha);

  return (
    <header
      className={cn(
        'relative px-4 py-6 sm:px-6',
        'bg-gradient-to-b',
        statusConfig.gradient,
        className
      )}
      role="banner"
    >
      {/* Header with title and status badge */}
      <PageHeader
        title={data.competencyName}
        description="Анализ надежности измерений"
      >
        <ReliabilityStatusBadge status={data.reliabilityStatus} className="text-sm" />
      </PageHeader>

      {/* Hero Content - Mobile: stacked, Desktop: side-by-side */}
      <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Alpha Gauge - Centered on mobile, left-aligned on desktop */}
        <div className="flex justify-center lg:justify-start">
          {/* Smaller on mobile, larger on tablet+ */}
          <HeroAlphaGauge
            alpha={data.cronbachAlpha}
            size="md"
            className="sm:hidden"
          />
          <HeroAlphaGauge
            alpha={data.cronbachAlpha}
            size="lg"
            className="hidden sm:flex"
          />
        </div>

        {/* Stats Section - Pill group on mobile, expanded grid on desktop */}
        <div className="w-full space-y-4 lg:flex-1">
          {/* Mobile: Compact pills */}
          <div className="lg:hidden">
            <StatPillGroup className="justify-center">
              <StatPill
                icon={Users}
                label="Респонденты"
                value={data.sampleSize?.toLocaleString() ?? '-'}
                variant={getSampleSizeVariant(data.sampleSize)}
                size="md"
                title={`Количество респондентов: ${data.sampleSize ?? 'нет данных'}`}
              />
              <StatPill
                icon={FileText}
                label="Элементы"
                value={data.itemCount ?? '-'}
                variant={getItemCountVariant(data.itemCount)}
                size="md"
                title={`Количество элементов шкалы: ${data.itemCount ?? 'нет данных'}`}
              />
              <StatPill
                icon={TrendingUp}
                label="Качество"
                value={alphaQuality.label}
                variant={getAlphaVariant(data.cronbachAlpha)}
                size="md"
                title={alphaQuality.description}
              />
            </StatPillGroup>
          </div>

          {/* Desktop: Expanded stats grid */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
            {/* Respondents Card */}
            <div
              className="text-center p-4 rounded-lg bg-background/50"
              role="group"
              aria-label="Sample size"
            >
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                <Users className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {data.sampleSize?.toLocaleString() ?? '-'}
              </p>
              <p className="text-sm text-muted-foreground">Респондентов</p>
            </div>

            {/* Items Card */}
            <div
              className="text-center p-4 rounded-lg bg-background/50"
              role="group"
              aria-label="Item count"
            >
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {data.itemCount ?? '-'}
              </p>
              <p className="text-sm text-muted-foreground">Элементов</p>
            </div>

            {/* Quality Card */}
            <div
              className="text-center p-4 rounded-lg bg-background/50"
              role="group"
              aria-label="Alpha quality assessment"
            >
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className={cn('text-lg font-bold', alphaQuality.textClass)}>
                {alphaQuality.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {alphaQuality.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default CompetencyHeroMobile;
