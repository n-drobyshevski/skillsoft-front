/**
 * Enum Translation Tests
 *
 * Verifies that all enum values have corresponding translations in both
 * English and Russian. Also checks for _DESC suffix keys where applicable.
 */

import { describe, it, expect } from 'vitest';
import enMessages from '../../../messages/en/index';
import ruMessages from '../../../messages/ru/index';
import {
  CompetencyCategory,
  ObservabilityLevel,
  ApprovalStatus,
  ContextScope,
  IndicatorMeasurementType,
  DifficultyLevel,
  QuestionType,
  SessionStatus,
  AssessmentGoal,
} from '@/types/domain';

type EnumRecord = Record<string, unknown>;

/**
 * Gets the enum translations object from messages
 */
function getEnumTranslations(
  messages: EnumRecord,
  enumName: string
): Record<string, string> | undefined {
  const enums = messages.enums as EnumRecord | undefined;
  if (!enums) return undefined;
  return enums[enumName] as Record<string, string> | undefined;
}

/**
 * Configuration for enum tests
 */
interface EnumTestConfig {
  name: string;
  translationKey: string;
  values: string[];
  hasDescriptions: boolean;
}

const enumConfigs: EnumTestConfig[] = [
  {
    name: 'CompetencyCategory',
    translationKey: 'competencyCategory',
    values: Object.values(CompetencyCategory),
    hasDescriptions: true,
  },
  {
    name: 'ObservabilityLevel',
    translationKey: 'observabilityLevel',
    values: Object.values(ObservabilityLevel),
    hasDescriptions: true,
  },
  {
    name: 'ApprovalStatus',
    translationKey: 'approvalStatus',
    values: Object.values(ApprovalStatus),
    hasDescriptions: true,
  },
  {
    name: 'ContextScope',
    translationKey: 'contextScope',
    values: Object.values(ContextScope),
    hasDescriptions: true,
  },
  {
    name: 'IndicatorMeasurementType',
    translationKey: 'measurementType',
    values: Object.values(IndicatorMeasurementType),
    hasDescriptions: true,
  },
  {
    name: 'DifficultyLevel',
    translationKey: 'difficultyLevel',
    values: Object.values(DifficultyLevel),
    hasDescriptions: true,
  },
  {
    name: 'QuestionType',
    translationKey: 'questionType',
    values: Object.values(QuestionType),
    hasDescriptions: true,
  },
  {
    name: 'SessionStatus',
    translationKey: 'sessionStatus',
    values: Object.values(SessionStatus),
    hasDescriptions: true,
  },
  {
    name: 'AssessmentGoal',
    translationKey: 'assessmentGoal',
    values: Object.values(AssessmentGoal),
    hasDescriptions: true,
  },
];

describe('Enum Translations', () => {
  enumConfigs.forEach(({ name, translationKey, values, hasDescriptions }) => {
    describe(name, () => {
      it(`has all ${values.length} values translated in English`, () => {
        const translations = getEnumTranslations(
          enMessages as EnumRecord,
          translationKey
        );

        expect(translations).toBeDefined();

        const missingValues: string[] = [];
        values.forEach(value => {
          if (!translations?.[value]) {
            missingValues.push(value);
          }
        });

        if (missingValues.length > 0) {
          console.log(`Missing in en.json enums.${translationKey}:`, missingValues);
        }

        expect(missingValues).toEqual([]);
      });

      it(`has all ${values.length} values translated in Russian`, () => {
        const translations = getEnumTranslations(
          ruMessages as EnumRecord,
          translationKey
        );

        expect(translations).toBeDefined();

        const missingValues: string[] = [];
        values.forEach(value => {
          if (!translations?.[value]) {
            missingValues.push(value);
          }
        });

        if (missingValues.length > 0) {
          console.log(`Missing in ru.json enums.${translationKey}:`, missingValues);
        }

        expect(missingValues).toEqual([]);
      });

      if (hasDescriptions) {
        it(`has _DESC keys for all values in English`, () => {
          const translations = getEnumTranslations(
            enMessages as EnumRecord,
            translationKey
          );

          expect(translations).toBeDefined();

          const missingDescriptions: string[] = [];
          values.forEach(value => {
            const descKey = `${value}_DESC`;
            if (!translations?.[descKey]) {
              missingDescriptions.push(descKey);
            }
          });

          if (missingDescriptions.length > 0) {
            console.log(
              `Missing _DESC in en.json enums.${translationKey}:`,
              missingDescriptions
            );
          }

          expect(missingDescriptions).toEqual([]);
        });

        it(`has _DESC keys for all values in Russian`, () => {
          const translations = getEnumTranslations(
            ruMessages as EnumRecord,
            translationKey
          );

          expect(translations).toBeDefined();

          const missingDescriptions: string[] = [];
          values.forEach(value => {
            const descKey = `${value}_DESC`;
            if (!translations?.[descKey]) {
              missingDescriptions.push(descKey);
            }
          });

          if (missingDescriptions.length > 0) {
            console.log(
              `Missing _DESC in ru.json enums.${translationKey}:`,
              missingDescriptions
            );
          }

          expect(missingDescriptions).toEqual([]);
        });
      }

      it('has non-empty translations in English', () => {
        const translations = getEnumTranslations(
          enMessages as EnumRecord,
          translationKey
        );

        expect(translations).toBeDefined();

        const emptyValues: string[] = [];
        values.forEach(value => {
          if (translations?.[value] === '') {
            emptyValues.push(value);
          }
        });

        expect(emptyValues).toEqual([]);
      });

      it('has non-empty translations in Russian', () => {
        const translations = getEnumTranslations(
          ruMessages as EnumRecord,
          translationKey
        );

        expect(translations).toBeDefined();

        const emptyValues: string[] = [];
        values.forEach(value => {
          if (translations?.[value] === '') {
            emptyValues.push(value);
          }
        });

        expect(emptyValues).toEqual([]);
      });
    });
  });

  describe('Enum Translation Summary', () => {
    it('reports total enum coverage', () => {
      let totalValues = 0;
      let totalDescriptions = 0;

      console.log('\n📊 Enum Translation Summary:');

      enumConfigs.forEach(({ name, translationKey, values, hasDescriptions }) => {
        const enTranslations = getEnumTranslations(
          enMessages as EnumRecord,
          translationKey
        );

        const translatedCount = values.filter(v => enTranslations?.[v]).length;
        const descCount = hasDescriptions
          ? values.filter(v => enTranslations?.[`${v}_DESC`]).length
          : 0;

        console.log(
          `   ${name}: ${translatedCount}/${values.length} values` +
            (hasDescriptions ? `, ${descCount}/${values.length} descriptions` : '')
        );

        totalValues += values.length;
        totalDescriptions += hasDescriptions ? values.length : 0;
      });

      console.log(`   Total: ${totalValues} enum values, ${totalDescriptions} descriptions`);

      expect(totalValues).toBeGreaterThan(0);
    });
  });
});
