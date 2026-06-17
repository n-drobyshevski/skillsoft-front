/**
 * Generate compact O*NET occupation profiles for the backend.
 *
 * The backend's JOB_FIT assembler needs O*NET benchmark levels per occupation,
 * but only the frontend ships the full O*NET element dataset (~75 MB across
 * Abilities/Knowledge/WorkStyles). This script distills that dataset into a
 * small per-SOC-code profile file that the backend bundles as a classpath
 * resource and loads at startup — no network/credentials, low memory.
 *
 * Output shape mirrors the backend `OnetService.OnetProfile` record so it
 * deserializes directly into `Map<String, OnetProfile>`:
 *
 *   {
 *     "17-2199.09": {
 *       "socCode": "17-2199.09",
 *       "occupationTitle": "Nanosystems Engineers",
 *       "description": "...",
 *       "benchmarks":     { "Analytical Thinking": 4.1, ... },  // from Work Styles
 *       "knowledgeAreas": { "Engineering and Technology": 4.3, ... },
 *       "skills":         {},                                   // no Skills.json in dataset
 *       "abilities":      { "Deductive Reasoning": 4.1, ... }
 *     },
 *     ...
 *   }
 *
 * IMPORTANT: `benchmarks` are built from Work Styles (NOT Abilities). The
 * backend maps benchmark keys to internal competencies via
 * `standardCodes.onetRef.title`, and the internal competencies are keyed on
 * O*NET Work Style names ("Analytical Thinking", "Leadership", "Cooperation",
 * ...). Using Abilities here would break that mapping.
 *
 * Regenerate after updating the O*NET source data:
 *   npm run gen:onet-profiles
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Source O*NET element data (frontend) and backend output target.
const DATA_DIR = resolve(__dirname, '../src/data/standards/onet');
const OUTPUT_FILE = resolve(
  __dirname,
  '../../assessment-backend/src/main/resources/onet/onet-profiles.json'
);

// How many top elements (by importance) to keep per category.
const MAX_BENCHMARKS = 8; // Work Styles
const MAX_KNOWLEDGE = 8;
const MAX_ABILITIES = 10;

function readJson(name) {
  return JSON.parse(readFileSync(resolve(DATA_DIR, name), 'utf8'));
}

/**
 * Index importance-rated (IM) element rows by SOC code.
 * Returns Map<socCode, Array<{ name, value }>>.
 */
function indexByCode(rows) {
  const index = new Map();
  for (const r of rows) {
    if (r['Scale ID'] !== 'IM') continue;
    if (r['Recommend Suppress'] === 'Y') continue;
    if (r['Not Relevant'] === 'Y') continue;

    const code = r['O*NET-SOC Code'];
    const value = parseFloat(r['Data Value']);
    if (!Number.isFinite(value) || value <= 0) continue;

    let bucket = index.get(code);
    if (!bucket) {
      bucket = [];
      index.set(code, bucket);
    }
    bucket.push({ name: r['Element Name'], value });
  }
  return index;
}

/**
 * Resolve element rows for a SOC code with robust fallback:
 * exact code -> base ".00" code -> any sibling sharing the "XX-XXXX" prefix.
 * O*NET element files only carry detailed codes, and some detailed ".09"-style
 * codes have no rows of their own, so we borrow the closest available profile.
 */
function resolveElements(index, socCode) {
  const exact = index.get(socCode);
  if (exact && exact.length > 0) return exact;

  const prefix = socCode.slice(0, socCode.lastIndexOf('.')); // "17-2199"

  const base = index.get(`${prefix}.00`);
  if (base && base.length > 0) return base;

  for (const [code, rows] of index) {
    if (code.startsWith(prefix) && rows.length > 0) return rows;
  }
  return [];
}

/** Top-N elements by importance as a { name: roundedValue } map. */
function topMap(elements, limit) {
  return [...elements]
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .reduce((acc, e) => {
      // Keep the highest importance if an element name repeats across scales.
      const rounded = Math.round(e.value * 100) / 100;
      if (acc[e.name] === undefined || rounded > acc[e.name]) {
        acc[e.name] = rounded;
      }
      return acc;
    }, {});
}

function main() {
  console.log('[gen:onet-profiles] Reading O*NET source data from', DATA_DIR);

  const occupations = readJson('OccupationData.json');
  const workStyles = indexByCode(readJson('WorkStyles.json'));
  const knowledge = indexByCode(readJson('Knowledge.json'));
  const abilities = indexByCode(readJson('Abilities.json'));

  console.log(
    `[gen:onet-profiles] Indexed: ${workStyles.size} work-style, ` +
      `${knowledge.size} knowledge, ${abilities.size} ability occupations`
  );

  const profiles = {};
  let withBenchmarks = 0;

  for (const occ of occupations) {
    const socCode = occ['O*NET-SOC Code'];

    const benchmarks = topMap(resolveElements(workStyles, socCode), MAX_BENCHMARKS);
    const knowledgeAreas = topMap(resolveElements(knowledge, socCode), MAX_KNOWLEDGE);
    const abilityMap = topMap(resolveElements(abilities, socCode), MAX_ABILITIES);

    if (Object.keys(benchmarks).length > 0) withBenchmarks++;

    profiles[socCode] = {
      socCode,
      occupationTitle: occ.Title,
      description: occ.Description ?? '',
      benchmarks,
      knowledgeAreas,
      skills: {},
      abilities: abilityMap,
    };
  }

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(profiles, null, 0), 'utf8');

  const total = Object.keys(profiles).length;
  console.log(
    `[gen:onet-profiles] Wrote ${total} profiles (${withBenchmarks} with benchmarks) -> ${OUTPUT_FILE}`
  );

  // Sanity: the code that triggered the original bug must now resolve.
  const sample = profiles['17-2199.09'];
  if (!sample || Object.keys(sample.benchmarks).length === 0) {
    console.error('[gen:onet-profiles] WARNING: 17-2199.09 has no benchmarks!');
  } else {
    console.log(
      `[gen:onet-profiles] 17-2199.09 "${sample.occupationTitle}" -> ` +
        `${Object.keys(sample.benchmarks).length} benchmarks`
    );
  }
}

main();
