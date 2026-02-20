'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  UserPlus,
  MessageCircle,
  Users,
  ListChecks,
  ArrowRight,
} from 'lucide-react';
import type { CompetencyScore, TeamFitExtendedMetrics } from '@/types/domain';
import type { BigFiveProfile } from '@/hooks/useBigFiveProjection';

// ============================================================================
// Communication Style Detection
// ============================================================================

interface CommunicationProfile {
  /** Primary communication style key for i18n lookup */
  styleKey: string;
  /** Traits that inform this style */
  traits: string[];
}

/**
 * Derives a communication style from Big Five personality dimensions.
 * Returns a key used for i18n lookup under nextSteps.onboarding.styles.*
 */
function deriveCommunicationStyle(
  bigFive: BigFiveProfile | Record<string, number> | null | undefined
): CommunicationProfile {
  if (!bigFive || Object.keys(bigFive).length === 0) {
    return { styleKey: 'balanced', traits: [] };
  }

  // Cast to record for flexible key access (handles both PascalCase and UPPER_CASE)
  const profile = bigFive as Record<string, number | undefined>;
  const extraversion = profile['EXTRAVERSION'] ?? profile['Extraversion'] ?? 50;
  const agreeableness = profile['AGREEABLENESS'] ?? profile['Agreeableness'] ?? 50;
  const openness = profile['OPENNESS'] ?? profile['Openness'] ?? 50;
  const conscientiousness = profile['CONSCIENTIOUSNESS'] ?? profile['Conscientiousness'] ?? 50;

  const traits: string[] = [];

  if (extraversion >= 70) {
    traits.push('extraverted');
    if (agreeableness >= 60) return { styleKey: 'collaborative', traits };
    return { styleKey: 'assertive', traits };
  }

  if (extraversion <= 40) {
    traits.push('introverted');
    if (conscientiousness >= 60) return { styleKey: 'analytical', traits };
    return { styleKey: 'reflective', traits };
  }

  if (openness >= 70) {
    traits.push('open');
    return { styleKey: 'creative', traits };
  }

  if (conscientiousness >= 70) {
    traits.push('conscientious');
    return { styleKey: 'structured', traits };
  }

  return { styleKey: 'balanced', traits };
}

// ============================================================================
// Team Role Detection
// ============================================================================

interface TeamRoleProfile {
  roleKey: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Determines team role fit based on competency scores and team metrics.
 */
function deriveTeamRole(
  competencyScores: CompetencyScore[],
  teamMetrics: TeamFitExtendedMetrics | null
): TeamRoleProfile {
  if (competencyScores.length === 0) {
    return { roleKey: 'contributor', confidence: 'low' };
  }

  const avgScore = competencyScores.reduce((s, c) => s + c.percentage, 0) / competencyScores.length;
  const maxScore = Math.max(...competencyScores.map(c => c.percentage));
  const minScore = Math.min(...competencyScores.map(c => c.percentage));
  const range = maxScore - minScore;

  // Specialist: wide range with clear peaks
  if (range > 35 && maxScore >= 75) {
    return { roleKey: 'specialist', confidence: 'high' };
  }

  // Leader: high average with broad skills
  if (avgScore >= 75 && range < 25) {
    return { roleKey: 'leader', confidence: 'high' };
  }

  // Gap filler: team metrics show high diversity contribution
  if (teamMetrics && teamMetrics.diversityRatio > 0.6) {
    return { roleKey: 'gapFiller', confidence: 'medium' };
  }

  // Collaborator: moderate+ scores, balanced
  if (avgScore >= 55 && range < 30) {
    return { roleKey: 'collaborator', confidence: 'medium' };
  }

  // Generalist: moderate balanced profile
  if (range < 20) {
    return { roleKey: 'generalist', confidence: 'medium' };
  }

  return { roleKey: 'contributor', confidence: 'low' };
}

// ============================================================================
// Onboarding Focus Items
// ============================================================================

interface OnboardingFocusItem {
  /** i18n key under nextSteps.onboarding.focusItems.* */
  key: string;
  /** Priority: 1 = highest */
  priority: number;
}

/**
 * Generates prioritized onboarding focus items based on gaps and team fit data.
 */
function generateOnboardingFocus(
  competencyScores: CompetencyScore[],
  teamMetrics: TeamFitExtendedMetrics | null,
  communicationStyle: string
): OnboardingFocusItem[] {
  const items: OnboardingFocusItem[] = [];

  // Always include team integration
  items.push({ key: 'teamIntegration', priority: 1 });

  // Communication style-specific recommendation
  if (communicationStyle === 'assertive' || communicationStyle === 'collaborative') {
    items.push({ key: 'leverageStrengths', priority: 2 });
  } else if (communicationStyle === 'analytical' || communicationStyle === 'reflective') {
    items.push({ key: 'gradualExposure', priority: 2 });
  } else {
    items.push({ key: 'buildRelationships', priority: 2 });
  }

  // Gap-based recommendations
  const gaps = competencyScores.filter(c => c.percentage < 50);
  if (gaps.length > 0) {
    items.push({ key: 'skillDevelopment', priority: 3 });
  }

  // Saturation-based recommendation
  if (teamMetrics && teamMetrics.saturationRatio > 0.5) {
    items.push({ key: 'differentiateRole', priority: 4 });
  } else {
    items.push({ key: 'mentorship', priority: 4 });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

// ============================================================================
// Component
// ============================================================================

interface OnboardingRecommendationsProps {
  competencyScores: CompetencyScore[];
  bigFiveProfile: BigFiveProfile | Record<string, number> | null | undefined;
  teamMetrics: TeamFitExtendedMetrics | null;
}

/**
 * Onboarding Recommendations component for TeamFit results.
 *
 * Surfaces team dynamic insights and provides actionable onboarding guidance:
 * - Communication Style: derived from Big Five personality dimensions
 * - Team Role Fit: based on competency distribution and team composition
 * - Recommended Onboarding Focus: 3-4 prioritized actionable items
 *
 * All text is bilingual via next-intl.
 */
export function OnboardingRecommendations({
  competencyScores,
  bigFiveProfile,
  teamMetrics,
}: OnboardingRecommendationsProps) {
  const t = useTranslations('results.nextSteps.onboarding');
  const [isOpen, setIsOpen] = useState(true);

  const communicationProfile = useMemo(
    () => deriveCommunicationStyle(bigFiveProfile),
    [bigFiveProfile]
  );

  const teamRole = useMemo(
    () => deriveTeamRole(competencyScores, teamMetrics),
    [competencyScores, teamMetrics]
  );

  const onboardingFocus = useMemo(
    () => generateOnboardingFocus(competencyScores, teamMetrics, communicationProfile.styleKey),
    [competencyScores, teamMetrics, communicationProfile.styleKey]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="animate-fadeInUp-4 print:shadow-none print:border-0">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {t('title')}
              </CardTitle>
              <ChevronDown
                className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-200 print:hidden ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('description')}
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 sm:space-y-5 px-3 sm:px-6">
            {/* Communication Style Section */}
            <div className="p-3 sm:p-4 bg-blue-500/5 rounded-xl border border-blue-500/15">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/15 shrink-0">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                    {t('communicationStyle')}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-1.5">
                    {t(`styles.${communicationProfile.styleKey}.label`)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t(`styles.${communicationProfile.styleKey}.description`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Role Fit Section */}
            <div className="p-3 sm:p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/15">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/15 shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                    {t('teamRole')}
                  </h4>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      {t(`roles.${teamRole.roleKey}.label`)}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      teamRole.confidence === 'high'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : teamRole.confidence === 'medium'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {t(`confidence.${teamRole.confidence}`)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t(`roles.${teamRole.roleKey}.description`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Onboarding Focus Areas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                <h4 className="text-sm sm:text-base font-semibold text-foreground">
                  {t('focusAreas')}
                </h4>
              </div>
              <div className="space-y-2">
                {onboardingFocus.map((item, index) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 p-2.5 sm:p-3 bg-muted/40 hover:bg-muted/60 rounded-xl border border-border/50 transition-colors"
                  >
                    <span className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold shrink-0 tabular-nums">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground mb-0.5">
                        {t(`focusItems.${item.key}.title`)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                        {t(`focusItems.${item.key}.description`)}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 hidden sm:block" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
