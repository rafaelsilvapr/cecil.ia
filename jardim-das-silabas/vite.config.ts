import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Versão gravada em cada sessão de telemetria. Sem isso não dá para separar
// "antes" e "depois" quando a dificuldade mudar com a Cecília a 1.500 km.
const appVersion = () => {
  const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string }
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
    ?? (() => {
      try {
        return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      } catch {
        return ''
      }
    })()
  return sha ? `${version}+${sha.slice(0, 7)}` : `${version}+local`
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt' porque o app decide a hora de aplicar: sozinho quando ela está
      // no mapa, com botão quando ela está no meio de uma fase (src/pwa/update.ts).
      registerType: 'prompt',
      includeAssets: ['icons/favicon-64.png'],
      manifest: {
        name: 'Jardim das Sílabas',
        short_name: 'Jardim',
        description: 'Jogo de alfabetização por sílabas da Cecília.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#d7ffb8',
        theme_color: '#58CC02',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tudo que o jogo precisa fica em cache: sem internet ela continua jogando.
        globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
        navigateFallback: '/index.html',
        // O painel dos pais e a telemetria falam com o Supabase; nunca servir do cache.
        navigateFallbackDenylist: [/^\/painel/, /^\/configurar/],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: true // Expose to network
  }
})
