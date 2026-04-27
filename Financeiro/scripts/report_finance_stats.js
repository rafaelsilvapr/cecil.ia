import { db } from "../db.js";

function yearWhere(year) {
  const y = String(year);
  return `date LIKE '${y}-%'`;
}

function getScalar(sql) {
  return db.prepare(sql).get()?.c ?? 0;
}

function getAll(sql) {
  return db.prepare(sql).all();
}

function main() {
  const yearArg = process.argv.find((arg) => arg.startsWith("--year="))?.slice("--year=".length);
  const year = Number(yearArg || 2025);
  const whereYear = yearWhere(year);

  const documents = {
    total: getScalar("SELECT COUNT(*) AS c FROM documents"),
    imported: getScalar("SELECT COUNT(*) AS c FROM documents WHERE status='imported'"),
    byType: getAll("SELECT source_type, COUNT(*) AS c FROM documents GROUP BY source_type ORDER BY c DESC"),
    byStatus: getAll("SELECT status, COUNT(*) AS c FROM documents GROUP BY status ORDER BY c DESC"),
  };

  const entries = {
    total: getScalar("SELECT COUNT(*) AS c FROM entries"),
    byReviewStatus: getAll("SELECT review_status, COUNT(*) AS c FROM entries GROUP BY review_status ORDER BY c DESC"),
    needsReviewTotal: getScalar("SELECT COUNT(*) AS c FROM entries WHERE review_status='needs_review'"),
    possibleDuplicates: getScalar("SELECT COUNT(*) AS c FROM entries WHERE possible_duplicate=1"),
    flags: db
      .prepare(
        "SELECT SUM(is_internal_transfer) AS internal, SUM(is_card_payment) AS card, SUM(is_investment_movement) AS invest, SUM(is_loan_movement) AS loan FROM entries",
      )
      .get(),
    paymentMethods: getAll("SELECT payment_method, COUNT(*) AS c FROM entries GROUP BY payment_method ORDER BY c DESC"),
  };

  const entriesYear = {
    total: getScalar(`SELECT COUNT(*) AS c FROM entries WHERE ${whereYear}`),
    needsReview: getScalar(`SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND review_status='needs_review'`),
    categoriesTop: getAll(
      `SELECT category, subcategory, COUNT(*) AS c
       FROM entries WHERE ${whereYear}
       GROUP BY category, subcategory
       ORDER BY c DESC
       LIMIT 20`,
    ),
    counterpartiesPixTop: getAll(
      `SELECT merchant_or_counterparty AS merchant, COUNT(*) AS c
       FROM entries
       WHERE ${whereYear} AND payment_method='PIX' AND merchant_or_counterparty<>''
       GROUP BY merchant
       ORDER BY c DESC
       LIMIT 15`,
    ),
    counterpartiesDebitoTop: getAll(
      `SELECT merchant_or_counterparty AS merchant, COUNT(*) AS c
       FROM entries
       WHERE ${whereYear} AND payment_method='Débito' AND merchant_or_counterparty<>''
       GROUP BY merchant
       ORDER BY c DESC
       LIMIT 15`,
    ),
    keyPatterns: {
      pixNoCredito: getScalar(
        `SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND description_raw LIKE 'Valor adicionado na conta por cartão de crédito%'`,
      ),
      pagamentoFatura: getScalar(
        `SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND category='Cartão de crédito' AND subcategory='Pagamento de fatura'`,
      ),
      transfersInternas: getScalar(`SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND category='Transferência interna'`),
      transferPix: getScalar(`SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND category='Transferência' AND subcategory='PIX'`),
      investimentoAplicacao: getScalar(`SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND category='Investimento' AND subcategory='Aplicação'`),
      investimentoResgate: getScalar(`SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND category='Investimento' AND subcategory='Resgate'`),
      unimedBoletos: getScalar(
        `SELECT COUNT(*) AS c FROM entries WHERE ${whereYear} AND description_raw LIKE 'Pagamento de boleto efetuado - UNIMED%'`,
      ),
    },
    totals: db
      .prepare(
        `SELECT
           SUM(CASE WHEN direction='income' THEN amount ELSE 0 END) AS income_gross,
           SUM(CASE WHEN direction='expense' THEN amount ELSE 0 END) AS expense_gross,
           SUM(CASE WHEN direction='income' AND is_internal_transfer=0 AND is_investment_movement=0 AND is_loan_movement=0 THEN amount ELSE 0 END) AS income_real,
           SUM(CASE WHEN direction='expense' AND is_internal_transfer=0 AND is_card_payment=0 AND is_investment_movement=0 AND is_loan_movement=0 THEN amount ELSE 0 END) AS expense_real,
           SUM(CASE WHEN is_internal_transfer=1 THEN amount ELSE 0 END) AS internal_total,
           SUM(CASE WHEN is_card_payment=1 THEN amount ELSE 0 END) AS card_related_total,
           SUM(CASE WHEN is_investment_movement=1 THEN amount ELSE 0 END) AS invest_total
         FROM entries
         WHERE ${whereYear}`,
      )
      .get(),
  };

  const dupes = getAll(
    `SELECT id, date, description, amount, direction, notes, source_id
     FROM entries
     WHERE possible_duplicate=1
     ORDER BY date ASC, id ASC`,
  );

  console.log(
    JSON.stringify(
      {
        year,
        documents,
        entries,
        entriesYear,
        possibleDuplicates: dupes,
      },
      null,
      2,
    ),
  );
}

main();

