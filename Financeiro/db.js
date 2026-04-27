import { mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { cloneSeedState } from "./shared.js";

const dataDir = resolve(process.cwd(), "data");
const dbPath = resolve(dataDir, "financeiro.sqlite");

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    kind TEXT NOT NULL,
    source TEXT NOT NULL,
    source_type TEXT DEFAULT '',
    source_origin TEXT DEFAULT '',
    date_range_start TEXT DEFAULT '',
    date_range_end TEXT DEFAULT '',
    account TEXT DEFAULT '',
    status TEXT NOT NULL,
    note TEXT DEFAULT '',
    filename TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    external_id TEXT DEFAULT '',
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    description_raw TEXT DEFAULT '',
    direction TEXT NOT NULL,
    amount REAL NOT NULL,
    merchant_or_counterparty TEXT DEFAULT '',
    payment_method TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    confidence TEXT NOT NULL DEFAULT 'baixa',
    notes TEXT DEFAULT '',
    recurring INTEGER NOT NULL DEFAULT 0,
    review_status TEXT NOT NULL,
    is_internal_transfer INTEGER NOT NULL DEFAULT 0,
    is_card_payment INTEGER NOT NULL DEFAULT 0,
    is_investment_movement INTEGER NOT NULL DEFAULT 0,
    is_loan_movement INTEGER NOT NULL DEFAULT 0,
    possible_duplicate INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    expense REAL NOT NULL,
    income REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roadmap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sort_order INTEGER NOT NULL,
    title TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rule_hints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    confidence TEXT NOT NULL
  );
`);

function hasColumn(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((row) => row.name === column);
}

function ensureColumn(table, definition) {
  const column = definition.split(" ")[0];
  if (!hasColumn(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
}

function ensureIndex(name, sql) {
  db.exec(`CREATE INDEX IF NOT EXISTS ${name} ${sql}`);
}

ensureColumn("documents", "source_type TEXT DEFAULT ''");
ensureColumn("documents", "source_origin TEXT DEFAULT ''");
ensureColumn("documents", "date_range_start TEXT DEFAULT ''");
ensureColumn("documents", "date_range_end TEXT DEFAULT ''");
ensureColumn("documents", "account TEXT DEFAULT ''");

ensureColumn("entries", "source_id INTEGER");
ensureColumn("entries", "external_id TEXT DEFAULT ''");
ensureColumn("entries", "description_raw TEXT DEFAULT ''");
ensureColumn("entries", "merchant_or_counterparty TEXT DEFAULT ''");
ensureColumn("entries", "confidence TEXT NOT NULL DEFAULT 'baixa'");
ensureColumn("entries", "notes TEXT DEFAULT ''");
ensureColumn("entries", "is_internal_transfer INTEGER NOT NULL DEFAULT 0");
ensureColumn("entries", "is_card_payment INTEGER NOT NULL DEFAULT 0");
ensureColumn("entries", "is_investment_movement INTEGER NOT NULL DEFAULT 0");
ensureColumn("entries", "is_loan_movement INTEGER NOT NULL DEFAULT 0");
ensureColumn("entries", "possible_duplicate INTEGER NOT NULL DEFAULT 0");

ensureIndex("idx_documents_status", "ON documents(status)");
ensureIndex("idx_documents_account", "ON documents(account)");
ensureIndex("idx_entries_date", "ON entries(date)");
ensureIndex("idx_entries_review_status", "ON entries(review_status)");
ensureIndex("idx_entries_category", "ON entries(category, subcategory)");
ensureIndex("idx_entries_source_id", "ON entries(source_id)");

function count(table) {
  return db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
}

function withTransaction(callback) {
  db.exec("BEGIN");
  try {
    callback();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function seedTable(table, rows, insertSql, mapRow) {
  if (!rows.length || count(table) > 0) {
    return;
  }
  const insert = db.prepare(insertSql);
  withTransaction(() => {
    for (const row of rows) {
      insert.run(...mapRow(row));
    }
  });
}

const seed = cloneSeedState();

seedTable(
  "documents",
  seed.documents,
  `INSERT INTO documents (id, title, kind, source, source_type, source_origin, date_range_start, date_range_end, account, status, note, filename, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  (row) => [
    row.id,
    row.title,
    row.kind,
    row.source,
    row.sourceType ?? "",
    row.sourceOrigin ?? row.source ?? "",
    row.dateRangeStart ?? "",
    row.dateRangeEnd ?? "",
    row.account ?? "",
    row.status,
    row.note ?? "",
    row.filename ?? "",
    row.createdAt,
  ],
);

seedTable(
  "entries",
  seed.entries,
  `INSERT INTO entries (
     id,
     source_id,
     external_id,
     date,
     description,
     description_raw,
     direction,
     amount,
     merchant_or_counterparty,
     payment_method,
     category,
     subcategory,
     confidence,
     notes,
     recurring,
     review_status,
     is_internal_transfer,
     is_card_payment,
     is_investment_movement,
     is_loan_movement,
     possible_duplicate
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  (row) => [
    row.id,
    row.sourceId ?? null,
    row.externalId ?? "",
    row.date,
    row.description,
    row.descriptionRaw ?? row.description,
    row.direction,
    row.amount,
    row.merchantOrCounterparty ?? "",
    row.paymentMethod,
    row.category,
    row.subcategory,
    row.confidence ?? "alta",
    row.notes ?? "",
    row.recurring ? 1 : 0,
    row.reviewStatus,
    row.isInternalTransfer ? 1 : 0,
    row.isCardPayment ? 1 : 0,
    row.isInvestmentMovement ? 1 : 0,
    row.isLoanMovement ? 1 : 0,
    row.possibleDuplicate ? 1 : 0,
  ],
);

seedTable(
  "snapshots",
  seed.snapshots,
  `INSERT INTO snapshots (id, label, expense, income) VALUES (?, ?, ?, ?)`,
  (row) => [row.id ?? null, row.label, row.expense, row.income],
);

seedTable(
  "risks",
  seed.risks,
  `INSERT INTO risks (id, title, body) VALUES (?, ?, ?)`,
  (row) => [row.id ?? null, row.title, row.body],
);

seedTable(
  "roadmap",
  seed.roadmap.map((title, index) => ({ sortOrder: index + 1, title })),
  `INSERT INTO roadmap (sort_order, title) VALUES (?, ?)`,
  (row) => [row.sortOrder, row.title],
);

seedTable(
  "rule_hints",
  seed.ruleHints,
  `INSERT INTO rule_hints (pattern, category, subcategory, confidence) VALUES (?, ?, ?, ?)`,
  (row) => [row.pattern, row.category, row.subcategory, row.confidence],
);

function rowsToDocuments(rows) {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    kind: row.kind,
    source: row.source,
    sourceType: row.source_type,
    sourceOrigin: row.source_origin,
    dateRangeStart: row.date_range_start,
    dateRangeEnd: row.date_range_end,
    account: row.account,
    status: row.status,
    note: row.note,
    filename: row.filename,
    createdAt: row.created_at,
  }));
}

function rowsToEntries(rows) {
  return rows.map((row) => ({
    id: row.id,
    sourceId: row.source_id,
    externalId: row.external_id,
    date: row.date,
    description: row.description,
    descriptionRaw: row.description_raw,
    direction: row.direction,
    amount: row.amount,
    merchantOrCounterparty: row.merchant_or_counterparty,
    paymentMethod: row.payment_method,
    category: row.category,
    subcategory: row.subcategory,
    confidence: row.confidence,
    notes: row.notes,
    recurring: Boolean(row.recurring),
    reviewStatus: row.review_status,
    isInternalTransfer: Boolean(row.is_internal_transfer),
    isCardPayment: Boolean(row.is_card_payment),
    isInvestmentMovement: Boolean(row.is_investment_movement),
    isLoanMovement: Boolean(row.is_loan_movement),
    possibleDuplicate: Boolean(row.possible_duplicate),
  }));
}

export function getState() {
  return {
    documents: rowsToDocuments(db.prepare("SELECT * FROM documents ORDER BY id DESC").all()),
    entries: rowsToEntries(db.prepare("SELECT * FROM entries ORDER BY id DESC").all()),
    snapshots: db.prepare("SELECT * FROM snapshots ORDER BY id ASC").all().map((row) => ({
      id: row.id,
      label: row.label,
      expense: row.expense,
      income: row.income,
    })),
    risks: db.prepare("SELECT * FROM risks ORDER BY id ASC").all().map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
    })),
    roadmap: db.prepare("SELECT * FROM roadmap ORDER BY sort_order ASC").all().map((row) => row.title),
    ruleHints: db.prepare("SELECT * FROM rule_hints ORDER BY id ASC").all().map((row) => ({
      id: row.id,
      pattern: row.pattern,
      category: row.category,
      subcategory: row.subcategory,
      confidence: row.confidence,
    })),
  };
}

export function replaceState(nextState) {
  withTransaction(() => {
    db.exec(`
      DELETE FROM documents;
      DELETE FROM entries;
      DELETE FROM snapshots;
      DELETE FROM risks;
      DELETE FROM roadmap;
      DELETE FROM rule_hints;
    `);

    const insertDocument = db.prepare(
      `INSERT INTO documents (
         id,
         title,
         kind,
         source,
         source_type,
         source_origin,
         date_range_start,
         date_range_end,
         account,
         status,
         note,
         filename,
         created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertEntry = db.prepare(
      `INSERT INTO entries (
         id,
         source_id,
         external_id,
         date,
         description,
         description_raw,
         direction,
         amount,
         merchant_or_counterparty,
         payment_method,
         category,
         subcategory,
         confidence,
         notes,
         recurring,
         review_status,
         is_internal_transfer,
         is_card_payment,
         is_investment_movement,
         is_loan_movement,
         possible_duplicate
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertSnapshot = db.prepare(`INSERT INTO snapshots (id, label, expense, income) VALUES (?, ?, ?, ?)`);
    const insertRisk = db.prepare(`INSERT INTO risks (id, title, body) VALUES (?, ?, ?)`);
    const insertRoadmap = db.prepare(`INSERT INTO roadmap (sort_order, title) VALUES (?, ?)`);
    const insertRule = db.prepare(`INSERT INTO rule_hints (id, pattern, category, subcategory, confidence) VALUES (?, ?, ?, ?, ?)`);

    for (const row of nextState.documents || []) {
      insertDocument.run(
        row.id ?? null,
        row.title,
        row.kind,
        row.source,
        row.sourceType ?? "",
        row.sourceOrigin ?? row.source ?? "",
        row.dateRangeStart ?? "",
        row.dateRangeEnd ?? "",
        row.account ?? "",
        row.status,
        row.note ?? "",
        row.filename ?? "",
        row.createdAt,
      );
    }

    for (const row of nextState.entries || []) {
      insertEntry.run(
        row.id ?? null,
        row.sourceId ?? null,
        row.externalId ?? "",
        row.date,
        row.description,
        row.descriptionRaw ?? row.description,
        row.direction,
        row.amount,
        row.merchantOrCounterparty ?? "",
        row.paymentMethod,
        row.category,
        row.subcategory,
        row.confidence ?? "baixa",
        row.notes ?? "",
        row.recurring ? 1 : 0,
        row.reviewStatus,
        row.isInternalTransfer ? 1 : 0,
        row.isCardPayment ? 1 : 0,
        row.isInvestmentMovement ? 1 : 0,
        row.isLoanMovement ? 1 : 0,
        row.possibleDuplicate ? 1 : 0,
      );
    }

    for (const row of nextState.snapshots || []) {
      insertSnapshot.run(row.id ?? null, row.label, row.expense, row.income);
    }

    for (const row of nextState.risks || []) {
      insertRisk.run(row.id ?? null, row.title, row.body);
    }

    for (const [index, row] of (nextState.roadmap || []).entries()) {
      insertRoadmap.run(index + 1, row);
    }

    for (const row of nextState.ruleHints || []) {
      const pattern = typeof row.pattern === "string" ? row.pattern : row.pattern?.source ?? "";
      insertRule.run(row.id ?? null, pattern, row.category, row.subcategory, row.confidence);
    }
  });

  return getState();
}

export function addDocument(document) {
  const stmt = db.prepare(
    `INSERT INTO documents (
       title,
       kind,
       source,
       source_type,
       source_origin,
       date_range_start,
       date_range_end,
       account,
       status,
       note,
       filename,
       created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const result = stmt.run(
    document.title,
    document.kind,
    document.source,
    document.sourceType ?? "",
    document.sourceOrigin ?? document.source ?? "",
    document.dateRangeStart ?? "",
    document.dateRangeEnd ?? "",
    document.account ?? "",
    document.status,
    document.note ?? "",
    document.filename ?? "",
    document.createdAt,
  );
  return db.prepare("SELECT * FROM documents WHERE id = ?").get(result.lastInsertRowid);
}

export function addEntry(entry) {
  const stmt = db.prepare(
    `INSERT INTO entries (
       source_id,
       external_id,
       date,
       description,
       description_raw,
       direction,
       amount,
       merchant_or_counterparty,
       payment_method,
       category,
       subcategory,
       confidence,
       notes,
       recurring,
       review_status,
       is_internal_transfer,
       is_card_payment,
       is_investment_movement,
       is_loan_movement,
       possible_duplicate
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const result = stmt.run(
    entry.sourceId ?? null,
    entry.externalId ?? "",
    entry.date,
    entry.description,
    entry.descriptionRaw ?? entry.description,
    entry.direction,
    entry.amount,
    entry.merchantOrCounterparty ?? "",
    entry.paymentMethod,
    entry.category,
    entry.subcategory,
    entry.confidence ?? "baixa",
    entry.notes ?? "",
    entry.recurring ? 1 : 0,
    entry.reviewStatus,
    entry.isInternalTransfer ? 1 : 0,
    entry.isCardPayment ? 1 : 0,
    entry.isInvestmentMovement ? 1 : 0,
    entry.isLoanMovement ? 1 : 0,
    entry.possibleDuplicate ? 1 : 0,
  );
  return db.prepare("SELECT * FROM entries WHERE id = ?").get(result.lastInsertRowid);
}
