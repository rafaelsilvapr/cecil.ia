# Fluxo De Publicacao Diaria

Este documento descreve a automacao proposta para publicar 1 video por dia, escolhendo o proximo item de forma aleatoria controlada ate fechar o ciclo, sem repetir antes de completar a lista.

## Objetivo
- ler a base viva de videos na planilha
- escolher 1 video por dia
- evitar repeticao ate o ciclo terminar
- gerar legenda especifica para cada plataforma
- publicar ou agendar nas contas certas
- registrar o status final e o historico de publicacao

## Base De Dados
A planilha nativa criada no Drive e a fonte operacional:
- aba `publicacao_diaria`
- coluna `video_id`
- coluna `nome_arquivo`
- coluna `musica`
- coluna `autor_compositor`
- coluna `interprete_associado`
- coluna `tipo_musica`
- coluna `origem_pasta`
- coluna `trecho`
- coluna `duracao`
- coluna `energia`
- coluna `ciclo`
- coluna `status`
- coluna `legenda_tiktok`
- coluna `legenda_facebook`
- coluna `legenda_youtube`
- coluna `cta`
- coluna `agenda_proxima_data`
- coluna `agenda_proxima_local`
- coluna `spotify`
- coluna `observacoes`

## Como O Fluxo Funciona

### 1. Disparo Diario
O cenaro roda em horario fixo, de preferencia no horario da equipe.
O gatilho nao deve depender de arquivo novo. Ele precisa rodar mesmo quando nada entrou na pasta naquele dia, porque o criterio principal e a fila de publicacao, nao o upload.

### 2. Leitura Da Fila
O fluxo consulta a planilha e filtra apenas os registros elegiveis:
- `status = raw`
- `status = selected`
- `status = captioned`
- ou outra regra que voces definirem para "pronto para publicar"

Depois disso, ele exclui:
- itens ja publicados
- itens arquivados
- itens pausados manualmente
- itens com problemas de direito ou sem autorizacao

### 3. Definicao Do Ciclo
O ciclo e a forma de garantir aleatoriedade sem repeticao.

A logica recomendada e:
1. pegar todos os videos elegiveis
2. embaralhar a lista
3. salvar a ordem numa memoria persistente
4. marcar o ciclo atual com um numero ou hash
5. consumir 1 item por dia, sempre do topo da fila

Quando a fila acabar:
1. gerar uma nova ordem aleatoria
2. iniciar um novo ciclo
3. voltar a consumir do topo

### 4. Selecionar O Video Do Dia
O fluxo escolhe apenas 1 item por execucao.
Esse item precisa carregar:
- ID do arquivo
- nome da musica
- autor, quando houver
- interprete associado
- trecho ou intervalo
- energia
- agenda
- link de Spotify, quando for autoral

### 5. Buscar O Arquivo No Drive
Depois de selecionar o registro, o fluxo busca o video no Drive usando o `video_id` ou a referencia salva na planilha.
Se o arquivo nao for encontrado, ele nao deve seguir adiante. Deve marcar erro e parar a execucao daquele item.

### 6. Gerar Legendas
A legenda precisa ser gerada por plataforma, usando a regra editorial do projeto.

Base de escrita:
- gancho inicial
- contexto curto
- valor musical ou emocional
- CTA simples

O agente de texto deve considerar:
- nome da musica
- quem ficou conhecido cantando
- quem compoe, quando confirmado
- se a musica e autoral
- agenda da proxima apresentacao, se houver
- chamada para Spotify ou outro streaming, se a musica for autoral

### 7. Publicar Em Cada Plataforma
O fluxo pode publicar em tres niveis:
- TikTok
- Facebook
- YouTube

Para Instagram, a recomendacao atual e tratar como caso separado, porque a publicacao colaborativa automatica nao ficou confirmada como suporte oficial no caminho pesquisado.

### 8. Atualizar Status
Depois da publicacao, a planilha deve ser atualizada com:
- `status = published`
- legenda final usada
- data e hora da publicacao
- plataforma publicada
- observacoes de erro, se houver

Se a publicacao falhar em uma plataforma, o ideal e gravar isso como:
- `partial_publish`
- ou um status equivalente de "publicado parcialmente"

### 9. Arquivar O Material
Quando tudo der certo:
- o arquivo sai da fila de ativos
- a linha fica historica
- o video pode ir para uma pasta de publicados

Se o fluxo for reprocessado, ele precisa ignorar o que ja esta em `published` ou `archived`.

## Estrutura Recomendada No Make

### Modulo 1: Scheduler
Dispara 1 vez por dia.
Nao usar "watch files" como gatilho principal se a meta e publicar aleatoriamente.

### Modulo 2: Google Sheets - Ler Linhas
Busca a tabela `publicacao_diaria`.
Filtra o que pode entrar no dia.

### Modulo 3: Memory / Data Store
Guarda:
- ciclo atual
- lista embaralhada do ciclo
- posicao da proxima publicacao
- ultimo `video_id` publicado

### Modulo 4: Google Drive - Recuperar Arquivo
Obtencao do video cru ou do recorte pronto.

### Modulo 5: Agente De Texto
Gera:
- legenda TikTok
- legenda Facebook
- legenda YouTube

### Modulo 6: Publicadores
Uma rota por plataforma:
- TikTok
- Facebook
- YouTube

### Modulo 7: Google Sheets - Atualizar Linha
Marca o resultado final.

### Modulo 8: Registro De Erros
Se algo falhar, salva:
- plataforma
- tipo de falha
- timestamp
- acao manual necessaria

## Como O Ciclo Aleatorio Deve Ser Guardado
O ponto mais importante da automacao e nao perder a ordem sorteada.

Recomendacao:
- a ordem embaralhada nao deve ser recalculada todo dia
- ela deve ser salva em memoria persistente
- cada execucao do dia le a proxima posicao
- quando chegar no fim, gera nova ordem

Se nao fizer isso, a automacao pode repetir videos antes da hora.

## Onde Estao Os Possiveis Erros

### 1. Usar Watch Files Em Vez De Scheduler
Esse e o erro mais comum.
Se o cenário depender de arquivo novo, ele nao vai obedecer a logica "1 por dia".
Vai obedecer a entrada de arquivo.

### 2. Nao Persistir A Ordem Do Ciclo
Se a lista for embaralhada de novo em toda execucao, o ciclo perde sentido.
Pode repetir videos ou pular itens sem controle.

### 3. Planilha Sem Status Claro
Se o status nao estiver padronizado, a automacao vai misturar:
- pronto para postar
- ja postado
- pausado
- a confirmar

Isso costuma gerar duplicacao e postagem errada.

### 4. Nome De Arquivo Ambiguo
Vocabulos como:
- nome da musica
- nome do interprete
- nome do compositor
- nome do arquivo

podem se confundir facilmente.
Se o parser do nome do arquivo nao for muito bem definido, a automacao vai errar a musica ou a autoria.

### 5. Autor E Interprete Misturados
Algumas musicas sao mais conhecidas pelo interprete do que pelo compositor.
Se a planilha nao separar isso, a legenda pode sair errada ou imprecisa.

### 6. Faltas De Dados
Se faltar:
- duracao
- trecho
- autor
- link de streaming
- agenda

o agente precisa saber o que fazer.
Sem regra de fallback, ele pode inventar ou travar.

### 7. Instagram Colaborativo
Esse e um ponto sensivel.
Eu nao consegui confirmar, na pesquisa feita, um caminho oficial simples para automatizar post colaborativo no Instagram da mesma forma que uma publicacao comum.

Risco pratico:
- tentar automatizar uma funcao que a plataforma nao expõe bem
- achar que o post sera colaborativo, mas ele sair apenas como publicacao normal

### 8. TikTok Com Varios Perfis
TikTok costuma ser menos flexivel para fluxo "colaborador".
Se houver mais de uma conta, e melhor tratar como publicacao separada por conta.

### 9. Agente De IA Sem Trava
Se o agente tiver liberdade demais, ele pode:
- alongar legenda
- inventar CTA
- falar de agenda inexistente
- misturar composicao com interprete

Por isso, a IA deve gerar texto dentro de regras fixas.

### 10. Conflito De Fuso Horario
O trabalho esta no fuso de Sao Paulo, mas a planilha criada veio com timezone diferente.
Se o agendamento ignorar o fuso correto, os posts podem sair fora do horario esperado.

### 11. Execucoes Sobrepostas
Se a automacao disparar antes da execucao anterior terminar, pode acontecer:
- dois videos escolhidos no mesmo dia
- dois updates na mesma linha
- status sobrescrito

### 12. Falha Na Atualizacao Da Planilha
Se o update da linha falhar depois da publicacao, o sistema pode achar que o video ainda esta pendente.
Isso cria duplicacao na proxima rodada.

### 13. Movimento De Arquivo
Se o arquivo nao for movido ou marcado como publicado, ele continua aparecendo como elegivel.

### 14. Direitos E Uso
Se o material nao tiver observacao de uso, a automacao pode publicar algo que ainda estava pendente de aprovacão.

## Regras De Seguranca Que Eu Recomendo
- nunca publicar sem `status` claro
- nunca deixar a IA inventar autor, agenda ou link
- nunca recalcular o ciclo inteiro no meio do ciclo sem necessidade
- nunca considerar `agenda_proxima_data` quando ela estiver vazia
- nunca tratar colaboracao do Instagram como garantida sem teste real

## Sugestao De Estado Minimo
Eu sugiro estes estados:
- `raw`
- `selected`
- `captioned`
- `approved`
- `scheduled`
- `published`
- `archived`
- `error`

## O Que Eu Faria Primeiro Na Implementacao
1. criar a tabela final com as colunas definitivas
2. definir os status oficiais
3. criar a memoria do ciclo aleatorio
4. publicar apenas 1 plataforma primeiro, para testar
5. depois ligar as outras
6. por ultimo, validar Instagram e colaboracao

## Resumo Pratico
O fluxo correto nao e "ver se entrou video novo e postar".
O fluxo correto e:
1. rodar todo dia
2. ler a fila
3. escolher o proximo video do ciclo salvo
4. gerar legendas com regras
5. publicar
6. gravar o resultado
7. seguir para o proximo dia

Se qualquer uma dessas etapas nao persistir estado, o ciclo fica instavel.
