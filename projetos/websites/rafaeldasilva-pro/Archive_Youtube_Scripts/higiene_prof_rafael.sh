#!/bin/bash
# Script autônomo de Higiene Canônica - Fase 3
# Este script resolve fisicamente as sobras que a Sandbox macOS impede o robô de apagar no background.

BASE_DIR="/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael"

echo "🧹 Iniciando limpeza canônica e arquivamento em: $BASE_DIR"

# 1. Cria diretórios de organização e backup
mkdir -p "$BASE_DIR/Bkp_Fase3_Antigos"
mkdir -p "$BASE_DIR/Content/scripts"

# 2. O arquivo canônico atual (Imune à exclusão)
CANONICAL="Relatorio_Auditoria_YouTube_Rafael_Base_Consolidada_Final.xlsx"

if [ -f "$BASE_DIR/$CANONICAL" ]; then
    echo "✅ Arquivo Canônico identificado: $CANONICAL"
else
    echo "⚠️ ALERTA: O arquivo canônico '$CANONICAL' não está na raiz! Copiando do workspace..."
    cp "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/projetos/websites/rafaeldasilva-pro/$CANONICAL" "$BASE_DIR/"
fi

# 3. Arquivamento de todas as versões antigas ou parciais para tirar ambiguidades
echo "📦 Movendo versões ambíguas antigas para Bkp_Fase3_Antigos..."
mv "$BASE_DIR/Relatorio_Analise_YouTube_Rafael"* "$BASE_DIR/Bkp_Fase3_Antigos/" 2>/dev/null
mv "$BASE_DIR/Relatorio_Auditoria_YouTube_Rafael_Base_Limpa"* "$BASE_DIR/Bkp_Fase3_Antigos/" 2>/dev/null
mv "$BASE_DIR/Relatorio_Auditoria_YouTube_Rafael_FINAL"* "$BASE_DIR/Bkp_Fase3_Antigos/" 2>/dev/null

# 4. Limpeza de resíduos de teste e scripts perdidos
echo "🗑️ Apagando lixo de sistema (test.txt)..."
rm -f "$BASE_DIR/test.txt"

echo "📂 Movendo scripts de automação para Content/scripts..."
mv "$BASE_DIR/create_clean_benchmark.py" "$BASE_DIR/Content/scripts/" 2>/dev/null

echo ""
echo "✨ [SUCESSO] Limpeza e Consolidação Finalizada."
echo "O único workbook atualmente ativo e canônico na raiz de 'Prof. Rafael' é:"
echo "-> $CANONICAL"
