# Manifesto Make - Cibele e Rafa Publicacao Diaria

## Dados Basicos
- nome_do_scenario: `Cibele e Rafa - Publicacao Diaria`
- objetivo: publicar 1 video por dia com ciclo persistido, legenda por plataforma e checagem semanal de agenda
- timezone: `America/Sao_Paulo`
- tipo: `scheduler`

## Fonte de Verdade
- spreadsheet_id: `1wzxSkFec9ASfZjQThExFBN2tdV1axkQVLHn7jQPXgK4`
- catalog_sheet: `catalogo_videos`
- log_sheet: `publicacoes_log`
- cycle_sheet: `cycle_state`
- media_folder_id: `1alP2wrtcN78j-YzWURMCazvw7BZjorvL`
- calendar_id: `a confirmar`

## Regras Fixas
- escrever sempre `Cibele`
- nunca escrever `Cybele`
- nunca citar `Spotify`
- CTA principal: convidar as pessoas a buscar `Samba da Gabriela` e outras composicoes de Rafael da Silva nas plataformas de streaming de audio e no YouTube
- se houver show na agenda da semana, incluir bloco de servico com `o que`, `quando`, `onde` e, quando fizer sentido, `com quem`
- se nao houver show, usar CTA para buscar `Samba da Gabriela` e outras composicoes de Rafael da Silva nas plataformas de streaming de audio e no YouTube, alem de acompanhar os canais
- entradas com `Rafael da Silva` no titulo ou compositor indicam autoria propria
- usar `origem_autoral = autor_proprio` quando a obra for do proprio Rafael
- hashtags por plataforma
- usar `#samba` quando fizer sentido e `#shorts` no YouTube quando for short
- nao mover arquivos entre pastas
- nao mexer na branch de publicacao que ja funciona; este blueprint prepara, publica e registra

## Estrutura Recomendada
1. scheduler diario
2. leitura do estado de ciclo
3. selecao do video do dia
4. leitura da agenda da semana
5. geracao das legendas e hashtags
6. publicacao nas plataformas
7. registro em log
8. atualizacao do ciclo

## Agente Editorial
- usar um unico agente de legenda como passo intermediario entre selecao e publicacao
- entrada do agente: linha selecionada do catalogo, resumo da agenda da semana e regras editoriais fixas
- saida do agente: JSON estruturado com legendas e hashtags separadas por plataforma
- implementar esse agente com o module `openai-gpt-3:CreateCompletion` em modo `chat` e `response_format = json_object`
- campos esperados na saida:
  - `caption_tiktok`
  - `hashtags_tiktok`
  - `caption_instagram`
  - `hashtags_instagram`
  - `caption_facebook`
  - `hashtags_facebook`
  - `caption_youtube`
  - `hashtags_youtube`
  - `show_mentioned`
  - `cta_type`
- o agente nao publica, nao move arquivo e nao decide ciclo; ele so escreve a camada editorial
- se o modulo de IA nao estiver confirmado no tenant, esse agente fica como especificacao e nao entra no shell importavel
- quando for pedido um prompt de agente, entregar sempre o texto completo, reformulado e pronto para copiar e colar, sem exigir que o usuario procure trechos para alterar

## Guardrails De Importacao
- sempre partir de um shell exportado e validado no Make quando o objetivo for importar
- nunca inventar nomes de modulo, versao ou familia de app sem confirmar no tenant
- se um modulo nao estiver confirmado, tratar como rascunho e nao como JSON importavel
- manter um unico upload de midia compartilhado antes do roteamento das plataformas
- nao duplicar a mesma subida de arquivo em rotas diferentes sem necessidade tecnica explicita
- preservar a topologia de um trecho que ja funciona; mudar so o minimo necessario
- separar claramente `draft`, `import shell` e `scenario final`
- se o import acusar `Module Not Found`, revisar primeiro modulo, versao, placeholders de conexao e ids duplicados
- se o fluxo ja publica bem, nao mexer na branch de publicacao; alterar somente a camada que estiver fora do caminho de saida

## Campo Editorial
- `origem_autoral`
  - `autor_proprio`
  - `obra_terceiros`
  - `interpretacao_destacada`
  - `equilibrado`
