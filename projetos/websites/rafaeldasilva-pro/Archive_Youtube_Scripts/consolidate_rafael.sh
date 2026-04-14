#!/bin/bash

# Target Directory
TARGET="/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael"

# Source Directories
SOURCE_CONTENT="/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Produção de conteúdo/Professor Rafael"
SOURCE_WEBSITE="/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/projetos/websites/rafaeldasilva-pro"
SOURCE_LITERACY="/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/jardim-das-silabas"

echo "🚀 Iniciando consolidação de conteúdos do Professor Rafael..."

# 1. Create subfolder structure
mkdir -p "$TARGET/Content"
mkdir -p "$TARGET/Projects"
mkdir -p "$TARGET/Analysis"

# 2. Move content production folders
if [ -d "$SOURCE_CONTENT" ]; then
    echo "📦 Movendo conteúdo de produção..."
    mv "$SOURCE_CONTENT"/* "$TARGET/Content/"
    rmdir "$SOURCE_CONTENT"
fi

# 3. Move website and literacy app
if [ -d "$SOURCE_WEBSITE" ]; then
    echo "🌐 Movendo projeto do website..."
    mv "$SOURCE_WEBSITE" "$TARGET/Projects/Website"
fi

if [ -d "$SOURCE_LITERACY" ]; then
    echo "🌿 Movendo app Jardim das Sílabas..."
    mv "$SOURCE_LITERACY" "$TARGET/Projects/LiteracyApp"
fi

echo "✅ Consolidação concluída em $TARGET"
