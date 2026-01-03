'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

type HelpItem = {
  title: string;
  content: React.ReactNode;
};

type PsychometricHelp = {
  [key: string]: HelpItem;
};

/**
 * Hook that returns translated psychometric help content
 *
 * This hook generates JSX content dynamically using translation keys,
 * providing fully localized help tooltips.
 */
export function usePsychometricHelp(): PsychometricHelp {
  const t = useTranslations('psychometrics.help');

  return React.useMemo(() => ({
    // Core metrics
    difficulty: {
      title: t('difficulty.title'),
      content: (
        <div className="space-y-1">
          <p>{t('difficulty.description')}</p>
          <p className="text-muted-foreground">{t('difficulty.example')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('difficulty.tooHard')}</li>
            <li>{t('difficulty.optimal')}</li>
            <li>{t('difficulty.tooEasy')}</li>
          </ul>
        </div>
      ),
    },

    discrimination: {
      title: t('discrimination.title'),
      content: (
        <div className="space-y-1">
          <p>{t('discrimination.description')}</p>
          <p className="text-muted-foreground">{t('discrimination.technical')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('discrimination.toxic')}</li>
            <li>{t('discrimination.critical')}</li>
            <li>{t('discrimination.marginal')}</li>
            <li>{t('discrimination.good')}</li>
          </ul>
        </div>
      ),
    },

    cronbachAlpha: {
      title: t('cronbachAlpha.title'),
      content: (
        <div className="space-y-1">
          <p>{t('cronbachAlpha.description')}</p>
          <p className="text-muted-foreground">{t('cronbachAlpha.technical')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('cronbachAlpha.unreliable')}</li>
            <li>{t('cronbachAlpha.acceptable')}</li>
            <li>{t('cronbachAlpha.reliable')}</li>
          </ul>
        </div>
      ),
    },

    validityStatus: {
      title: t('validityStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('validityStatus.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('validityStatus.active')}</li>
            <li>{t('validityStatus.probation')}</li>
            <li>{t('validityStatus.flagged')}</li>
            <li>{t('validityStatus.retired')}</li>
          </ul>
        </div>
      ),
    },

    responseCount: {
      title: t('responseCount.title'),
      content: (
        <div className="space-y-1">
          <p>{t('responseCount.description')}</p>
          <p className="text-muted-foreground">{t('responseCount.minimum')}</p>
        </div>
      ),
    },

    alphaIfDeleted: {
      title: t('alphaIfDeleted.title'),
      content: (
        <div className="space-y-1">
          <p>{t('alphaIfDeleted.description')}</p>
          <p className="text-muted-foreground">{t('alphaIfDeleted.interpretation')}</p>
        </div>
      ),
    },

    distractorEfficiency: {
      title: t('distractorEfficiency.title'),
      content: (
        <div className="space-y-1">
          <p>{t('distractorEfficiency.description')}</p>
          <p className="text-muted-foreground">{t('distractorEfficiency.threshold')}</p>
        </div>
      ),
    },

    bigFive: {
      title: t('bigFive.title'),
      content: (
        <div className="space-y-1">
          <p>{t('bigFive.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('bigFive.openness')}</li>
            <li>{t('bigFive.conscientiousness')}</li>
            <li>{t('bigFive.extraversion')}</li>
            <li>{t('bigFive.agreeableness')}</li>
            <li>{t('bigFive.neuroticism')}</li>
          </ul>
        </div>
      ),
    },

    sampleSize: {
      title: t('sampleSize.title'),
      content: <p>{t('sampleSize.description')}</p>,
    },

    itemCount: {
      title: t('itemCount.title'),
      content: <p>{t('itemCount.description')}</p>,
    },

    averageDiscrimination: {
      title: t('averageDiscrimination.title'),
      content: (
        <div className="space-y-1">
          <p>{t('averageDiscrimination.description')}</p>
          <p className="text-muted-foreground">{t('averageDiscrimination.purpose')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('averageDiscrimination.needsWork')}</li>
            <li>{t('averageDiscrimination.acceptable')}</li>
            <li>{t('averageDiscrimination.good')}</li>
          </ul>
        </div>
      ),
    },

    averageAlpha: {
      title: t('averageAlpha.title'),
      content: (
        <div className="space-y-1">
          <p>{t('averageAlpha.description')}</p>
          <p className="text-muted-foreground">{t('averageAlpha.purpose')}</p>
        </div>
      ),
    },

    activeItemsPercent: {
      title: t('activeItemsPercent.title'),
      content: (
        <div className="space-y-1">
          <p>{t('activeItemsPercent.description')}</p>
          <p className="text-muted-foreground">{t('activeItemsPercent.meaning')}</p>
        </div>
      ),
    },

    reliableCompetenciesPercent: {
      title: t('reliableCompetenciesPercent.title'),
      content: (
        <div className="space-y-1">
          <p>{t('reliableCompetenciesPercent.description')}</p>
          <p className="text-muted-foreground">{t('reliableCompetenciesPercent.meaning')}</p>
        </div>
      ),
    },

    flaggedItems: {
      title: t('flaggedItems.title'),
      content: (
        <div className="space-y-1">
          <p>{t('flaggedItems.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('flaggedItems.issue1')}</li>
            <li>{t('flaggedItems.issue2')}</li>
            <li>{t('flaggedItems.action')}</li>
          </ul>
        </div>
      ),
    },

    // Section Headers
    itemStatusSection: {
      title: t('itemStatusSection.title'),
      content: (
        <div className="space-y-1">
          <p>{t('itemStatusSection.description')}</p>
          <p className="text-muted-foreground">{t('itemStatusSection.threshold')}</p>
        </div>
      ),
    },

    competencyReliabilitySection: {
      title: t('competencyReliabilitySection.title'),
      content: (
        <div className="space-y-1">
          <p>{t('competencyReliabilitySection.description')}</p>
          <p className="text-muted-foreground">{t('competencyReliabilitySection.metric')}</p>
        </div>
      ),
    },

    bigFiveReliabilitySection: {
      title: t('bigFiveReliabilitySection.title'),
      content: (
        <div className="space-y-1">
          <p>{t('bigFiveReliabilitySection.description')}</p>
          <p className="text-muted-foreground">{t('bigFiveReliabilitySection.method')}</p>
        </div>
      ),
    },

    // Item Status
    activeStatus: {
      title: t('activeStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('activeStatus.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('activeStatus.rpb')}</li>
            <li>{t('activeStatus.difficulty')}</li>
            <li>{t('activeStatus.responses')}</li>
          </ul>
        </div>
      ),
    },

    probationStatus: {
      title: t('probationStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('probationStatus.description')}</p>
          <p className="text-muted-foreground">{t('probationStatus.requirement')}</p>
        </div>
      ),
    },

    flaggedForReviewStatus: {
      title: t('flaggedForReviewStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('flaggedForReviewStatus.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('flaggedForReviewStatus.criticalRpb')}</li>
            <li>{t('flaggedForReviewStatus.extremeDifficulty')}</li>
          </ul>
        </div>
      ),
    },

    retiredStatus: {
      title: t('retiredStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('retiredStatus.description')}</p>
          <p className="text-muted-foreground">{t('retiredStatus.automatic')}</p>
        </div>
      ),
    },

    // Competency Reliability Status
    reliableCompetencyStatus: {
      title: t('reliableCompetencyStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('reliableCompetencyStatus.alpha')}</p>
          <p className="text-muted-foreground">{t('reliableCompetencyStatus.meaning')}</p>
        </div>
      ),
    },

    acceptableCompetencyStatus: {
      title: t('acceptableCompetencyStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('acceptableCompetencyStatus.alpha')}</p>
          <p className="text-muted-foreground">{t('acceptableCompetencyStatus.meaning')}</p>
        </div>
      ),
    },

    unreliableCompetencyStatus: {
      title: t('unreliableCompetencyStatus.title'),
      content: (
        <div className="space-y-1">
          <p>{t('unreliableCompetencyStatus.alpha')}</p>
          <p className="text-muted-foreground">{t('unreliableCompetencyStatus.meaning')}</p>
        </div>
      ),
    },

    insufficientDataCompetency: {
      title: t('insufficientDataCompetency.title'),
      content: <p className="text-muted-foreground">{t('insufficientDataCompetency.meaning')}</p>,
    },

    // Big Five Trait Status
    reliableTraitStatus: {
      title: t('reliableTraitStatus.title'),
      content: <p className="text-muted-foreground">{t('reliableTraitStatus.meaning')}</p>,
    },

    acceptableTraitStatus: {
      title: t('acceptableTraitStatus.title'),
      content: <p className="text-muted-foreground">{t('acceptableTraitStatus.meaning')}</p>,
    },

    unreliableTraitStatus: {
      title: t('unreliableTraitStatus.title'),
      content: <p className="text-muted-foreground">{t('unreliableTraitStatus.meaning')}</p>,
    },

    insufficientDataTrait: {
      title: t('insufficientDataTrait.title'),
      content: <p className="text-muted-foreground">{t('insufficientDataTrait.meaning')}</p>,
    },

    // Big Five Individual Traits
    traitOpenness: {
      title: t('traitOpenness.title'),
      content: (
        <div className="space-y-1">
          <p>{t('traitOpenness.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('traitOpenness.high')}</li>
            <li>{t('traitOpenness.low')}</li>
          </ul>
        </div>
      ),
    },

    traitConscientiousness: {
      title: t('traitConscientiousness.title'),
      content: (
        <div className="space-y-1">
          <p>{t('traitConscientiousness.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('traitConscientiousness.high')}</li>
            <li>{t('traitConscientiousness.low')}</li>
          </ul>
        </div>
      ),
    },

    traitExtraversion: {
      title: t('traitExtraversion.title'),
      content: (
        <div className="space-y-1">
          <p>{t('traitExtraversion.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('traitExtraversion.high')}</li>
            <li>{t('traitExtraversion.low')}</li>
          </ul>
        </div>
      ),
    },

    traitAgreeableness: {
      title: t('traitAgreeableness.title'),
      content: (
        <div className="space-y-1">
          <p>{t('traitAgreeableness.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('traitAgreeableness.high')}</li>
            <li>{t('traitAgreeableness.low')}</li>
          </ul>
        </div>
      ),
    },

    traitEmotionalStability: {
      title: t('traitEmotionalStability.title'),
      content: (
        <div className="space-y-1">
          <p>{t('traitEmotionalStability.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('traitEmotionalStability.high')}</li>
            <li>{t('traitEmotionalStability.low')}</li>
          </ul>
        </div>
      ),
    },

    averageBigFiveAlpha: {
      title: t('averageBigFiveAlpha.title'),
      content: <p className="text-muted-foreground">{t('averageBigFiveAlpha.meaning')}</p>,
    },

    // Dashboard Hero
    healthScore: {
      title: t('healthScore.title'),
      content: (
        <div className="space-y-1">
          <p>{t('healthScore.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('healthScore.excellent')}</li>
            <li>{t('healthScore.good')}</li>
            <li>{t('healthScore.needsAttention')}</li>
            <li>{t('healthScore.critical')}</li>
          </ul>
        </div>
      ),
    },

    healthScoreBreakdown: {
      title: t('healthScoreBreakdown.title'),
      content: (
        <div className="space-y-1">
          <p>{t('healthScoreBreakdown.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li><span className="text-emerald-600">●</span> {t('healthScoreBreakdown.activeItems')}</li>
            <li><span className="text-blue-600">●</span> {t('healthScoreBreakdown.reliableCompetencies')}</li>
            <li><span className="text-amber-600">●</span> {t('healthScoreBreakdown.nonFlagged')}</li>
          </ul>
        </div>
      ),
    },

    activeItemsWeight: {
      title: t('activeItemsWeight.title'),
      content: (
        <div className="space-y-1">
          <p>{t('activeItemsWeight.description')}</p>
          <p className="text-muted-foreground">{t('activeItemsWeight.meaning')}</p>
        </div>
      ),
    },

    reliableCompetenciesWeight: {
      title: t('reliableCompetenciesWeight.title'),
      content: (
        <div className="space-y-1">
          <p>{t('reliableCompetenciesWeight.description')}</p>
          <p className="text-muted-foreground">{t('reliableCompetenciesWeight.includes')}</p>
        </div>
      ),
    },

    nonFlaggedItemsWeight: {
      title: t('nonFlaggedItemsWeight.title'),
      content: (
        <div className="space-y-1">
          <p>{t('nonFlaggedItemsWeight.description')}</p>
          <p className="text-muted-foreground">{t('nonFlaggedItemsWeight.excludes')}</p>
        </div>
      ),
    },

    heroTotalItems: {
      title: t('heroTotalItems.title'),
      content: <p className="text-muted-foreground">{t('heroTotalItems.meaning')}</p>,
    },

    heroActiveRate: {
      title: t('heroActiveRate.title'),
      content: (
        <div className="space-y-1">
          <p>{t('heroActiveRate.description')}</p>
          <p className="text-muted-foreground">{t('heroActiveRate.meaning')}</p>
        </div>
      ),
    },

    heroIssues: {
      title: t('heroIssues.title'),
      content: (
        <div className="space-y-1">
          <p>{t('heroIssues.description')}</p>
          <p className="text-muted-foreground">{t('heroIssues.includes')}</p>
        </div>
      ),
    },

    // Item Quality Scatter Chart
    itemQualityMap: {
      title: t('itemQualityMap.title'),
      content: (
        <div className="space-y-1">
          <p>{t('itemQualityMap.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('itemQualityMap.xAxis')}</li>
            <li>{t('itemQualityMap.yAxis')}</li>
          </ul>
          <p className="mt-1 text-muted-foreground">{t('itemQualityMap.interaction')}</p>
        </div>
      ),
    },

    zoneOptimal: {
      title: t('zoneOptimal.title'),
      content: (
        <div className="space-y-1">
          <p>{t('zoneOptimal.description')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            <li>{t('zoneOptimal.difficulty')}</li>
            <li>{t('zoneOptimal.effectiveness')}</li>
          </ul>
        </div>
      ),
    },

    zoneTooEasy: {
      title: t('zoneTooEasy.title'),
      content: (
        <div className="space-y-1">
          <p>{t('zoneTooEasy.description')}</p>
          <p className="text-muted-foreground">{t('zoneTooEasy.threshold')}</p>
        </div>
      ),
    },

    zoneTooHard: {
      title: t('zoneTooHard.title'),
      content: (
        <div className="space-y-1">
          <p>{t('zoneTooHard.description')}</p>
          <p className="text-muted-foreground">{t('zoneTooHard.threshold')}</p>
        </div>
      ),
    },

    zoneToxic: {
      title: t('zoneToxic.title'),
      content: (
        <div className="space-y-1">
          <p>{t('zoneToxic.description')}</p>
          <p className="text-muted-foreground">{t('zoneToxic.meaning')}</p>
        </div>
      ),
    },
  }), [t]);
}

export default usePsychometricHelp;
