/**
 * Tests for UI utility functions
 * Tests color mappings and icon generation
 */
import { describe, it, expect } from 'vitest';
import {
  competencyCategoryToIcon,
  levelToNumber,
  levelToColor,
  approvalStatusToColor,
  questionTypeToIcon,
  questionDifficultyToColor,
  questionTypeToColor,
  biLevelToColor,
} from '@/lib/ui-utils';
import { DifficultyLevel } from '@/types/domain';

describe('competencyCategoryToIcon', () => {
  it('should return an icon element for COGNITIVE', () => {
    const icon = competencyCategoryToIcon('COGNITIVE');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
    expect(icon.props.className).toBe('h-4 w-4');
  });

  it('should return an icon element for INTERPERSONAL', () => {
    const icon = competencyCategoryToIcon('INTERPERSONAL');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });

  it('should return an icon element for LEADERSHIP', () => {
    const icon = competencyCategoryToIcon('LEADERSHIP');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });

  it('should return an icon element for COMMUNICATION', () => {
    const icon = competencyCategoryToIcon('COMMUNICATION');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });

  it('should return default icon for unknown category', () => {
    const icon = competencyCategoryToIcon('UNKNOWN_CATEGORY');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
    expect(icon.props.className).toBe('h-4 w-4');
  });

  it('should return icons for all defined categories', () => {
    const categories = [
      'COGNITIVE',
      'INTERPERSONAL',
      'LEADERSHIP',
      'ADAPTABILITY',
      'EMOTIONAL_INTELLIGENCE',
      'COMMUNICATION',
      'COLLABORATION',
      'CRITICAL_THINKING',
      'TIME_MANAGEMENT',
    ];

    categories.forEach((category) => {
      const icon = competencyCategoryToIcon(category);
      expect(icon).toBeDefined();
      expect(icon).toHaveProperty('props');
    });
  });
});

describe('levelToNumber', () => {
  it('should convert NOVICE to 1', () => {
    expect(levelToNumber('NOVICE')).toBe(1);
  });

  it('should convert DEVELOPING to 2', () => {
    expect(levelToNumber('DEVELOPING')).toBe(2);
  });

  it('should convert PROFICIENT to 3', () => {
    expect(levelToNumber('PROFICIENT')).toBe(3);
  });

  it('should convert ADVANCED to 4', () => {
    expect(levelToNumber('ADVANCED')).toBe(4);
  });

  it('should convert EXPERT to 5', () => {
    expect(levelToNumber('EXPERT')).toBe(5);
  });

  it('should return 1 for unknown level', () => {
    expect(levelToNumber('UNKNOWN')).toBe(1);
  });
});

describe('levelToColor', () => {
  it('should return red-based color for NOVICE', () => {
    const color = levelToColor('NOVICE');
    expect(color).toContain('red');
  });

  it('should return amber-based color for DEVELOPING', () => {
    const color = levelToColor('DEVELOPING');
    expect(color).toContain('amber');
  });

  it('should return emerald-based color for PROFICIENT', () => {
    const color = levelToColor('PROFICIENT');
    expect(color).toContain('emerald');
  });

  it('should return blue-based color for ADVANCED', () => {
    const color = levelToColor('ADVANCED');
    expect(color).toContain('blue');
  });

  it('should return violet-based color for EXPERT', () => {
    const color = levelToColor('EXPERT');
    expect(color).toContain('violet');
  });

  it('should return novice color for unknown level', () => {
    const color = levelToColor('UNKNOWN');
    expect(color).toContain('red');
  });
});

describe('approvalStatusToColor', () => {
  it('should return yellow for DRAFT', () => {
    const color = approvalStatusToColor('DRAFT');
    expect(color).toContain('yellow');
  });

  it('should return yellow for PENDING_REVIEW', () => {
    const color = approvalStatusToColor('PENDING_REVIEW');
    expect(color).toContain('yellow');
  });

  it('should return emerald for APPROVED', () => {
    const color = approvalStatusToColor('APPROVED');
    expect(color).toContain('emerald');
  });

  it('should return red for REJECTED', () => {
    const color = approvalStatusToColor('REJECTED');
    expect(color).toContain('red');
  });

  it('should return gray for ARCHIVED', () => {
    const color = approvalStatusToColor('ARCHIVED');
    expect(color).toContain('gray');
  });

  it('should return blue for UNDER_REVISION', () => {
    const color = approvalStatusToColor('UNDER_REVISION');
    expect(color).toContain('blue');
  });

  it('should return gray for unknown status', () => {
    const color = approvalStatusToColor('UNKNOWN');
    expect(color).toContain('gray');
  });
});

describe('biLevelToColor', () => {
  it('should return appropriate colors for each observability level', () => {
    expect(biLevelToColor('DIRECTLY_OBSERVABLE')).toContain('green');
    expect(biLevelToColor('PARTIALLY_OBSERVABLE')).toContain('blue');
    expect(biLevelToColor('INFERRED')).toContain('purple');
    expect(biLevelToColor('SELF_REPORTED')).toContain('amber');
    expect(biLevelToColor('REQUIRES_DOCUMENTATION')).toContain('gray');
  });

  it('should return gray color for unknown level', () => {
    const color = biLevelToColor('UNKNOWN');
    expect(color).toContain('gray');
  });
});

describe('questionTypeToIcon', () => {
  it('should return icon for MULTIPLE_CHOICE', () => {
    const icon = questionTypeToIcon('MULTIPLE_CHOICE');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
    expect(icon.props.className).toBe('h-4 w-4');
  });

  it('should return icon for SITUATIONAL_JUDGMENT', () => {
    const icon = questionTypeToIcon('SITUATIONAL_JUDGMENT');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });

  it('should return icon for LIKERT_SCALE', () => {
    const icon = questionTypeToIcon('LIKERT_SCALE');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });

  it('should return icon for OPEN_TEXT', () => {
    const icon = questionTypeToIcon('OPEN_TEXT');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });

  it('should return icon for TRUE_FALSE', () => {
    const icon = questionTypeToIcon('TRUE_FALSE');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });

  it('should return default icon for unknown type', () => {
    const icon = questionTypeToIcon('UNKNOWN_TYPE');
    expect(icon).toBeDefined();
    expect(icon).toHaveProperty('props');
  });
});

describe('questionDifficultyToColor', () => {
  it('should return emerald (green) for FOUNDATIONAL (easy)', () => {
    const color = questionDifficultyToColor(DifficultyLevel.FOUNDATIONAL);
    expect(color).toContain('emerald');
  });

  it('should return amber for INTERMEDIATE (medium)', () => {
    const color = questionDifficultyToColor(DifficultyLevel.INTERMEDIATE);
    expect(color).toContain('amber');
  });

  it('should return red for ADVANCED (hard)', () => {
    const color = questionDifficultyToColor(DifficultyLevel.ADVANCED);
    expect(color).toContain('red');
  });

  it('should return violet for EXPERT', () => {
    const color = questionDifficultyToColor(DifficultyLevel.EXPERT);
    expect(color).toContain('violet');
  });
});

describe('questionTypeToColor', () => {
  it('should return blue for MULTIPLE_CHOICE', () => {
    const color = questionTypeToColor('MULTIPLE_CHOICE');
    expect(color).toContain('blue');
  });

  it('should return indigo for SINGLE_CHOICE', () => {
    const color = questionTypeToColor('SINGLE_CHOICE');
    expect(color).toContain('indigo');
  });

  it('should return violet for TRUE_FALSE', () => {
    const color = questionTypeToColor('TRUE_FALSE');
    expect(color).toContain('violet');
  });

  it('should return orange for OPEN_TEXT', () => {
    const color = questionTypeToColor('OPEN_TEXT');
    expect(color).toContain('orange');
  });

  it('should return purple for SCENARIO_BASED', () => {
    const color = questionTypeToColor('SCENARIO_BASED');
    expect(color).toContain('purple');
  });

  it('should return teal for LIKERT_SCALE', () => {
    const color = questionTypeToColor('LIKERT_SCALE');
    expect(color).toContain('teal');
  });

  it('should return pink for SITUATIONAL_JUDGMENT', () => {
    const color = questionTypeToColor('SITUATIONAL_JUDGMENT');
    expect(color).toContain('pink');
  });

  it('should return muted color for unknown type', () => {
    const color = questionTypeToColor('UNKNOWN_TYPE');
    expect(color).toContain('muted');
  });
});
