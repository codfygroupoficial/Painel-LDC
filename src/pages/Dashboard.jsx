import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { dinheiro, moedaNumero } from '../utils/index'

const CORES_STATUS = ['#f97316', '#60a5fa', '#4ade80']
const CORES_PRIO   = ['#94a3b8', '#fbbf24', '#f87171']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '8px 14px', fontSize: 13, boxShadow: '0 8px 30px rgba(0,0,0,.15)' }}>
      <strong>{payload[0].name}</strong>: {payload[0].value}
    </div>
  )
}

function DonutChart({ dados, cores }) {
  const vazio = dados.every(d => d.value === 0)
  if (vazio) return <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Sem dados</div>
  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={dados} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
          {dados.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function ChartCard({ titulo, subtitulo, dados, cores, children }) {
  return (
    <div className="dash-chart-card">
      <div className="dash-chart-head">
        <div>
          <h3>{titulo}</h3>
          <span>{subtitulo}</span>
        </div>
      </div>
      <DonutChart dados={dados} cores={cores} />
      <div className="dash-legend">
        {dados.map((d, i) => (
          <div key={d.name} className="dash-legend-item">
            <span style={{ background: cores[i % cores.length] }} />
            <span>{d.name}</span>
            <strong>{d.value}</strong>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

export default function Dashboard({ onNovaLancada, onNovaPendencia }) {
  const { estadias, estadiasALancar, usuarioAtual, usuariosOnline, cloudStatus } = useApp()

  const abertas     = estadias.filter(e => e.status === 'Aberto').length
  const feitas      = estadias.filter(e => e.status === 'Feito').length
  const finalizadas = estadias.filter(e => e.status === 'Finalizado').length
  const urgentes    = estadiasALancar.filter(e => e.prioridade === 'Urgente').length
  const medias      = estadiasALancar.filter(e => e.prioridade === 'Média').length
  const normais     = estadiasALancar.filter(e => e.prioridade === 'Normal').length
  const valorTotal  = dinheiro(estadias.reduce((s, e) => s + moedaNumero(e.valor), 0))
  const primeiroNome = usuarioAtual?.nome?.split(' ')[0] || 'usuário'

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <section className="aba active">

      {/* Hero Banner */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <div className="dash-hero-greeting">{saudacao}, <span>{primeiroNome}</span> 👋</div>
          <div className="dash-hero-sub">
            {usuarioAtual?.cargo === 'Admin' ? 'Visão geral do sistema' : `Filial: ${usuarioAtual?.filial || 'principal'}`}
            &nbsp;·&nbsp;
            <span style={{ color: cloudStatus === 'online' ? '#4ade80' : '#f87171' }}>
              {cloudStatus === 'online' ? '● Online' : '● Offline'}
            </span>
            &nbsp;·&nbsp;{usuariosOnline.length} usuário(s) online
          </div>
          <div className="dash-hero-actions">
            <button className="btn-hero-primary" onClick={onNovaLancada}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Nova estadia
            </button>
            <button className="btn-hero-secondary" onClick={onNovaPendencia}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Nova pendência
            </button>
          </div>
        </div>
        <div className="dash-hero-right">
          <div className="dash-valor-card">
            <span>Valor total em estadias</span>
            <strong>{valorTotal}</strong>
            <div className="dash-valor-sub">{estadias.length} estadias registradas</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="dash-charts">
        <ChartCard
          titulo="Status das estadias"
          subtitulo={`${estadias.length} total`}
          dados={[
            { name: 'Abertas',     value: abertas },
            { name: 'Feitas',      value: feitas },
            { name: 'Finalizadas', value: finalizadas },
          ]}
          cores={CORES_STATUS}
        />

        <ChartCard
          titulo="Prioridade"
          subtitulo={`${estadiasALancar.length} pendências`}
          dados={[
            { name: 'Normal',  value: normais },
            { name: 'Média',   value: medias },
            { name: 'Urgente', value: urgentes },
          ]}
          cores={CORES_PRIO}
        />

        <div className="dash-chart-card dash-quick-stats">
          <div className="dash-chart-head"><div><h3>Resumo rápido</h3><span>Visão geral</span></div></div>
          <div className="dash-quick-list">
            {[
              { label: 'Total lançadas',  value: estadias.length,     color: '#60a5fa', icon: '📦' },
              { label: 'Em aberto',       value: abertas,             color: '#f97316', icon: '🔓' },
              { label: 'Concluídas',      value: feitas + finalizadas, color: '#4ade80', icon: '✅' },
              { label: 'A lançar',        value: estadiasALancar.length, color: '#a78bfa', icon: '📋' },
              { label: 'Urgentes',        value: urgentes,            color: '#f87171', icon: '🚨' },
              { label: 'Online agora',    value: usuariosOnline.length, color: '#34d399', icon: '👥' },
            ].map(item => (
              <div key={item.label} className="dash-quick-item">
                <div className="dash-quick-icon">{item.icon}</div>
                <div className="dash-quick-info">
                  <span>{item.label}</span>
                  <strong style={{ color: item.color }}>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
