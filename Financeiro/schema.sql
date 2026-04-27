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
  possible_duplicate INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (source_id) REFERENCES documents(id)
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

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_account ON documents(account);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_review_status ON entries(review_status);
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_entries_source_id ON entries(source_id);
