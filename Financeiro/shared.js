export const seedState = {
  documents: [
    {
      id: 1,
      title: "Finanças 2022",
      kind: "Planilha",
      source: "Google Drive",
      status: "Importado",
      note: "Base histórica por ano, com receita, despesa fixa e pensão.",
      filename: "11cw3F25N2U-gTIlX558jDj3khH4u9qiiB6UYPs10vY8",
      createdAt: "2026-04-15",
    },
    {
      id: 2,
      title: "CT 16592-40.pdf",
      kind: "Contrato",
      source: "Downloads",
      status: "Revisado",
      note: "Demonstrativo de evolução contratual da Caixa.",
      filename: "CT 16592-40.pdf",
      createdAt: "2026-04-15",
    },
    {
      id: 3,
      title: "CT 17433-80.pdf",
      kind: "Contrato",
      source: "Downloads",
      status: "Revisado",
      note: "Segundo contrato de financiamento com evolução contratual.",
      filename: "CT 17433-80.pdf",
      createdAt: "2026-04-15",
    },
    {
      id: 4,
      title: "rafael.pdf",
      kind: "Dívida / ônus real",
      source: "Downloads",
      status: "Revisado",
      note: "Demonstrativo da Caixa com ônus real e evolução de saldo.",
      filename: "rafael.pdf",
      createdAt: "2026-04-15",
    },
    {
      id: 5,
      title: "pix.pdf",
      kind: "PIX",
      source: "Downloads",
      status: "Importado",
      note: "Lista de transações com várias ocorrências do mesmo fluxo.",
      filename: "pix.pdf",
      createdAt: "2026-04-15",
    },
    {
      id: 6,
      title: "PIX (1).pdf",
      kind: "PIX",
      source: "Downloads",
      status: "Importado",
      note: "Outro histórico de PIX com layout tabelado e data/hora.",
      filename: "PIX (1).pdf",
      createdAt: "2026-04-15",
    },
    {
      id: 7,
      title: "dem.pdf",
      kind: "Documento bancário",
      source: "Downloads",
      status: "Pendente",
      note: "Leitura visual inconclusiva; precisa de OCR dedicado.",
      filename: "dem.pdf",
      createdAt: "2026-04-15",
    },
  ],
  entries: [
    {
      id: 1,
      date: "2026-03-01",
      description: "Salário",
      direction: "income",
      amount: 10112.07,
      paymentMethod: "Transferência",
      category: "Receita",
      subcategory: "Salário",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 2,
      date: "2026-03-02",
      description: "Pensão",
      direction: "expense",
      amount: 2983.17,
      paymentMethod: "Transferência",
      category: "Família",
      subcategory: "Pensão",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 3,
      date: "2026-03-03",
      description: "Unimed",
      direction: "expense",
      amount: 1823.79,
      paymentMethod: "Boleto",
      category: "Saúde",
      subcategory: "Plano de saúde",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 4,
      date: "2026-03-04",
      description: "Aluguel",
      direction: "expense",
      amount: 1000,
      paymentMethod: "PIX",
      category: "Moradia",
      subcategory: "Aluguel",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 5,
      date: "2026-03-05",
      description: "Claro",
      direction: "expense",
      amount: 203.23,
      paymentMethod: "Débito",
      category: "Comunicação",
      subcategory: "Telefonia",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 6,
      date: "2026-03-06",
      description: "Google One",
      direction: "expense",
      amount: 96.99,
      paymentMethod: "Cartão de crédito",
      category: "Assinaturas",
      subcategory: "Software",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 7,
      date: "2026-03-07",
      description: "Aluguel Cecília",
      direction: "expense",
      amount: 1150,
      paymentMethod: "Transferência",
      category: "Moradia",
      subcategory: "Aluguel",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 8,
      date: "2026-03-08",
      description: "Cartão Nubank",
      direction: "expense",
      amount: 3054.62,
      paymentMethod: "Cartão de crédito",
      category: "Cartão de crédito",
      subcategory: "Fatura",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 9,
      date: "2026-03-09",
      description: "Cartão Caixa",
      direction: "expense",
      amount: 627.28,
      paymentMethod: "Cartão de crédito",
      category: "Cartão de crédito",
      subcategory: "Fatura",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 10,
      date: "2026-03-10",
      description: "Gigs",
      direction: "income",
      amount: 870,
      paymentMethod: "PIX",
      category: "Receita",
      subcategory: "Trabalho extra",
      recurring: false,
      reviewStatus: "Revisado",
    },
    {
      id: 11,
      date: "2026-03-11",
      description: "Bolsa RP",
      direction: "income",
      amount: 2000,
      paymentMethod: "Transferência",
      category: "Receita",
      subcategory: "Bolsa",
      recurring: true,
      reviewStatus: "Revisado",
    },
    {
      id: 12,
      date: "2026-03-12",
      description: "Advogada",
      direction: "expense",
      amount: 489.95,
      paymentMethod: "Transferência",
      category: "Jurídico",
      subcategory: "Honorários",
      recurring: false,
      reviewStatus: "Revisado",
    },
  ],
  snapshots: [
    { label: "2024 Jan", expense: 10403.2, income: 8648.66 },
    { label: "2024 Dez", expense: 11272.08, income: 13289.73 },
    { label: "2025 Mar", expense: 11958.0, income: 8648.66 },
    { label: "2025 Set", expense: 13430.64, income: 13289.73 },
    { label: "2025 Dez", expense: 12459.7, income: 13723.42 },
    { label: "2026 Mar", expense: 13614.11, income: 10112.07 },
  ],
  risks: [
    {
      title: "Fontes heterogêneas",
      body:
        "A base mistura contrato, PIX, fatura, extrato e planilha. O sistema precisa tratar cada tipo como fonte documental, não como um lançamento pronto.",
    },
    {
      title: "Classificação ambígua",
      body:
        "Itens como bebida, lazer, alimentação e despesa pessoal podem se confundir. O motor sugere, mas a revisão humana precisa continuar disponível.",
    },
    {
      title: "Duplicidade",
      body:
        "Um mesmo gasto pode aparecer na planilha, no extrato e no comprovante. A solução é consolidar pela chave data + valor + descrição + origem.",
    },
    {
      title: "IR e jurídico",
      body:
        "Pensão, dívidas, contratos e imposto exigem trilha de auditoria forte, com documentos sempre vinculados ao lançamento e ao status de revisão.",
    },
  ],
  roadmap: [
    "Importar a planilha atual como base histórica oficial.",
    "Cadastrar documentos brutos no inbox e classificá-los por tipo.",
    "Adicionar OCR e extração automática para PDF e imagem.",
    "Criar reconciliação entre planilha, extrato e comprovante.",
    "Ligar alertas de assinatura, IR e projeções de caixa.",
  ],
  ruleHints: [
    {
      pattern: "aluguel\\s+cec[ií]lia",
      category: "Família",
      subcategory: "Pensão",
      confidence: "alta",
    },
    {
      pattern: "aline\\s+cl[ií]ss?iane\\s+ferreira\\s+da\\s+silva",
      category: "Família",
      subcategory: "Pensão",
      confidence: "alta",
    },
    {
      pattern: "embarca(\\.ai)?|quero\\s+passagem|viagens\\s+e\\s+turismo",
      category: "Transporte",
      subcategory: "Viagens",
      confidence: "alta",
    },
    {
      pattern: "\\buber\\b",
      category: "Transporte",
      subcategory: "Corridas (Uber)",
      confidence: "média",
    },
    {
      pattern: "\\bcad[eê]\\b",
      category: "Transporte",
      subcategory: "Corridas (Cadê)",
      confidence: "média",
    },
    {
      pattern: "\\b99\\s*(app|pop|taxi)\\b",
      category: "Transporte",
      subcategory: "Corridas (99)",
      confidence: "média",
    },
    { pattern: "aluguel|moradia", category: "Moradia", subcategory: "Aluguel", confidence: "alta" },
    { pattern: "unimed|plano|saúde", category: "Saúde", subcategory: "Plano de saúde", confidence: "alta" },
    { pattern: "claro|vivo|tim|telefone", category: "Comunicação", subcategory: "Telefonia", confidence: "alta" },
    { pattern: "google\\s*one|hostgator|perplexity", category: "Assinaturas", subcategory: "Software", confidence: "alta" },
    { pattern: "pensão|coordenação|residência pedagógica", category: "Família", subcategory: "Pensão", confidence: "alta" },
    { pattern: "cart[aã]o|nubank|caixa", category: "Cartão de crédito", subcategory: "Fatura", confidence: "média" },
    { pattern: "pix|transfer[iê]ncia", category: "Transferência", subcategory: "PIX", confidence: "média" },
    { pattern: "ônibus|onibus", category: "Transporte", subcategory: "Ônibus", confidence: "alta" },
    { pattern: "sal[aá]rio|bolsa|gigs|masterclass|direção", category: "Receita", subcategory: "Trabalho", confidence: "alta" },
    { pattern: "bebida", category: "Alimentação", subcategory: "Bebidas", confidence: "média" },
  ],
};

export function cloneSeedState() {
  return {
    ...JSON.parse(JSON.stringify({
      ...seedState,
      ruleHints: seedState.ruleHints.map((hint) => ({ ...hint })),
    })),
  };
}

export function normalizeReviewStatus(status = "") {
  const text = String(status || "").trim().toLowerCase();
  if (!text) return "needs_review";
  if (text === "reviewed" || text.includes("revis")) return "reviewed";
  if (text === "imported" || text.includes("import")) return "imported";
  if (text === "needs_review" || text.includes("pend") || text.includes("confirm")) return "needs_review";
  return "needs_review";
}

export function isNeedsReview(status = "") {
  return normalizeReviewStatus(status) !== "reviewed";
}

export function getReviewStatusLabel(status = "") {
  const normalized = normalizeReviewStatus(status);
  if (normalized === "reviewed") return "Revisado";
  if (normalized === "imported") return "Importado";
  return "Needs review";
}

export function classify(description = "", direction = "expense", ruleHints = seedState.ruleHints) {
  const text = `${description} ${direction}`.trim();
  if (direction === "income") {
    return { category: "Receita", subcategory: "Entrada", confidence: "alta" };
  }

  if (/aluguel\s+cec[ií]lia/i.test(text)) {
    return { category: "Família", subcategory: "Pensão", confidence: "alta" };
  }

  if (/\buber\b/i.test(text)) {
    return { category: "Transporte", subcategory: "Corridas (Uber)", confidence: "média" };
  }

  if (/\bcad[eê]\b/i.test(text)) {
    return { category: "Transporte", subcategory: "Corridas (Cadê)", confidence: "média" };
  }

  if (/\b99\s*(app|pop|taxi)\b/i.test(text)) {
    return { category: "Transporte", subcategory: "Corridas (99)", confidence: "média" };
  }

  if (/embarca(\.ai)?|quero\s+passagem|viagens\s+e\s+turismo/i.test(text)) {
    return { category: "Transporte", subcategory: "Viagens", confidence: "alta" };
  }

  const amountMatch = String(description).match(/R?\$?\s*([0-9]+(?:[.,][0-9]+)?)/);
  const amount = amountMatch ? Number(amountMatch[1].replace(".", "").replace(",", ".")) : null;
  if (/ônibus|onibus/i.test(text)) {
    return {
      category: "Transporte",
      subcategory: "Ônibus",
      confidence: "alta",
    };
  }
  if (
    amount !== null &&
    amount > 0 &&
    amount <= 30 &&
    /pix|transfer/i.test(text)
  ) {
    return {
      category: "Transporte",
      subcategory: "Cadê / corrida",
      confidence: "média",
    };
  }

  if (
    amount !== null &&
    amount === 0 &&
    /cancelad|pix|transfer/i.test(text)
  ) {
    return {
      category: "Transporte",
      subcategory: "Cadê / cancelada",
      confidence: "alta",
    };
  }

  const match = ruleHints.find((rule) => {
    const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern, "i");
    return pattern.test(text);
  });
  if (match) {
    return {
      category: match.category,
      subcategory: match.subcategory,
      confidence: match.confidence,
    };
  }

  return {
    category: "A confirmar",
    subcategory: "Sem classificação",
    confidence: "baixa",
  };
}

export function computeTotals(entries) {
  return entries.reduce(
    (acc, entry) => {
      const amount = Number(entry.amount) || 0;
      if (entry.direction === "income") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      if (entry.recurring) {
        acc.recurring += amount;
      }
      if (isNeedsReview(entry.reviewStatus)) {
        acc.open += 1;
      }
      return acc;
    },
    { income: 0, expense: 0, recurring: 0, open: 0 },
  );
}

export function computeRealTotals(entries) {
  return entries.reduce(
    (acc, entry) => {
      const amount = Number(entry.amount) || 0;
      const isInternal = Boolean(entry.isInternalTransfer);
      const isCard = Boolean(entry.isCardPayment);
      const isInvest = Boolean(entry.isInvestmentMovement);
      const isLoan = Boolean(entry.isLoanMovement);

      if (entry.direction === "income") {
        if (!isInternal && !isInvest && !isLoan) {
          acc.income += amount;
        }
        return acc;
      }

      if (!isInternal && !isCard && !isInvest && !isLoan) {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 },
  );
}

export function nextId(rows) {
  return rows.length ? Math.max(...rows.map((item) => Number(item.id))) + 1 : 1;
}
