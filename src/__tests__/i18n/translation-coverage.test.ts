/**
 * Translation Coverage Tests
 *
 * Ensures that both English and Russian translation files have identical keys
 * and no empty values. This prevents missing translations in production.
 */

import { describe, it, expect } from 'vitest';
import enMessages from '../../../messages/en/index';
import ruMessages from '../../../messages/ru/index';

/**
 * Recursively extracts all keys from a nested object
 * Returns flattened key paths like "forms.indicator.fields.title"
 */
function getAllKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getAllKeys(value as object, path);
    }
    return [path];
  });
}

/**
 * Gets the value at a nested path in an object
 */
function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

describe('Translation Coverage', () => {
  const enKeys = getAllKeys(enMessages);
  const ruKeys = getAllKeys(ruMessages);

  describe('Key Synchronization', () => {
    it('Russian has all English keys', () => {
      const missingInRu = enKeys.filter(key => !ruKeys.includes(key));

      if (missingInRu.length > 0) {
        console.log('Keys missing in ru.json:', missingInRu);
      }

      expect(missingInRu).toEqual([]);
    });

    it('English has all Russian keys', () => {
      const missingInEn = ruKeys.filter(key => !enKeys.includes(key));

      if (missingInEn.length > 0) {
        console.log('Keys missing in en.json:', missingInEn);
      }

      expect(missingInEn).toEqual([]);
    });

    it('Both files have the same number of keys', () => {
      expect(enKeys.length).toBe(ruKeys.length);
    });
  });

  describe('Value Validation', () => {
    it('No empty translation values in English', () => {
      const emptyKeys = enKeys.filter(key => {
        const value = getValueAtPath(enMessages as Record<string, unknown>, key);
        return value === '' || value === null || value === undefined;
      });

      if (emptyKeys.length > 0) {
        console.log('Empty values in en.json:', emptyKeys);
      }

      expect(emptyKeys).toEqual([]);
    });

    it('No empty translation values in Russian', () => {
      const emptyKeys = ruKeys.filter(key => {
        const value = getValueAtPath(ruMessages as Record<string, unknown>, key);
        return value === '' || value === null || value === undefined;
      });

      if (emptyKeys.length > 0) {
        console.log('Empty values in ru.json:', emptyKeys);
      }

      expect(emptyKeys).toEqual([]);
    });
  });

  describe('Namespace Coverage', () => {
    const requiredNamespaces = [
      'common',
      'navigation',
      'dashboard',
      'competency',
      'indicator',
      'question',
      'enums',
      'forms',
      'validation',
      'errors',
      'help',
      'metadata',
    ];

    requiredNamespaces.forEach(namespace => {
      it(`has '${namespace}' namespace in English`, () => {
        expect(enMessages).toHaveProperty(namespace);
      });

      it(`has '${namespace}' namespace in Russian`, () => {
        expect(ruMessages).toHaveProperty(namespace);
      });
    });
  });

  describe('Translation Metrics', () => {
    it('reports total translation keys', () => {
      console.log(`\n📊 Translation Metrics:`);
      console.log(`   English keys: ${enKeys.length}`);
      console.log(`   Russian keys: ${ruKeys.length}`);

      // Count by top-level namespace
      const namespaces = new Set(enKeys.map(key => key.split('.')[0]));
      console.log(`   Namespaces: ${namespaces.size}`);

      namespaces.forEach(ns => {
        const count = enKeys.filter(key => key.startsWith(ns + '.')).length;
        console.log(`   - ${ns}: ${count} keys`);
      });

      expect(enKeys.length).toBeGreaterThan(0);
    });
  });
});
