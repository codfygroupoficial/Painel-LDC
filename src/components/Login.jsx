import { useState } from 'react'
import { useApp } from '../context/AppContext'
import '../access-login.css'
import '../login-reference.css'

const modulos = [
  {
    id: 'estadia',
    titulo: 'Painel de Estadia',
    destaque: 'Estadia',
    subtitulo: 'Gerencie estadias, pátios, agendamentos e movimentações com total visibilidade e controle operacional.',
    icon: '▣',
    accent: 'blue',
    aba: 'inicio',
  },
  {
    id: 'captacao',
    titulo: 'Painel de Captação',
    destaque: 'Captação',
    subtitulo: 'Acompanhe indicadores, desempenho e resultados da captação de cargas em tempo real.',
    icon: '▥',
    accent: 'orange',
    aba: 'captacao',
  },
]

const beneficios = [
  { icon: '◇', titulo: 'Controle Avançado', texto: 'Operação organizada com painéis separados e visão clara.' },
  { icon: '◷', titulo: 'Tempo Real', texto: 'Informações atualizadas para decisões mais rápidas.' },
  { icon: '▤', titulo: 'Inteligência de Dados', texto: 'Relatórios e dashboards para acompanhar resultados.' },
  { icon: '◎', titulo: 'Experiência Unificada', texto: 'Navegação integrada entre os principais módulos.' },
]

export default function Login() {
  const { entrar, mudarAba } = useApp()
  const [form, setForm] = useState({ usuario: '', senha: '' })
  const [modulo, setModulo] = useState(localStorage.getItem('moduloInicialViaLog') || 'estadia')
  const [carregando, setCarregando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const abrirAcesso = (id) => {
    setModulo(id)
    localStorage.setItem('moduloInicialViaLog', id)
    setModalAberto(true)
    setTimeout(() => document.getElementById('portal-user')?.focus(), 80)
  }

  const handleLogin = async () => {
    if (carregando) return
    localStorage.setItem('moduloInicialViaLog', modulo)
    setCarregando(true)
    const ok = await entrar(form.usuario, form.senha)
    if (ok) {
      const escolhido = modulos.find(m => m.id === modulo)
      mudarAba(escolhido?.aba || 'inicio')
    }
    setCarregando(false)
  }

  const selecionado = modulos.find(m => m.id === modulo) || modulos[0]

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-logo-wrap">
          <div className="portal-logo-mark">A</div>
          <div>
            <div className="portal-logo-text">AYRES</div>
            <div className="portal-logo-sub">Logística inteligente</div>
          </div>
        </div>
        <div className="portal-lang">◉ Português⌄</div>
      </header>

      <main className="portal-main">
        <section className="portal-title">
          <h1>Bem-vindo ao <span>AYRES</span></h1>
          <p>Acesse os painéis estratégicos da plataforma e gerencie suas operações com eficiência.</p>
        </section>

        <section className="portal-panels">
          {modulos.map(m => (
            <button
              key={m.id}
              type="button"
              className={`portal-panel ${m.accent} ${modulo === m.id ? 'active' : ''}`}
              onClick={() => abrirAcesso(m.id)}
            >
              <div className="portal-panel-content">
                <div className="portal-panel-icon">{m.icon}</div>
                <h2>{m.titulo.replace(m.destaque, '')}<span>{m.destaque}</span></h2>
                <div className="portal-panel-line" />
                <p>{m.subtitulo}</p>
                <span className="portal-panel-cta">Acessar Painel →</span>
              </div>

              <div className={`portal-visual ${m.accent}`}>
                {m.id === 'estadia' ? (
                  <div className="truck-visual" aria-hidden="true">
                    <div className="truck-box" />
                    <div className="truck-cab" />
                    <div className="truck-wheel w1" />
                    <div className="truck-wheel w2" />
                    <div className="truck-base" />
                  </div>
                ) : (
                  <div className="chart-visual" aria-hidden="true">
                    <i style={{ '--h': '40%' }} /><i style={{ '--h': '55%' }} /><i style={{ '--h': '72%' }} /><i style={{ '--h': '92%' }} />
                    <div className="chart-arrow" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </section>

        <section className="portal-benefits">
          {beneficios.map(b => (
            <div key={b.titulo} className="portal-benefit">
              <div>{b.icon}</div>
              <b>{b.titulo}</b>
              <span>{b.texto}</span>
            </div>
          ))}
        </section>
      </main>

      <footer className="portal-footer">© 2026 <b style={{ color: '#3b82f6' }}>AYRES</b>. Todos os direitos reservados.</footer>
      <div className="portal-secure">▣ Acesso protegido<br />Sessão operacional</div>

      {modalAberto && (
        <div className="portal-modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className={`portal-modal ${selecionado.accent}`} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-head">
              <div>
                <h3>Acessar {selecionado.titulo}</h3>
                <span>Informe suas credenciais para entrar no módulo selecionado.</span>
              </div>
              <button className="portal-modal-close" type="button" onClick={() => setModalAberto(false)}>×</button>
            </div>

            <div className="portal-modal-form">
              <div className="portal-input-wrap">
                <span>Usuário</span>
                <input id="portal-user" type="text" placeholder="Digite seu usuário" value={form.usuario} onChange={e => set('usuario', e.target.value)} autoComplete="username" onKeyDown={e => e.key === 'Enter' && document.getElementById('login-pw')?.focus()} />
              </div>
              <div className="portal-input-wrap">
                <span>Senha</span>
                <input id="login-pw" type="password" placeholder="Digite sua senha" value={form.senha} onChange={e => set('senha', e.target.value)} autoComplete="current-password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button className={`portal-modal-enter ${selecionado.accent}`} onClick={handleLogin} disabled={carregando}>
                {carregando ? <><span className="access-spinner" /> Validando...</> : <>Entrar no painel →</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
