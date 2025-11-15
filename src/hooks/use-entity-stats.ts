"use client";

import { useState, useEffect, useCallback } from "react";

// Base entity stats interface
interface BaseStats {
  total: number;
  active?: number;
  inactive?: number;
  average?: number;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
}

// Competency-specific stats
interface CompetencyStats extends BaseStats {
  byLevel?: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  byCategory?: {
    technical: number;
    behavioral: number;
    leadership: number;
  };
  averageWeight?: number;
  withAssessments?: number;
}

// Behavioral Indicator-specific stats
interface BehavioralIndicatorStats extends BaseStats {
  byCompetency?: number;
  byLevel?: {
    observable: number;
    measurable: number;
    actionable: number;
  };
  withQuestions?: number;
  averageComplexity?: number;
}

// Assessment Question-specific stats
interface AssessmentQuestionStats extends BaseStats {
  byType?: {
    multipleChoice: number;
    essay: number;
    practical: number;
    scenario: number;
  };
  byDifficulty?: {
    easy: number;
    medium: number;
    hard: number;
  };
  withIndicators?: number;
  averageScore?: number;
}

type EntityStats = CompetencyStats | BehavioralIndicatorStats | AssessmentQuestionStats;
type EntityType = "competencies" | "behavioral-indicators" | "assessment-questions";

interface UseEntityStatsReturn {
  stats: EntityStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Constants
const TREND_LABEL = "vs last month";

// Mock data generators for development
const generateCompetencyStats = (): CompetencyStats => ({
  total: Math.floor(Math.random() * 100) + 20,
  active: Math.floor(Math.random() * 80) + 15,
  inactive: Math.floor(Math.random() * 10) + 2,
  byLevel: {
    beginner: Math.floor(Math.random() * 20) + 5,
    intermediate: Math.floor(Math.random() * 25) + 10,
    advanced: Math.floor(Math.random() * 20) + 8,
    expert: Math.floor(Math.random() * 15) + 3,
  },
  byCategory: {
    technical: Math.floor(Math.random() * 30) + 15,
    behavioral: Math.floor(Math.random() * 25) + 10,
    leadership: Math.floor(Math.random() * 20) + 8,
  },
  averageWeight: Math.random() * 30 + 20,
  withAssessments: Math.floor(Math.random() * 60) + 15,
  trend: {
    value: `+${Math.floor(Math.random() * 15) + 2}%`,
    label: TREND_LABEL,
    isPositive: Math.random() > 0.3,
  },
});

const generateBehavioralIndicatorStats = (): BehavioralIndicatorStats => ({
  total: Math.floor(Math.random() * 200) + 50,
  active: Math.floor(Math.random() * 180) + 40,
  inactive: Math.floor(Math.random() * 20) + 5,
  byLevel: {
    observable: Math.floor(Math.random() * 80) + 20,
    measurable: Math.floor(Math.random() * 70) + 15,
    actionable: Math.floor(Math.random() * 60) + 10,
  },
  withQuestions: Math.floor(Math.random() * 120) + 30,
  averageComplexity: Math.random() * 3 + 2,
  trend: {
    value: `+${Math.floor(Math.random() * 20) + 5}%`,
    label: TREND_LABEL,
    isPositive: Math.random() > 0.2,
  },
});

const generateAssessmentQuestionStats = (): AssessmentQuestionStats => ({
  total: Math.floor(Math.random() * 500) + 100,
  active: Math.floor(Math.random() * 450) + 80,
  inactive: Math.floor(Math.random() * 50) + 10,
  byType: {
    multipleChoice: Math.floor(Math.random() * 200) + 50,
    essay: Math.floor(Math.random() * 100) + 20,
    practical: Math.floor(Math.random() * 150) + 30,
    scenario: Math.floor(Math.random() * 80) + 15,
  },
  byDifficulty: {
    easy: Math.floor(Math.random() * 150) + 40,
    medium: Math.floor(Math.random() * 200) + 60,
    hard: Math.floor(Math.random() * 100) + 20,
  },
  withIndicators: Math.floor(Math.random() * 400) + 80,
  averageScore: Math.random() * 30 + 60,
  trend: {
    value: `+${Math.floor(Math.random() * 12) + 3}%`,
    label: TREND_LABEL,
    isPositive: Math.random() > 0.4,
  },
});

export function useEntityStats(type: EntityType): UseEntityStatsReturn {
  const [stats, setStats] = useState<EntityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      // Generate mock data based on type
      let mockStats: EntityStats;
      switch (type) {
        case "competencies":
          mockStats = generateCompetencyStats();
          break;
        case "behavioral-indicators":
          mockStats = generateBehavioralIndicatorStats();
          break;
        case "assessment-questions":
          mockStats = generateAssessmentQuestionStats();
          break;
        default:
          throw new Error(`Unknown entity type: ${type}`);
      }
      
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, [type]);

  const refresh = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

export type { EntityStats, CompetencyStats, BehavioralIndicatorStats, AssessmentQuestionStats, EntityType };