import fs from 'node:fs/promises';
import path from 'node:path';
import {
  Workbook,
  SpreadsheetFile,
} from '/Users/rafaelrodriguesdasilva/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';

const cwd = process.cwd();
const outputDir = path.join(cwd, 'outputs', 'cibele_rafa_repertorio_2026-04-16');
const previewDir = path.join(outputDir, 'previews');
const catalogPath = path.join(cwd, 'repertorio', 'catalogo_canonico.md');
const blocksPath = path.join(cwd, 'repertorio', 'blocos_e_medleys.md');
const workbookPath = path.join(outputDir, 'cibele_rafa_repertorio_base.xlsx');

const categoryDisplay = {
  'Sambas': 'Sambas',
  'Sambas rapidos': 'Sambas rápidos',
  'Samba rock / Funk': 'Samba rock / Funk',
  'Xotes': 'Xotes',
  'Reggae': 'Reggae',
  'Baiao / Nordeste': 'Baião / Nordeste',
  'Maxixe': 'Maxixe',
  'Axe': 'Axé',
  'Blues / românticas': 'Blues / românticas',
  'Frevos': 'Frevos',
  'Marchinhas': 'Marchinhas',
  'Rock e outras': 'Rock e outras',
  'Rebarba / reservas': 'Rebarba / reservas',
  'Pendencias de confirmacao': 'Pendências de confirmação',
};

const energyByCategory = {
  'Sambas': 'Média',
  'Sambas rapidos': 'Alta',
  'Samba rock / Funk': 'Alta',
  'Xotes': 'Média',
  'Reggae': 'Média',
  'Baiao / Nordeste': 'Média',
  'Maxixe': 'Média',
  'Axe': 'Alta',
  'Blues / românticas': 'Baixa',
  'Frevos': 'Alta',
  'Marchinhas': 'Alta',
  'Rock e outras': 'Média',
  'Rebarba / reservas': 'Média',
  'Pendencias de confirmacao': 'A confirmar',
};

const styleValidationList = [
  'Todos',
  'Sambas',
  'Sambas rápidos',
  'Samba rock / Funk',
  'Xotes',
  'Reggae',
  'Baião / Nordeste',
  'Maxixe',
  'Axé',
  'Blues / românticas',
  'Frevos',
  'Marchinhas',
  'Rock e outras',
  'Rebarba / reservas',
  'Pendências de confirmação',
];

const energyValidationList = ['Todos', 'Baixa', 'Média', 'Alta', 'A confirmar'];
const statusValidationList = ['Todos', 'Base', 'Reserva', 'Pendente', 'A confirmar'];

const displayOverrides = new Map([
  [normalizeKey('alo fevereiro'), 'Alô Fevereiro'],
  [normalizeKey('tiro ao alvaro'), 'Tiro ao Álvaro'],
  [normalizeKey('pe do meu samba'), 'Pé do meu Samba'],
  [normalizeKey('o bebado e a equilibrista'), 'O bêbado e a equilibrista'],
  [normalizeKey('danca da solidao'), 'Dança da Solidão'],
  [normalizeKey('nao deixe o samba morrer'), 'Não deixe o samba morrer'],
  [normalizeKey('nao vou ficar'), 'Não vou ficar'],
  [normalizeKey('voce abusou'), 'Você abusou'],
  [normalizeKey('voce me vira a cabeca'), 'Você me vira a cabeça'],
  [normalizeKey('voce com essa mania sensual'), 'Você com essa mania sensual'],
  [normalizeKey('isso aqui o que e'), 'Isso aqui o que é'],
  [normalizeKey('o que e o que e'), 'O que é o que é'],
  [normalizeKey('o que e o amor'), 'O que é o amor'],
  [normalizeKey('como sera o amanha'), 'Como será o amanhã'],
  [normalizeKey('eu so quero um xodo'), 'Eu só quero um xodó'],
  [normalizeKey('ai que saudade doce'), 'Ai que saudade docê'],
  [normalizeKey('sao gonca'), 'São Gonça'],
  [normalizeKey('lets stay together'), "Let's stay together"],
  [normalizeKey('cabeleira do zeze'), 'Cabeleira do Zezé'],
  [normalizeKey('baianidade nago'), 'Baianidade Nagô'],
  [normalizeKey('varias queixas'), 'Várias queixas'],
  [normalizeKey('dois pra la, dois pra ca'), 'Dois pra lá, dois pra cá'],
  [normalizeKey('quizas, quizas, quizas'), 'Quizás, quizás, quizás'],
  [normalizeKey('besame mucho'), 'Bésame mucho'],
  [normalizeKey('el dia que me quieras'), 'El día que me quieras'],
  [normalizeKey('me da um dinheiro ai'), 'Me dá um dinheiro aí'],
  [normalizeKey('mamae eu quero'), 'Mamãe eu quero'],
  [normalizeKey('o teu cabelo nao nega'), 'O teu cabelo não nega'],
  [normalizeKey('pais tropical'), 'País tropical'],
  [normalizeKey('mascara negra'), 'Máscara negra'],
  [normalizeKey('me abraça, me beija'), 'Me abraça, me beija'],
  [normalizeKey('im yours'), "I'm yours"],
  [normalizeKey('ive brussel'), 'Ive Brussel'],
  [normalizeKey('pe na areia'), 'Pé na areia'],
]);

const toneAliases = new Map([
  ['ca', 'C'],
  ['bem', 'Bm'],
  ['c', 'C'],
  ['d', 'D'],
  ['e', 'E'],
  ['f', 'F'],
  ['g', 'G'],
  ['a', 'A'],
  ['b', 'B'],
]);

const toneOrder = [
  'A', 'A7', 'A7M', 'Am',
  'Bb', 'B', 'Bm',
  'C', 'C#m', 'Cm',
  'D', 'D7', 'Dm',
  'Eb', 'E', 'Em',
  'F', 'F#', 'F#m', 'Fm',
  'G', 'Gm',
  'A confirmar',
];

function normalizeKey(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['’"]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase();
}

function titleScore(text) {
  return [...text].reduce((score, ch) => {
    if (ch.charCodeAt(0) > 127) return score + 2;
    if (ch === "'" || ch === '’') return score + 1;
    return score;
  }, 0);
}

function applyDisplayOverrides(rawTitle) {
  const key = normalizeKey(rawTitle);
  return displayOverrides.get(key) ?? rawTitle.trim();
}

function cleanWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function parseCategory(raw) {
  return categoryDisplay[raw] ?? raw;
}

function parseEnergy(rawCategory) {
  return energyByCategory[rawCategory] ?? 'Média';
}

function stripBullets(text) {
  return text.replace(/^\s*-\s*/, '').replace(/^\s*\d+\.\s*/, '').trim();
}

function isUppercaseStart(char) {
  return /[A-ZÀ-ÖØ-Þ]/.test(char);
}

function splitTopLevel(text) {
  const parts = [];
  let current = '';
  let depth = 0;

  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) parts.push(trimmed);
    current = '';
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    const prev = text[i - 1];

    if (ch === '(') depth += 1;
    if (ch === ')' && depth > 0) depth -= 1;

    if (depth === 0) {
      if (ch === '-' && next === '>') {
        flush();
        i += 1;
        continue;
      }
      if (
        ch === '-' &&
        prev === ' ' &&
        next === ' '
      ) {
        flush();
        continue;
      }
      if (ch === '/') {
        const remainder = text.slice(i + 1).trimStart();
        if (remainder && isUppercaseStart(remainder[0])) {
          flush();
          continue;
        }
      }
    }

    current += ch;
  }

  flush();
  return parts;
}

function extractTone(meta) {
  const cleaned = meta
    .replace(/[º°]/g, 'º')
    .replace(/\s+/g, ' ')
    .trim();

  const candidates = [...cleaned.matchAll(/\b([A-G](?:#|b)?(?:7M|m7|M|m|7|º)?)\b/g)].map((m) => m[1]);
  if (candidates.length > 0) {
    return candidates[0];
  }

  const alias = toneAliases.get(cleaned.toLowerCase());
  if (alias) return alias;
  return '';
}

function extractNote(meta, tone) {
  const trimmed = cleanWhitespace(meta);
  if (!tone) return trimmed;
  const pattern = new RegExp(`\\b${tone.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
  const withoutTone = cleanWhitespace(trimmed.replace(pattern, ' ').replace(/^[/,;:-]+\s*/, ''));
  return withoutTone && withoutTone !== tone ? withoutTone : '';
}

function parseSegment(segment) {
  const raw = cleanWhitespace(segment);
  const match = raw.match(/^(.*)\(([^()]*)\)\s*$/);

  let titlePart = raw;
  let meta = '';
  if (match) {
    titlePart = cleanWhitespace(match[1]);
    meta = cleanWhitespace(match[2]);
  }

  const subtitleMatches = [...titlePart.matchAll(/\(([^()]*)\)/g)].map((m) => cleanWhitespace(m[1])).filter(Boolean);
  const baseTitle = cleanWhitespace(titlePart.replace(/\s*\([^)]*\)\s*/g, ' '));

  let displayTitle = applyDisplayOverrides(baseTitle);
  if (titleScore(displayTitle) < titleScore(baseTitle)) {
    displayTitle = baseTitle;
  }

  const tone = meta ? extractTone(meta) : '';
  const toneNote = meta ? extractNote(meta, tone) : '';

  return {
    title: displayTitle,
    titleKey: normalizeKey(displayTitle),
    tone,
    note: cleanWhitespace([...(subtitleMatches || []), toneNote].filter(Boolean).join('; ')),
    raw: raw,
  };
}

function ensureMapEntry(map, key, createValue) {
  if (!map.has(key)) {
    map.set(key, createValue());
  }
  return map.get(key);
}

function joinUnique(values, separator = '; ') {
  return [...new Set(values.filter(Boolean))].join(separator);
}

function uniqueSortedTones(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (!value) continue;
    const normalized = value.replace(/\s+/g, '').toUpperCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(value);
    }
  }
  result.sort((a, b) => {
    const ia = toneOrder.indexOf(a);
    const ib = toneOrder.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    }
    return a.localeCompare(b, 'pt-BR');
  });
  return result;
}

function parseCatalog(markdown) {
  const lines = markdown.split(/\r?\n/);
  const songs = new Map();
  let currentCategory = '';
  let rowOrder = 0;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      currentCategory = heading[1].trim();
      continue;
    }

    if (!line.trim().startsWith('- ')) continue;
    if (!currentCategory) continue;

    rowOrder += 1;
    const rawTitle = stripBullets(line);
    const displayTitle = applyDisplayOverrides(rawTitle);
    const key = normalizeKey(displayTitle);
    const category = parseCategory(currentCategory);

    const existing = ensureMapEntry(songs, key, () => ({
      key,
      title: displayTitle,
      titleScore: titleScore(displayTitle),
      primaryCategoryRaw: currentCategory,
      primaryCategory: category,
      categories: [],
      energy: parseEnergy(currentCategory),
      status: currentCategory === 'Pendencias de confirmacao'
        ? 'Pendente'
        : currentCategory === 'Rebarba / reservas'
          ? 'Reserva'
          : 'Base',
      tones: [],
      notes: [],
      refs: [],
      rawTitles: [],
      firstSeen: rowOrder,
    }));

    existing.rawTitles.push(rawTitle);
    if (!existing.categories.includes(category)) {
      existing.categories.push(category);
    }
    if (titleScore(displayTitle) > existing.titleScore) {
      existing.title = displayTitle;
      existing.titleScore = titleScore(displayTitle);
    }
    if (currentCategory === 'Pendencias de confirmacao') {
      existing.status = 'Pendente';
    }
  }

  return songs;
}

function parseBlocks(markdown, songMap) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let currentCategory = '';
  let blockNumber = 0;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      currentCategory = heading[1].trim();
      continue;
    }

    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (!numbered || !currentCategory) continue;

    blockNumber += 1;
    const raw = cleanWhitespace(numbered[1]);
    const category = parseCategory(currentCategory);
    const sequenceParts = splitTopLevel(raw);
    const detectedTones = [];
    const notes = [];
    const segmentTitles = [];

    for (const part of sequenceParts) {
      const parsed = parseSegment(part);
      if (!parsed.title) continue;
      segmentTitles.push(parsed.title);
      if (parsed.tone) detectedTones.push(parsed.tone);
      if (parsed.note) notes.push(parsed.note);

      const song = songMap.get(parsed.titleKey);
      if (song) {
        song.tones.push(parsed.tone);
        song.refs.push(`${category} ${blockNumber}`);
        if (parsed.note) song.notes.push(parsed.note);
      }
    }

    blocks.push({
      category,
      blockNumber,
      sequence: raw,
      tones: uniqueSortedTones(detectedTones),
      notes: joinUnique(notes),
      status: notes.length > 0 ? 'A revisar' : 'Base',
      titles: segmentTitles,
    });
  }

  return blocks;
}

function toMatrix(rows, columns) {
  return rows.map((row) => columns.map((col) => row[col] ?? ''));
}

function setTitleBlock(sheet, titleRange, subtitleRange, title, subtitle, columns) {
  sheet.getRange(titleRange).merge();
  sheet.getRange(subtitleRange).merge();
  sheet.getRange(titleRange.split(':')[0]).values = [[title]];
  sheet.getRange(subtitleRange.split(':')[0]).values = [[subtitle]];
  sheet.getRange(titleRange).format = {
    fill: '#1F2937',
    font: { name: 'Aptos', size: 16, bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
  };
  sheet.getRange(subtitleRange).format = {
    fill: '#E5E7EB',
    font: { name: 'Aptos', size: 10, color: '#111827' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
  };
  sheet.getRange(titleRange).format.rowHeightPx = 28;
  sheet.getRange(subtitleRange).format.rowHeightPx = 24;
  for (const col of columns) {
    sheet.getRange(col).format.verticalAlignment = 'middle';
  }
}

async function writePreview(workbook, sheetName, range, filePath) {
  const blob = await workbook.render({ sheetName, range, scale: 2, format: 'png' });
  const buffer = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(filePath, buffer);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });

  const [catalogMarkdown, blocksMarkdown] = await Promise.all([
    fs.readFile(catalogPath, 'utf8'),
    fs.readFile(blocksPath, 'utf8'),
  ]);

  const songsMap = parseCatalog(catalogMarkdown);
  const blocks = parseBlocks(blocksMarkdown, songsMap);

  const songRows = [...songsMap.values()]
    .sort((a, b) => a.firstSeen - b.firstSeen)
    .map((song) => {
      const uniqueTones = uniqueSortedTones(song.tones);
      const primaryTone = uniqueTones[0] ?? '';
      const extraTones = uniqueTones.slice(1);
      const extraNotes = [];
      if (extraTones.length > 0) {
        extraNotes.push(`Tons adicionais: ${extraTones.join(', ')}`);
      }
      if (song.notes.length > 0) {
        extraNotes.push(...song.notes);
      }

      return {
        category: song.primaryCategory,
        title: song.title,
        tone: primaryTone || (song.status === 'Pendente' ? 'A confirmar' : ''),
        energy: song.energy,
        usage: joinUnique(song.categories),
        refs: joinUnique(song.refs),
        notes: joinUnique(extraNotes),
        status: song.status,
      };
    });

  const songLastRow = 4 + songRows.length;
  const blockLastRow = 4 + blocks.length;

  const workbook = Workbook.create();
  const resumo = workbook.worksheets.add('Resumo');
  const catalogo = workbook.worksheets.add('Catalogo');
  const blocos = workbook.worksheets.add('Blocos');
  const consulta = workbook.worksheets.add('Consulta');

  // Resumo
  setTitleBlock(
    resumo,
    'A1:H1',
    'A2:H2',
    'Cibele e Rafa - Base de repertorio',
    'Catalogo deduplicado, blocos de medley e consulta com filtros por estilo, tom e energia.',
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  );
  resumo.getRange('A4:B4').merge();
  resumo.getRange('A5:B5').merge();
  resumo.getRange('C4:D4').merge();
  resumo.getRange('C5:D5').merge();
  resumo.getRange('E4:F4').merge();
  resumo.getRange('E5:F5').merge();
  resumo.getRange('G4:H4').merge();
  resumo.getRange('G5:H5').merge();

  resumo.getRange('A4').values = [['Total de canções']];
  resumo.getRange('A5').formulas = [[`=COUNTA(Catalogo!$B$5:$B$${songLastRow})`]];
  resumo.getRange('C4').values = [['Blocos']]
  resumo.getRange('C5').formulas = [[`=COUNTA(Blocos!$C$5:$C$${blockLastRow})`]];
  resumo.getRange('E4').values = [['Tons registrados']];
  resumo.getRange('E5').formulas = [[`=COUNTIF(Catalogo!$C$5:$C$${songLastRow},"<>")`]];
  resumo.getRange('G4').values = [['Pendências']];
  resumo.getRange('G5').formulas = [[`=COUNTIF(Catalogo!$H$5:$H$${songLastRow},"Pendente")`]];

  for (const rangeAddress of ['A4:B4', 'A5:B5', 'C4:D4', 'C5:D5', 'E4:F4', 'E5:F5', 'G4:H4', 'G5:H5']) {
    resumo.getRange(rangeAddress).format = {
      fill: rangeAddress.endsWith('4') ? '#0F172A' : '#E2E8F0',
      font: {
        name: 'Aptos',
        size: rangeAddress.endsWith('4') ? 10 : 16,
        bold: true,
        color: rangeAddress.endsWith('4') ? '#FFFFFF' : '#0F172A',
      },
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      wrapText: true,
      borders: { preset: 'outside', style: 'thin', color: '#CBD5E1' },
    };
    resumo.getRange(rangeAddress).format.rowHeightPx = rangeAddress.endsWith('4') ? 24 : 36;
  }
  resumo.getRange('A4:H5').format.borders = { preset: 'outside', style: 'thin', color: '#CBD5E1' };

  const styleCounts = styleValidationList.slice(1).map((style) => songRows.filter((row) => row.category === style).length);
  const summaryChartStyles = [
    'Sambas',
    'Sambas rápidas',
    'Samba rock',
    'Xotes',
    'Reggae',
    'Baião',
    'Maxixe',
    'Axé',
    'Blues',
    'Frevos',
    'Marchinhas',
    'Rock',
    'Rebarba',
    'Pendências',
  ];

  resumo.getRange('A8:B8').values = [['Estilo', 'Canções']];
  resumo.getRange('A9:A22').values = styleValidationList.slice(1).map((style) => [style]);
  resumo.getRange('B9:B22').formulas = styleValidationList.slice(1).map((_, index) => [`=COUNTIF(Catalogo!$A$5:$A$${songLastRow},A${9 + index})`]);
  resumo.getRange('D8:E8').values = [['Energia', 'Canções']];
  resumo.getRange('D9:D11').values = energyValidationList.slice(1, 4).map((item) => [item]);
  resumo.getRange('E9:E11').formulas = energyValidationList.slice(1, 4).map((_, index) => [`=COUNTIF(Catalogo!$D$5:$D$${songLastRow},D${9 + index})`]);

  for (const rangeAddress of ['A8:B8', 'D8:E8']) {
    resumo.getRange(rangeAddress).format = {
      fill: '#1D4ED8',
      font: { name: 'Aptos', size: 11, bold: true, color: '#FFFFFF' },
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      wrapText: true,
      borders: { preset: 'outside', style: 'thin', color: '#1D4ED8' },
    };
  }
  resumo.getRange('A9:B22').format = {
    fill: '#FFFFFF',
    font: { name: 'Aptos', size: 10, color: '#111827' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: '#E5E7EB' },
  };
  resumo.getRange('D9:E11').format = {
    fill: '#FFFFFF',
    font: { name: 'Aptos', size: 10, color: '#111827' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: '#E5E7EB' },
  };
  resumo.getRange('A8:E22').format.rowHeightPx = 24;
  resumo.getRange('A9:A22').format.columnWidthPx = 210;
  resumo.getRange('A9:A22').format.wrapText = true;
  resumo.getRange('B9:B22').format.columnWidthPx = 90;
  resumo.getRange('D9:D11').format.columnWidthPx = 140;
  resumo.getRange('E9:E11').format.columnWidthPx = 90;
  resumo.getRange('A8:E22').format.verticalAlignment = 'middle';
  resumo.freezePanes.unfreeze();

  resumo.charts.add('bar', {
    title: 'Canções por estilo',
    from: { row: 7, col: 6 },
    extent: { widthPx: 560, heightPx: 340 },
    categories: summaryChartStyles,
    series: [
      { name: 'Canções', values: styleCounts },
    ],
    hasLegend: false,
    dataLabels: { showValue: true },
  });

  resumo.getRange('A23:H23').merge();
  resumo.getRange('A23').values = [['O repertório foi deduplicado por chave interna; se você quiser, eu padronizo títulos, tonais e observações na próxima passada.']];
  resumo.getRange('A23:H23').format = {
    fill: '#F8FAFC',
    font: { name: 'Aptos', size: 10, italic: true, color: '#334155' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: '#E2E8F0' },
  };
  resumo.getRange('A23:H23').format.rowHeightPx = 34;

  // Catalogo
  setTitleBlock(
    catalogo,
    'A1:H1',
    'A2:H2',
    'Catalogo canonico',
    'Use o filtro da tabela para achar uma canção por estilo, tom ou energia. A aba Consulta traz a mesma busca em modo assistido.',
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  );
  catalogo.getRange('A3:H3').merge();
  catalogo.getRange('A3').values = [['Categorias de uso e referências de bloco foram consolidadas a partir dos cadernos originais.']];
  catalogo.getRange('A3:H3').format = {
    fill: '#F8FAFC',
    font: { name: 'Aptos', size: 10, italic: true, color: '#334155' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: '#E2E8F0' },
  };
  catalogo.getRange('A3:H3').format.rowHeightPx = 28;

  const catalogHeaders = [[
    'Categoria principal',
    'Música',
    'Tom de referência',
    'Energia',
    'Categorias de uso',
    'Referências',
    'Observações',
    'Status',
  ]];
  catalogo.getRange('A4:H4').values = catalogHeaders;
  catalogo.getRange(`A5:H${songLastRow}`).values = toMatrix(songRows, [
    'category',
    'title',
    'tone',
    'energy',
    'usage',
    'refs',
    'notes',
    'status',
  ]);
  const catalogTable = catalogo.tables.add(`A4:H${songLastRow}`, true, 'CatalogoMusicas');
  catalogTable.style = 'TableStyleMedium2';
  catalogTable.showFilterButton = true;
  catalogTable.showBandedRows = true;
  catalogTable.showBandedColumns = false;
  catalogo.freezePanes.freezeRows(4);
  catalogo.getRange('A4:H4').format = {
    fill: '#0F172A',
    font: { name: 'Aptos', size: 10, bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
  };
  catalogo.getRange(`A5:H${songLastRow}`).format = {
    font: { name: 'Aptos', size: 10, color: '#111827' },
    verticalAlignment: 'top',
    wrapText: false,
  };
  catalogo.getRange(`E5:G${songLastRow}`).format.wrapText = true;
  catalogo.getRange(`F5:G${songLastRow}`).format.wrapText = true;
  catalogo.getRange(`A1:H${songLastRow}`).format.rowHeightPx = 24;
  catalogo.getRange('A1:H1').format.rowHeightPx = 28;
  catalogo.getRange('A2:H2').format.rowHeightPx = 26;
  catalogo.getRange('A3:H3').format.rowHeightPx = 28;
  catalogo.getRange('A4:H4').format.rowHeightPx = 28;
  catalogo.getRange(`A5:H${songLastRow}`).format.rowHeightPx = 30;
  catalogo.getRange('A:A').format.columnWidthPx = 160;
  catalogo.getRange('B:B').format.columnWidthPx = 230;
  catalogo.getRange('C:C').format.columnWidthPx = 120;
  catalogo.getRange('D:D').format.columnWidthPx = 90;
  catalogo.getRange('E:E').format.columnWidthPx = 210;
  catalogo.getRange('F:F').format.columnWidthPx = 180;
  catalogo.getRange('G:G').format.columnWidthPx = 240;
  catalogo.getRange('H:H').format.columnWidthPx = 110;

  // Blocos
  setTitleBlock(
    blocos,
    'A1:E1',
    'A2:E2',
    'Blocos e medleys',
    'Registro dos blocos de show e das sequências já pensadas. Ótimo para montar setlists por clima ou duração.',
    ['A', 'B', 'C', 'D', 'E'],
  );
  blocos.getRange('A3:E3').merge();
  blocos.getRange('A3').values = [['A coluna Tom(ões) resume as tonalidades detectadas em cada bloco; as observações registram chamadas como início no IV, refrão ou intro.']];
  blocos.getRange('A3:E3').format = {
    fill: '#F8FAFC',
    font: { name: 'Aptos', size: 10, italic: true, color: '#334155' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: '#E2E8F0' },
  };
  blocos.getRange('A3:E3').format.rowHeightPx = 30;
  blocos.getRange('A4:E4').values = [[
    'Categoria',
    'Bloco',
    'Sequência / medley',
    'Tom(ões)',
    'Observações',
  ]];
  blocos.getRange(`A5:E${blockLastRow}`).values = toMatrix(blocks, [
    'category',
    'blockNumber',
    'sequence',
    'tones',
    'notes',
  ]);
  const blockTable = blocos.tables.add(`A4:E${blockLastRow}`, true, 'BlocosMusicais');
  blockTable.style = 'TableStyleMedium2';
  blockTable.showFilterButton = true;
  blockTable.showBandedRows = true;
  blocos.freezePanes.freezeRows(4);
  blocos.getRange('A4:E4').format = {
    fill: '#1F2937',
    font: { name: 'Aptos', size: 10, bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
  };
  blocos.getRange(`A5:E${blockLastRow}`).format = {
    font: { name: 'Aptos', size: 10, color: '#111827' },
    verticalAlignment: 'top',
    wrapText: true,
  };
  blocos.getRange('A:A').format.columnWidthPx = 170;
  blocos.getRange('B:B').format.columnWidthPx = 70;
  blocos.getRange('C:C').format.columnWidthPx = 410;
  blocos.getRange('D:D').format.columnWidthPx = 180;
  blocos.getRange('E:E').format.columnWidthPx = 230;
  blocos.getRange(`A5:E${blockLastRow}`).format.rowHeightPx = 34;

  // Consulta
  setTitleBlock(
    consulta,
    'A1:H1',
    'A2:H2',
    'Consulta guiada',
    'Escolha estilo, tom, energia e status. Deixe "Todos" para abrir a busca.',
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  );
  consulta.getRange('A3:H3').merge();
  consulta.getRange('A3').values = [['Os filtros da esquerda alimentam uma busca dinâmica abaixo.']];
  consulta.getRange('A3:H3').format = {
    fill: '#F8FAFC',
    font: { name: 'Aptos', size: 10, italic: true, color: '#334155' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: '#E2E8F0' },
  };
  consulta.getRange('A3:H3').format.rowHeightPx = 28;

  consulta.getRange('A5:A8').values = [
    ['Categoria'],
    ['Tom'],
    ['Energia'],
    ['Status'],
  ];
  consulta.getRange('B5:B8').values = [
    ['Todos'],
    ['Todos'],
    ['Todos'],
    ['Todos'],
  ];
  consulta.getRange('D5:H8').merge();
  consulta.getRange('D5').formulas = [[`="Resultados: "&COUNTIF(A11:A${10 + songRows.length},"<>")&CHAR(10)&"Use a tabela Catalogo para filtrar com o mesmo padrão."`]];
  consulta.getRange('D5:H8').format = {
    fill: '#EEF2FF',
    font: { name: 'Aptos', size: 11, color: '#1E3A8A' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: '#C7D2FE' },
  };

  const filterRanges = ['B5:B5', 'B6:B6', 'B7:B7', 'B8:B8'];
  const validations = [
    styleValidationList,
    ['Todos', ...toneOrder.filter((tone) => tone !== 'A confirmar')],
    energyValidationList,
    statusValidationList,
  ];
  for (let i = 0; i < filterRanges.length; i += 1) {
    consulta.getRange(filterRanges[i]).dataValidation = {
      allowBlank: true,
      list: {
        inCellDropDown: true,
        source: validations[i],
      },
    };
  }
  consulta.getRange('A5:B8').format = {
    fill: '#FFFFFF',
    font: { name: 'Aptos', size: 10, color: '#111827' },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: false,
    borders: { preset: 'outside', style: 'thin', color: '#CBD5E1' },
  };
  consulta.getRange('B5:B8').format.fill = '#F9FAFB';
  consulta.getRange('B5:B8').format.font = { name: 'Aptos', size: 10, color: '#111827' };
  consulta.getRange('B5:B8').format.borders = { preset: 'outside', style: 'thin', color: '#CBD5E1' };

  consulta.getRange('A10:H10').values = [[
    'Categoria principal',
    'Música',
    'Tom de referência',
    'Energia',
    'Categorias de uso',
    'Referências',
    'Observações',
    'Status',
  ]];
  const queryCriteria = `(IF($B$5="Todos",1,ISNUMBER(SEARCH($B$5,Catalogo!$E$5:$E$${songLastRow}))))*(IF($B$6="Todos",1,Catalogo!$C$5:$C$${songLastRow}=$B$6))*(IF($B$7="Todos",1,Catalogo!$D$5:$D$${songLastRow}=$B$7))*(IF($B$8="Todos",1,Catalogo!$H$5:$H$${songLastRow}=$B$8))`;
  const rowIndexExpr = `ROW(Catalogo!$A$5:$A$${songLastRow})-ROW(Catalogo!$A$5)+1`;
  const queryRows = [];
  for (let i = 0; i < songRows.length; i += 1) {
    const nth = i + 1;
    queryRows.push([
      `=IFERROR(INDEX(Catalogo!$A$5:$A$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
      `=IFERROR(INDEX(Catalogo!$B$5:$B$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
      `=IFERROR(INDEX(Catalogo!$C$5:$C$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
      `=IFERROR(INDEX(Catalogo!$D$5:$D$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
      `=IFERROR(INDEX(Catalogo!$E$5:$E$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
      `=IFERROR(INDEX(Catalogo!$F$5:$F$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
      `=IFERROR(INDEX(Catalogo!$G$5:$G$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
      `=IFERROR(INDEX(Catalogo!$H$5:$H$${songLastRow},AGGREGATE(15,6,(${rowIndexExpr})/(${queryCriteria}),${nth})), "")`,
    ]);
  }
  consulta.getRange(`A11:H${10 + songRows.length}`).formulas = queryRows;
  consulta.getRange('A10:H10').format = {
    fill: '#0F172A',
    font: { name: 'Aptos', size: 10, bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
  };
  consulta.getRange(`A11:H${10 + songRows.length}`).format = {
    font: { name: 'Aptos', size: 10, color: '#111827' },
    verticalAlignment: 'top',
    wrapText: true,
  };
  consulta.freezePanes.freezeRows(10);
  consulta.getRange('A:A').format.columnWidthPx = 160;
  consulta.getRange('B:B').format.columnWidthPx = 230;
  consulta.getRange('C:C').format.columnWidthPx = 120;
  consulta.getRange('D:D').format.columnWidthPx = 90;
  consulta.getRange('E:E').format.columnWidthPx = 210;
  consulta.getRange('F:F').format.columnWidthPx = 180;
  consulta.getRange('G:G').format.columnWidthPx = 240;
  consulta.getRange('H:H').format.columnWidthPx = 110;
  consulta.getRange('A5:H8').format.rowHeightPx = 24;
  consulta.getRange('A10:H10').format.rowHeightPx = 28;
  consulta.getRange(`A11:H${10 + songRows.length}`).format.rowHeightPx = 24;

  await workbook.recalculate();

  const summaryInspect = await workbook.inspect({
    kind: 'table',
    range: 'Resumo!A1:H23',
    include: 'values,formulas',
    tableMaxRows: 25,
    tableMaxCols: 8,
  });
  console.log(summaryInspect.ndjson);

  const errors = await workbook.inspect({
    kind: 'match',
    searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
    options: { useRegex: true, maxResults: 200 },
    summary: 'formula error scan',
  });
  console.log(errors.ndjson);

  await writePreview(workbook, 'Resumo', 'A1:N24', path.join(previewDir, 'Resumo.png'));
  await writePreview(workbook, 'Catalogo', 'A1:H20', path.join(previewDir, 'Catalogo.png'));
  await writePreview(workbook, 'Blocos', 'A1:E20', path.join(previewDir, 'Blocos.png'));
  await writePreview(workbook, 'Consulta', 'A1:H22', path.join(previewDir, 'Consulta.png'));

  const exportFile = await SpreadsheetFile.exportXlsx(workbook);
  await exportFile.save(workbookPath);

  await fs.writeFile(
    path.join(outputDir, 'song_rows.json'),
    JSON.stringify({ songs: songRows, blocks }, null, 2),
  );
}

await main();
