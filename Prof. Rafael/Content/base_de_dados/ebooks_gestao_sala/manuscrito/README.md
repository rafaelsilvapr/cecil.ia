# Manuscrito — Gestão de sala de aula sem caos

Fonte em Markdown: **um ficheiro por protocolo** (subcapítulo), para edição no Cursor/Claude/Codex e exportação para `Produtos/` (DOCX/PDF).

## Hierarquia (leia antes de editar)

| Conceito | O que é |
| --- | --- |
| **6 capítulos** | Partes principais do livro (macro blocos temáticos). |
| **~40 protocolos** | Unidades curtas (~2 páginas), também chamadas **subcapítulos**. Cada uma é um `protocolo-NN-*.md`. |
| **Numerador `NN` (01–40)** | Índice global do protocolo no projeto, **não** o número do capítulo do livro. |

Referência canónica: `Content/00_direcao/GUIA_OFICIAL_40_PROTOCOLOS.md`

## Ordem sugerida de montagem

1. `00_apresentacao.md`
2. `01_introducao.md`
3. `protocolo-01-*.md` … `protocolo-40-*.md` (ordem pelo número no nome)
4. `90_referencias.md`
5. `91_glossario.md`
6. `92_indice_remisivo.md`

## Mapa `protocolo-NN` → capítulo do livro

| Capítulo do livro | Ficheiros `protocolo-NN` | Tema |
|---:|---|---|
| 1 | 01–08 | Organização do ambiente e rotina |
| 2 | 09–14 | Prevenção e preparação (6 protocolos finais; 8 temas-candidatos no mapa editorial) |
| 3 | 15–21 | Gestão do fluxo da aula |
| 4 | 22–33 | Correção e desescalada |
| 5 | 34–37 | Relação e clima |
| 6 | 38–40 | Família, equipe e apoio externo |

O YAML de cada ficheiro inclui `capitulo_livro` e `numero_protocolo` para filtros e scripts.

## Convenções

- **Slug ASCII** no nome do ficheiro após `protocolo-NN-`; título com acentos no front matter e no primeiro `#`.
- Renomeie o ficheiro se mudar o slug, **mantendo** o prefixo `protocolo-NN-` coerente com a ordem global.
- **Nota Cap. 2:** o `GUIA_OFICIAL` e o mapa editorial podem listar **8 temas-candidatos** para Prevenção; esta pasta usa **6 ficheiros** (09–14) como protocolos finais do manuscrito. Assim, `temas-candidatos` e `protocolos finais` deixam de competir entre si.

## Próximo passo técnico (opcional)

- Um script `pandoc` ou Python (`python-docx`) que concatena os ficheiros na ordem acima e gera o `.docx` em `Produtos/`.
