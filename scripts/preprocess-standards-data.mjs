/**
 * Pre-process Standards Data
 *
 * Reads raw ESCO and O*NET JSON files, transforms them into the unified
 * skill format used by the search engine, and writes minified output
 * to public/data/standards/ for CDN-served on-demand loading.
 *
 * Run: node scripts/preprocess-standards-data.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data', 'standards');
const OUTPUT_DIR = join(ROOT, 'public', 'data', 'standards');

// =============================================================================
// ESCO Processing
// =============================================================================

function extractESCOId(uri) {
  const parts = uri.split('/');
  return parts[parts.length - 1];
}

function parseAltLabels(altLabels) {
  if (!altLabels || altLabels.trim() === '') return [];
  return altLabels
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function mapESCOCategory(skillType, reuseLevel) {
  if (skillType === 'knowledge') return 'Knowledge';
  const levelMap = {
    'cross-sector': 'Cross-Sector Skill',
    'sector-specific': 'Sector-Specific Skill',
    'occupation-specific': 'Occupation-Specific Skill',
    transversal: 'Transversal Competence',
  };
  return levelMap[reuseLevel] || 'Skill/Competence';
}

function processESCOSkills(rawSkills) {
  return rawSkills
    .filter((skill) => skill.status === 'released')
    .map((raw) => {
      const id = extractESCOId(raw.conceptUri);
      return {
        id: `esco-${id}`,
        source: 'esco',
        name: raw.preferredLabel,
        altNames: parseAltLabels(raw.altLabels),
        description: raw.description || raw.scopeNote || '',
        category: mapESCOCategory(raw.skillType, raw.reuseLevel),
        subCategory: raw.reuseLevel,
        uri: raw.conceptUri,
        metadata: {
          status: raw.status,
          modifiedDate: raw.modifiedDate,
          conceptType: raw.conceptType,
        },
      };
    });
}

// =============================================================================
// O*NET Processing
// =============================================================================

function mapONetCategory(elementId) {
  if (elementId.startsWith('1.A')) return 'Ability';
  if (elementId.startsWith('1.B')) return 'Interest';
  if (elementId.startsWith('1.C')) return 'Work Style';
  if (elementId.startsWith('2.A')) return 'Knowledge';
  if (elementId.startsWith('2.B')) return 'Skill';
  if (elementId.startsWith('2.C')) return 'Education';
  return 'Other';
}

function aggregateONetElements(rawData) {
  const elementMap = new Map();

  for (const row of rawData) {
    const elementId = row['Element ID'];
    const elementName = row['Element Name'];
    const occupationCode = row['O*NET-SOC Code'];
    const occupationTitle = row['Title'];
    const scaleId = row['Scale ID'];
    const dataValue = parseFloat(row['Data Value']);

    if (!elementMap.has(elementId)) {
      elementMap.set(elementId, {
        elementId,
        elementName,
        occupations: new Map(),
      });
    }

    const element = elementMap.get(elementId);

    if (!element.occupations.has(occupationCode)) {
      element.occupations.set(occupationCode, {
        code: occupationCode,
        title: occupationTitle,
      });
    }

    const occupation = element.occupations.get(occupationCode);

    if (scaleId === 'IM') {
      occupation.importance = dataValue;
    } else if (scaleId === 'LV') {
      occupation.level = dataValue;
    }
  }

  return Array.from(elementMap.values());
}

function processONetElements(rawData, category) {
  const aggregated = aggregateONetElements(rawData);

  return aggregated.map((element) => {
    const topOccupations = Array.from(element.occupations.values())
      .filter((occ) => occ.importance !== undefined)
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, 10);

    const categoryLabel = mapONetCategory(element.elementId);

    return {
      id: `onet-${element.elementId}`,
      source: 'onet',
      name: element.elementName,
      altNames: [],
      description:
        `O*NET ${categoryLabel}: ${element.elementName}. ` +
        `Relevant for occupations like ${topOccupations
          .slice(0, 3)
          .map((o) => o.title)
          .join(', ')}.`,
      category: categoryLabel,
      code: element.elementId,
      metadata: {
        occupationCount: element.occupations.size,
        topOccupations: topOccupations.map((o) => ({
          code: o.code,
          title: o.title,
          importance: o.importance,
          level: o.level,
        })),
      },
    };
  });
}

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log('[preprocess] Reading raw standards data...');

  const escoSkills = JSON.parse(
    readFileSync(join(DATA_DIR, 'esco', 'skills_en.json'), 'utf-8')
  );
  const onetAbilities = JSON.parse(
    readFileSync(join(DATA_DIR, 'onet', 'Abilities.json'), 'utf-8')
  );
  const onetWorkStyles = JSON.parse(
    readFileSync(join(DATA_DIR, 'onet', 'WorkStyles.json'), 'utf-8')
  );
  const onetKnowledge = JSON.parse(
    readFileSync(join(DATA_DIR, 'onet', 'Knowledge.json'), 'utf-8')
  );

  console.log(`[preprocess] ESCO skills: ${escoSkills.length} raw entries`);
  console.log(`[preprocess] O*NET abilities: ${onetAbilities.length} raw rows`);
  console.log(`[preprocess] O*NET work styles: ${onetWorkStyles.length} raw rows`);
  console.log(`[preprocess] O*NET knowledge: ${onetKnowledge.length} raw rows`);

  // Process ESCO
  const escoProcessed = processESCOSkills(escoSkills);
  console.log(`[preprocess] ESCO processed: ${escoProcessed.length} skills (released only)`);

  // Process O*NET
  const onetAbilitiesProcessed = processONetElements(onetAbilities, 'ability');
  const onetWorkStylesProcessed = processONetElements(onetWorkStyles, 'work-style');
  const onetKnowledgeProcessed = processONetElements(onetKnowledge, 'knowledge');

  const onetCombined = [
    ...onetAbilitiesProcessed,
    ...onetWorkStylesProcessed,
    ...onetKnowledgeProcessed,
  ];
  console.log(`[preprocess] O*NET processed: ${onetCombined.length} elements (deduplicated)`);

  // Combine
  const allSkills = [...escoProcessed, ...onetCombined];
  console.log(`[preprocess] Total unified skills: ${allSkills.length}`);

  // Write output
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = join(OUTPUT_DIR, 'unified-skills.json');
  const json = JSON.stringify(allSkills);
  writeFileSync(outputPath, json, 'utf-8');

  const sizeMB = (Buffer.byteLength(json, 'utf-8') / (1024 * 1024)).toFixed(2);
  console.log(`[preprocess] Written: ${outputPath}`);
  console.log(`[preprocess] Output size: ${sizeMB} MB (minified JSON)`);
  console.log('[preprocess] Done.');
}

main();
