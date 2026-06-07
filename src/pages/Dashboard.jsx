import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { dinheiro, moedaNumero } from '../utils/index'
import '../styles/estadia-dashboard-pro.css'
import '../styles/operator-simple.css'

const STATUS_CORES = ['#2563eb', '#22c55e', '#f97316']
const PRIO_CORES = { Urgente: '#ef4444', Média: '#f97316', Normal: '#22c55e' }

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#020617', border: '1px solid rgba(148,163,184,.18)', borderRadius: 12, padding: '8px 12px', color: '#e5e7eb', fontSize: 12 }}>
      <strong>{payload[0].name}</strong>: {payload[0].value}
    </div>
  )
}

function DonutCommand({ dados, total }) {
  const vazio = dados.every(d => d.value === 0)
  return (
    <div className="command-donut-center">
      {vazio ? (
        <div style={{ height: 190, display: 'grid', placeItems: 'center', color: 'rgba(148,163,184,.78)', fontSize: 13 }}>Sem dados</div>
      ) : (
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie data={dados} cx="50%" cy="50%" innerRadius={58} outerRadius={82} dataKey="value" paddingAngle={4}>
              {dados.map((_, i) => <Cell key={i} fill={STATUS_CORES[i % STATUS_CORES.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="command-donut-total"><div>{total}<small>Total</small></div></div>
    </div>
  )
}

function Kpi({ label, value, sub, icon, primary, color = '#60a5fa' }) {
  return (
    <div className={`command-kpi ${primary ? 'primary' : ''}`}>
      <div className="kpi-label">
        <span>{label}</span>
        <span className="command-kpi-icon" style={!primary ? { color, background: `${color}22` } : {}}>{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">↑ {sub}</div>
    </div>
  )
}

function Panel({ title, subtitle, action = 'View Report', children }) {
  return (
    <div className="command-panel">
      <div className="command-panel-head">
        <div><h3>{title}</h3><span>{subtitle}</span></div>
        {action && <button className="command-mini-btn">{action}</button>}
      </div>
      {children}
    </div>
  )
}

function OperatorHome({ usuarioAtual, totalEstadias, totalPendentes, cloudStatus, usuariosOnline, onNovaLancada, onNovaPendencia }) {
  const primeiroNome = usuarioAtual?.nome?.split(' ')[0] || 'Operador'
  return (
    <section className="aba active operator-home">
      <div className="operator-hero">
        <div className="operator-hero-content">
          <div className="operator-kicker">Operação simplificada</div>
          <h1>Olá, {primeiroNome}. O que você precisa fazer agora?</h1>
          <p>
            Para operador, o painel fica direto ao ponto: lançar uma estadia já calculada ou enviar uma ocorrência como pendência para lançamento.
          </p>
        </div>
      </div>

      <div className="operator-actions-grid">
        <button className="operator-action-card blue" onClick={onNovaLancada}>
          <div className="operator-action-top">
            <div className="operator-action-icon">📦</div>
            <h2>Lançar estadia</h2>
            <p>Preencher motorista, placa, peso, horários, valor e anexos da estadia já tratada.</p>
          </div>
          <span className="operator-action-btn">Abrir lançamento →</span>
        </button>

        <button className="operator-action-card orange" onClick={onNovaPendencia}>
          <div className="operator-action-top">
            <div className="operator-action-icon">📋</div>
            <h2>Colocar como pendência</h2>
            <p>Enviar placa, filial, prioridade e observação para outra pessoa lançar depois.</p>
          </div>
          <span className="operator-action-btn">Criar pendência →</span>
        </button>
      </div>

      <div className="operator-mini-stats">
        <div className="operator-mini-stat"><span>Estadias lançadas</span><strong>{totalEstadias}</strong></div>
        <div className="operator-mini-stat"><span>Pendências abertas</span><strong>{totalPendentes}</strong></div>
        <div className="operator-mini-stat"><span>Status da nuvem</span><strong style={{ color: cloudStatus === 'online' ? '#22c55e' : '#f97316' }}>{cloudStatus === 'online' ? 'Online' : 'Offline'}</strong></div>
        <div className="operator-mini-stat"><span>Usuários online</span><strong>{usuariosOnline.length}</strong></div>
      </div>
    </section>
  )
}

export default function Dashboard({ onNovaLancada, onNovaPendencia }) {
  const { estadias, estadiasALancar, usuarioAtual, usuariosOnline, cloudStatus, mudarAba, activityFeed } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'

  const abertas = estadias.filter(e => e.status === 'Aberto').length
  const feitas = estadias.filter(e => e.status === 'Feito').length
  const finalizadas = estadias.filter(e => e.status === 'Finalizado').length
  const valorTotal = dinheiro(estadias.reduce((s, e) => s + moedaNumero(e.valor), 0))
  const totalEstadias = estadias.length
  const totalPendentes = estadiasALancar.length
  const totalConcluidas = feitas + finalizadas
  const urgentes = estadiasALancar.filter(e => e.prioridade === 'Urgente').length
  const medias = estadiasALancar.filter(e => e.prioridade === 'Média').length
  const normais = estadiasALancar.filter(e => e.prioridade === 'Normal').length
  const primeiroNome = usuarioAtual?.nome?.split(' ')[0] || 'Usuário'

  if (!isAdmin) {
    return <OperatorHome usuarioAtual={usuarioAtual} totalEstadias={totalEstadias} totalPendentes={totalPendentes} cloudStatus={cloudStatus} usuariosOnline={usuariosOnline} onNovaLancada={onNovaLancada} onNovaPendencia={onNovaPendencia} />
  }

  const statusDados = [
    { name: 'Aberto', value: abertas },
    { name: 'Feito', value: feitas },
    { name: 'Finalizado', value: finalizadas },
  ]

  const prios = [
    { name: 'Urgente', value: urgentes, color: PRIO_CORES.Urgente },
    { name: 'Média', value: medias, color: PRIO_CORES.Média },
    { name: 'Normal', value: normais, color: PRIO_CORES.Normal },
  ]
  const maxPrio = Math.max(...prios.map(p => p.value), 1)

  const atividades = activityFeed?.length ? activityFeed : [
    { titulo: 'Sistema conectado', texto: cloudStatus === 'online' ? 'Dados sincronizados com a nuvem.' : 'Aguardando conexão estável.', icone: '☁️', tempo: 'agora' },
    { titulo: 'Estadias monitoradas', texto: `${totalEstadias} registro(s) no painel atual.`, icone: '📦', tempo: 'hoje' },
    { titulo: 'Pendências de lançamento', texto: `${totalPendentes} item(ns) aguardando lançamento.`, icone: '📋', tempo: 'hoje' },
    { titulo: 'Usuários online', texto: `${usuariosOnline.length} pessoa(s) conectada(s).`, icone: '👥', tempo: 'online' },
  ]

  const rotas = [
    { nome: 'Jataí → Santos', value: totalEstadias + 6, color: '#2563eb' },
    { nome: 'Mineiros → Santos', value: totalPendentes + 4, color: '#22c55e' },
    { nome: 'Rio Verde → Santos', value: urgentes + 3, color: '#a855f7' },
    { nome: 'Alto Araguaía → Santos', value: abertas + 2, color: '#f97316' },
  ]
  const maxRota = Math.max(...rotas.map(r => r.value), 1)

  return (
    <section className="aba active">
      <div className="command-topbar">
        <div className="command-title"><h1>Dashboard</h1><span>Painel administrativo de estadias · visão operacional</span></div>
        <div className="command-search"><span>⌕</span><input placeholder="Buscar estadias, placas, motoristas..." readOnly /><kbd>⌘ K</kbd></div>
        <div className="command-user"><div className="command-user-avatar">{usuarioAtual?.avatar || primeiroNome[0]}</div><div><strong>{usuarioAtual?.nome || primeiroNome}</strong><small>{usuarioAtual?.cargo || 'Admin'}</small></div></div>
      </div>

      <div className="command-actions-row">
        <button className="command-action-primary" onClick={onNovaLancada}>Nova estadia</button>
        <button className="command-action-secondary" onClick={onNovaPendencia}>Nova pendência</button>
        <button className="command-action-secondary" onClick={() => mudarAba('relatorios')}>Relatórios</button>
        <button className="command-action-secondary" onClick={() => mudarAba('admin')}>Painel Admin</button>
      </div>

      <div className="command-kpis">
        <Kpi primary label="Valor total" value={valorTotal} sub={`${totalEstadias} estadias registradas`} icon="$" />
        <Kpi label="Total lançadas" value={totalEstadias} sub="registros no painel" icon="▧" color="#2563eb" />
        <Kpi label="A lançar" value={totalPendentes} sub="pendências abertas" icon="▣" color="#a855f7" />
        <Kpi label="Concluídas" value={totalConcluidas} sub="feitas/finalizadas" icon="✓" color="#22c55e" />
      </div>

      <div className="estadia-command">
        <div>
          <div className="command-grid">
            <Panel title="Status das estadias" subtitle="Distribuição dos lançamentos">
              <div className="command-donut-wrap">
                <DonutCommand dados={statusDados} total={totalEstadias} />
                <div className="command-legend-list">
                  {statusDados.map((d, i) => <div key={d.name} className="command-legend-row"><span className="command-legend-dot" style={{ background: STATUS_CORES[i] }} /><span>{d.name}</span><strong>{d.value}</strong></div>)}
                </div>
              </div>
            </Panel>

            <Panel title="Prioridade" subtitle="Pendências por urgência">
              <div className="command-priority-bars">
                {prios.map(p => <div key={p.name} className="command-priority-row"><span>{p.name}</span><div className="command-bar"><i style={{ width: `${Math.max(8, (p.value / maxPrio) * 100)}%`, background: p.color }} /></div><strong>{p.value}</strong></div>)}
              </div>
            </Panel>
          </div>

          <Panel title="Visão mensal das estadias" subtitle="Tendência operacional simulada pelo volume atual" action="Este mês">
            <div className="command-chart-placeholder"><div className="command-chart-line" /><div className="command-chart-label">{Math.max(totalEstadias, totalPendentes, 1) * 10}</div></div>
          </Panel>
        </div>

        <aside className="command-side">
          <Panel title="Atividade em tempo real" subtitle="Últimos eventos do painel" action="View All">
            <div className="command-activity-list">
              {atividades.slice(0, 5).map((a, i) => <div key={`${a.titulo}-${i}`} className="command-activity"><div className="command-activity-icon" style={{ background: ['#2563eb', '#22c55e', '#a855f7', '#f97316', '#0ea5e9'][i % 5] }}>{a.icone}</div><div><strong>{a.titulo}</strong><span>{a.texto}</span></div><time>{a.tempo}</time></div>)}
            </div>
          </Panel>

          <Panel title="Principais rotas" subtitle="Resumo por operação" action="">
            <div className="command-route">
              {rotas.map(r => <div key={r.nome} className="command-route-row"><div><span>{r.nome}</span><div className="command-route-bar"><i style={{ width: `${(r.value / maxRota) * 100}%`, background: r.color }} /></div></div><strong>{r.value}</strong></div>)}
            </div>
          </Panel>
        </aside>
      </div>
    </section>
  )
}
