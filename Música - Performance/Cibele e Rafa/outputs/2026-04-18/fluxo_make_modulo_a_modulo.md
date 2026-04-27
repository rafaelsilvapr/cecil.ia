# Fluxo Make - Modulo A Modulo

Este desenho separa a automacao em dois cenarios:
- `Cenario 1`: entrada e atualizacao do banco de videos
- `Cenario 2`: publicacao diaria com ciclo aleatorio sem repeticao

A divisao em dois cenarios e importante porque a origem dos dados e a rotina de publicacao nao tem o mesmo ritmo.

## Visao Geral

### Cenário 1 - Ingestão
Responsavel por detectar novos arquivos na pasta do Drive, registrar ou atualizar a linha da planilha e deixar o item pronto para curadoria.

### Cenário 2 - Publicação Diária
Responsavel por rodar 1 vez por dia, escolher o próximo video da fila, gerar as legendas e publicar nas plataformas.

### Estado Persistente
Um Data Store deve guardar:
- ciclo atual
- ordem embaralhada do ciclo
- posicao atual dentro do ciclo
- ultimo `video_id` publicado
- data da ultima execucao
- eventuais travas de concorrencia

---

# Cenário 1 - Ingestão Da Pasta

## Objetivo
Registrar no banco tudo o que entra na pasta antes de qualquer publicacao.
Esse fluxo alimenta a planilha `publicacao_diaria`.

## Módulo 1 - Google Drive Watch Files Ou List Folder
### Funcao
Detectar novos arquivos no diretorio de videos.

### Uso Recomendado
- se a pasta tiver entrada frequente, usar watch
- se a pasta tiver muitos arquivos antigos ou reorganizacoes, prefira uma checagem agendada com listagem e deduplicacao

### Saida Esperada
- ID do arquivo
- nome do arquivo
- data de criacao
- link do arquivo

### Erro Tipico
Se o fluxo depender apenas de watch e a pasta for movida, renomeada ou reorganizada, arquivos antigos podem sair da visibilidade e o banco fica incompleto.

## Módulo 2 - Google Sheets Search Rows
### Funcao
Procurar se o `video_id` ja existe na aba `publicacao_diaria`.

### Regra
- se existir, atualizar
- se nao existir, criar nova linha

### Erro Tipico
Sem essa checagem, o mesmo video pode ser registrado duas vezes.

## Módulo 3 - Parser De Nome
### Funcao
Separar o nome do arquivo em campos editáveis.

### Campos Que Ele Tenta Inferir
- musica
- autor_compositor
- interprete_associado
- tipo_musica

### Regra Editorial
Se o parser nao conseguir confirmar, escrever `a confirmar` e nao inventar.

### Erro Tipico
Nome de arquivo ambíguo pode ser lido como música quando na verdade traz o intérprete ou uma homenagem.

## Módulo 4 - Google Sheets Add/Update Row
### Funcao
Criar ou atualizar a linha da planilha.

### Campos Mínimos
- `video_id`
- `nome_arquivo`
- `musica`
- `autor_compositor`
- `interprete_associado`
- `origem_pasta`
- `status`
- `observacoes`

### Status Inicial Recomendado
- `raw`

### Erro Tipico
Se a linha entrar já com status errado, o cenário de publicação pode tentar publicar um item incompleto.

## Módulo 5 - Normalização De Status
### Funcao
Garantir que todo item novo siga o mesmo padrão de estado.

### Regra
Se faltar informação essencial, manter:
- `status = raw`
- `observacoes` com o ponto pendente

### Erro Tipico
Misturar `raw`, `selected` e `approved` no mesmo sentido operacional gera confusão e publicacao prematura.

---

# Cenário 2 - Publicação Diária

## Objetivo
Rodar 1 vez por dia e publicar apenas 1 video, sem repetir antes do fim do ciclo.

## Módulo 1 - Scheduler
### Funcao
Disparar o cenário em horario fixo.

### Configuracao Recomendada
- 1 vez por dia
- horario fixo da equipe
- fuso de Sao Paulo

### Observacao
Nao usar gatilho por arquivo novo aqui. O gatilho tem que ser por tempo, nao por entrada.

### Erro Tipico
Se este cenário virar watch de pasta, ele deixará de ser diário e passará a depender da chegada de arquivos.

## Módulo 2 - Google Sheets Search Rows
### Funcao
Buscar todos os registros que podem entrar na fila de publicação.

### Filtro Base
- `status = raw`
- `status = selected`
- `status = captioned`
- ou qualquer status definido como elegivel por vocês

### Exclusoes
- `published`
- `archived`
- `error`
- itens manualmente pausados

### Erro Tipico
Se o filtro aceitar estados errados, o cenário vai republicar vídeo já usado ou pular controle de curadoria.

## Módulo 3 - Data Store Get Record
### Funcao
Ler o estado do ciclo atual.

### Chaves Sugeridas
- `cycle_id`
- `cycle_order`
- `cycle_position`
- `last_video_id`
- `last_run_at`

### Erro Tipico
Se o ciclo nao for persistido, todo dia o embaralhamento muda e o sistema perde a memoria de repeticao.

## Módulo 4 - Router: Ciclo Vazio Ou Ciclo Ativo
### Funcao
Separar dois casos:
- existe fila salva para consumir
- fila acabou e precisa gerar novo ciclo

### Caminho A - Ciclo Ativo
Segue para pegar o próximo item da lista persistida.

### Caminho B - Novo Ciclo
Gera uma nova ordem aleatória com todos os itens elegíveis.

### Erro Tipico
Não diferenciar esses dois casos faz o cenário travar ou repetir o mesmo bloco para sempre.

## Módulo 5 - Gerador De Ordem Aleatoria
### Funcao
Criar uma lista embaralhada só no início do ciclo.

### Implementacao Recomendavel
Existem duas formas seguras:
- usar um passo de código pequeno para embaralhar a lista
- ou calcular uma ordenação pseudoaleatória e gravar a ordem no Data Store

### Regra
A ordem não pode ser recalculada toda vez que o cenário roda.

### Erro Tipico
Se o embaralhamento acontecer diariamente, o ciclo deixa de existir.

## Módulo 6 - Data Store Set Record
### Funcao
Salvar a ordem do ciclo e a posicao atual.

### Exemplo De Estado
- `cycle_id = 2026-04-18-A`
- `cycle_position = 7`
- `cycle_order = [id3, id9, id1, id8...]`

### Erro Tipico
Salvar só a posição sem salvar a ordem não resolve nada, porque a lista pode mudar entre execuções.

## Módulo 7 - Selecionar O Próximo Video
### Funcao
Pegar o item da posicao corrente no ciclo.

### Regra
- se `cycle_position` ainda existir na lista, usar esse item
- se a posição passar do fim, regenerar ciclo

### Erro Tipico
Pular a conferência de fim de fila pode gerar erro de índice ou retorno vazio.

## Módulo 8 - Google Drive Get A File
### Funcao
Buscar o video associado ao `video_id`.

### Saida Esperada
- nome
- data
- link de download
- binario do arquivo

### Erro Tipico
Se o arquivo tiver sido movido ou renomeado sem atualização da linha, o cenário não encontra o video.

## Módulo 9 - Gerador De Legendas
### Funcao
Criar as legendas por plataforma.

### Entrada
- musica
- autor_compositor
- interprete_associado
- energia
- agenda_proxima_data
- agenda_proxima_local
- spotify
- observacoes

### Saida
- `legenda_tiktok`
- `legenda_facebook`
- `legenda_youtube`

### Implementacao Recomendada
Se o Make AI Agents (New) estiver disponivel na conta:
- usar `Make AI Agents (New) > Run an agent`
- fornecer as regras de tom e a base de legenda como conhecimento

Se nao estiver:
- usar um módulo de HTTP para um modelo externo
- ou gerar texto com template controlado

### Regras De Segurança Do Texto
- nao inventar agenda
- nao inventar autoria
- nao aumentar a legenda sem necessidade
- nao usar hashtag demais

### Erro Tipico
Um agente com liberdade demais pode trocar o compositor pelo intérprete ou criar CTA que não existe.

## Módulo 10 - Router Por Plataforma
### Funcao
Separar a publicação em rotas independentes.

### Rotas
- TikTok
- Facebook
- YouTube

### Erro Tipico
Se tudo for uma única rota, uma falha numa plataforma pode impedir as outras.

## Módulo 11 - TikTok Publish
### Opção
Usar o conector de publicação disponível na conta ou um intermediário como Blotato, se esse for o caminho já validado por vocês.

### Campos
- video
- legenda
- privacidade
- comentários

### Erro Tipico
TikTok costuma exigir configuração específica de conta e permissões, então a rota pode falhar por credencial e não por lógica.

## Módulo 12 - Facebook Publish
### Opção
Publicar via Facebook Pages ou via intermediário.

### Campos
- arquivo
- descrição
- título
- página

### Erro Tipico
Se a conta/página não estiver ligada corretamente, a publicação falha apesar de o vídeo estar correto.

## Módulo 13 - YouTube Upload
### Opção
Upload via módulo nativo do YouTube.

### Campos
- título
- descrição
- categoria
- privacidade
- arquivo

### Erro Tipico
YouTube tem limites e validações próprias de descrição, título e formato de arquivo.

## Módulo 14 - Instagram Branch
### Recomendação
Deixar fora da primeira versão automatizada.

### Motivo
A colaboração em Instagram não ficou confirmada como um fluxo oficial simples para automação completa.

### Como Tratar
- primeira versão: manual ou semi manual
- segunda versão: só depois de teste real

### Erro Tipico
Assumir que o post colaborativo vai funcionar como uma publicação comum.

## Módulo 15 - Google Sheets Update Row
### Funcao
Gravar o resultado da publicacao na linha.

### Campos A Atualizar
- `status = published`
- `legenda_tiktok`
- `legenda_facebook`
- `legenda_youtube`
- `observacoes`

### Erro Tipico
Se a linha não for atualizada, o próximo ciclo vai entender o item como ainda disponível.

## Módulo 16 - Data Store Update Record
### Funcao
Avancar a posicao do ciclo ou fechar o ciclo se acabou.

### Regra
- `cycle_position = cycle_position + 1`
- se passou do fim, gerar novo ciclo na próxima execução

### Erro Tipico
Se a posicao nao for incrementada depois da postagem, o mesmo item volta a ser escolhido.

## Módulo 17 - Error Handler
### Funcao
Capturar falhas por plataforma ou por etapa.

### O Que Registrar
- modulo que falhou
- plataforma
- timestamp
- mensagem de erro
- acao manual sugerida

### Status Sugerido
- `error`
- ou `partial_publish` quando apenas uma plataforma falhar

### Erro Tipico
Sem handler, o cenário quebra em silêncio ou para antes de gravar o problema.

---

# Roteiro De Publicacao

## Ordem Recomendada
1. Scheduler
2. Ler estado do ciclo
3. Ler planilha
4. Filtrar elegiveis
5. Gerar ou continuar ciclo
6. Selecionar video do dia
7. Buscar arquivo
8. Gerar legendas
9. Publicar por rota
10. Atualizar planilha
11. Atualizar Data Store
12. Registrar erros, se houver

## Ordem De Implantacao
### Fase 1
Publicar apenas em 1 plataforma e validar status.

### Fase 2
Ligar as outras duas plataformas.

### Fase 3
Tratar Instagram como experimento separado.

### Fase 4
Adicionar otimizações como melhores ganchos, agenda e CTA dinamico.

---

# Ponto Mais Critico

O erro mais perigoso nao e a legenda.
O erro mais perigoso e perder o estado do ciclo.

Se o ciclo nao for salvo em memoria persistente, o sistema deixa de ser "1 por dia sem repeticao" e vira apenas uma seleção aleatoria nova toda vez.

Esse e o ponto que eu protegeria com mais cuidado.
