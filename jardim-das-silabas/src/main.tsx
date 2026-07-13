import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ParentDashboard } from './screens/ParentDashboard.tsx'

const isParentDashboard = window.location.pathname === '/painel' || window.location.pathname === '/painel/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isParentDashboard ? <ParentDashboard /> : <App />}
  </StrictMode>,
)
