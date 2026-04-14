# Plano de Mapeamento de Mercado - E-books sobre Gestao de Sala de Aula

## Objetivo
Construir uma base de dados que oriente:

- naming do produto
- copy de vendas
- estrutura do e-book
- direcao de capa, contracapa e criativos
- posicionamento comercial

O foco nao e apenas listar livros. O foco e entender:

- o que esta sendo prometido
- para quem esta sendo vendido
- como a dor esta sendo enquadrada
- quais sinais publicos indicam tracao
- quais temas convertem mais em compra ou interesse

## Regra central de metodo
Separar sempre 3 tipos de dado:

1. Dado publico comprovado
2. Proxy publica
3. Inferencia analitica

Isso evita misturar fato com chute.

Exemplo:

- `preco exibido na pagina`: dado publico comprovado
- `pagina vista 2.790 vezes`: dado publico comprovado
- `numero de reviews`: proxy publica de tracao
- `esse produto provavelmente vende bem`: inferencia analitica

## O que e realisticamente coletavel
### Coletavel com boa confianca
- titulo
- subtitulo
- autor ou marca
- plataforma
- preco
- formato do produto
- URL da pagina de vendas
- copy principal
- bullets de promessa
- capa e outras imagens publicas
- CTA
- bonus
- garantias
- prova social publica, quando existir
- categorias e tags, quando existirem

### Coletavel so em alguns casos
- numero de alunos ou compradores exibido na pagina
- notificacoes de interesse ou compras recentes
- numero de avaliacoes
- ranking publico
- visualizacoes da pagina

### Normalmente nao coletavel de forma publica
- numero exato de cliques do anuncio
- numero exato de vendas
- taxa de conversao
- EPC
- ROI de campanha

Quando isso nao estiver publico, registrar:

- `nao publico`
- `nao encontrado`
- `requer proxy`

## Plataformas prioritarias
### Camada 1 - marketplaces e vitrines publicas
Comecar aqui porque possuem busca aberta, metadados indexados ou paginas com estrutura previsivel.

- Hotmart Marketplace
- Amazon Kindle
- Google Books / Google Play Livros
- Clube de Autores
- UICLAP

### Camada 2 - plataformas de checkout e infoproduto
Entrar depois, porque a busca costuma depender de Google, redes sociais, anuncios ou checkout direto.

- Kiwify
- Eduzz
- Perfect Pay
- Braip
- Monetizze

### Camada 3 - descoberta por distribuicao
Usar para encontrar ofertas que nao aparecem facil em marketplace.

- Google com operadores de busca
- YouTube descricoes e links
- Instagram bio e destaques
- Meta Ad Library
- Google Ads Transparency Center

## Observacoes operacionais importantes
- Hotmart pode exibir sinais de interesse ou compras recentes no checkout quando o produtor habilita esse recurso; isso deve entrar como proxy publica e nao como venda total.
- Kiwify e Eduzz tem dados de vendas em dashboards e APIs do proprio produtor; isso nao deve ser tratado como metricas publicas de concorrente.
- Clube de Autores e especialmente util porque algumas paginas exibem visualizacoes da pagina, preco, autor, categorias e metadados do livro.

## Estrutura da base
### 1. Tabela principal de ofertas
Uma linha por produto.

Colunas nucleares:

- `coleta_id`
- `data_coleta`
- `plataforma`
- `tipo_fonte`
- `categoria`
- `titulo`
- `subtitulo`
- `autor_marca`
- `editora_produtor`
- `preco_principal`
- `moeda`
- `parcelamento`
- `formato`
- `paginas_ou_duracao`
- `publico_alvo`
- `url_pagina_vendas`
- `url_checkout`
- `url_capa`
- `headline_principal`
- `promessa_central`
- `mecanismo_ou_metodo`
- `principais_bullets`
- `dor_principal`
- `beneficio_principal`
- `prova_social_texto`
- `garantia_ou_risco_reverso`
- `bonus`
- `cta`
- `escassez_urgencia`
- `avaliacao_media`
- `qtd_avaliacoes`
- `qtd_reviews_publicas`
- `qtd_alunos_publica`
- `qtd_vendas_publica`
- `qtd_cliques_publica`
- `qtd_visualizacoes_pagina_publica`
- `ranking_publico`
- `indicador_tendencia_publico`
- `tipo_metrica_publica`
- `confianca_metrica`
- `observacoes`
- `fonte_1`
- `fonte_2`
- `fonte_3`

### 2. Tabela de sinais de demanda
Uma linha por dor, desejo, objecao ou linguagem recorrente.

- `sinal_id`
- `data_coleta`
- `tema_macro`
- `subtema`
- `frase_literal_publico`
- `fonte_tipo`
- `plataforma_origem`
- `produto_relacionado`
- `url_fonte`
- `sinal_de_dor`
- `sinal_de_desejo`
- `sinal_de_objecao`
- `nivel_frequencia`
- `forca_comercial`
- `observacoes`

### 3. Tabela de ativos visuais
Uma linha por capa, mockup, contracapa, preview ou screenshot salvo.

- `ativo_id`
- `data_coleta`
- `produto_relacionado`
- `plataforma`
- `tipo_ativo`
- `nome_arquivo`
- `caminho_local`
- `url_origem`
- `hash_ou_slug`
- `status_captura`
- `observacoes`

## Pastas de armazenamento
- `Content/base_de_dados/ebooks_gestao_sala/assets/capas`
- `Content/base_de_dados/ebooks_gestao_sala/assets/contracapas`
- `Content/base_de_dados/ebooks_gestao_sala/raw/sales_pages`
- `Content/base_de_dados/ebooks_gestao_sala/raw/metadata`

## Estrategia para gastar poucos tokens
### Etapa 1 - coleta estrutural sem LLM
Usar busca, planilha e extracao simples para levantar:

- titulo
- autor
- preco
- plataforma
- link
- capa
- metadados publicos

Objetivo: montar universo inicial de 50 a 100 ofertas.

### Etapa 2 - filtragem
Classificar e priorizar apenas as 20 a 30 ofertas mais relevantes por:

- proximidade com o tema
- clareza da promessa
- forca dos sinais publicos
- adequacao ao publico professor

### Etapa 3 - leitura qualitativa com LLM
Usar modelo apenas para resumir:

- angulos de venda
- promessas repetidas
- mecanismos prometidos
- objecoes atacadas
- lacunas de mercado

### Etapa 4 - sintese estrategica
Transformar a base em decisoes:

- territorios de titulo
- tese de posicionamento
- copy da pagina
- sumario do e-book
- direcao de capa

## Queries de descoberta sugeridas
### Busca aberta
- `site:hotmart.com/pt-br/marketplace/produtos professor sala de aula`
- `site:hotmart.com/pt-br/marketplace/produtos indisciplina escolar`
- `site:clubedeautores.com.br/livro gestao da sala de aula`
- `site:uiclap.com gestao de sala de aula professor`
- `site:books.google.com "gestao de sala de aula"`

### Busca por pagina de venda fora de marketplace
- `"gestao de sala de aula" "comprar agora"`
- `"indisciplina escolar" ebook professor`
- `"disciplina escolar" professora ebook`
- `"professor" "sala de aula" "kiwify"`
- `"professor" "sala de aula" "eduzz"`

## Taxonomia inicial de temas
Usar esta taxonomia para classificar cada oferta:

- controle da turma
- autoridade sem gritar
- regras e combinados
- rotina e transicoes
- indisciplina recorrente
- conflito com familia
- gestao emocional do professor
- planejamento pratico
- atividades prontas
- engajamento da turma
- inclusao e comportamento
- reducao do desgaste docente

## Como a base vai orientar o produto
### Titulos
Vamos procurar o que domina hoje:

- promessa direta
- formula pratica
- dor + alivio
- autoridade pedagogica
- ganho emocional

### Copy
Vamos identificar:

- quais dores abrem a venda
- quais mecanismos parecem novos
- quais garantias diminuem a resistencia
- quais palavras o mercado usa para nao soar academico demais

### Capa
Vamos mapear:

- padrao de cor
- densidade de texto
- nivel de sobriedade vs praticidade
- sinais de "manual util" vs "livro teorico"

## Sequencia recomendada de execucao
1. Montar a base inicial com 50 a 100 ofertas.
2. Deduplicar por autor, titulo e reempacotamentos muito proximos.
3. Priorizar 20 a 30 ofertas para leitura completa de copy.
4. Extrair 10 a 15 padroes fortes de promessa e linguagem.
5. Definir 3 a 5 territorios de posicionamento para o novo e-book.
6. Criar 10 opcoes de titulo sem depender literalmente de "disciplina" ou "gestao de sala de aula".
7. Criar a VSL curta, pagina de vendas e direcao de capa.

## Entregaveis esperados
- base de dados consolidada
- ranking das ofertas mais relevantes
- mapa de promessas
- mapa de dores e desejos
- territorios de naming
- estrutura da copy
- direcao visual da capa e contracapa
