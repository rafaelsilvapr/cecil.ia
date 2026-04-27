# Protocolo de Agentes

Este vault e um segundo cerebro em Markdown. A prioridade e simplicidade, consistencia e ausencia de duplicacao.

## Ordem de operacao
1. Ler `00_Sistema/INDEX.md`.
2. Ler `00_Sistema/MODELO_DE_NOTAS.md`.
3. Procurar notas existentes antes de criar novas.
4. Atualizar a nota canonica quando houver sobreposicao.
5. Registrar alteracoes relevantes em `00_Sistema/CHANGELOG.md`.

## Regras gerais
- Prefira atualizar notas existentes em vez de criar duplicatas.
- Crie nota nova apenas quando a ideia, referencia ou experiencia for realmente atomica.
- Use links internos `[[...]]` para conectar conhecimento.
- Se faltar contexto, registre em `00_Inbox/` em vez de adivinhar.
- Mantenha textos curtos, concretos e acionaveis.

## Regras de criacao e atualizacao
- `Ideia`: quando for um insight bruto, um problema ou uma hipoteses ainda nao consolidada.
- `Protocolo`: quando houver um passo a passo pratico, idealmente com base em evidencia.
- `Referencia`: quando a fonte precisar ser rastreavel, com autor, obra, artigo ou video.
- `Experiencia`: quando houver um caso real, historia, teste ou aprendizado aplicado.
- `Projeto`: quando a nota estiver ligada a execucao, entregas, decisoes ou andamento.

## Regras de linkagem
- Cada nota permanente deve apontar para pelo menos uma nota relacionada, quando isso fizer sentido.
- Projetos devem apontar para protocolos, referencias e experiencias.
- Protocolos devem apontar para referencias e, quando possivel, para experiencias.
- Experiencias devem apontar para o protocolo ou referencia que foram aplicados.
- Evite repetir conteudo que ja existe em outra nota canonica.

## Regras de nomes
- Use ASCII, minusculas e hifens.
- Evite acentos, espacos e nomes muito longos.
- Prefira prefixos por tipo:
  - `ideia-`
  - `protocolo-`
  - `referencia-`
  - `experiencia-`
  - `projeto-`

## Controle de mudancas
- Toda alteracao importante deve ser registrada em `00_Sistema/CHANGELOG.md`.
- Mudancas pequenas podem ser agrupadas por dia.
- Se uma alteracao substituir uma nota canonica, mantenha um link para a nota antiga, quando util.

## Regra de conflito
- Se houver duvida entre criar ou atualizar, procure a nota mais parecida e atualize-a.
- Se ainda houver incerteza, registre no Inbox com a duvida explicita.
