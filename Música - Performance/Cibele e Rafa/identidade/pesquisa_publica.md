# Pesquisa Publica

Este documento registra o que foi encontrado na web e o que ainda nao ficou confirmado.

## Fontes Encontradas
- [Casagriz Ceramica - A Ceramista](https://www.casagriz.com.br/a-ceramista)
- [Casagriz Atelie De Ceramica Ltda na Solutudo](https://www.solutudo.com.br/empresas/sp/s-paulo/ceramica/casagriz-atelie-de-ceramica-ltda-12903337)
- [Make - Schedule a scenario](https://help.make.com/schedule-a-scenario)
- [Make - Data stores](https://help.make.com/data-stores)
- [Make - Introduction to Make AI Agents (New)](https://help.make.com/introduction-to-make-ai-agents-new)
- [Meta - Making it Easier for Brands and Creators to Collaborate on Instagram](https://about.fb.com/news/2024/02/creator-marketplace-for-brands-and-creators-to-collaborate-on-instagram/)
- [n8n - HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [n8n - Schedule Trigger node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [n8n - Accessing and using n8n MCP server](https://docs.n8n.io/advanced-ai/mcp/accessing-n8n-mcp-server/)
- [n8n - MCP Client node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcpClient/)
- [n8n - MCP Server Trigger node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/)
- [n8n - AI Agent node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
- [n8n - Memory in AI](https://docs.n8n.io/advanced-ai/examples/understand-memory/)
- [n8n - Data tables](https://docs.n8n.io/data/schema-preview/)
- [n8n - n8n node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.n8n/)
- [n8n - Google Calendar node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/)
- [n8n - Google Drive node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/)
- [n8n - Google Sheets node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/)
- [n8n - YouTube node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.youtube/)
- [n8n - Facebook Graph API node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.facebookgraphapi/)

## O Que As Fontes Dizem
- A pagina da Casagriz apresenta `Sibeli Martinez` como a ceramista do atelie e diz que o primeiro contato com a ceramica aconteceu em 2010.
- A mesma pagina relata que ela trocou de carreira em 2017 e que o atelie nasceu em janeiro de 2018.
- A pagina da Solutudo confirma a razao social `Casagriz Atelie De Ceramica Ltda` sob o nome `Sibeli Martinez`, com fundacao em 03/03/2018 em Sao Paulo.

## O Que Nao Fiquei Confortavel Em Tratar Como Fato
- Nao encontrei uma bio musical oficial e inequivoca da dupla.
- `Rafael da Silva` e um nome muito comum na web; os resultados se misturam com muitos homonimos.
- Por isso, nao usei perfis soltos e ambiguos como base para a bio final da dupla.

## Achados Relevantes Para Automacao
- O Make suporta cenarios com agendamento diario, por dias da semana ou em intervalos regulares; tambem tem `Data stores` para guardar estado entre execucoes e `Make AI Agents (New)` para raciocinio e classificacao dentro do fluxo.
- O n8n tem `Schedule Trigger` para rodar em horario fixo e `HTTP Request` para conversar com APIs REST, entao ele serve bem como orquestrador se a gente quiser sair do Make em algum ponto.
- O n8n hoje tambem tem `Data Tables`, que funcionam como armazenamento interno estruturado para estado, historico e tabelas de apoio; isso e util para fila, memoria editorial e pendencias por canal.
- O n8n possui `AI Agent`, memoria de conversa e nos de Google Calendar, Google Drive, Google Sheets e YouTube, o que fortalece o uso de contexto vivo e de escrita assistida dentro do proprio workflow.
- O n8n tambem possui MCP nativo em duas frentes: pode atuar como `MCP client` para consumir ferramentas externas e pode expor workflows e ferramentas via `MCP server`.
- A documentacao atual do n8n indica que o acesso MCP em nivel de instancia pode permitir a clientes compativeis buscar workflows, executa-los e tambem criar ou editar workflows e data tables, desde que o MCP esteja habilitado e autenticado na instancia.
- O n8n tem um node `n8n` para operar a propria instancia via API, incluindo criar, atualizar, publicar e desativar workflows.
- Para Facebook, o n8n tem um node oficial de `Facebook Graph API`, mas a publicacao costuma exigir configuracao manual de endpoint, edge e credenciais adequadas.
- Eu nao encontrei, nesta rodada, documentacao oficial clara de um node built-in de TikTok no n8n. Leitura pratica: TikTok tende a depender de `HTTP Request`, node comunitario ou ferramenta intermediaria.
- A Meta confirma o ecossistema de colaboracoes no Instagram via `creator marketplace` e `partnership ads`, mas eu nao encontrei nesta pesquisa uma documentacao oficial clara de API publica para automatizar `collaborator tags` do tipo `post com coautor` como parte do fluxo de publicacao.
- Reels ja possuem suporte de publicacao via API oficial do Instagram Platform, mas isso nao confirma suporte a post colaborativo automatizado.
- Leitura pratica: Instagram colaborativo parece depender do app/fluxo nativo da plataforma ou de ferramentas intermediarias com suporte proprio; tratar como `a confirmar` antes de prometer no fluxo.

## Leitura Pratica
- A base documental mais segura hoje e o repertorio local.
- A identidade publica deve ser tratada como provisoria ate surgirem fotos, bios e links oficiais da dupla.
- A associacao com ceramica sugere uma camada artesanal e tactil que combina bem com o tom caloroso do projeto, mas isso e uma inferencia de branding, nao uma assinatura oficial.
