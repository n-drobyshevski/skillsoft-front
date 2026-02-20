'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useOnboardingTour, type TourDefinition } from '@/hooks/useOnboardingTour';
import { CoachMark } from './CoachMark';

/**
 * BuilderOnboarding - First-time guided wizard for the Assessment Blueprint builder.
 *
 * Shows a 4-step tooltip walkthrough for first-time users:
 * 1. Welcome to Assessment Blueprint - overview
 * 2. Add Competencies - points to the library panel
 * 3. Set Importance Levels - points to the canvas weight controls
 * 4. Preview Results - points to the simulator panel
 *
 * Gated by localStorage key: skillsoft_builder_onboarding_completed
 * Integrates with CoachMark.tsx for rendering each step.
 */

const TOUR_ID = 'skillsoft_builder_onboarding_completed';

export function BuilderOnboarding() {
  const t = useTranslations('builder.onboarding');

  const tour = useOnboardingTour();

  useEffect(() => {
    // Do not show if already completed
    if (tour.hasCompletedTour(TOUR_ID)) {
      return;
    }

    // Delay slightly to allow the builder layout to mount and settle
    const timer = setTimeout(() => {
      const tourDefinition: TourDefinition = {
        id: TOUR_ID,
        steps: [
          {
            id: 'welcome',
            target: '#panel-canvas',
            title: t('welcome.title'),
            content: t('welcome.content'),
            placement: 'center',
            spotlight: false,
            delay: 300,
          },
          {
            id: 'library',
            target: '#panel-library',
            title: t('library.title'),
            content: t('library.content'),
            placement: 'right',
            spotlight: true,
            delay: 150,
          },
          {
            id: 'importance',
            target: '#panel-canvas',
            title: t('importance.title'),
            content: t('importance.content'),
            placement: 'bottom',
            spotlight: true,
            delay: 150,
          },
          {
            id: 'simulator',
            target: '#panel-simulator',
            title: t('simulator.title'),
            content: t('simulator.content'),
            placement: 'left',
            spotlight: true,
            delay: 150,
          },
        ],
      };

      tour.startTour(tourDefinition);
    }, 800);

    return () => clearTimeout(timer);
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tour.isActive || !tour.currentStep) {
    return null;
  }

  return (
    <CoachMark
      step={tour.currentStep}
      stepIndex={tour.currentStepIndex}
      totalSteps={tour.totalSteps}
      onNext={tour.nextStep}
      onPrev={tour.prevStep}
      onSkip={tour.skipTour}
      onComplete={tour.completeTour}
    />
  );
}
