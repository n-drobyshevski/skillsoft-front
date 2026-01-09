'use client';

import { useTranslations } from 'next-intl';
import { TestTemplate, Competency } from '@/types/domain';
import type { TestActivity, TemplateActivityStats } from '@/types/activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

// Import sub-components
import { OverviewHero } from './OverviewHero';
import { SharingSummaryCard } from './SharingSummaryCard';
import { ConfigurationCard } from './ConfigurationCard';
import { QuickStatsGrid } from './QuickStatsGrid';
import { RecentActivityList } from './RecentActivityList';

// ============================================
// PROPS INTERFACE
// ============================================

export interface OverviewContentProps {
  /** The test template being displayed */
  template: TestTemplate;
  /** Competencies linked to this template */
  competencies: Competency[];
  /** Recent test activity for this template */
  activities: TestActivity[];
  /** Aggregated statistics for this template */
  stats: TemplateActivityStats | null;
  /** Whether current user is the template owner */
  isOwner: boolean;
  /** Whether current user can edit the template */
  canEdit: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * OverviewContent - Main client wrapper for the Overview tab.
 *
 * Coordinates all overview sections with responsive layout:
 * - Mobile (< 1024px): Single column stacked
 * - Desktop (>= 1024px): 3-column grid
 *
 * Sub-components:
 * - OverviewHero: Template header with key info and actions
 * - ConfigurationCard: Template settings summary
 * - RecentActivityList: Recent sessions and activity
 * - SharingSummaryCard: Visibility and sharing info
 * - QuickStatsGrid: Key metrics at a glance
 */
export function OverviewContent({
  template,
  competencies,
  activities,
  stats,
  isOwner,
  canEdit,
}: OverviewContentProps) {
  const t = useTranslations('template.hub.overview');
  // Derive draft state from template.isActive
  const isDraft = !template.isActive;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Hero Section - Full width */}
      <Card>
        <CardContent className="pt-6">
          <OverviewHero
            template={template}
            isDraft={isDraft}
            canEdit={canEdit}
          />
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration Card */}
          <ConfigurationCard
            template={template}
            competencyCount={competencies.length}
            isDraft={isDraft}
            canEdit={canEdit}
          />

          {/* Recent Activity List */}
          <RecentActivityList
            activities={activities}
            templateId={template.id}
            passingScore={template.passingScore}
          />
        </div>

        {/* Right Column (1 col on lg) */}
        <div className="space-y-6">
          {/* Sharing Summary Card */}
          <SharingSummaryCard
            templateId={template.id}
            templateName={template.name}
            isOwner={isOwner}
            canManage={canEdit}
          />

          {/* Quick Stats Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                {t('performance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickStatsGrid stats={stats} passingScore={template.passingScore} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OverviewContent;
