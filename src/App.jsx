import { useRef, useState, useEffect } from 'react'
import { useApp } from './context/AppContext'
import Loader from './components/Loader'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import LivePanel from './components/LivePanel'
import HeroSection from './components/HeroSection'
import Toast from './components/Toast'
import EstadiaLancada from './pages/EstadiaLancada'
import EstadiaALancar from './pages/EstadiaALancar'
import Historico from './pages/Historico'
import Backup from './pages/Backup'

function Painel() {
  const { abaAtiva, mudarAba } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCommand, setShowCommand] = useState(false)
  const formLancadaRef = useRef()
  const formALancarRef = useRef()

  const focarLancada = () => {
    mudarAba('lancadas')
    setTimeout(() => formLancadaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const focarALancar = () => {
    mudarAba('alancar')
    setTimeout(() => formALancarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCommand(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="app" style={{ display: 'block' }}>
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 25, background: 'rgba(0,0,0,.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`app-layout`}>
        <div style={sidebarOpen ? { transform: 'translateX(0)' } : {}}>
          <Sidebar onFechar={() => setSidebarOpen(false)} />
        </div>

        <section className="main-pro">
          <Header onMenuMobile={() => setSidebarOpen(true)} />

          <main className="container">
            <HeroSection
              onNovaLancada={focarLancada}
              onNovaPendencia={focarALancar}
              onComandos={() => setShowCommand(true)}
            />
            <LivePanel />
            <StatsBar />

            {abaAtiva === 'lancadas' && <EstadiaLancada formRef={formLancadaRef} />}
            {abaAtiva === 'alancar' && <EstadiaALancar formRef={formALancarRef} />}
            {abaAtiva === 'historico' && <Historico />}
            {abaAtiva === 'backup' && <Backup />}

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
  return (
    <>
      {!usuarioAtual && <Login />}
      {usuarioAtual && <Painel />}
      <Toast />
    </>
  )
}
