# Modelo de Notas

Use este padrao para manter as notas consistentes e faceis de ler por humanos e agentes.

## Campos comuns
```md
---
type: ideia
status: inbox
created: 2026-04-14
tags: [tipo/ideia, status/inbox]
aliases: []
related: []
projects: []
---
```

## Ideia
```md
---
type: ideia
status: inbox
created: 2026-04-14
tags: [tipo/ideia, status/inbox]
aliases: []
related: []
projects: []
---

# Ideia: titulo curto

## Resumo
- Uma frase direta que explica a ideia.

## Contexto
- Onde surgiu.
- Qual problema tenta resolver.

## Valor
- Por que isso importa.

## Proximos passos
- O que pesquisar.
- O que testar.
- O que virar protocolo ou projeto.

## Links
- [[protocolo-exemplo]]
- [[experiencia-exemplo]]
```

## Protocolo
```md
---
type: protocolo
status: validado
created: 2026-04-14
tags: [tipo/protocolo, status/validado]
evidence_level: forte
aliases: []
related: []
---

# Protocolo: titulo curto

## Quando usar
- Contexto ideal de aplicacao.

## Passos
- Passo 1.
- Passo 2.
- Passo 3.

## Evidencia
- Base pratica ou cientifica.

## Quando nao usar
- Limites e riscos.

## Exemplo real
- Caso de uso concreto.

## Links
- [[referencia-exemplo]]
- [[experiencia-exemplo]]
```

## Referencia
```md
---
type: referencia
status: lido
created: 2026-04-14
tags: [tipo/referencia, status/validado]
reference_type: livro
author: ""
source_url: ""
aliases: []
related: []
---

# Referencia: titulo curto

## Tese central
- Ideia principal da fonte.

## Ideias uteis
- Ponto 1.
- Ponto 2.

## O que reaproveitar
- Conceitos, frases ou modelos.

## Limites
- O que a fonte nao resolve.

## Links
- [[protocolo-exemplo]]
- [[ideia-exemplo]]
```

## Experiencia
```md
---
type: experiencia
status: registrado
created: 2026-04-14
tags: [tipo/experiencia, status/registrado]
context: ""
aliases: []
related: []
projects: []
---

# Experiencia: titulo curto

## Situacao
- Onde aconteceu.
- Quem estava envolvido.

## O que aconteceu
- Fatos concretos.

## O que aprendi
- Licao principal.

## O que eu faria diferente
- Ajuste futuro.

## Links
- [[protocolo-exemplo]]
- [[referencia-exemplo]]
```

## Projeto
```md
---
type: projeto
status: ativo
created: 2026-04-14
tags: [tipo/projeto, status/ativo]
owners: []
aliases: []
related: []
---

# Projeto: titulo curto

## Objetivo
- Resultado esperado.

## Escopo
- O que entra.
- O que nao entra.

## Referencias
- [[referencia-exemplo]]

## Protocolos
- [[protocolo-exemplo]]

## Experiencias
- [[experiencia-exemplo]]

## Proximas acoes
- Proxima decisao.
- Proximo passo pratico.
```
