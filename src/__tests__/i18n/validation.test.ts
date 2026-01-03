/**
 * I18n Validation Tests
 *
 * Advanced validation tests for translation quality including:
 * - Interpolation placeholder consistency
 * - Namespace structure validation
 * - Translation value quality checks
 */

import { describe, it, expect } from 'vitest';
import {
  getAllKeys,
  getMissingKeys,
  getEmptyKeys,
  countByNamespace,
  getInterpolationMismatches,
  getTranslation,
} from './test-utils';

describe('I18n Validation', () => {
  describe('Interpolation Placeholders', () => {
    it('has matching placeholders between EN and RU', () => {
      const mismatches = getInterpolationMismatches();

      if (mismatches.length > 0) {
        console.log('\n⚠️ Interpolation mismatches found:');
        mismatches.forEach(m => console.log(`   ${m}`));
      }

      expect(mismatches).toEqual([]);
    });
  });

  describe('Namespace Structure', () => {
    it('has balanced namespace sizes between locales', () => {
      const enCounts = countByNamespace('en');
      const ruCounts = countByNamespace('ru');

      const namespaces = new Set([
        ...Object.keys(enCounts),
        ...Object.keys(ruCounts),
      ]);

      const imbalanced: string[] = [];

      namespaces.forEach(ns => {
        const enCount = enCounts[ns] || 0;
        const ruCount = ruCounts[ns] || 0;

        if (enCount !== ruCount) {
          imbalanced.push(`${ns}: EN=${enCount}, RU=${ruCount}`);
        }
      });

      if (imbalanced.length > 0) {
        console.log('\n⚠️ Namespace size imbalances:');
        imbalanced.forEach(i => console.log(`   ${i}`));
      }

      expect(imbalanced).toEqual([]);
    });
  });

  describe('Key Synchronization', () => {
    it('EN has no keys missing from RU', () => {
      const missing = getMissingKeys('en', 'ru');

      if (missing.length > 0) {
        console.log('\n⚠️ Keys in EN missing from RU:');
        missing.slice(0, 10).forEach(k => console.log(`   ${k}`));
        if (missing.length > 10) {
          console.log(`   ... and ${missing.length - 10} more`);
        }
      }

      expect(missing).toEqual([]);
    });

    it('RU has no keys missing from EN', () => {
      const missing = getMissingKeys('ru', 'en');

      if (missing.length > 0) {
        console.log('\n⚠️ Keys in RU missing from EN:');
        missing.slice(0, 10).forEach(k => console.log(`   ${k}`));
        if (missing.length > 10) {
          console.log(`   ... and ${missing.length - 10} more`);
        }
      }

      expect(missing).toEqual([]);
    });
  });

  describe('Empty Value Detection', () => {
    it('EN has no empty values', () => {
      const empty = getEmptyKeys('en');

      if (empty.length > 0) {
        console.log('\n⚠️ Empty values in EN:');
        empty.forEach(k => console.log(`   ${k}`));
      }

      expect(empty).toEqual([]);
    });

    it('RU has no empty values', () => {
      const empty = getEmptyKeys('ru');

      if (empty.length > 0) {
        console.log('\n⚠️ Empty values in RU:');
        empty.forEach(k => console.log(`   ${k}`));
      }

      expect(empty).toEqual([]);
    });
  });

  describe('Translation Quality', () => {
    it('RU translations are not just copies of EN', () => {
      const enKeys = getAllKeys('en');
      const suspiciousCopies: string[] = [];

      enKeys.forEach(key => {
        const enValue = getTranslation('en', key);
        const ruValue = getTranslation('ru', key);

        // Skip if either is undefined or if they're short (like "OK", "ID")
        if (!enValue || !ruValue || enValue.length < 3) return;

        // Skip if it's a proper noun or brand name
        if (key.includes('siteName') || key.includes('brand')) return;

        // Flag if RU is identical to EN (likely not translated)
        if (enValue === ruValue && /[a-zA-Z]{3,}/.test(enValue)) {
          suspiciousCopies.push(`${key}: "${enValue}"`);
        }
      });

      if (suspiciousCopies.length > 0) {
        console.log('\n⚠️ Possible untranslated values (RU = EN):');
        suspiciousCopies.slice(0, 10).forEach(s => console.log(`   ${s}`));
        if (suspiciousCopies.length > 10) {
          console.log(`   ... and ${suspiciousCopies.length - 10} more`);
        }
      }

      // Allow some copies (brand names, etc.) but flag if too many
      expect(suspiciousCopies.length).toBeLessThan(10);
    });

    it('RU translations use Cyrillic characters', () => {
      const ruKeys = getAllKeys('ru');
      const missingCyrillic: string[] = [];

      // Regex to detect at least one Cyrillic character
      const cyrillicRegex = /[\u0400-\u04FF]/;

      ruKeys.forEach(key => {
        const value = getTranslation('ru', key);

        // Skip short values, numbers, or special format strings
        if (!value || value.length < 5) return;
        if (/^\d+$/.test(value)) return; // Pure numbers
        if (/^[%\d.,\s]+$/.test(value)) return; // Number formats

        // Skip keys that are likely to be in English (e.g., codes, IDs)
        if (key.includes('code') || key.includes('id')) return;

        // Check for Cyrillic
        if (!cyrillicRegex.test(value)) {
          missingCyrillic.push(`${key}: "${value}"`);
        }
      });

      if (missingCyrillic.length > 0) {
        console.log('\n⚠️ RU values without Cyrillic characters:');
        missingCyrillic.slice(0, 10).forEach(m => console.log(`   ${m}`));
        if (missingCyrillic.length > 10) {
          console.log(`   ... and ${missingCyrillic.length - 10} more`);
        }
      }

      // Allow some non-Cyrillic (brand names, etc.) but flag if too many
      expect(missingCyrillic.length).toBeLessThan(20);
    });
  });

  describe('Coverage Summary', () => {
    it('reports overall coverage metrics', () => {
      const enKeys = getAllKeys('en');
      const ruKeys = getAllKeys('ru');
      const enCounts = countByNamespace('en');

      console.log('\n📊 I18n Coverage Summary:');
      console.log(`   Total EN keys: ${enKeys.length}`);
      console.log(`   Total RU keys: ${ruKeys.length}`);
      console.log(`   Namespaces: ${Object.keys(enCounts).length}`);
      console.log('\n   Keys by namespace:');

      Object.entries(enCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([ns, count]) => {
          console.log(`   - ${ns}: ${count}`);
        });

      expect(enKeys.length).toBe(ruKeys.length);
    });
  });
});
