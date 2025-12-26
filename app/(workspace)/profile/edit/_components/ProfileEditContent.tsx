'use client';

import { User, ClipboardCheck, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AccountInfoSection } from './AccountInfoSection';
import { PreferencesSection } from './PreferencesSection';
import { QuickStatsGrid } from '../../_components/QuickStatsGrid';
import { RecentResultsSection } from '../../_components/RecentResultsSection';
import { PersonalityPassportCard } from '../../_components/PersonalityPassportCard';
import { TopCompetenciesCard } from '../../_components/TopCompetenciesCard';
import { cn } from '@/lib/utils';
import type { ProfileUserInfo, AssessmentSummary, CompetencyPassport } from '@/types/profile';

interface ProfileEditContentProps {
  userInfo: ProfileUserInfo;
  summary: AssessmentSummary;
  passport: CompetencyPassport;
}

// Tab configuration for profile edit
const TAB_CONFIG = [
  { value: 'account', label: 'Аккаунт', icon: User },
  { value: 'results', label: 'Результаты', icon: ClipboardCheck },
  { value: 'passport', label: 'Паспорт', icon: Brain },
] as const;

/**
 * Profile Edit Content - Main Client Component
 *
 * Tab-based navigation:
 * - Account: Editable personal info + preferences
 * - Results: Read-only test results summary
 * - Passport: Read-only competency passport (Big Five + Top Competencies)
 *
 * Mobile-optimized with responsive tab layout
 * Styled consistently with my-tests page tabs
 */
export function ProfileEditContent({
  userInfo,
  summary,
  passport,
}: ProfileEditContentProps) {
  return (
    <Tabs defaultValue="account" className="space-y-4 sm:space-y-6">
      {/* Tabs Header - Matches my-tests page styling */}
      <ScrollArea className="w-full">
        <TabsList className="inline-flex w-max h-11 sm:h-10 p-1 bg-muted/50 rounded-lg gap-1">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'inline-flex flex-none items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-1.5',
                  'min-h-[40px] sm:min-h-[36px]',
                  'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                  'text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-md'
                )}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      {/* Account Tab - Editable */}
      <TabsContent value="account" className="space-y-4 sm:space-y-6 mt-0">
        <AccountInfoSection userInfo={userInfo} />
        <PreferencesSection userInfo={userInfo} />
      </TabsContent>

      {/* Results Tab - Read-only */}
      <TabsContent value="results" className="space-y-4 sm:space-y-6 mt-0">
        <QuickStatsGrid summary={summary} />
        <RecentResultsSection results={summary.recentResults} />
      </TabsContent>

      {/* Passport Tab - Read-only */}
      <TabsContent value="passport" className="mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PersonalityPassportCard
            profile={passport.bigFiveProfile}
            confidence={passport.confidence}
            totalAssessments={passport.totalAssessmentsUsed}
          />
          <TopCompetenciesCard
            competencies={passport.topCompetencies}
            totalAssessments={passport.totalAssessmentsUsed}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
