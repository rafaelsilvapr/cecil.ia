import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const curriculumPath = path.resolve('src/data/curriculum.ts');
const migrationPath = path.resolve('supabase/migrations/20260712223000_phase9_telemetry.sql');
const marker = '-- GENERATED SYLLABLE CATALOG';
const clusters = [
  'CH', 'LH', 'NH', 'RR', 'SS', 'QU', 'GU', 'BR', 'BL', 'CR', 'CL',
  'DR', 'FR', 'FL', 'GR', 'GL', 'PR', 'PL', 'TR', 'VR',
];

const classifyFamily = syllable => {
  const normalized = syllable.normalize('NFD').replace(/\p{M}/gu, '');
  const cluster = clusters.find(candidate => normalized.startsWith(candidate));
  if (cluster) return cluster;
  if ('AEIOU'.includes(normalized[0])) return 'VOGAL';
  return syllable[0];
};

const source = await readFile(curriculumPath, 'utf8');
const catalog = new Map();
let currentLevel = 0;

for (const line of source.split(/\r?\n/)) {
  const levelMatch = line.match(/id:\s*'nivel-(\d+)'/);
  if (levelMatch) currentLevel = (Number(levelMatch[1]) - 1) * 10;

  const syllablesMatch = line.match(/syllables:\s*\[([^\]]+)\]/);
  if (!syllablesMatch) continue;

  for (const match of syllablesMatch[1].matchAll(/'([^']+)'/g)) {
    const syllable = match[1];
    if (!catalog.has(syllable)) {
      catalog.set(syllable, {
        familyKey: classifyFamily(syllable),
        introducedLevel: currentLevel,
      });
    }
  }
}

if (catalog.size === 0) throw new Error('Nenhuma sílaba encontrada no currículo.');

const values = [...catalog.entries()]
  .sort(([left], [right]) => left.localeCompare(right, 'pt-BR'))
  .map(([syllable, entry]) => `  ('${syllable.replaceAll("'", "''")}', '${entry.familyKey}', ${entry.introducedLevel}, false)`)
  .join(',\n');

const generatedSql = `${marker}\ninsert into public.syllable_catalog (\n  syllable, family_key, introduced_level, pedagogically_reviewed\n) values\n${values}\non conflict (syllable) do update set\n  family_key = excluded.family_key,\n  introduced_level = least(public.syllable_catalog.introduced_level, excluded.introduced_level),\n  updated_at = now();\n`;

const migration = await readFile(migrationPath, 'utf8');
const baseMigration = migration.split(marker)[0].trimEnd();
await writeFile(migrationPath, `${baseMigration}\n\n${generatedSql}`, 'utf8');

console.log(`${catalog.size} sílabas adicionadas à migration.`);
