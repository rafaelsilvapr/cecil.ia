import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ParentDashboard } from './screens/ParentDashboard.tsx'
import { registerUpdateChannel } from './pwa/update.ts'

const isParentDashboard = window.location.pathname === '/painel' || window.location.pathname === '/painel/'

registerUpdateChannel()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isParentDashboard ? <ParentDashboard /> : <App />}
  </StrictMode>,
)
