import {
  classify,
  cloneSeedState,
  computeRealTotals,
  computeTotals,
  getReviewStatusLabel,
  isNeedsReview,
  normalizeReviewStatus,
} from "./shared.js";

const CACHE_KEY = "financeiro-cloud-cache-v2";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const state = {
  documents: [],
  entries: [],
  snapshots: [],
  risks: [],
  roadmap: [],
  ruleHints: [],
  summary: null,
};

const els = {
  heroMetrics: document.getElementById("hero-metrics"),
  pipeline: document.getElementById("pipeline"),
  documentsList: document.getElementById("documents-list"),
  entriesTbody: document.getElementById("entries-tbody"),
  reviewQueueList: document.getElementById("review-queue-list"),
  reviewQueueSummary: document.getElementById("review-queue-summary"),
  snapshotGrid: document.getElementById("snapshot-grid"),
  sparkline: document.getElementById("sparkline"),
  riskList: document.getElementById("risk-list"),
  roadmapList: document.getElementById("roadmap-list"),
  documentForm: document.getElementById("document-form"),
  entryForm: document.getElementById("entry-form"),
  exportBtn: document.getElementById("export-btn"),
  importInput: document.getElementById("import-input"),
};

function saveCache() {
  localStorage.setItem(CACHE_KEY, JSON.stringify(state));
}

function loadCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!parsed) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function loadState() {
  try {
    const data = await api("/api/state");
    Object.assign(state, data);
    saveCache();
    return;
  } catch {
    const cache = loadCache();
    if (cache) {
      Object.assign(state, cache);
      return;
    }
    Object.assign(state, cloneSeedState());
  }
}

function formatMoney(value) {
  return currency.format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Sem data";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getTotals(entries) {
  // Prefer "real totals" (excludes transferências internas, fatura, investimento etc.) when flags are available.
  const real = computeRealTotals(entries);
  return real.income || real.expense ? { ...computeTotals(entries), ...real } : computeTotals(entries);
}

function getConfidenceBadge(confidence) {
  if (confidence === "alta") return '<span class="badge good">Alta confiança</span>';
  if (confidence === "média") return '<span class="badge warn">Média confiança</span>';
  return '<span class="badge danger">Baixa confiança</span>';
}

function getDocumentBadge(status) {
  const normalized = normalizeReviewStatus(status);
  if (normalized === "reviewed") return "good";
  if (normalized === "imported") return "soft";
  return "warn";
}

function getReviewBadge(status) {
  const normalized = normalizeReviewStatus(status);
  if (normalized === "reviewed") return '<span class="badge good">Revisado</span>';
  if (normalized === "imported") return '<span class="badge soft">Importado</span>';
  return '<span class="badge warn">Needs review</span>';
}

function renderHeroMetrics() {
  const totals = getTotals(state.entries);
  const net = (totals.income || 0) - (totals.expense || 0);
  const docsPending = state.documents.filter((doc) => isNeedsReview(doc.status)).length;
  const reviewQueue = state.summary?.reviewQueue ?? (
    state.entries.filter((entry) => isNeedsReview(entry.reviewStatus)).length + docsPending
  );
  const cards = [
    {
      label: "Saldo operacional (real)",
      value: formatMoney(net),
      caption: "Receitas menos despesas, excluindo fatura/cartão, transferências internas e investimentos.",
    },
    {
      label: "Receita real",
      value: formatMoney(totals.income),
      caption: "Ignora transferências internas e movimentos de investimento.",
    },
    {
      label: "Despesa real",
      value: formatMoney(totals.expense),
      caption: "Não conta pagamento de fatura como despesa nova (evita dupla contagem).",
    },
    {
      label: "Fila de revisão",
      value: String(reviewQueue || docsPending),
      caption: "Itens que ainda pedem confirmação ou ajuste.",
    },
  ];

  els.heroMetrics.innerHTML = cards
    .map(
      (card) => `
        <article class="metric">
          <span class="label">${escapeHtml(card.label)}</span>
          <span class="value">${escapeHtml(card.value)}</span>
          <span class="caption">${escapeHtml(card.caption)}</span>
        </article>
      `,
    )
    .join("");
}

function renderPipeline() {
  const steps = [
    { tag: "Entrada", title: "Telegram / upload", body: "Você envia fotos, PDFs e arquivos de apoio. O chat é só a porta de entrada." },
    { tag: "Coleta", title: "Inbox documental", body: "Cada arquivo entra com origem, tipo, status e trilha de auditoria." },
    { tag: "Leitura", title: "OCR e extração", body: "Texto, data, valor, favorecido e indícios de categoria são extraídos." },
    { tag: "Classificação", title: "Motor de regras", body: "A IA sugere categoria e subcategoria com base em palavras-chave e histórico." },
    { tag: "Consolidação", title: "Base canônica", body: "Tudo se normaliza numa estrutura única com revisão e auditoria." },
    { tag: "Análise", title: "Relatórios e projeções", body: "O painel mostra totais, recorrências, riscos fiscais e fluxo de caixa." },
    { tag: "Ação", title: "Alertas e follow-up", body: "O sistema avisa sobre assinaturas, documentos pendentes e prazos." },
  ];

  els.pipeline.innerHTML = steps
    .map(
      (step) => `
        <article class="pipe-node">
          <span class="tag">${escapeHtml(step.tag)}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.body)}</p>
        </article>
      `,
    )
    .join("");
}

function renderDocuments() {
  const documents = [...state.documents].sort((a, b) => Number(b.id) - Number(a.id));
  els.documentsList.innerHTML = documents
    .map((doc) => {
      const badgeClass = getDocumentBadge(doc.status);
      return `
        <article class="doc-card">
          <div class="doc-top">
            <strong>${escapeHtml(doc.title)}</strong>
            <span class="badge ${badgeClass}">${escapeHtml(doc.kind)}</span>
          </div>
          <div class="doc-meta">
            <span class="mono">${escapeHtml(doc.source)}</span>
            <span>${escapeHtml(doc.status)}</span>
          </div>
          <p>${escapeHtml(doc.note || "Sem observação")}</p>
          <div class="doc-meta">
            <span class="mono">${escapeHtml(doc.filename || "sem arquivo")}</span>
            <span>${escapeHtml(formatDate(doc.createdAt))}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderEntries() {
  const entries = [...state.entries].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  els.entriesTbody.innerHTML = entries
    .map((entry) => {
      const suggested = classify(entry.description, entry.direction, state.ruleHints);
      const visibleCategory = entry.category || suggested.category;
      const visibleSub = entry.subcategory || suggested.subcategory;
      return `
        <tr>
          <td class="mono">${escapeHtml(formatDate(entry.date))}</td>
          <td>
            <strong>${escapeHtml(entry.description)}</strong>
            <div class="callout">${escapeHtml(visibleSub)}</div>
          </td>
          <td>
            ${escapeHtml(visibleCategory)}
            <div>${getConfidenceBadge(entry.confidence || suggested.confidence)}</div>
          </td>
          <td class="mono">${escapeHtml(formatMoney(entry.amount))}</td>
          <td>${getReviewBadge(entry.reviewStatus)}</td>
        </tr>
      `;
    })
    .join("");
}

function getEntryReviewReason(entry) {
  if (entry.possibleDuplicate) {
    return "Possivel duplicidade com outra fonte. Conferir antes de consolidar.";
  }
  if (entry.isInternalTransfer) {
    return "Movimento interno. Confirmar se nao deve entrar como receita ou despesa real.";
  }
  if (entry.isCardPayment) {
    return "Pagamento de fatura precisa ser reconciliado para nao duplicar gasto.";
  }
  if (entry.isInvestmentMovement) {
    return "Movimento de reserva ou investimento. Validar classificacao patrimonial.";
  }
  if (entry.isLoanMovement) {
    return "Entrada ou saida ligada a emprestimo. Separar do fluxo operacional.";
  }
  if ((entry.confidence || "baixa") === "baixa" || entry.category === "A confirmar") {
    return "Descricao ambigua ou regra fraca. Precisa de classificacao manual.";
  }
  return "Item ainda nao revisado. Validar categoria, subcategoria e vinculo documental.";
}

function renderReviewQueue() {
  const pendingDocuments = state.documents
    .filter((doc) => isNeedsReview(doc.status))
    .map((doc) => ({
      type: "Documento",
      title: doc.title,
      amount: null,
      date: doc.createdAt,
      badge: getDocumentBadge(doc.status),
      status: getReviewStatusLabel(doc.status),
      meta: [doc.kind, doc.sourceOrigin || doc.source, doc.account].filter(Boolean).join(" • "),
      body: doc.note || "Documento ainda sem revisao concluida.",
    }));

  const pendingEntries = state.entries
    .filter((entry) => isNeedsReview(entry.reviewStatus))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((entry) => ({
      type: "Lancamento",
      title: entry.description,
      amount: formatMoney(entry.amount),
      date: entry.date,
      badge: normalizeReviewStatus(entry.reviewStatus) === "imported" ? "soft" : "warn",
      status: getReviewStatusLabel(entry.reviewStatus),
      meta: [entry.category, entry.subcategory, entry.paymentMethod].filter(Boolean).join(" • "),
      body: getEntryReviewReason(entry),
    }));

  const queue = [...pendingDocuments, ...pendingEntries];
  const summary = `${queue.length} itens aguardando revisao. ${pendingDocuments.length} documentos e ${pendingEntries.length} lancamentos.`;
  els.reviewQueueSummary.textContent = summary;

  if (!queue.length) {
    els.reviewQueueList.innerHTML = `
      <article class="review-card">
        <header>
          <h3>Fila vazia</h3>
          <span class="badge good">Pronto</span>
        </header>
        <p>Nenhum item bloqueando a classificacao agora. O proximo agente pode seguir para a importacao em lote.</p>
      </article>
    `;
    return;
  }

  els.reviewQueueList.innerHTML = queue
    .map((item) => `
      <article class="review-card">
        <header>
          <h3>${escapeHtml(item.title)}</h3>
          <span class="badge ${escapeHtml(item.badge)}">${escapeHtml(item.type)}</span>
        </header>
        <div class="meta">${escapeHtml(item.meta || "Sem metadados adicionais")}</div>
        <p>${escapeHtml(item.body)}</p>
        <footer>
          <span>${escapeHtml(item.amount || formatDate(item.date))}</span>
          <span class="badge warn">${escapeHtml(item.status)}</span>
        </footer>
      </article>
    `)
    .join("");
}

function renderSnapshots() {
  els.snapshotGrid.innerHTML = state.snapshots
    .map((item) => {
      const delta = Number(item.income || 0) - Number(item.expense || 0);
      const deltaLabel = delta >= 0 ? `Superavit ${formatMoney(delta)}` : `Deficit ${formatMoney(Math.abs(delta))}`;
      return `
        <article class="snapshot-card">
          <div class="year">${escapeHtml(item.label)}</div>
          <span class="number">${escapeHtml(formatMoney(item.expense))}</span>
          <div class="delta">${escapeHtml(deltaLabel)}</div>
        </article>
      `;
    })
    .join("");

  const values = state.snapshots.map((item) => Number(item.expense || 0));
  const max = Math.max(...values, 1);
  els.sparkline.innerHTML = state.snapshots
    .map((item) => {
      const height = Math.max(18, Math.round((Number(item.expense || 0) / max) * 180));
      return `
        <div class="bar">
          <div class="bar-value">${escapeHtml(formatMoney(item.expense))}</div>
          <div class="fill" style="height:${height}px"></div>
          <div class="bar-label">${escapeHtml(item.label)}</div>
        </div>
      `;
    })
    .join("");
}

function renderRisks() {
  els.riskList.innerHTML = state.risks
    .map(
      (risk) => `
        <article class="risk-card">
          <h3>${escapeHtml(risk.title)}</h3>
          <p>${escapeHtml(risk.body)}</p>
        </article>
      `,
    )
    .join("");

  els.roadmapList.innerHTML = state.roadmap.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
}

function renderAll() {
  renderHeroMetrics();
  renderPipeline();
  renderDocuments();
  renderEntries();
  renderReviewQueue();
  renderSnapshots();
  renderRisks();
}

async function addDocumentFromForm(form) {
  const formData = new FormData(form);
  const file = form.querySelector('input[name="file"]').files[0];
  const payload = {
    title: String(formData.get("title") || "").trim(),
    kind: String(formData.get("kind") || "Outro"),
    source: String(formData.get("source") || "").trim(),
    status: String(formData.get("status") || "Pendente"),
    note: String(formData.get("note") || "").trim(),
    filename: file ? file.name : "sem arquivo",
  };

  if (!payload.title || !payload.source) return;

  try {
    const result = await api("/api/documents", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.documents.unshift({
      ...result.document,
      createdAt: result.document.created_at || result.document.createdAt,
    });
    saveCache();
    renderDocuments();
    renderReviewQueue();
    renderHeroMetrics();
    form.reset();
  } catch {
    const next = {
      id: state.documents.length ? Math.max(...state.documents.map((item) => Number(item.id))) + 1 : 1,
      ...payload,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    state.documents.unshift(next);
    saveCache();
    renderDocuments();
    renderReviewQueue();
    renderHeroMetrics();
    form.reset();
  }
}

async function addEntryFromForm(form) {
  const formData = new FormData(form);
  const description = String(formData.get("description") || "").trim();
  const direction = String(formData.get("direction") || "expense");
  const suggestion = classify(description, direction, state.ruleHints);
  const payload = {
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
    description,
    direction,
    amount: Number(formData.get("amount") || 0),
    paymentMethod: String(formData.get("paymentMethod") || "Outro"),
    category: String(formData.get("category") || suggestion.category).trim() || suggestion.category,
    subcategory: String(formData.get("subcategory") || suggestion.subcategory).trim() || suggestion.subcategory,
    confidence: suggestion.confidence,
    recurring: /aluguel|unimed|claro|google|pensão|cart[aã]o|sal[aá]rio/i.test(description),
    reviewStatus: suggestion.confidence === "baixa" ? "needs_review" : "reviewed",
    descriptionRaw: description,
  };

  if (!payload.description || !payload.amount) return;

  try {
    const result = await api("/api/entries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.entries.unshift({
      ...result.entry,
      paymentMethod: result.entry.payment_method || result.entry.paymentMethod,
      reviewStatus: result.entry.review_status || result.entry.reviewStatus,
      confidence: result.entry.confidence,
    });
    saveCache();
    renderEntries();
    renderReviewQueue();
    renderHeroMetrics();
    form.reset();
    setDefaultDate();
  } catch {
    const next = {
      id: state.entries.length ? Math.max(...state.entries.map((item) => Number(item.id))) + 1 : 1,
      ...payload,
    };
    state.entries.unshift(next);
    saveCache();
    renderEntries();
    renderReviewQueue();
    renderHeroMetrics();
    form.reset();
    setDefaultDate();
  }
}

function setDefaultDate() {
  const dateInput = els.entryForm.querySelector('input[name="date"]');
  if (!dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
}

async function exportJson() {
  try {
    const response = await fetch("/api/export");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assistente-financeiro-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assistente-financeiro-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

async function importJson(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const result = await api("/api/import", {
        method: "POST",
        body: JSON.stringify(parsed),
      });
      Object.assign(state, result);
      saveCache();
      renderAll();
    } catch {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        Object.assign(state, parsed);
        saveCache();
        renderAll();
      } catch {
        window.alert("Nao consegui ler o arquivo JSON.");
      }
    }
  };
  reader.readAsText(file);
}

els.documentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addDocumentFromForm(els.documentForm);
});

els.entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addEntryFromForm(els.entryForm);
});

els.exportBtn.addEventListener("click", exportJson);
els.importInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) {
    importJson(file);
  }
  event.target.value = "";
});

async function bootstrap() {
  await loadState();
  if (!state.documents.length && !state.entries.length) {
    Object.assign(state, cloneSeedState());
  }
  if (state.summary) {
    renderAll();
  } else {
    renderAll();
  }
  setDefaultDate();
}

bootstrap();
