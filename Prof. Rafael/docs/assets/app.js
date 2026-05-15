const dashboardEl = document.getElementById("dashboard");
const heroMetaEl = document.getElementById("hero-meta");

const STATUS_LABELS = {
  pending_approval: "Pendente",
  approved: "Aprovado",
  needs_revision: "Precisa de ajuste",
  rejected: "Rejeitado",
};

function formatDate(isoString) {
  if (!isoString) return "sem registro";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function statusPill(status) {
  const label = STATUS_LABELS[status] ?? status ?? "sem status";
  return `<span class="status-pill ${escapeHtml(status || "pending_approval")}">${escapeHtml(label)}</span>`;
}

function approvalIssueUrl(repo, item, decision, notes = "") {
  if (!repo?.issues_new_url || !item?.id) return "#";
  const issueTitle = `[Approval] ${item.kind} ${item.id} -> ${decision}`;
  const body = [
    "automation_approval: true",
    `kind: ${item.kind}`,
    `target_id: ${item.id}`,
    `decision: ${decision}`,
    `notes: ${notes}`,
  ].join("\n");
  return `${repo.issues_new_url}?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(body)}`;
}

function renderMetaCard(label, value) {
  return `
    <article class="meta-card">
      <span class="meta-label">${escapeHtml(label)}</span>
      <span class="meta-value">${escapeHtml(value)}</span>
    </article>
  `;
}

function renderCarousel(repo, carousel) {
  if (!carousel) {
    return `
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Carrossel</p>
            <h2>Nenhum draft recente</h2>
          </div>
        </div>
        <p class="section-subtitle">Assim que a automação gerar o próximo carrossel, ele aparece aqui com atalhos de aprovação.</p>
      </section>
    `;
  }

  const source = carousel.source_article || {};
  const slides = (carousel.slides || [])
    .slice(0, 4)
    .map(
      (slide) => `
        <li class="slide-item">
          <strong>Slide ${escapeHtml(slide.number)} — ${escapeHtml(slide.type)}</strong>
          <div>${escapeHtml(slide.headline)}</div>
          ${slide.body ? `<p class="footer-note">${escapeHtml(slide.body)}</p>` : ""}
        </li>
      `
    )
    .join("");

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="section-kicker">Carrossel</p>
          <h2>Draft do dia ${escapeHtml(carousel.id)}</h2>
          <p class="section-subtitle">A ideia aqui é aprovar o ângulo rápido no celular antes da etapa visual.</p>
        </div>
        ${statusPill(carousel.status)}
      </div>

      <p class="thesis">${escapeHtml(carousel.thesis || "Tese ainda não definida")}</p>
      <p class="supporting-copy">
        <strong>Pergunta da audiência:</strong> ${escapeHtml(carousel.question || "não informada")}
      </p>

      <div class="meta-grid">
        ${renderMetaCard("Artigo-fonte", source.title || "não informado")}
        ${renderMetaCard("Método", source.method || "não informado")}
        ${renderMetaCard("País", source.country || "não informado")}
        ${renderMetaCard("Atualizado", formatDate(carousel.updated_at))}
      </div>

      <ul class="slide-list">
        ${slides}
      </ul>

      <div class="action-row">
        <a class="action-button primary" href="${approvalIssueUrl(repo, carousel, "approve")}" target="_blank" rel="noreferrer">Aprovar</a>
        <a class="action-button secondary" href="${approvalIssueUrl(repo, carousel, "revise", "Ajustar gancho, tom ou estrutura.")}" target="_blank" rel="noreferrer">Pedir ajuste</a>
        <a class="action-button danger" href="${approvalIssueUrl(repo, carousel, "reject", "Descartar este draft e gerar outra opção.")}" target="_blank" rel="noreferrer">Rejeitar</a>
      </div>

      <p class="hint">Os botões abrem um issue já preenchido no GitHub. Depois a Action atualiza o status do repositório automaticamente.</p>
    </section>
  `;
}

function renderResearch(repo, research) {
  if (!research) {
    return `
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Radar de pesquisa</p>
            <h2>Ainda sem radar publicado</h2>
          </div>
        </div>
        <p class="section-subtitle">Quando o JSON diário entrar na base, este bloco passa a mostrar os 5 estudos e a aprovação da curadoria.</p>
      </section>
    `;
  }

  const articles = (research.articles || [])
    .map(
      (article) => `
        <li class="article-item">
          <strong>${escapeHtml(article.title)}</strong>
          <div>${escapeHtml(article.field || "Campo não informado")} · ${escapeHtml(article.method || "Método não informado")} · ${escapeHtml(article.country || "País não informado")}</div>
          <p class="footer-note">${escapeHtml(article.results || article.classroom_implication || "Sem resumo disponível.")}</p>
        </li>
      `
    )
    .join("");

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="section-kicker">Radar de pesquisa</p>
          <h2>Curadoria de ${escapeHtml(research.id)}</h2>
          <p class="section-subtitle">Ideal para um “ok” rápido antes da seleção alimentar o restante do pipeline.</p>
        </div>
        ${statusPill(research.status)}
      </div>

      <div class="compact-grid">
        ${renderMetaCard("Artigos", research.article_count || 0)}
        ${renderMetaCard("Campos", (research.fields_covered || []).join(", ") || "não informado")}
        ${renderMetaCard("Atualizado", formatDate(research.updated_at))}
      </div>

      <ul class="article-list">${articles}</ul>

      <div class="action-row">
        <a class="action-button primary" href="${approvalIssueUrl(repo, research, "approve")}" target="_blank" rel="noreferrer">Curadoria ok</a>
        <a class="action-button secondary" href="${approvalIssueUrl(repo, research, "revise", "Refazer a seleção e variar mais os campos.")}" target="_blank" rel="noreferrer">Pedir nova seleção</a>
        <a class="action-button danger" href="${approvalIssueUrl(repo, research, "reject", "Descartar esta curadoria diária.")}" target="_blank" rel="noreferrer">Descartar</a>
      </div>
    </section>
  `;
}

function renderActivity(activity) {
  if (!activity?.length) {
    return `
      <section class="panel full-span">
        <div class="section-head">
          <div>
            <p class="section-kicker">Histórico</p>
            <h2>Sem decisões registradas ainda</h2>
          </div>
        </div>
        <p class="section-subtitle">Quando você aprovar ou pedir ajustes, o histórico aparece aqui.</p>
      </section>
    `;
  }

  const items = activity
    .map(
      (item) => `
        <li class="activity-item">
          <strong>${escapeHtml(item.kind)} · ${escapeHtml(item.target_id)}</strong>
          <div>${escapeHtml(STATUS_LABELS[item.status] || item.status)} · ${formatDate(item.updated_at)}</div>
          ${item.notes ? `<p class="footer-note">${escapeHtml(item.notes)}</p>` : ""}
        </li>
      `
    )
    .join("");

  return `
    <section class="panel full-span">
      <div class="section-head">
        <div>
          <p class="section-kicker">Histórico</p>
          <h2>Últimas decisões</h2>
        </div>
      </div>
      <ul class="activity-list">${items}</ul>
    </section>
  `;
}

async function loadDashboard() {
  try {
    const response = await fetch("./data/dashboard.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();

    heroMetaEl.textContent = `Última atualização: ${formatDate(payload.generated_at)}`;

    const sections = [
      renderCarousel(payload.repo, payload.carousel),
      renderResearch(payload.repo, payload.research),
      renderActivity(payload.activity),
    ];

    dashboardEl.innerHTML = sections.join("");
  } catch (error) {
    console.error(error);
    heroMetaEl.textContent = "Não foi possível carregar os dados do painel agora.";
    dashboardEl.innerHTML = `
      <section class="panel empty-state">
        <h2>Painel indisponível</h2>
        <p>O arquivo <code>docs/data/dashboard.json</code> ainda não foi gerado ou publicado. Rode a atualização do dashboard antes do deploy.</p>
      </section>
    `;
  }
}

loadDashboard();
