import { useRef, useState, useEffect } from 'react'
import { useApp } from './context/AppContext'
import Loader from './components/Loader'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LivePanel from './components/LivePanel'
import Toast from './components/Toast'
import SoundManager from './components/SoundManager'
import Dashboard from './pages/Dashboard'
import EstadiaLancada from './pages/EstadiaLancada'
import EstadiaALancar from './pages/EstadiaALancar'
import Captacao from './pages/Captacao'
import CaptacaoAdmin from './pages/CaptacaoAdmin'
import Historico from './pages/Historico'
import Relatorios from './pages/Relatorios.jsx'
import Backup from './pages/Backup'
import Admin from './pages/Admin'
import './captacao-theme.css'
import './estadia-mobile.css'
import './pro-polish.css'
import './sidebar-reference.css'
import './tempo-estadia.css'
import './live-command.css'
import './admin-pro.css'

function CaptacaoIsolada() {
  const { usuarioAtual, logout } = useApp()

  const sair = () => {
    localStorage.removeItem('moduloInicialViaLog')
    logout()
  }

  const trocarParaEstadia = () => {
    localStorage.setItem('moduloInicialViaLog', 'estadia')
    window.location.reload()
  }

  return (
    <div className="app capture-shell-pro" style={{ display: 'block' }}>
      <main className="capture-main-pro">
        <section className="capture-topbar-pro">
          <div className="capture-title-pro">
            <div className="capture-eyebrow-pro">Central operacional</div>
            <h1>Painel de Captação</h1>
            <p>Ambiente separado para registrar motoristas, acompanhar evolução de contato, ordem e carregamento confirmado.</p>
          </div>
          <div className="capture-actions-pro">
            <span className="capture-user-chip-pro">{usuarioAtual?.nome || usuarioAtual?.usuario || 'Usuário'}</span>
            <button className="capture-action-btn-pro" onClick={trocarParaEstadia}>Painel de estadia</button>
            <button className="capture-action-btn-pro" onClick={sair}>Sair</button>
          </div>
        </section>

        <section className="capture-panel-wrap-pro"><Captacao /></section>
        <div className="capture-footer-pro">AYRES · Central de captação</div>
      </main>
    </div>
  )
}

function PainelEstadia() {
  const { abaAtiva, mudarAba, usuarioAtual } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const formLancadaRef = useRef()
  const formALancarRef = useRef()
  const isAdmin = usuarioAtual?.cargo === 'Admin'
  const abaProtegida = ['historico', 'relatorios', 'backup', 'admin', 'captacaoAdmin'].includes(abaAtiva)
  const abaRender = !isAdmin && abaProtegida ? 'inicio' : abaAtiva

  const focarLancada = () => {
    mudarAba('lancadas')
    setTimeout(() => formLancadaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const focarALancar = () => {
    mudarAba('alancar')
    setTimeout(() => formALancarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  useEffect(() => {
    if (!isAdmin && abaProtegida) mudarAba('inicio')
  }, [isAdmin, abaProtegida, mudarAba])

  return (
    <div className="app" style={{ display: 'block' }}>
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 25, background: 'rgba(0,0,0,.4)' }} onClick={() => setSidebarOpen(false)} />}

      <div className={`app-layout`}>
        <div style={sidebarOpen ? { transform: 'translateX(0)' } : {}}><Sidebar onFechar={() => setSidebarOpen(false)} /></div>

        <section className="main-pro">
          <Header onMenuMobile={() => setSidebarOpen(true)} />
          <main className="container">
            <LivePanel />

            {abaRender === 'inicio' && <Dashboard onNovaLancada={focarLancada} onNovaPendencia={focarALancar} />}
            {abaRender === 'lancadas' && <EstadiaLancada formRef={formLancadaRef} />}
            {abaRender === 'alancar' && <EstadiaALancar formRef={formALancarRef} />}
            {isAdmin && abaRender === 'captacaoAdmin' && <CaptacaoAdmin />}
            {isAdmin && abaRender === 'historico' && <Historico />}
            {isAdmin && abaRender === 'relatorios' && <Relatorios />}
            {isAdmin && abaRender === 'backup' && <Backup />}
            {isAdmin && abaRender === 'admin' && <Admin />}

            <div className="footer">by Manoel</div>
          </main>
        </section>
      </div>
    </div>
  )
}

export default function App() {
  const { usuarioAtual } = useApp()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <Loader />

  const moduloInicial = localStorage.getItem('moduloInicialViaLog') || 'estadia'

  return (
    <>
      <SoundManager />
      {!usuarioAtual && <Login />}
      {usuarioAtual && moduloInicial === 'captacao' && <CaptacaoIsolada />}
      {usuarioAtual && moduloInicial !== 'captacao' && <PainelEstadia />}
      <Toast />
    </>
  )
}
