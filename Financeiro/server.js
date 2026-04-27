import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { existsSync, readFileSync, statSync } from "node:fs";
import { addDocument, addEntry, getState, replaceState } from "./db.js";
import { cloneSeedState } from "./shared.js";
import { classify, computeRealTotals, computeTotals, isNeedsReview, normalizeReviewStatus } from "./shared.js";

const rootDir = resolve(process.cwd());
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(text);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    return {};
  }
  return JSON.parse(raw);
}

function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(join(rootDir, safePath.slice(1)));

  if (!filePath.startsWith(rootDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    return false;
  }

  const contentType = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  const body = readFileSync(filePath);
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(body);
  return true;
}

function withDerivedState(state) {
  const totals = computeTotals(state.entries);
  const totalsReal = computeRealTotals(state.entries);
  const net = totals.income - totals.expense;
  const netReal = totalsReal.income - totalsReal.expense;
  const pendingDocuments = state.documents.filter((doc) => isNeedsReview(doc.status)).length;
  const reviewQueue = state.entries.filter((entry) => isNeedsReview(entry.reviewStatus)).length + pendingDocuments;
  return {
    ...state,
    summary: {
      totals,
      totalsReal,
      net,
      netReal,
      pendingDocuments,
      reviewQueue,
      classifiedEntries: state.entries.length - state.entries.filter((entry) => entry.category === "A confirmar").length,
    },
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "financeiro-backend" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    sendJson(res, 200, withDerivedState(getState()));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/summary") {
    const state = getState();
    sendJson(res, 200, withDerivedState(state).summary);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/export") {
    const state = withDerivedState(getState());
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="assistente-financeiro-export.json"`,
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(state, null, 2));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/documents") {
    const body = await readJsonBody(req);
    const classification = {
      category: body.kind || "Documento",
      subcategory: body.status || "Entrada",
      confidence: "alta",
    };
    const document = addDocument({
      title: String(body.title || "").trim(),
      kind: String(body.kind || "Outro"),
      source: String(body.source || "").trim(),
      sourceType: String(body.sourceType || body.kind || "manual").trim(),
      sourceOrigin: String(body.sourceOrigin || body.source || "").trim(),
      dateRangeStart: String(body.dateRangeStart || "").trim(),
      dateRangeEnd: String(body.dateRangeEnd || "").trim(),
      account: String(body.account || "").trim(),
      status: String(body.status || "Pendente"),
      note: String(body.note || "").trim(),
      filename: String(body.filename || "sem arquivo"),
      createdAt: new Date().toISOString().slice(0, 10),
    });
    sendJson(res, 201, { document, classification });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/entries") {
    const body = await readJsonBody(req);
    const suggested = classify(String(body.description || ""), String(body.direction || "expense"));
    const reviewStatus = normalizeReviewStatus(
      String(body.reviewStatus || (suggested.confidence === "baixa" ? "needs_review" : "reviewed")),
    );
    const category = String(body.category || suggested.category).trim() || suggested.category;
    const subcategory = String(body.subcategory || suggested.subcategory).trim() || suggested.subcategory;
    const entry = addEntry({
      sourceId: body.sourceId ?? null,
      externalId: String(body.externalId || "").trim(),
      date: String(body.date || new Date().toISOString().slice(0, 10)),
      description: String(body.description || "").trim(),
      descriptionRaw: String(body.descriptionRaw || body.description || "").trim(),
      direction: String(body.direction || "expense"),
      amount: Number(body.amount || 0),
      merchantOrCounterparty: String(body.merchantOrCounterparty || "").trim(),
      paymentMethod: String(body.paymentMethod || "Outro"),
      category,
      subcategory,
      confidence: String(body.confidence || suggested.confidence || "baixa").trim(),
      notes: String(body.notes || "").trim(),
      recurring: Boolean(body.recurring),
      reviewStatus,
      isInternalTransfer: Boolean(body.isInternalTransfer || category === "Transferência interna"),
      isCardPayment: Boolean(body.isCardPayment || category === "Cartão de crédito" || /fatura/i.test(subcategory)),
      isInvestmentMovement: Boolean(body.isInvestmentMovement || category === "Investimento"),
      isLoanMovement: Boolean(body.isLoanMovement || category === "Empréstimo"),
      possibleDuplicate: Boolean(body.possibleDuplicate),
    });
    sendJson(res, 201, { entry, suggested });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/import") {
    const body = await readJsonBody(req);
    const nextState = {
      documents: Array.isArray(body.documents) ? body.documents : [],
      entries: Array.isArray(body.entries) ? body.entries : [],
      snapshots: Array.isArray(body.snapshots) ? body.snapshots : [],
      risks: Array.isArray(body.risks) ? body.risks : [],
      roadmap: Array.isArray(body.roadmap) ? body.roadmap : [],
      ruleHints: Array.isArray(body.ruleHints) ? body.ruleHints : [],
    };
    const merged = replaceState(nextState);
    sendJson(res, 200, withDerivedState(merged));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/seed") {
    sendJson(res, 200, getState());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/reset") {
    const merged = replaceState(cloneSeedState());
    sendJson(res, 200, withDerivedState(merged));
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    const served = serveStatic(res, url.pathname);
    if (served) {
      return;
    }
  }

  sendText(res, 404, "Not found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Financeiro backend running on http://localhost:${port}`);
});
