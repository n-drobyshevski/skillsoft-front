/**
 * TypeScript types for the Psychometric Validation System.
 * Corresponds to backend DTOs in domain/dto/psychometrics/
 */

// ============================================
// ENUMS
// ============================================

export enum ItemValidityStatus {
  ACTIVE = 'ACTIVE',
  PROBATION = 'PROBATION',
  FLAGGED_FOR_REVIEW = 'FLAGGED_FOR_REVIEW',
  RETIRED = 'RETIRED'
}

export enum DifficultyFlag {
  NONE = 'NONE',
  TOO_HARD = 'TOO_HARD',
  TOO_EASY = 'TOO_EASY'
}

export enum DiscriminationFlag {
  NONE = 'NONE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  NEGATIVE = 'NEGATIVE'
}

export enum ReliabilityStatus {
  RELIABLE = 'RELIABLE',
  ACCEPTABLE = 'ACCEPTABLE',
  UNRELIABLE = 'UNRELIABLE',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA'
}

export enum BigFiveTrait {
  OPENNESS = 'OPENNESS',
  CONSCIENTIOUSNESS = 'CONSCIENTIOUSNESS',
  EXTRAVERSION = 'EXTRAVERSION',
  AGREEABLENESS = 'AGREEABLENESS',
  EMOTIONAL_STABILITY = 'EMOTIONAL_STABILITY'
}

// ============================================
// ITEM STATISTICS DTOs
// ============================================

export interface ItemStatistics {
  id: string;
  questionId: string;
  questionText: string;
  competencyName: string;
  indicatorTitle: string;
  difficultyIndex: number | null;
  discriminationIndex: number | null;
  responseCount: number;
  validityStatus: ItemValidityStatus;
  difficultyFlag: DifficultyFlag | null;
  discriminationFlag: DiscriminationFlag | null;
  lastCalculatedAt: string | null;
}

export interface StatusChangeRecord {
  fromStatus: ItemValidityStatus;
  toStatus: ItemValidityStatus;
  timestamp: string;
  reason: string | null;
}

export interface ItemStatisticsDetail extends ItemStatistics {
  distractorEfficiency: Record<string, number> | null;
  statusChangeHistory: StatusChangeRecord[];
  previousDiscriminationIndex: number | null;
  recommendations: string[];
}

// ============================================
// COMPETENCY RELIABILITY DTOs
// ============================================

export interface CompetencyReliability {
  id: string;
  competencyId: string;
  competencyName: string;
  cronbachAlpha: number | null;
  sampleSize: number | null;
  itemCount: number | null;
  reliabilityStatus: ReliabilityStatus;
  lastCalculatedAt: string | null;
}

export interface AlphaIfDeletedEntry {
  questionId: string;
  questionText: string;
  alphaIfDeleted: number;
  improvement: number;
}

export interface ItemLoweringAlpha {
  questionId: string;
  questionText: string;
  currentAlpha: number;
  alphaWithout: number;
  improvement: number;
}

export interface CompetencyReliabilityDetail extends CompetencyReliability {
  alphaIfDeleted: Record<string, AlphaIfDeletedEntry>;
  itemsLoweringAlpha: ItemLoweringAlpha[];
}

// ============================================
// BIG FIVE RELIABILITY DTOs
// ============================================

export interface BigFiveReliability {
  id: string;
  trait: BigFiveTrait;
  traitDisplayName: string;
  cronbachAlpha: number | null;
  contributingCompetencies: number | null;
  totalItems: number | null;
  sampleSize: number | null;
  reliabilityStatus: ReliabilityStatus;
  lastCalculatedAt: string | null;
}

// ============================================
// FLAGGED ITEM DTOs
// ============================================

export interface FlaggedItemSummary {
  questionId: string;
  questionText: string | null;
  competencyName: string | null;
  indicatorTitle: string | null;
  difficultyIndex: number | null;
  discriminationIndex: number | null;
  responseCount: number;
  validityStatus: ItemValidityStatus;
  difficultyFlag: DifficultyFlag | null;
  discriminationFlag: DiscriminationFlag | null;
  lastCalculatedAt: string | null;
}

// ============================================
// HEALTH REPORT DTOs
// ============================================

export interface BigFiveReliabilitySummary {
  totalTraits: number;
  reliableTraits: number;
  unreliableTraits: number;
  insufficientDataTraits: number;
  acceptableTraits?: number;
  averageTraitAlpha: number | null;
  lowestAlphaTrait: string | null;
  lowestAlphaValue: number | null;
}

export interface PsychometricHealthReport {
  totalItems: number;
  activeItems: number;
  probationItems: number;
  flaggedItems: number;
  retiredItems: number;
  totalCompetencies: number;
  reliableCompetencies: number;
  acceptableCompetencies: number;
  unreliableCompetencies: number;
  insufficientDataCompetencies: number;
  averageAlpha: number | null;
  averageDiscrimination: number | null;
  topFlaggedItems: FlaggedItemSummary[];
  bigFiveReliabilitySummary: BigFiveReliabilitySummary;
  lastAuditRun: string | null;
  itemsAnalyzedSinceLastAudit: number;
}

// ============================================
// REQUEST/RESPONSE DTOs
// ============================================

export interface UpdateItemStatusRequest {
  newStatus: ItemValidityStatus;
  reason: string;
}

export interface AuditResult {
  itemsRecalculated: number;
  competenciesRecalculated: number;
  traitsRecalculated: number;
  statusesUpdated: number;
  message: string;
}

// ============================================
// PAGINATION
// ============================================

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ============================================
// FILTER PARAMS
// ============================================

export interface ItemStatisticsFilterParams {
  status?: ItemValidityStatus;
  competencyId?: string;
  discriminationFlag?: DiscriminationFlag;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CompetencyReliabilityFilterParams {
  status?: ReliabilityStatus;
  page?: number;
  size?: number;
  sort?: string;
}

// ============================================
// DISPLAY HELPERS
// ============================================

export const ItemValidityStatusDisplay: Record<ItemValidityStatus, { label: string; description: string; color: string }> = {
  [ItemValidityStatus.ACTIVE]: {
    label: 'Активный',
    description: 'Validated item with good psychometric properties',
    color: 'emerald'
  },
  [ItemValidityStatus.PROBATION]: {
    label: 'Пробационный',
    description: 'New item gathering data (< 50 responses)',
    color: 'amber'
  },
  [ItemValidityStatus.FLAGGED_FOR_REVIEW]: {
    label: 'На проверке',
    description: 'Requires manual review due to extreme metrics',
    color: 'orange'
  },
  [ItemValidityStatus.RETIRED]: {
    label: 'Отключен',
    description: 'Removed from active use due to poor discrimination',
    color: 'red'
  }
};

export const DifficultyFlagDisplay: Record<DifficultyFlag, { label: string; description: string }> = {
  [DifficultyFlag.NONE]: {
    label: 'Нормально',
    description: 'Difficulty in acceptable range (0.2 - 0.9)'
  },
  [DifficultyFlag.TOO_HARD]: {
    label: 'Слишком сложный',
    description: 'Difficulty < 0.2 - Most respondents fail'
  },
  [DifficultyFlag.TOO_EASY]: {
    label: 'Слишком легкий',
    description: 'Difficulty > 0.9 - Most respondents succeed'
  }
};

export const DiscriminationFlagDisplay: Record<DiscriminationFlag, { label: string; description: string }> = {
  [DiscriminationFlag.NONE]: {
    label: 'Хорошо',
    description: 'Good discrimination (rpb >= 0.25)'
  },
  [DiscriminationFlag.WARNING]: {
    label: 'Предупреждение',
    description: 'Marginal discrimination (0.1 <= rpb < 0.25)'
  },
  [DiscriminationFlag.CRITICAL]: {
    label: 'Критично',
    description: 'Poor discrimination (0 < rpb < 0.1)'
  },
  [DiscriminationFlag.NEGATIVE]: {
    label: 'Токсичный',
    description: 'Negative discrimination (rpb < 0)'
  }
};

export const ReliabilityStatusDisplay: Record<ReliabilityStatus, { label: string; description: string; color: string }> = {
  [ReliabilityStatus.RELIABLE]: {
    label: 'Надежный',
    description: "Cronbach's Alpha >= 0.7",
    color: 'emerald'
  },
  [ReliabilityStatus.ACCEPTABLE]: {
    label: 'Приемлемый',
    description: "Cronbach's Alpha 0.6 - 0.7",
    color: 'amber'
  },
  [ReliabilityStatus.UNRELIABLE]: {
    label: 'Ненадежный',
    description: "Cronbach's Alpha < 0.6",
    color: 'red'
  },
  [ReliabilityStatus.INSUFFICIENT_DATA]: {
    label: 'Недостаточно данных',
    description: 'Not enough responses for calculation',
    color: 'gray'
  }
};

export const BigFiveTraitDisplay: Record<BigFiveTrait, { label: string; description: string }> = {
  [BigFiveTrait.OPENNESS]: {
    label: 'Открытость опыту',
    description: 'Creativity, curiosity, intellectual interests'
  },
  [BigFiveTrait.CONSCIENTIOUSNESS]: {
    label: 'Добросовестность',
    description: 'Organization, dependability, self-discipline'
  },
  [BigFiveTrait.EXTRAVERSION]: {
    label: 'Экстраверсия',
    description: 'Energy, sociability, assertiveness'
  },
  [BigFiveTrait.AGREEABLENESS]: {
    label: 'Доброжелательность',
    description: 'Cooperation, trust, empathy'
  },
  [BigFiveTrait.EMOTIONAL_STABILITY]: {
    label: 'Эмоциональная стабильность',
    description: 'Calmness, resilience'
  }
};
