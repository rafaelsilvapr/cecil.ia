import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { db } from "../db.js";
import { classify, normalizeReviewStatus } from "../shared.js";

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function parseAmount(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  // Be tolerant with comma decimals and dot thousands separators.
  let normalized = text.replace(/\s+/g, "");
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = normalized.replace(",", ".");
  }
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function parseDateBr(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((cell) => cell.trim());
}

function readCsvRows(filePath) {
  const raw = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length);
  if (!lines.length) return { header: [], rows: [] };
  const header = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    rows.push(parseCsvLine(lines[i]));
  }
  return { header, rows };
}

function inferRangeFromFilename(filename) {
  // Example: NU_..._01JAN2025_31JAN2025.csv or NU_..._01ABR2026_14ABR2026.csv
  const match = filename.match(/_(\d{2}[A-Z]{3}\d{4})_(\d{2}[A-Z]{3}\d{4})\./i);
  if (!match) return { start: "", end: "" };
  const [, startToken, endToken] = match;
  const toIso = (token) => {
    const m = token.match(/^(\d{2})([A-Z]{3})(\d{4})$/i);
    if (!m) return "";
    const [, dd, mon, yyyy] = m;
    const month = {
      JAN: "01",
      FEV: "02",
      MAR: "03",
      ABR: "04",
      MAI: "05",
      JUN: "06",
      JUL: "07",
      AGO: "08",
      SET: "09",
      OUT: "10",
      NOV: "11",
      DEZ: "12",
    }[mon.toUpperCase()];
    if (!month) return "";
    return `${yyyy}-${month}-${dd}`;
  };
  return { start: toIso(startToken), end: toIso(endToken) };
}

function ensureDocument({ title, kind, filename, sourceType, note, account, dateRangeStart, dateRangeEnd }) {
  const existing = db
    .prepare(
      `SELECT id FROM documents
       WHERE source = 'Gmail' AND source_origin = 'Nubank' AND source_type = ? AND filename = ?
       LIMIT 1`,
    )
    .get(sourceType, filename);
  if (existing?.id) return existing.id;

  const insert = db.prepare(
    `INSERT INTO documents (
       title, kind, source, source_type, source_origin,
       date_range_start, date_range_end, account, status, note, filename, created_at
     ) VALUES (?, ?, 'Gmail', ?, 'Nubank', ?, ?, ?, ?, ?, ?, ?)`,
  );
  const createdAt = nowDate();
  const status = normalizeReviewStatus("imported");
  const result = insert.run(
    title,
    kind,
    sourceType,
    dateRangeStart ?? "",
    dateRangeEnd ?? "",
    account ?? "Nubank",
    status,
    note ?? "",
    filename,
    createdAt,
  );
  return Number(result.lastInsertRowid);
}

function ensureSiblingDocuments({ title, kind, csvFilename, account, dateRangeStart, dateRangeEnd, noteBase }) {
  const base = csvFilename.replace(/\.csv$/i, "");
  const siblings = [
    { filename: `${base}.ofx`, sourceType: "gmail_ofx" },
    { filename: `${base}.pdf`, sourceType: "gmail_pdf" },
  ];
  for (const sibling of siblings) {
    ensureDocument({
      title,
      kind,
      filename: sibling.filename,
      sourceType: sibling.sourceType,
      note: `${noteBase} (anexo irmão do CSV)`,
      account,
      dateRangeStart,
      dateRangeEnd,
    });
  }
}

function extractCounterparty(descriptionRaw) {
  const text = String(descriptionRaw || "");
  const parts = text.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return "";
  if (/^transfer[eê]ncia/i.test(parts[0])) {
    return parts[1] || "";
  }
  if (/compra no d[ée]bito/i.test(parts[0])) {
    return parts[1] || "";
  }
  return "";
}

function canonicalDescription(descriptionRaw) {
  const text = String(descriptionRaw || "").trim();
  const parts = text.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return "";
  const head = parts[0];
  if (/^transfer[eê]ncia/i.test(head) && parts[1]) {
    return `${head} - ${parts[1]}`;
  }
  if (/compra no d[ée]bito/i.test(head) && parts[1]) {
    return `${head} - ${parts[1]}`;
  }
  return head;
}

function isSelfTransfer(descriptionRaw) {
  const text = String(descriptionRaw || "").toLowerCase();
  // Heuristic: own name appears in Pix/transfer description.
  return text.includes("rafael rodrigues da silva");
}

function applyRunbookOverrides({ descriptionRaw, direction }) {
  const text = String(descriptionRaw || "");

  if (/pagamento de fatura/i.test(text)) {
    return {
      category: "Cartão de crédito",
      subcategory: "Pagamento de fatura",
      confidence: "alta",
      isInternalTransfer: true,
      isCardPayment: true,
      isInvestmentMovement: false,
      isLoanMovement: false,
      reviewStatus: "needs_review",
      notes:
        "Pagamento de fatura: não contar como despesa nova; precisa reconciliar com compras do cartão para evitar dupla contagem.",
    };
  }

  if (/aplica[cç][aã]o rdb/i.test(text)) {
    return {
      category: "Investimento",
      subcategory: "Aplicação",
      confidence: "alta",
      isInternalTransfer: true,
      isCardPayment: false,
      isInvestmentMovement: true,
      isLoanMovement: false,
      reviewStatus: "imported",
      notes: "Movimento de investimento (Aplicação RDB).",
    };
  }

  if (/resgate rdb/i.test(text)) {
    return {
      category: "Investimento",
      subcategory: "Resgate",
      confidence: "alta",
      isInternalTransfer: true,
      isCardPayment: false,
      isInvestmentMovement: true,
      isLoanMovement: false,
      reviewStatus: "imported",
      notes: "Movimento de investimento (Resgate RDB).",
    };
  }

  if (/resgate de empr[eé]stimo/i.test(text)) {
    return {
      category: "Empréstimo",
      subcategory: "Entrada",
      confidence: "alta",
      isInternalTransfer: false,
      isCardPayment: false,
      isInvestmentMovement: false,
      isLoanMovement: true,
      reviewStatus: "needs_review",
      notes: "Movimento de empréstimo detectado; validar origem e contrato.",
    };
  }

  if (isSelfTransfer(text)) {
    return {
      category: "Transferência interna",
      subcategory: direction === "income" ? "Entrada" : "Saída",
      confidence: "alta",
      isInternalTransfer: true,
      isCardPayment: false,
      isInvestmentMovement: false,
      isLoanMovement: false,
      reviewStatus: "imported",
      notes: "Transferência com o próprio nome: tratar como transferência interna (não é receita nova).",
    };
  }

  if (/valor adicionado na conta por cart[aã]o de cr[eé]dito/i.test(text)) {
    return {
      category: "A confirmar",
      subcategory: "Sem classificação",
      confidence: "baixa",
      isInternalTransfer: true,
      isCardPayment: true,
      isInvestmentMovement: false,
      isLoanMovement: false,
      reviewStatus: "needs_review",
      notes: "Entrada via cartão (Pix no crédito): não é receita; revisar para evitar dupla contagem com a saída Pix correspondente.",
    };
  }

  if (/estorno/i.test(text) && direction === "income") {
    return {
      category: "A confirmar",
      subcategory: "Sem classificação",
      confidence: "baixa",
      isInternalTransfer: false,
      isCardPayment: false,
      isInvestmentMovement: false,
      isLoanMovement: false,
      reviewStatus: "needs_review",
      notes: "Estorno detectado: normalmente reduz despesa anterior; revisar tratamento contábil.",
    };
  }

  return null;
}

function getRuleHintsFromDb() {
  return db
    .prepare("SELECT pattern, category, subcategory, confidence FROM rule_hints ORDER BY id ASC")
    .all()
    .map((row) => ({
      pattern: row.pattern,
      category: row.category,
      subcategory: row.subcategory,
      confidence: row.confidence,
    }));
}

function loadExistingEntryKeys(sourceId) {
  const rows = db.prepare("SELECT external_id FROM entries WHERE source_id = ?").all(sourceId);
  return new Set(rows.map((r) => String(r.external_id || "")));
}

function findPossibleDuplicate({ date, direction, amount, description }) {
  const row = db
    .prepare(
      `SELECT id FROM entries
       WHERE date = ? AND direction = ? AND amount = ? AND description = ?
       LIMIT 1`,
    )
    .get(date, direction, amount, description);
  return row?.id ? Number(row.id) : null;
}

function ingestCsvFile(filePath, { sourceType = "gmail_csv", account = "Nubank", note = "" } = {}) {
  const filename = basename(filePath);
  const { start, end } = inferRangeFromFilename(filename);
  const title = `Extrato Nubank ${start && end ? `${start} a ${end}` : filename}`;
  const noteBase = note || `Arquivo local: ${filePath}`;
  const sourceId = ensureDocument({
    title,
    kind: "Extrato",
    filename,
    sourceType,
    note: noteBase,
    account,
    dateRangeStart: start,
    dateRangeEnd: end,
  });

  ensureSiblingDocuments({
    title,
    kind: "Extrato",
    csvFilename: filename,
    account,
    dateRangeStart: start,
    dateRangeEnd: end,
    noteBase,
  });

  const ruleHints = getRuleHintsFromDb();
  const existingKeys = loadExistingEntryKeys(sourceId);
  const { header, rows } = readCsvRows(filePath);

  const idxData = header.findIndex((h) => h.toLowerCase() === "data");
  const idxValor = header.findIndex((h) => h.toLowerCase() === "valor");
  const idxId = header.findIndex((h) => h.toLowerCase() === "identificador");
  const idxDesc = header.findIndex((h) => h.toLowerCase().startsWith("descr"));

  if (idxData === -1 || idxValor === -1 || idxId === -1 || idxDesc === -1) {
    throw new Error(`CSV inesperado: header=${JSON.stringify(header)}`);
  }

  const insert = db.prepare(
    `INSERT INTO entries (
       source_id, external_id, date, description, description_raw, direction, amount,
       merchant_or_counterparty, payment_method, category, subcategory, confidence,
       notes, recurring, review_status,
       is_internal_transfer, is_card_payment, is_investment_movement, is_loan_movement,
       possible_duplicate
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  let imported = 0;
  let needsReview = 0;

  const identSeen = new Map();
  for (const row of rows) {
    const date = parseDateBr(row[idxData]);
    const rawAmount = parseAmount(row[idxValor]);
    const ident = String(row[idxId] ?? "").trim();
    const descriptionRaw = String(row[idxDesc] ?? "").trim();

    if (!date || rawAmount === null || !ident || !descriptionRaw) {
      continue;
    }

    const direction = rawAmount >= 0 ? "income" : "expense";
    const amount = Math.abs(rawAmount);
    const occurrence = (identSeen.get(ident) ?? 0) + 1;
    identSeen.set(ident, occurrence);
    const externalId = `nubank:${filename}:${ident}:${occurrence}`;
    if (existingKeys.has(externalId)) {
      continue;
    }

    const counterparty = extractCounterparty(descriptionRaw);
    const description = canonicalDescription(descriptionRaw) || descriptionRaw;
    const paymentMethod = /pix/i.test(descriptionRaw)
      ? "PIX"
      : /cart[aã]o de cr[eé]dito/i.test(descriptionRaw)
        ? "Cartão de crédito"
        : /d[ée]bito/i.test(descriptionRaw)
          ? "Débito"
          : "Transferência";

    const override = applyRunbookOverrides({ descriptionRaw, direction });
    const suggested = classify(descriptionRaw, direction, ruleHints);

    const category = override?.category ?? suggested.category;
    const subcategory = override?.subcategory ?? suggested.subcategory;
    const confidence = override?.confidence ?? suggested.confidence ?? "baixa";

    const possibleDuplicateId = findPossibleDuplicate({ date, direction, amount, description });
    const possibleDuplicate = possibleDuplicateId ? 1 : 0;

    const reviewStatusRaw =
      override?.reviewStatus ??
      (confidence === "alta" && category !== "A confirmar" ? "imported" : "needs_review");
    const reviewStatus = normalizeReviewStatus(reviewStatusRaw);

    const combinedNotes = [
      override?.notes ?? "",
      possibleDuplicateId ? `Possível duplicidade com entry id=${possibleDuplicateId}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const isInternalTransfer = Boolean(override?.isInternalTransfer);
    const isCardPayment = Boolean(override?.isCardPayment);
    const isInvestmentMovement = Boolean(override?.isInvestmentMovement);
    const isLoanMovement = Boolean(override?.isLoanMovement);

    insert.run(
      sourceId,
      externalId,
      date,
      description,
      descriptionRaw,
      direction,
      amount,
      counterparty,
      paymentMethod,
      category || "A confirmar",
      subcategory || "Sem classificação",
      confidence,
      combinedNotes,
      0,
      reviewStatus,
      isInternalTransfer ? 1 : 0,
      isCardPayment ? 1 : 0,
      isInvestmentMovement ? 1 : 0,
      isLoanMovement ? 1 : 0,
      possibleDuplicate,
    );

    existingKeys.add(externalId);
    imported += 1;
    if (reviewStatus === "needs_review") needsReview += 1;
  }

  return { sourceId, filename, imported, needsReview };
}

function listCsvFiles(dir, year) {
  return readdirSync(dir)
    .map((name) => resolve(dir, name))
    .filter((path) => path.toLowerCase().endsWith(".csv") && path.includes(String(year)))
    .filter((path) => statSync(path).isFile())
    .sort();
}

async function main() {
  const dirArg = process.argv.find((arg) => arg.startsWith("--dir="))?.slice("--dir=".length);
  const yearArg = process.argv.find((arg) => arg.startsWith("--year="))?.slice("--year=".length);
  const dir = resolve(process.cwd(), dirArg || "data/raw_nubank");
  const year = Number(yearArg || 2025);

  const csvFiles = listCsvFiles(dir, year);
  if (!csvFiles.length) {
    console.log(`No CSV files found for year=${year} in ${dir}`);
    process.exit(0);
  }

  // Register known newer sources already accessed (without importing them yet).
  const extraCsvFilenames = [
    "NU_256895573_01JAN2026_31JAN2026.csv",
    "NU_256895573_01FEV2026_28FEV2026.csv",
    "NU_256895573_01MAR2026_31MAR2026.csv",
    "NU_256895573_01ABR2026_14ABR2026.csv",
  ];
  for (const extra of extraCsvFilenames) {
    const { start, end } = inferRangeFromFilename(extra);
    const title = `Extrato Nubank ${start && end ? `${start} a ${end}` : extra}`;
    const noteBase = "Fonte acessada via Gmail; registro antecipado (ainda não importado).";
    ensureDocument({
      title,
      kind: "Extrato",
      filename: extra,
      sourceType: "gmail_csv",
      note: noteBase,
      account: "Nubank",
      dateRangeStart: start,
      dateRangeEnd: end,
    });
    ensureSiblingDocuments({
      title,
      kind: "Extrato",
      csvFilename: extra,
      account: "Nubank",
      dateRangeStart: start,
      dateRangeEnd: end,
      noteBase,
    });
  }

  const results = [];
  db.exec("BEGIN");
  try {
    for (const filePath of csvFiles) {
      results.push(ingestCsvFile(filePath, { sourceType: "gmail_csv", account: "Nubank" }));
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const totals = results.reduce(
    (acc, r) => {
      acc.files += 1;
      acc.imported += r.imported;
      acc.needsReview += r.needsReview;
      return acc;
    },
    { files: 0, imported: 0, needsReview: 0 },
  );

  console.log(JSON.stringify({ year, dir, ...totals }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
