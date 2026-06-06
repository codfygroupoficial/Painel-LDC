import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Phone, ClipboardCheck, PackageCheck, Plus, X, ChevronRight,
  Truck, MapPin, Package, Users, Search, Wheat, TrendingUp,
} from 'lucide-react'

const STATUS = {
  contatado: { label: 'Contatado',   cor: '#64748b', bg: 'rgba(100,116,139,.10)', border: 'rgba(100,116,139,.2)', Icon: Phone,          ordem: 1, next: 'ordem' },
  ordem:     { label: 'Pegou ordem', cor: '#d97706', bg: 'rgba(217,119,6,.10)',   border: 'rgba(217,119,6,.2)',   Icon: ClipboardCheck,  ordem: 2, next: 'carregou' },
  carregou:  { label: 'Carregou',    cor: '#16a34a', bg: 'rgba(22,163,74,.10)',   border: 'rgba(22,163,74,.2)',   Icon: PackageCheck,    ordem: 3, next: null },
}

const OPERACOES = ['Farelo', 'Soja', 'Milho', 'Óleo', 'Fertilizante', 'Outro']

const EMPTY = {
  motorista: '', telefone: '', placa: '', produto: 'Farelo',
  origem: '', destino: '', cidadeMotorista: '', qtdCargas: '', obs: '',
}

const limparTel = (t) => t.replace(/\D/g, '')

function medalha(i) {
  if (i === 0) return { icon: '🥇', cor: '#f59e0b' }
  if (i === 1) return { icon: '🥈', cor: '#94a3b8' }
  if (i === 2) return { icon: '🥉', cor: '#b45309' }
  return { icon: `#${i + 1}`, cor: 'var(--muted)' }
}

/* ── Stat card ─────────────────────────────────────── */
function StatCard({ Icon, color, value, label, sub }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18,
      padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 2px 10px rgba(15,23,42,.05)', transition: 'transform .2s, box-shadow .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.10)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(15,23,42,.05)' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

/* ── Status badge ──────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.contatado
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.cor, border: `1px solid ${s.border}`,
      borderRadius: 8, padding: '4px 10px', fontSize: 11.5, fontWeight: 700,
    }}>
      <s.Icon size={11} />
      {s.label}
    </span>
  )
}

/* ── Captação card ─────────────────────────────────── */
function CardCaptacao({ c, onAvancar, onExcluir, isAdmin }) {
  const s = STATUS[c.status] || STATUS.contatado
  const tel = limparTel(c.telefone || '')

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: '0 1px 6px rgba(15,23,42,.04)', transition: 'box-shadow .2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {(c.motorista || '?').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.motorista || '–'}</div>
            {tel && (
              <a href={`https://wa.me/55${tel}`} target="_blank" rel="noopener noreferrer"
                style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Phone size={10} />
                {c.telefone}
              </a>
            )}
          </div>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {c.placa && (
          <span style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace', fontWeight: 800, fontSize: 12 }}>
            {c.placa.toUpperCase()}
          </span>
        )}
        {c.produto && (
          <span style={{ background: 'rgba(37,99,235,.08)', color: '#2563eb', borderRadius: 6, padding: '3px 9px', fontWeight: 700, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Wheat size={10} />
            {c.produto}
          </span>
        )}
        {c.qtdCargas && (
          <span style={{ background: 'rgba(124,58,237,.08)', color: '#7c3aed', borderRadius: 6, padding: '3px 9px', fontWeight: 700, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Package size={10} />
            {c.qtdCargas}x
          </span>
        )}
        {(c.origem || c.destino) && (
          <span style={{ color: 'var(--muted)', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 3 }}>
            <MapPin size={10} />
            {c.origem}{c.origem && c.destino ? ' → ' : ''}{c.destino}
          </span>
        )}
      </div>

      {c.obs && (
        <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.18)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#92400e' }}>
          ⚠ {c.obs}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--line)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {isAdmin && c.captadoPor && <span>por <strong>{c.captadoPor}</strong> · </span>}
          {c.data?.slice(0, 10)}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {isAdmin && (
            <button onClick={() => onExcluir(c.id)} style={{
              background: 'rgba(220,38,38,.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,.15)',
              borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              boxShadow: 'none',
            }}>Excluir</button>
          )}
          {s.next && (
            <button onClick={() => onAvancar(c.id, s.next)} style={{
              background: STATUS[s.next].cor, color: 'white', border: 'none',
              borderRadius: 8, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              boxShadow: `0 4px 14px ${STATUS[s.next].cor}40`,
            }}>
              {STATUS[s.next].label} <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Modal form ────────────────────────────────────── */
function Modal({ form, setForm, onSalvar, onFechar }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,6,23,.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 0 0',
    }} onClick={e => e.target === e.currentTarget && onFechar()}>
      <div style={{
        width: '100%', maxWidth: 560, background: 'var(--card)',
        borderRadius: '24px 24px 0 0', padding: '24px 24px 32px',
        boxShadow: '0 -20px 60px rgba(0,0,0,.25)',
        animation: 'slideUp .25s cubic-bezier(.22,1,.36,1)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.4px' }}>Novo motorista captado</h2>
            <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 3 }}>Registre os dados do contato</p>
          </div>
          <button onClick={onFechar} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, padding: 8, boxShadow: 'none', color: 'var(--muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label>Motorista *</label>
            <input value={form.motorista} onChange={e => set('motorista', e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label>Telefone / WhatsApp *</label>
            <input value={form.telefone} onChange={e => set('telefone', e.target.value.replace(/\D/g, ''))} placeholder="64999999999" inputMode="numeric" />
          </div>
          <div>
            <label>Placa do veículo</label>
            <input value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="ABC1234" maxLength={8} />
          </div>
          <div>
            <label>Produto</label>
            <select value={form.produto} onChange={e => set('produto', e.target.value)}>
              {OPERACOES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label>Qtd de cargas</label>
            <input value={form.qtdCargas} onChange={e => set('qtdCargas', e.target.value)} placeholder="Ex: 1" inputMode="numeric" />
          </div>
          <div>
            <label>Origem</label>
            <input value={form.origem} onChange={e => set('origem', e.target.value)} placeholder="Cidade origem" />
          </div>
          <div>
            <label>Destino</label>
            <input value={form.destino} onChange={e => set('destino', e.target.value)} placeholder="Cidade destino" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label>Cidade do motorista</label>
            <input value={form.cidadeMotorista} onChange={e => set('cidadeMotorista', e.target.value)} placeholder="De onde o motorista está" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label>Observação</label>
            <input value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Ex: prefere manhã, tem baú..." />
          </div>
        </div>

        <button className="btn-blue btn-full" onClick={onSalvar} style={{ marginTop: 20, padding: '13px 16px', fontSize: 14 }}>
          <Plus size={16} /> Salvar captação
        </button>
      </div>
    </div>
  )
}

/* ── Ranking admin ─────────────────────────────────── */
function RankingAdmin({ captacoes }) {
  const byOp = {}
  const byProd = {}
  for (const c of captacoes) {
    const op = c.captadoPor || '?'
    const pr = c.produto || 'Outro'
    if (!byOp[op]) byOp[op] = { total: 0, carregou: 0 }
    if (!byProd[pr]) byProd[pr] = 0
    byOp[op].total++
    byProd[pr]++
    if (c.status === 'carregou' || c.carregou) byOp[op].carregou++
  }
  const rankOp = Object.entries(byOp).map(([nome, s]) => ({ nome, ...s })).sort((a, b) => b.total - a.total)
  const rankProd = Object.entries(byProd).map(([nome, cnt]) => ({ nome, cnt })).sort((a, b) => b.cnt - a.cnt)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
      {/* Ranking operadores */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '18px 20px', boxShadow: '0 2px 10px rgba(15,23,42,.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Users size={15} /> Ranking operadores</h2>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Quem mais captou</p>
          </div>
        </div>
        {rankOp.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhuma captação ainda.</p>
          : rankOp.map((r, i) => {
            const m = medalha(i)
            const taxa = r.total ? Math.round(r.carregou / r.total * 100) : 0
            return (
              <div key={r.nome} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < rankOp.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 32, textAlign: 'center', fontSize: i < 3 ? 20 : 12, fontWeight: 900, color: m.cor, flexShrink: 0 }}>{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.nome}</div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--line)', marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${taxa}%`, background: taxa >= 60 ? '#16a34a' : taxa >= 30 ? '#d97706' : '#64748b', borderRadius: 2, transition: 'width .4s' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: m.cor }}>{r.total}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>captados</div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Ranking produtos */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '18px 20px', boxShadow: '0 2px 10px rgba(15,23,42,.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}><Wheat size={15} /> Ranking produtos</h2>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Mais carregados</p>
          </div>
        </div>
        {rankProd.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhum produto ainda.</p>
          : rankProd.map((r, i) => {
            const m = medalha(i)
            const pct = rankProd[0]?.cnt ? Math.round(r.cnt / rankProd[0].cnt * 100) : 0
            return (
              <div key={r.nome} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < rankProd.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 32, textAlign: 'center', fontSize: i < 3 ? 20 : 12, fontWeight: 900, color: m.cor, flexShrink: 0 }}>{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.nome}</div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--line)', marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#2563eb', borderRadius: 2, transition: 'width .4s' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: m.cor }}>{r.cnt}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>contatos</div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────── */
export default function Captacao() {
  const { captacoes, adicionarCaptacao, atualizarStatusCaptacao, marcarCarregou, excluirCaptacao, usuarioAtual, toast } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'
  const [form, setForm] = useState(EMPTY)
  const [modal, setModal] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const getStatus = (c) => {
    if (c.status) return c.status
    if (c.carregou) return 'carregou'
    return 'contatado'
  }

  const handleSalvar = () => {
    if (!form.motorista.trim() || !form.telefone.trim()) {
      toast('Preencha motorista e telefone.', 'err'); return
    }
    adicionarCaptacao(form)
    setForm(EMPTY)
    setModal(false)
  }

  const handleAvancar = (id, novoStatus) => {
    if (atualizarStatusCaptacao) {
      atualizarStatusCaptacao(id, novoStatus)
    } else {
      marcarCarregou(id)
    }
  }

  const minhas = isAdmin ? captacoes : captacoes.filter(c => c.captadoPor === usuarioAtual?.usuario)

  const lista = minhas.filter(c => {
    const s = getStatus(c)
    const txt = `${c.motorista} ${c.telefone} ${c.placa} ${c.produto} ${c.origem} ${c.destino}`.toUpperCase()
    const matchBusca = !busca || txt.includes(busca.toUpperCase())
    const matchStatus = filtroStatus === 'todos' || s === filtroStatus
    return matchBusca && matchStatus
  })

  const countStatus = (s) => minhas.filter(c => getStatus(c) === s).length
  const total = minhas.length
  const totalCarregou = countStatus('carregou')
  const taxa = total ? Math.round(totalCarregou / total * 100) : 0

  return (
    <>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }`}</style>

      <section className="aba active" id="abaCaptacao">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 16 }}>
          <StatCard Icon={Phone}         color="#64748b" value={countStatus('contatado')} label="Contatados"   />
          <StatCard Icon={ClipboardCheck} color="#d97706" value={countStatus('ordem')}     label="Com ordem"    />
          <StatCard Icon={PackageCheck}  color="#16a34a" value={countStatus('carregou')}  label="Carregaram"   />
          <StatCard Icon={TrendingUp}    color="#7c3aed" value={`${taxa}%`}               label="Taxa de carga" sub={`${totalCarregou} de ${total}`} />
        </div>

        {isAdmin && captacoes.length > 0 && <RankingAdmin captacoes={captacoes} />}

        {/* Search + filters */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '16px 18px', marginBottom: 14, boxShadow: '0 1px 6px rgba(15,23,42,.04)' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Pesquisar motorista, placa, produto..."
                style={{ paddingLeft: 36 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['todos', 'contatado', 'ordem', 'carregou'].map(s => (
                <button key={s} onClick={() => setFiltroStatus(s)} style={{
                  background: filtroStatus === s ? (s === 'todos' ? 'var(--blue)' : STATUS[s]?.cor || 'var(--blue)') : 'var(--bg)',
                  color: filtroStatus === s ? 'white' : 'var(--muted)',
                  border: `1px solid ${filtroStatus === s ? 'transparent' : 'var(--line)'}`,
                  borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: 'none',
                }}>
                  {s === 'todos' ? 'Todos' : STATUS[s].label}
                  {s !== 'todos' && (
                    <span style={{ marginLeft: 6, background: 'rgba(255,255,255,.22)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>
                      {countStatus(s)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards list */}
        {lista.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', background: 'var(--card)', border: '1px dashed var(--line)', borderRadius: 18 }}>
            <Truck size={36} style={{ opacity: .3, marginBottom: 12 }} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>Nenhum motorista encontrado</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clique no botão + para registrar um novo contato</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 12 }}>
            {lista.map(c => (
              <CardCaptacao
                key={c.id} c={{ ...c, status: getStatus(c) }}
                onAvancar={handleAvancar}
                onExcluir={excluirCaptacao}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setModal(true)}
          style={{
            position: 'fixed', right: 24, bottom: 24, zIndex: 999,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
            color: 'white', boxShadow: '0 8px 24px rgba(37,99,235,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none', padding: 0,
          }}
        >
          <Plus size={24} />
        </button>
      </section>

      {modal && (
        <Modal form={form} setForm={setForm} onSalvar={handleSalvar} onFechar={() => setModal(false)} />
      )}
    </>
  )
}
