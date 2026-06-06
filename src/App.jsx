import { useRef, useState, useEffect } from 'react'
import { useApp } from './context/AppContext'
import Loader from './components/Loader'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LivePanel from './components/LivePanel'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import EstadiaLancada from './pages/EstadiaLancada'
import EstadiaALancar from './pages/EstadiaALancar'
import Historico from './pages/Historico'
import Captacao from './pages/Captacao'
import Backup from './pages/Backup'
import Admin from './pages/Admin'

function PainelCaptacao() {
  const { mudarModulo, usuarioAtual, logout, alternarTema, tema } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--line)',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: 'white', flexShrink: 0,
          }}>VL</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', lineHeight: 1.1 }}>Via Log</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.3px' }}>CENTRAL DE CAPTAÇÃO</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {usuarioAtual?.filial && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--muted)',
              background: 'var(--bg)', border: '1px solid var(--line)',
              padding: '3px 10px', borderRadius: 999,
            }}>{usuarioAtual.filial}</span>
          )}
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900, color: 'white', flexShrink: 0,
          }}>{usuarioAtual?.avatar || '?'}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{usuarioAtual?.nome}</div>
          {isAdmin && (
            <button
              onClick={() => mudarModulo('estadias')}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(37,99,235,0.12)', color: '#60a5fa',
                border: '1px solid rgba(37,99,235,0.25)', marginLeft: 4,
              }}
            >← Estadias</button>
          )}
          <button
            onClick={() => alternarTema()}
            style={{
              width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
              background: 'var(--bg)', border: '1px solid var(--line)',
              color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{tema === 'dark' ? '☀️' : '🌙'}</button>
          <button
            onClick={logout}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'var(--bg)', color: 'var(--muted)',
              border: '1px solid var(--line)',
            }}
          >Sair</button>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        <LivePanel />
        <Captacao />
      </main>
    </div>
  )
}

function Painel() {
  const { abaAtiva, mudarAba } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const formLancadaRef = useRef()
  const formALancarRef = useRef()

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen)
    return () => document.body.classList.remove('sidebar-open')
  }, [sidebarOpen])

  const focarLancada = () => {
    mudarAba('lancadas')
    setTimeout(() => formLancadaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const focarALancar = () => {
    mudarAba('alancar')
    setTimeout(() => formALancarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="app" style={{ display: 'block' }}>
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 25, background: 'rgba(0,0,0,.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-layout">
        <div style={sidebarOpen ? { transform: 'translateX(0)' } : {}}>
          <Sidebar onFechar={() => setSidebarOpen(false)} />
        </div>

        <section className="main-pro">
          <Header onMenuMobile={() => setSidebarOpen(true)} />

          <main className="container">
            <LivePanel />

            {abaAtiva === 'inicio' && <Dashboard onNovaLancada={focarLancada} onNovaPendencia={focarALancar} />}
            {abaAtiva === 'lancadas' && <EstadiaLancada formRef={formLancadaRef} />}
            {abaAtiva === 'alancar' && <EstadiaALancar formRef={formALancarRef} />}
            {abaAtiva === 'historico' && <Historico />}
            {abaAtiva === 'backup' && <Backup />}
            {abaAtiva === 'admin' && <Admin />}

            <div className="footer">by Manoel</div>
          </main>
        </section>
      </div>
    </div>
  )
}

export default function App() {
  const { usuarioAtual, moduloAtual } = useApp()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <Loader />
  return (
    <>
      {!usuarioAtual && <Login />}
      {usuarioAtual && moduloAtual === 'captacao' && <PainelCaptacao />}
      {usuarioAtual && moduloAtual !== 'captacao' && <Painel />}
      <Toast />
    </>
  )
}
