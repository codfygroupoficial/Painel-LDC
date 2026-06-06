import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_LIST = [
  'Contato captado', 'Em negociação', 'Programado para carregar',
  'Chegou na origem', 'Carregou', 'Ficou parado',
  'Não carregou', 'Sem retorno', 'Recusou',
]
const STATUS_FINAL = ['Carregou', 'Ficou parado', 'Não carregou', 'Sem retorno', 'Recusou']
const PRODUTOS = ['Farelo', 'Soja', 'Milho', 'Óleo', 'Fertilizante', 'Outro']

const STATUS_COR = {
  'Contato captado':         { bg: 'rgba(96,165,250,.13)', color: '#60a5fa',  border: 'rgba(96,165,250,.25)' },
  'Em negociação':           { bg: 'rgba(251,191,36,.13)', color: '#fbbf24',  border: 'rgba(251,191,36,.25)' },
  'Programado para carregar':{ bg: 'rgba(167,139,250,.13)',color: '#a78bfa',  border: 'rgba(167,139,250,.25)' },
  'Chegou na origem':        { bg: 'rgba(34,211,238,.13)', color: '#22d3ee',  border: 'rgba(34,211,238,.25)' },
  'Carregou':                { bg: 'rgba(74,222,128,.13)', color: '#4ade80',  border: 'rgba(74,222,128,.25)' },
  'Ficou parado':            { bg: 'rgba(251,146,60,.13)', color: '#fb923c',  border: 'rgba(251,146,60,.25)' },
  'Não carregou':            { bg: 'rgba(248,113,113,.13)',color: '#f87171',  border: 'rgba(248,113,113,.25)' },
  'Sem retorno':             { bg: 'rgba(148,163,184,.13)',color: '#94a3b8',  border: 'rgba(148,163,184,.25)' },
  'Recusou':                 { bg: 'rgba(239,68,68,.13)',  color: '#ef4444',  border: 'rgba(239,68,68,.25)' },
}

const MEDAL = (i) => {
  if (i === 0) return { bg: 'linear-gradient(135deg,#92400e,#f59e0b)', border: 'rgba(245,158,11,0.35)', icon: '🥇', glow: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
  if (i === 1) return { bg: 'linear-gradient(135deg,#374151,#9ca3af)', border: 'rgba(156,163,175,0.3)', icon: '🥈', glow: 'rgba(156,163,175,0.12)', color: '#9ca3af' }
  if (i === 2) return { bg: 'linear-gradient(135deg,#7c2d12,#ea580c)', border: 'rgba(234,88,12,0.3)', icon: '🥉', glow: 'rgba(234,88,12,0.12)', color: '#ea580c' }
  return { bg: 'var(--bg)', border: 'var(--line)', icon: `${i + 1}`, glow: 'transparent', color: 'var(--muted)' }
}

function StatusBadge({ status }) {
  const cor = STATUS_COR[status] || { bg: 'rgba(148,163,184,.1)', color: '#94a3b8', border: 'rgba(148,163,184,.2)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cor.bg, color: cor.color, border: `1px solid ${cor.border}`,
      borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cor.color, flexShrink: 0 }} />
      {status}
    </span>
  )
}

const FORM_EMPTY = {
  motorista: '', telefone: '', placa: '', produto: 'Farelo',
  origem: '', destino: '', cidadeMotorista: '', qtdCargas: '',
  previsaoCarregamento: '', obs: '',
}

export default function Captacao() {
  const { captacoes = [], adicionarCaptacao, atualizarStatusCaptacao, excluirCaptacao, usuarioAtual, usuarios = [], toast } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'

  const [form, setForm] = useState(FORM_EMPTY)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [expandido, setExpandido] = useState(null)
  const [atualizando, setAtualizando] = useState(null)
  const [confirmExcluir, setConfirmExcluir] = useState(null)
  const [tab, setTab] = useState('lista')
  const [filtros, setFiltros] = useState({ busca: '', status: '', produto: '', usuario: '', filial: '' })

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setFilt = (k, v) => setFiltros(p => ({ ...p, [k]: v }))

  const handleSalvar = () => {
    if (!form.motorista.trim()) { toast('Informe o nome do motorista.', 'err'); return }
    if (!form.telefone.trim()) { toast('Informe o telefone/WhatsApp.', 'err'); return }
    adicionarCaptacao(form)
    setForm(FORM_EMPTY)
    setMostrarForm(false)
  }

  const listaFiltrada = useMemo(() => {
    const q = filtros.busca.toUpperCase()
    return captacoes.filter(c => {
      if (filtros.status && c.status !== filtros.status) return false
      if (filtros.produto && c.produto !== filtros.produto) return false
      if (filtros.usuario && c.captadoPor !== filtros.usuario) return false
      if (filtros.filial && c.filial !== filtros.filial) return false
      if (q && !`${c.motorista} ${c.placa} ${c.origem} ${c.destino} ${c.telefone}`.toUpperCase().includes(q)) return false
      return true
    })
  }, [captacoes, filtros])

  const minhaCaptacao = useMemo(() => captacoes.filter(c => c.captadoPor === usuarioAtual?.usuario), [captacoes, usuarioAtual])

  const stats = useMemo(() => {
    const lista = isAdmin ? listaFiltrada : minhaCaptacao
    const hoje = new Date().toLocaleDateString('pt-BR')
    return {
      total: lista.length,
      totalCargas: lista.reduce((s, c) => s + (Number(c.qtdCargas) || 0), 0),
      captadosHoje: lista.filter(c => c.dataCaptacao?.startsWith(hoje) || c.dataCaptacao?.includes(hoje.split('/').reverse().join('-'))).length,
      carregaram: lista.filter(c => c.status === 'Carregou').length,
      parados: lista.filter(c => c.status === 'Ficou parado').length,
      emAberto: lista.filter(c => !STATUS_FINAL.includes(c.status)).length,
      naoCarregaram: lista.filter(c => c.status === 'Não carregou').length,
      semRetorno: lista.filter(c => c.status === 'Sem retorno').length,
      recusaram: lista.filter(c => c.status === 'Recusou').length,
    }
  }, [listaFiltrada, minhaCaptacao, isAdmin])

  const rankingOperadores = useMemo(() => {
    const map = {}
    for (const c of captacoes) {
      const u = c.captadoPor || 'Desconhecido'
      if (!map[u]) map[u] = { nome: u, contatos: 0, cargas: 0, carregaram: 0, parados: 0 }
      map[u].contatos++
      map[u].cargas += Number(c.qtdCargas) || 0
      if (c.status === 'Carregou') map[u].carregaram++
      if (c.status === 'Ficou parado') map[u].parados++
    }
    return Object.values(map)
      .map(r => ({ ...r, taxa: r.contatos ? Math.round(r.carregaram / r.contatos * 100) : 0 }))
      .sort((a, b) => b.contatos - a.contatos)
  }, [captacoes])

  const rankingProdutos = useMemo(() => {
    const map = {}
    for (const c of captacoes) {
      const p = c.produto || 'Sem produto'
      if (!map[p]) map[p] = { produto: p, contatos: 0, cargas: 0, carregaram: 0, parados: 0 }
      map[p].contatos++
      map[p].cargas += Number(c.qtdCargas) || 0
      if (c.status === 'Carregou') map[p].carregaram++
      if (c.status === 'Ficou parado') map[p].parados++
    }
    return Object.values(map).sort((a, b) => b.contatos - a.contatos)
  }, [captacoes])

  const usuariosUnicos = useMemo(() => [...new Set(captacoes.map(c => c.captadoPor).filter(Boolean))], [captacoes])
  const filiaisUnicas = useMemo(() => [...new Set(captacoes.map(c => c.filial).filter(Boolean))], [captacoes])

  const listaMostra = isAdmin ? listaFiltrada : minhaCaptacao

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg)', border: '1.5px solid var(--line)',
    borderRadius: 10, padding: '10px 12px', color: 'var(--text)',
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
  }
  const selectStyle = { ...inputStyle }

  /* ─── STATS CARDS ─── */
  const statsCards = [
    { label: 'Total captados',  value: stats.total,        color: '#60a5fa', icon: '📋' },
    { label: 'Cargas informadas', value: stats.totalCargas, color: '#a78bfa', icon: '🚛' },
    { label: 'Hoje',            value: stats.captadosHoje,  color: '#22d3ee', icon: '📅' },
    { label: 'Carregaram',      value: stats.carregaram,   color: '#4ade80', icon: '✅' },
    { label: 'Parados',         value: stats.parados,      color: '#fb923c', icon: '⚠️' },
    { label: 'Em aberto',       value: stats.emAberto,     color: '#fbbf24', icon: '🔄' },
    { label: 'Não carregaram',  value: stats.naoCarregaram, color: '#f87171', icon: '❌' },
    { label: 'Sem retorno',     value: stats.semRetorno,   color: '#94a3b8', icon: '📵' },
    { label: 'Recusaram',       value: stats.recusaram,    color: '#ef4444', icon: '🚫' },
  ]

  return (
    <>
      <style>{`
        .cap-input { background: var(--bg) !important; border: 1.5px solid var(--line) !important; border-radius: 10px !important; padding: 10px 12px !important; color: var(--text) !important; font-size: 13px !important; font-family: inherit !important; outline: none !important; width: 100% !important; box-sizing: border-box !important; }
        .cap-input:focus { border-color: rgba(59,130,246,.5) !important; box-shadow: 0 0 0 3px rgba(37,99,235,.1) !important; }
        .cap-tab { padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; border: 1px solid var(--line); background: var(--bg); color: var(--muted); }
        .cap-tab.active { background: linear-gradient(135deg,#1d4ed8,#7c3aed); color: white; border-color: transparent; }
        .cap-tab:hover:not(.active) { border-color: rgba(59,130,246,.4); color: var(--text); }
        .cap-card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; transition: border-color .15s; }
        .cap-card:hover { border-color: rgba(59,130,246,.3); }
        .quick-btn { padding: 5px 12px; border-radius: 7px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; transition: all .15s; }
      `}</style>

      <section className="aba active">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: 'var(--text)' }}>Central de Captação</h1>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{isAdmin ? 'Visão completa · todos os operadores' : `Olá, ${usuarioAtual?.nome?.split(' ')[0]} · seus contatos`}</p>
          </div>
          <button
            onClick={() => setMostrarForm(v => !v)}
            style={{
              padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: mostrarForm ? 'var(--bg)' : 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
              color: mostrarForm ? 'var(--muted)' : 'white',
              border: mostrarForm ? '1px solid var(--line)' : 'none',
            }}
          >{mostrarForm ? '✕ Fechar' : '+ Nova captação'}</button>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 8, marginBottom: 18 }}>
          {statsCards.map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form nova captação */}
        {mostrarForm && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 20px', marginBottom: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: 'var(--text)' }}>Nova captação</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px,1fr))', gap: 10 }}>
              {[
                { label: 'Motorista *', key: 'motorista', placeholder: 'Nome completo' },
                { label: 'Telefone/WhatsApp *', key: 'telefone', placeholder: '64999999999' },
                { label: 'Placa', key: 'placa', placeholder: 'ABC1234' },
                { label: 'Origem', key: 'origem', placeholder: 'Cidade / Estado' },
                { label: 'Destino', key: 'destino', placeholder: 'Cidade / Estado' },
                { label: 'Cidade do motorista', key: 'cidadeMotorista', placeholder: 'Onde está' },
                { label: 'Qtd cargas', key: 'qtdCargas', placeholder: '1', type: 'number' },
                { label: 'Previsão carregamento', key: 'previsaoCarregamento', placeholder: 'dd/mm', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.3px' }}>{f.label}</div>
                  <input className="cap-input" type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setF(f.key, e.target.value)} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.3px' }}>Produto</div>
                <select className="cap-input" value={form.produto} onChange={e => setF('produto', e.target.value)}>
                  {PRODUTOS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.3px' }}>Observação</div>
                <input className="cap-input" placeholder="Detalhes, condições, etc..." value={form.obs} onChange={e => setF('obs', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleSalvar} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: 'white' }}>Salvar captação</button>
              <button onClick={() => { setForm(FORM_EMPTY); setMostrarForm(false) }} style={{ padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--line)' }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Tabs (admin) */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[['lista','📋 Lista'],['ranking-operadores','🏆 Operadores'],['ranking-produtos','📦 Produtos']].map(([id, label]) => (
              <button key={id} className={`cap-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
        )}

        {/* Filters */}
        {(tab === 'lista' || !isAdmin) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <input className="cap-input" style={{ maxWidth: 220 }} placeholder="Buscar motorista, placa..." value={filtros.busca} onChange={e => setFilt('busca', e.target.value)} />
            <select className="cap-input" style={{ maxWidth: 160 }} value={filtros.status} onChange={e => setFilt('status', e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="cap-input" style={{ maxWidth: 140 }} value={filtros.produto} onChange={e => setFilt('produto', e.target.value)}>
              <option value="">Todos prod.</option>
              {PRODUTOS.map(p => <option key={p}>{p}</option>)}
            </select>
            {isAdmin && (
              <select className="cap-input" style={{ maxWidth: 150 }} value={filtros.usuario} onChange={e => setFilt('usuario', e.target.value)}>
                <option value="">Todos operadores</option>
                {usuariosUnicos.map(u => <option key={u}>{u}</option>)}
              </select>
            )}
            {(filtros.busca || filtros.status || filtros.produto || filtros.usuario) && (
              <button onClick={() => setFiltros({ busca: '', status: '', produto: '', usuario: '', filial: '' })} style={{ padding: '8px 12px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--line)' }}>Limpar filtros</button>
            )}
          </div>
        )}

        {/* ─── LISTA ─── */}
        {(tab === 'lista' || !isAdmin) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {listaMostra.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div style={{ fontWeight: 700 }}>Nenhuma captação encontrada</div>
                <div style={{ fontSize: 13, marginTop: 5 }}>Adicione uma nova captação acima</div>
              </div>
            ) : listaMostra.map(c => {
              const isMine = c.captadoPor === usuarioAtual?.usuario
              const isFinal = STATUS_FINAL.includes(c.status)
              const isOpen = expandido === c.id
              const updatingThis = atualizando?.id === c.id

              return (
                <div key={c.id} className="cap-card">
                  {/* Main row */}
                  <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{c.motorista}</span>
                        {c.placa && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1px 7px' }}>{c.placa}</span>}
                        <StatusBadge status={c.status} />
                        {c.produto && <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>{c.produto}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)' }}>
                        {c.telefone && <a href={`https://wa.me/55${c.telefone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', fontWeight: 600, textDecoration: 'none' }}>📱 {c.telefone}</a>}
                        {c.origem && <span>📍 {c.origem}</span>}
                        {c.destino && <span>🏁 {c.destino}</span>}
                        {c.qtdCargas && <span>🚛 {c.qtdCargas} carga(s)</span>}
                        {c.previsaoCarregamento && <span>📅 {c.previsaoCarregamento}</span>}
                      </div>
                      {c.obs && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, opacity: .6 }}>{c.obs}</div>}
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5, opacity: .45 }}>Captado por <strong>{c.captadoPor}</strong> · {c.dataCaptacao} · {c.filial}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                      {/* Quick actions */}
                      {!isFinal && (isMine || isAdmin) && (
                        <>
                          <button className="quick-btn" onClick={() => atualizarStatusCaptacao(c.id, 'Carregou', '')} style={{ background: 'rgba(74,222,128,.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,.3)' }}>✓ Carregou</button>
                          <button className="quick-btn" onClick={() => atualizarStatusCaptacao(c.id, 'Ficou parado', '')} style={{ background: 'rgba(251,146,60,.13)', color: '#fb923c', border: '1px solid rgba(251,146,60,.25)' }}>⚠ Parado</button>
                        </>
                      )}
                      {!isFinal && (isMine || isAdmin) && (
                        <button className="quick-btn" onClick={() => setAtualizando(updatingThis ? null : { id: c.id, status: c.status, obs: '' })} style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--line)' }}>Atualizar</button>
                      )}
                      <button className="quick-btn" onClick={() => setExpandido(isOpen ? null : c.id)} style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--line)' }}>{isOpen ? '▲' : '▼'} Histórico ({(c.historico || []).length})</button>
                      {(isMine || isAdmin) && <button className="quick-btn" onClick={() => setConfirmExcluir(c.id)} style={{ background: 'rgba(239,68,68,.1)', color: '#f87171', border: '1px solid rgba(239,68,68,.2)' }}>✕</button>}
                    </div>
                  </div>

                  {/* Update status form */}
                  {updatingThis && (
                    <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase' }}>Novo status</div>
                        <select className="cap-input" value={atualizando.status} onChange={e => setAtualizando(p => ({ ...p, status: e.target.value }))}>
                          {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 2, minWidth: 200 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase' }}>Observação</div>
                        <input className="cap-input" placeholder="Observação opcional..." value={atualizando.obs} onChange={e => setAtualizando(p => ({ ...p, obs: e.target.value }))} />
                      </div>
                      <button onClick={() => { atualizarStatusCaptacao(atualizando.id, atualizando.status, atualizando.obs); setAtualizando(null) }} style={{ padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: 'white' }}>Salvar</button>
                      <button onClick={() => setAtualizando(null)} style={{ padding: '10px 14px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 12, background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--line)' }}>Cancelar</button>
                    </div>
                  )}

                  {/* History timeline */}
                  {isOpen && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', margin: '12px 0 10px', textTransform: 'uppercase', letterSpacing: '.3px' }}>Histórico de status</div>
                      <div style={{ position: 'relative', paddingLeft: 20 }}>
                        <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'var(--line)' }} />
                        {(c.historico || []).map((h, i) => {
                          const cor = STATUS_COR[h.status] || { color: '#94a3b8' }
                          return (
                            <div key={i} style={{ position: 'relative', marginBottom: 12 }}>
                              <div style={{ position: 'absolute', left: -16, top: 4, width: 9, height: 9, borderRadius: '50%', background: cor.color, border: `2px solid var(--card)`, boxShadow: `0 0 0 2px ${cor.color}40` }} />
                              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <StatusBadge status={h.status} />
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{h.dataHora} · {h.atualizadoPor}</span>
                              </div>
                              {h.obs && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, opacity: .65 }}>{h.obs}</div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ─── RANKING OPERADORES ─── */}
        {tab === 'ranking-operadores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rankingOperadores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}><div style={{ fontSize: 40, marginBottom: 10 }}>📭</div><div>Sem dados de ranking ainda</div></div>
            ) : rankingOperadores.map((r, i) => {
              const m = MEDAL(i)
              const barColor = r.taxa >= 60 ? '#4ade80' : r.taxa >= 30 ? '#fbbf24' : '#f87171'
              return (
                <div key={r.nome} style={{ background: 'var(--card)', border: `1.5px solid ${m.border}`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: i < 3 ? `0 4px 20px ${m.glow}` : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? 22 : 13, fontWeight: 900, color: i < 3 ? undefined : m.color }}>{m.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.nome}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${r.taxa}%`, background: barColor, borderRadius: 3, transition: 'width .5s' }} /></div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: barColor, minWidth: 32, textAlign: 'right' }}>{r.taxa}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
                    {[['contatos','#60a5fa','Contatos'],[  'cargas','#a78bfa','Cargas'],['carregaram','#4ade80','Carregaram'],['parados','#fb923c','Parados']].map(([k, cor, lbl]) => (
                      <div key={k} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: cor, lineHeight: 1 }}>{r[k]}</div>
                        <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px', marginTop: 2 }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── RANKING PRODUTOS ─── */}
        {tab === 'ranking-produtos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rankingProdutos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}><div style={{ fontSize: 40, marginBottom: 10 }}>📭</div><div>Sem dados de produtos ainda</div></div>
            ) : rankingProdutos.map((r, i) => (
              <div key={r.produto} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,rgba(167,139,250,.2),rgba(37,99,235,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#a78bfa' }}>#{i+1}</div>
                <div style={{ flex: 1, fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{r.produto}</div>
                <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
                  {[['contatos','#60a5fa','Contatos'],['cargas','#a78bfa','Cargas'],['carregaram','#4ade80','Carregaram'],['parados','#fb923c','Parados']].map(([k,cor,lbl]) => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: cor, lineHeight: 1 }}>{r[k]}</div>
                      <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px', marginTop: 2 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {confirmExcluir && (
        <ConfirmDialog
          message="Excluir esta captação permanentemente?"
          onConfirm={() => { excluirCaptacao(confirmExcluir); setConfirmExcluir(null) }}
          onCancel={() => setConfirmExcluir(null)}
        />
      )}
    </>
  )
}
