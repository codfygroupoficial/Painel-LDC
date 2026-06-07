import { useState } from 'react'
import { useApp } from '../context/AppContext'

const Svg = ({ children, ...p }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
)

const ICONES = {
  grid: <Svg><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></Svg>,
  chart: <Svg><path d="M4 19V9" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M22 19h-20" /></Svg>,
  shield: <Svg><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /></Svg>,
  bolt: <Svg><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></Svg>,
  brain: <Svg><path d="M9.5 3a2.5 2.5 0 00-2.5 2.5v1A2.5 2.5 0 005 9v1a2.5 2.5 0 00-1 4.9V16a2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5 2.5h1" /><path d="M14.5 3a2.5 2.5 0 012.5 2.5v1A2.5 2.5 0 0119 9v1a2.5 2.5 0 011 4.9V16a2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5 2.5h-1" /><path d="M9.5 21V3M14.5 21V3" /></Svg>,
  globe: <Svg width="16" height="16"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></Svg>,
  chevronDown: <Svg width="12" height="12"><path d="M6 9l6 6 6-6" /></Svg>,
  chevronRight: <Svg width="14" height="14"><path d="M9 6l6 6-6 6" /></Svg>,
  arrowRight: <Svg width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>,
  close: <Svg width="20" height="20"><path d="M6 6l12 12M18 6L6 18" /></Svg>,
  lock: <Svg width="28" height="28"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></Svg>,
}

const modulos = [
  {
    id: 'estadia',
    nome: 'Estadia',
    subtitulo: 'Gerencie estadias, pátios e movimentações com total visibilidade.',
    icon: 'grid',
    cor: 'blue',
    aba: 'inicio',
  },
  {
    id: 'captacao',
    nome: 'Captação',
    subtitulo: 'Indicadores e resultados da captação de cargas em tempo real.',
    icon: 'chart',
    cor: 'orange',
    aba: 'captacao',
  },
]

const beneficios = [
  { icon: 'shield', texto: 'Controle Avançado' },
  { icon: 'bolt', texto: 'Tempo Real' },
  { icon: 'brain', texto: 'Inteligência de Dados' },
]

const cores = {
  blue: {
    texto: 'text-blue-500',
    iconeWrap: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    glow: 'hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6),0_0_24px_rgba(59,130,246,0.12)] hover:border-blue-500/30',
    botao: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-[0_10px_24px_rgba(37,99,235,0.35)]',
  },
  orange: {
    texto: 'text-orange-500',
    iconeWrap: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    glow: 'hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6),0_0_24px_rgba(249,115,22,0.12)] hover:border-orange-500/30',
    botao: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:shadow-[0_10px_24px_rgba(249,115,22,0.35)]',
  },
}

export default function Login() {
  const { entrar, mudarAba } = useApp()
  const [form, setForm] = useState({ usuario: '', senha: '' })
  const [modulo, setModulo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const abrirAcesso = (m) => {
    setModulo(m)
    setErro('')
    setForm({ usuario: '', senha: '' })
    setTimeout(() => document.getElementById('portal-user')?.focus(), 80)
  }

  const fechar = () => {
    if (carregando) return
    setModulo(null)
  }

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (carregando || !modulo) return
    setErro('')
    setCarregando(true)
    localStorage.setItem('moduloInicialViaLog', modulo.id)
    const ok = await entrar(form.usuario, form.senha)
    if (ok) {
      mudarAba(modulo.aba)
    } else {
      setErro('Usuário ou senha inválidos.')
    }
    setCarregando(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] text-white font-sans relative overflow-hidden" style={{ fontFamily: "'Inter','Plus Jakarta Sans',Arial,sans-serif" }}>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        }}
      />

      <header className="px-6 sm:px-10 py-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <span className="text-2xl font-extrabold">A</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AYRES</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold">Logística inteligente</p>
          </div>
        </div>
        <button type="button" className="bg-white/5 border border-white/10 rounded-full px-4 sm:px-5 py-2.5 text-xs font-bold flex items-center gap-2 sm:gap-3 hover:bg-white/10 transition-all">
          {ICONES.globe}
          <span className="hidden sm:inline">PORTUGUÊS</span>
          {ICONES.chevronDown}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="text-center mb-14 sm:mb-20 max-w-3xl">
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 tracking-tight">
            Bem-vindo ao <span className="text-blue-500">AYRES</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-xl leading-relaxed font-light">
            Acesse os painéis estratégicos da plataforma e gerencie suas operações com eficiência, segurança e inteligência de dados em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 max-w-6xl w-full">
          {modulos.map((m) => {
            const c = cores[m.cor]
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => abrirAcesso(m)}
                className={`text-left p-8 sm:p-12 flex flex-col justify-between min-h-[340px] sm:min-h-[450px] rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-[#0d1117] to-[#080a0f] cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] ${c.glow}`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 sm:mb-10 border ${c.iconeWrap}`}>
                    {ICONES[m.icon]}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 tracking-tight">
                    Painel de <br />
                    <span className={c.texto}>{m.nome}</span>
                  </h3>
                  <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xs">{m.subtitulo}</p>
                </div>
                <div className={`flex items-center gap-3 font-bold text-sm ${c.texto}`}>
                  <span>ACESSAR MÓDULO</span>
                  {ICONES.arrowRight}
                </div>
              </button>
            )
          })}
        </div>
      </main>

      <footer className="px-6 py-12 sm:py-16 text-center">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-8">
          {beneficios.map((b) => (
            <div key={b.texto} className="flex items-center gap-3 text-slate-500">
              <span className="text-blue-500">{ICONES[b.icon]}</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">{b.texto}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-700 uppercase tracking-[0.4em]">
          © 2026 AYRES Logística. Todos os direitos reservados.
        </p>
      </footer>

      {modulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={fechar}>
          <div
            className="bg-[#0d1117] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 sm:p-12 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={fechar} className="absolute top-7 right-7 sm:top-8 sm:right-8 text-slate-500 hover:text-white transition-colors">
              {ICONES.close}
            </button>

            <div className="text-center mb-10">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${cores[modulo.cor].iconeWrap}`}>
                {ICONES[modulo.icon]}
              </div>
              <h4 className="text-2xl font-bold mb-2">
                Acessar Painel de <span className={cores[modulo.cor].texto}>{modulo.nome}</span>
              </h4>
              <p className="text-slate-500 text-sm">Informe suas credenciais de acesso</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Usuário</label>
                <input
                  id="portal-user"
                  type="text"
                  placeholder="Seu ID de acesso"
                  autoComplete="username"
                  value={form.usuario}
                  onChange={(e) => set('usuario', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && document.getElementById('portal-pass')?.focus()}
                  className="w-full px-5 py-4 rounded-2xl outline-none text-white bg-white/[.03] border border-white/5 transition-all focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:bg-white/5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Senha</label>
                <input
                  id="portal-pass"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.senha}
                  onChange={(e) => set('senha', e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl outline-none text-white bg-white/[.03] border border-white/5 transition-all focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:bg-white/5"
                />
              </div>

              {erro && <p className="text-red-400 text-sm text-center -mt-2">{erro}</p>}

              <button
                type="submit"
                disabled={carregando}
                className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-xl mt-2 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait ${cores[modulo.cor].botao}`}
              >
                {carregando ? 'Validando...' : <>ENTRAR NO PAINEL {ICONES.chevronRight}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-7 flex items-center gap-2 text-slate-600 text-[10px] uppercase tracking-widest font-bold opacity-70 hover:opacity-100 transition-opacity">
        {ICONES.lock}
        <span className="text-right leading-tight normal-case tracking-normal">Acesso protegido<br />Sessão operacional</span>
      </div>
    </div>
  )
}
