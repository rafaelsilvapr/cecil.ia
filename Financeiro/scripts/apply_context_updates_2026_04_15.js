import { db } from "../db.js";
import { normalizeReviewStatus } from "../shared.js";

const TODAY = "2026-04-15";

function setRiskBody(title, body) {
  const existing = db.prepare("SELECT id FROM risks WHERE title = ? LIMIT 1").get(title);
  if (existing?.id) {
    db.prepare("UPDATE risks SET body = ? WHERE id = ?").run(body, existing.id);
    return Number(existing.id);
  }
  const result = db.prepare("INSERT INTO risks (title, body) VALUES (?, ?)").run(title, body);
  return Number(result.lastInsertRowid);
}

function ensureDocument({ title, kind, note }) {
  const existing = db
    .prepare("SELECT id FROM documents WHERE title = ? AND kind = ? AND source = 'Manual' LIMIT 1")
    .get(title, kind);
  if (existing?.id) return Number(existing.id);

  const result = db
    .prepare(
      `INSERT INTO documents (
         title, kind, source, source_type, source_origin,
         date_range_start, date_range_end, account, status, note, filename, created_at
       ) VALUES (?, ?, 'Manual', 'manual_context', 'user_context', '', '', '', ?, ?, 'sem arquivo', ?)`,
    )
    .run(title, kind, "Revisado", note, TODAY);
  return Number(result.lastInsertRowid);
}

function setDocumentNote(title, kind, note) {
  const id = ensureDocument({ title, kind, note });
  db.prepare("UPDATE documents SET note = ? WHERE id = ?").run(note, id);
  return id;
}

function ensureRuleHint({ pattern, category, subcategory, confidence }) {
  const existing = db.prepare("SELECT id FROM rule_hints WHERE pattern = ? LIMIT 1").get(pattern);
  if (existing?.id) return Number(existing.id);
  const result = db
    .prepare("INSERT INTO rule_hints (pattern, category, subcategory, confidence) VALUES (?, ?, ?, ?)")
    .run(pattern, category, subcategory, confidence);
  return Number(result.lastInsertRowid);
}

function appendNotes(existing, extra) {
  const left = String(existing || "").trim();
  const right = String(extra || "").trim();
  if (!right) return left;
  if (!left) return right;
  if (left.includes(right)) return left;
  return `${left} ${right}`;
}

function updateEntriesWhere(whereSql, params, patch) {
  const rows = db.prepare(`SELECT id, notes FROM entries WHERE ${whereSql}`).all(...params);
  if (!rows.length) return 0;
  const stmt = db.prepare(
    `UPDATE entries
     SET category = ?,
         subcategory = ?,
         confidence = ?,
         review_status = ?,
         notes = ?,
         is_internal_transfer = ?,
         is_card_payment = ?,
         is_investment_movement = ?,
         is_loan_movement = ?
     WHERE id = ?`,
  );
  let changes = 0;
  for (const row of rows) {
    const nextNotes = appendNotes(row.notes, patch.notesAppend);
    const reviewStatus = patch.reviewStatus ?? "needs_review";
    const normalized = normalizeReviewStatus(reviewStatus);
    const res = stmt.run(
      patch.category,
      patch.subcategory,
      patch.confidence ?? "baixa",
      normalized,
      nextNotes,
      patch.isInternalTransfer ? 1 : 0,
      patch.isCardPayment ? 1 : 0,
      patch.isInvestmentMovement ? 1 : 0,
      patch.isLoanMovement ? 1 : 0,
      row.id,
    );
    changes += res.changes ?? 0;
  }
  return changes;
}

function main() {
  const summary = {
    rulesUpdated: 0,
    rulesInserted: 0,
    risksInserted: 0,
    documentsInserted: 0,
    entriesUpdated: 0,
  };

  db.exec("BEGIN");
  try {
    // Fix overly broad "one" hint (matched "STONE", "japones", etc.).
    const updatedRule = db
      .prepare("UPDATE rule_hints SET pattern = ? WHERE pattern = ?")
      .run("google\\s*one|hostgator|perplexity", "google|one|hostgator|perplexity");
    summary.rulesUpdated += updatedRule.changes ?? 0;

    // Add focused hints (also covered by explicit checks in shared.js).
    const inserted = [];
    inserted.push(
      ensureRuleHint({
        pattern: "embarca(\\.ai)?|quero\\s+passagem|viagens\\s+e\\s+turismo",
        category: "Transporte",
        subcategory: "Viagens",
        confidence: "alta",
      }),
    );
    inserted.push(
      ensureRuleHint({
        pattern: "aluguel\\s+cec[ií]lia",
        category: "Família",
        subcategory: "Pensão",
        confidence: "alta",
      }),
    );
    inserted.push(
      ensureRuleHint({
        // Confirmado pelo usuário: todas as transferências para Aline são pensão.
        // Regex tolerante para variações simples de grafia.
        pattern: "aline\\s+cl[ií]ss?iane\\s+ferreira\\s+da\\s+silva",
        category: "Família",
        subcategory: "Pensão",
        confidence: "alta",
      }),
    );
    inserted.push(
      ensureRuleHint({
        pattern: "\\buber\\b",
        category: "Transporte",
        subcategory: "Corridas (Uber)",
        confidence: "média",
      }),
    );
    inserted.push(
      ensureRuleHint({
        pattern: "\\bcad[eê]\\b",
        category: "Transporte",
        subcategory: "Corridas (Cadê)",
        confidence: "média",
      }),
    );
    inserted.push(
      ensureRuleHint({
        pattern: "\\b99\\s*(app|pop|taxi)\\b",
        category: "Transporte",
        subcategory: "Corridas (99)",
        confidence: "média",
      }),
    );
    summary.rulesInserted += inserted.filter(Boolean).length;

    // Register context.
    const riskId = setRiskBody(
      "Contexto: família no Paraná e viagens",
      "Família mora no Paraná (filha em Maringá; pais em Curitiba). Gastos como EMBARCA.AI e QUERO PASSAGEM indicam transporte de viagem (intermunicipal/interestadual) e devem ser analisados como 'Transporte / Viagens' quando a evidência for forte.\n\nPensão: todas as transferências via Pix para Aline Clissiane Ferreira da Silva devem ser tratadas como 'Família / Pensão' (em alguns meses inclui o aluguel da Cecília como parte do acordo).\n\nObservação: corridas de Uber existem em Curitiba; quando pagas via Pix não vêm rotuladas como Uber/Cadê no extrato, então precisam de reconciliação/contexto para classificar com segurança.",
    );
    summary.risksInserted += riskId ? 1 : 0;

    const canonicalContextNote =
      "Família mora no Paraná (filha em Maringá; pais em Curitiba). Embarca.ai e Quero Passagem são viagens. Transferências via Pix para Aline Clissiane Ferreira da Silva são pensão (em alguns meses inclui o aluguel da Cecília como parte do acordo de fiador para evitar atraso). Corridas de Uber existem em Curitiba; quando pagas via Pix não vêm rotuladas como Uber/Cadê no extrato (em Bagé não há Uber).";
    const docId = setDocumentNote("Contexto de gastos: viagens e acordo de pensão", "Contexto", canonicalContextNote);
    summary.documentsInserted += docId ? 1 : 0;

    // Apply confirmed travel providers.
    summary.entriesUpdated += updateEntriesWhere(
      "date LIKE '2025-%' AND upper(description_raw) LIKE '%EMBARCA%'",
      [],
      {
        category: "Transporte",
        subcategory: "Viagens",
        confidence: "alta",
        reviewStatus: "reviewed",
        notesAppend: "Confirmado pelo usuário em 2026-04-15: EMBARCA.AI é gasto de viagem (Transporte/Viagens).",
        isInternalTransfer: false,
        isCardPayment: false,
        isInvestmentMovement: false,
        isLoanMovement: false,
      },
    );
    summary.entriesUpdated += updateEntriesWhere(
      "date LIKE '2025-%' AND upper(description_raw) LIKE '%QUERO PASSAGEM%'",
      [],
      {
        category: "Transporte",
        subcategory: "Viagens",
        confidence: "alta",
        reviewStatus: "reviewed",
        notesAppend:
          "Confirmado pelo usuário em 2026-04-15: QUERO PASSAGEM (viagens e turismo) é transporte de viagem (Transporte/Viagens).",
        isInternalTransfer: false,
        isCardPayment: false,
        isInvestmentMovement: false,
        isLoanMovement: false,
      },
    );

    // Apply confirmed pension counterparty (Aline).
    summary.entriesUpdated += updateEntriesWhere(
      "date LIKE '2025-%' AND upper(description_raw) LIKE '%ALINE%FERREIRA%SILVA%'",
      [],
      {
        category: "Família",
        subcategory: "Pensão",
        confidence: "alta",
        reviewStatus: "reviewed",
        notesAppend:
          "Confirmado pelo usuário em 2026-04-15: transferências para Aline Clissiane Ferreira da Silva são pensão (em alguns meses inclui aluguel da Cecília como parte do acordo).",
        isInternalTransfer: false,
        isCardPayment: false,
        isInvestmentMovement: false,
        isLoanMovement: false,
      },
    );

    // Correct legacy misclassifications caused by broad rule hint matching substrings (ex.: 'STONE', 'japones').
    const misclassified = db
      .prepare(
        `SELECT id, description_raw
         FROM entries
         WHERE date LIKE '2025-%'
           AND category = 'Assinaturas'
           AND subcategory = 'Software'
           AND description_raw NOT LIKE '%Google%'
           AND description_raw NOT LIKE '%Hostgator%'
           AND description_raw NOT LIKE '%Perplexity%'`,
      )
      .all();
    if (misclassified.length) {
      const update = db.prepare(
        `UPDATE entries
         SET category = ?,
             subcategory = ?,
             confidence = ?,
             review_status = ?,
             notes = ?
         WHERE id = ?`,
      );
      for (const row of misclassified) {
        const raw = String(row.description_raw || "");
        const isDebit = /^compra no d[ée]bito/i.test(raw);
        const nextCategory = isDebit ? "A confirmar" : "Transferência";
        const nextSub = isDebit ? "Sem classificação" : "PIX";
        const nextConf = isDebit ? "baixa" : "média";
        const nextReview = normalizeReviewStatus("needs_review");
        const nextNotes = appendNotes(
          db.prepare("SELECT notes FROM entries WHERE id = ?").get(row.id)?.notes,
          "Reclassificado em 2026-04-15: regra antiga ('one') gerava falso-positivo (ex.: STONE, JAPONES).",
        );
        const res = update.run(nextCategory, nextSub, nextConf, nextReview, nextNotes, row.id);
        summary.entriesUpdated += res.changes ?? 0;
      }
    }

    // Consolidate 'Aluguel Cecília' into 'Família / Pensão' with an audit note.
    const adendo =
      "Acordo ligado à pensão: aluguel da filha (Cecília) pago por um período para evitar atraso; usuário era fiador. Registro feito em 2026-04-15.";
    const pensao = db.prepare("SELECT id, notes FROM entries WHERE description = 'Pensão' LIMIT 1").get();
    if (pensao?.id) {
      const updated = db
        .prepare("UPDATE entries SET notes = ? WHERE id = ?")
        .run(appendNotes(pensao.notes, adendo), pensao.id);
      summary.entriesUpdated += updated.changes ?? 0;
    }
    const aluguelCecilia = db.prepare("SELECT id, notes FROM entries WHERE description = 'Aluguel Cecília' LIMIT 1").get();
    if (aluguelCecilia?.id) {
      const updated = db
        .prepare(
          "UPDATE entries SET category = 'Família', subcategory = 'Pensão', confidence = 'alta', notes = ? WHERE id = ?",
        )
        .run(appendNotes(aluguelCecilia.notes, adendo), aluguelCecilia.id);
      summary.entriesUpdated += updated.changes ?? 0;
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
