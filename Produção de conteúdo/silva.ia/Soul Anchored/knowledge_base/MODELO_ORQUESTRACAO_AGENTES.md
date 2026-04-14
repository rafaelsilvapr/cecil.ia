# Soul Anchored: Estratégia de Orquestração de Agentes

Este documento define a colaboração entre os diferentes agentes para a produção automatizada de vídeos longos, seguindo o fluxo **Thumbnail-First**.

## 1. Fluxo de Trabalho (Orquestração)

1.  **Agente Criativo & SEO (Antigravity):**
    -   **Gatilho:** Analisa o calendário de publicações ou solicitações manuais.
    -   **Ação:** Define o "Gancho Viral" (Frase de Capa) com base no banco de dados de concorrência (`concorrentes_youtube_top30_consolidado`).
    -   **Entrega:** Título, Thumbnail e Tema central.

2.  **Agente Roteirista (Modelo: Claude 3.5 Sonnet + NotebookLM):**
    -   **Entrada:** Tema central e Título.
    -   **Base de Dados (Protocolo de Fidelidade):** 
        1. O agente usa o **NotebookLM** para localizar os roteiros virais exatos que tratam do tema.
        2. O sistema recupera a **Transcrição na Íntegra** (Texto Bruto) desses documentos.
        3. O Sonnet recebe esses textos como "Contexto Mestre" para mimetizar cadência, vocabulário e ganchos de retenção específicos.
    -   **Ação:** Escreve um roteiro espiritual profundo seguindo a estrutura de sucesso comprovada.
    -   **Entrega:** Arquivo `.txt` na pasta `roteiros/pendentes/`.

3.  **Agente de Narração (Modelo: Gemini 2.5 Flash - Charon):**
    -   **Entrada:** Script da pasta `pendentes`.
    -   **Ação:** Gera o áudio em blocos (chunks) para garantir estabilidade e clareza.
    -   **Entrega:** Pasta temporária com segmentos de áudio sincronizados.

4.  **Agente de Montagem (Script: create_long_soul_video.py):**
    -   **Entrada:** Áudios segmentados + Banco de Loops (`assets/loops/`).
    -   **Ação:** Seleciona o loop, identifica versículos contextuais e gera o MP4 final.
    -   **Entrega:** Vídeo bruto com sobreposições contextuais.

5.  **Agente de Legendas (Modelo: Gemini/Script):**
    -   **Ação:** Gera o arquivo de legendas (`.srt`) sincronizado com o áudio final para garantir acessibilidade no YouTube/TikTok.
    -   **Entrega:** Arquivo de legenda pronto para upload e move o roteiro para `roteiros/publicados/`.

## 2. Estrutura de Pastas de Suporte

-   `/Soul Anchored/roteiros/pendentes/`: Fila de produção.
-   `/Soul Anchored/roteiros/publicados/`: Histórico de conteúdos postados.
-   `/Soul Anchored/assets/loops/`: Biblioteca de paisagens em 4K/HD.
-   **Nuvem (Google Drive):** Repositório Master de transcrições e benchmarks.

## 3. Próximos Passos Técnicos

- [ ] Consolidar a base de 270 roteiros virais.
- [ ] Configurar o prompt do "Agente Roteirista" para imitar o estilo dos virais.
- [ ] Criar o banco de vídeos em loop.
