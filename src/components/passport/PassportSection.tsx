'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User } from 'lucide-react';
import { usePassport, calculateDeltaAnalysis } from '@/hooks/usePassport';
import { PassportStatusBadge, getPassportStatus } from './PassportStatusBadge';
import { PassportPreview } from './PassportPreview';
import { DeltaTestingToggle } from './DeltaTestingToggle';
import type { CompetencyPassport } from '@/types/domain';

// Types

export interface DeltaConfig {
  /** Whether delta testing is enabled */
  enabled: boolean;
  /** Competency IDs to skip (from passport) */
  skippedCompetencyIds: string[];
  /** Passport ID being used */
  passportId?: string;
}

export interface PassportSectionProps {
  /** Clerk user ID of the candidate */
  clerkUserId?: string | null;
  /** Required competency IDs from the assessment */
  requiredCompetencyIds: string[];
  /** Callback when delta config changes */
  onDeltaConfigChange: (config: DeltaConfig) => void;
  /** Whether delta testing feature is available */
  deltaTestingEnabled?: boolean;
  /** Initial delta testing state */
  initialDeltaEnabled?: boolean;
  /** Additional class names */
  className?: string;
}

// Component

export function PassportSection({
  clerkUserId,
  requiredCompetencyIds,
  onDeltaConfigChange,
  deltaTestingEnabled = true,
  initialDeltaEnabled = false,
  className,
}: PassportSectionProps) {
  const [deltaEnabled, setDeltaEnabled] = useState(initialDeltaEnabled);

  // Fetch passport data
  const { passport, isLoading, isError, error, isValid, competencyCount } =
    usePassport(clerkUserId);

  // Calculate delta analysis
  const deltaAnalysis = calculateDeltaAnalysis(passport, requiredCompetencyIds);

  // Update parent when delta config changes
  useEffect(() => {
    const config: DeltaConfig = {
      enabled: deltaEnabled && deltaAnalysis.skippableCount > 0,
      skippedCompetencyIds: deltaEnabled
        ? deltaAnalysis.skippableCompetencies
        : [],
      passportId: passport?.id,
    };
    onDeltaConfigChange(config);
  }, [
    deltaEnabled,
    deltaAnalysis.skippableCount,
    deltaAnalysis.skippableCompetencies,
    passport?.id,
    onDeltaConfigChange,
  ]);

  // Handle delta toggle
  const handleDeltaToggle = useCallback((enabled: boolean) => {
    setDeltaEnabled(enabled);
  }, []);

  // No candidate selected
  if (!clerkUserId) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold">Паспорт компетенций</h3>
        </div>
        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Выберите кандидата для просмотра паспорта компетенций
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold">Паспорт компетенций</h3>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Ошибка загрузки паспорта: {error?.message || 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const status = getPassportStatus(passport);

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">Паспорт компетенций</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Связать оценку с существующими результатами кандидата
          </p>
        </div>
        <PassportStatusBadge
          status={status}
          expiresAt={passport?.expiresAt}
          lastUpdated={passport?.lastUpdated}
          competencyCount={competencyCount}
          size="sm"
        />
      </div>

      <div className="space-y-4">
        {/* Passport Preview (only if valid) */}
        {passport && isValid && (
          <PassportPreview
            passport={passport}
            defaultExpanded={false}
            maxVisible={3}
          />
        )}

        {/* Delta Testing Toggle */}
        {deltaTestingEnabled && (
          <DeltaTestingToggle
            enabled={deltaEnabled}
            onToggle={handleDeltaToggle}
            analysis={deltaAnalysis}
            disabled={!isValid}
            disabledReason={
              !isValid ? 'Требуется действующий паспорт компетенций' : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

export default PassportSection;
