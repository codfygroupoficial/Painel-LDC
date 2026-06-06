import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  Phone, ClipboardCheck, PackageCheck, Plus, Search,
  TrendingUp, Users, ChevronRight, X, Pencil, Trash2,
  MessageSquare, Trophy, ChevronDown, ChevronUp,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────────────
const STATUS = {
  contatado: { label: 'Contatado',   cor: '#64748b', IconComp: Phone,          ordem: 1 },
  ordem:     { label: 'Pegou ordem', cor: '#d97706', IconComp: ClipboardCheck,  ordem: 2 },
  carregou:  { label: 'Carregou',    cor: '#16a34a', IconComp: PackageCheck,    ordem: 3 },
}

const OPERACOES = ['Farelo', 'Soja', 'Milho', 'Óleo', 'Fertilizante', 'Outro']

const OP_CORES = {
  Farelo:      { bg: '#fef3c7', color: '#92400e' },
  Soja:        { bg: '#dcfce7', color: '#166534' },
  Milho:       { bg: '#fef9c3', color: '#854d0e' },
  'Óleo':       { bg: '#dbeafe', color: '#1e40af' },
  Fertilizante:{ bg: '#ede9fe', color: '#5b21b6' },
  Outro:       { bg: '#f1f5f9', color: '#475569' },
}

const FORM_VAZIO = { motorista: '', telefone: '', placa: '', operacao: 'Farelo', status: 'contatado', obs: '', origem: '', destino: '' }

const inputSt = {
  width: '100%', padding: '11px 14px', borderRadius: 11, border: '1px solid #e2e8f0',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 14,
}
const lblSt = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }
const iconBtn = {
  border: '1px solid #e2e8f0', background: '#fff', borderRadius: 8, padding: 6,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ────── StatCard ─────────────────────────────────────────────────────────
function StatCard({ IconComp, label, valor, cor }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: '16px 20px', flex: 1, minWidth: 120,
      border: '1px solid #f1f5f9', boxShadow: '0 4px 12px -6px rgba(0,0,0,.06)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: `${cor}1a`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      }}>
        <IconComp size={19} color={cor} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
    </div>
  )
}

// ────── Modal cadastro / edição ──────────────────────────────────────────
function ModalMotorista({ aberto, fechar, salvar, editando }) {
  const [form, setForm] = useState(FORM_VAZIO)

  useState(() => {
    if (aberto) setForm(editando ? {
      motorista: editando.motorista || '',
      telefone:  editando.telefone  || '',
      placa:     editando.placa     || '',
      operacao:  editando.produto   || editando.operacao || 'Farelo',
      status:    editando.status    || 'contatado',
      obs:       editando.obs       || '',
      origem:    editando.origem    || '',
      destino:   editando.destino   || '',
    } : FORM_VAZIO)
  }, [aberto])

  if (!aberto) return null

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const confirmar = () => {
    if (!form.motorista.trim() || !form.telefone.trim()) return
    salvar(form)
  }

  return (
    <div onClick={fechar} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 0', zIndex: 50,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 20px 36px',
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            {editando ? 'Editar motorista' : 'Novo motorista'}
          </h2>
          <button onClick={fechar} style={{ border: 'none', background: '#f1f5f9', borderRadius: 8, padding: 7, cursor: 'pointer', lineHeight: 0 }}>
            <X size={17} color='#64748b' />
          </button>
        </div>

        <label style={lblSt}>Nome do motorista *</label>
        <input style={inputSt} value={form.motorista} onChange={e => set('motorista', e.target.value)} placeholder='Ex: José Pereira' />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={lblSt}>Telefone / WhatsApp *</label>
            <input style={{ ...inputSt }} value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder='(65) 99999-9999' />
          </div>
          <div>
            <label style={lblSt}>Placa</label>
            <input style={{ ...inputSt }} value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder='ABC1234' />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={lblSt}>Origem</label>
            <input style={{ ...inputSt }} value={form.origem} onChange={e => set('origem', e.target.value)} placeholder='Cidade de origem' />
          </div>
          <div>
            <label style={lblSt}>Destino</label>
            <input style={{ ...inputSt }} value={form.destino} onChange={e => set('destino', e.target.value)} placeholder='Cidade destino' />
          </div>
        </div>

        <label style={lblSt}>Operação</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {OPERACOES.map(op => {
            const c = OP_CORES[op] || OP_CORES.Outro
            const sel = form.operacao === op
            return (
              <button key={op} onClick={() => set('operacao', op)} style={{
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                border: sel ? `2px solid ${c.color}` : '1px solid #e2e8f0',
                background: sel ? c.bg : '#fff',
                color: sel ? c.color : '#64748b',
              }}>{op}</button>
            )
          })}
        </div>

        <label style={lblSt}>Status</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {Object.entries(STATUS).map(([k, s]) => (
            <button key={k} onClick={() => set('status', k)} style={{
              flex: 1, padding: '9px 4px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
              border: form.status === k ? `2px solid ${s.cor}` : '1px solid #e2e8f0',
              background: form.status === k ? `${s.cor}12` : '#fff',
              color: form.status === k ? s.cor : '#64748b',
            }}>{s.label}</button>
          ))}
        </div>

        <label style={lblSt}>Observação</label>
        <textarea style={{ ...inputSt, minHeight: 64, resize: 'vertical' }}
          value={form.obs} onChange={e => set('obs', e.target.value)}
          placeholder='Ex: Não carrega LDC por seguradora' />

        <button onClick={confirmar} style={{
          width: '100%', padding: 14, border: 'none', borderRadius: 12, cursor: 'pointer',
          background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', fontWeight: 700, fontSize: 15,
        }}>{editando ? 'Salvar alterações' : 'Cadastrar motorista'}</button>
      </div>
    </div>
  )
}

// ────── Ranking Admin ───────────────────────────────────────────────────────
function RankingAdmin({ captacoes }) {
  const [aba, setAba] = useState('operadores')

  const rankOp = useMemo(() => {
    const map = {}
    for (const c of captacoes) {
      const u = c.captadoPor || 'Desconhecido'
      if (!map[u]) map[u] = { nome: u, contatos: 0, ordem: 0, carregou: 0 }
      map[u].contatos++
      if (c.status === 'ordem' || c.status === 'carregou') map[u].ordem++
      if (c.status === 'carregou') map[u].carregou++
    }
    return Object.values(map)
      .map(r => ({ ...r, taxa: r.contatos ? Math.round(r.carregou / r.contatos * 100) : 0 }))
      .sort((a, b) => b.contatos - a.contatos)
  }, [captacoes])

  const rankProd = useMemo(() => {
    const map = {}
    for (const c of captacoes) {
      const p = c.produto || c.operacao || 'Sem produto'
      if (!map[p]) map[p] = { produto: p, contatos: 0, carregou: 0 }
      map[p].contatos++
      if (c.status === 'carregou') map[p].carregou++
    }
    return Object.values(map).sort((a, b) => b.contatos - a.contatos)
  }, [captacoes])

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['operadores', '👤 Operadores'], ['produtos', '🌾 Produtos']].map(([id, lbl]) => (
          <button key={id} onClick={() => setAba(id)} style={{
            padding: '8px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            border: aba === id ? 'none' : '1px solid #e2e8f0',
            background: aba === id ? 'linear-gradient(135deg,#d97706,#f59e0b)' : '#fff',
            color: aba === id ? '#fff' : '#64748b',
          }}>{lbl}</button>
        ))}
      </div>

      {aba === 'operadores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rankOp.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>Sem dados ainda.</p>}
          {rankOp.map((r, i) => {
            const barColor = r.taxa >= 60 ? '#16a34a' : r.taxa >= 30 ? '#d97706' : '#ef4444'
            return (
              <div key={r.nome} style={{
                background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #f1f5f9',
                boxShadow: i < 3 ? '0 4px 16px -6px rgba(0,0,0,.1)' : 'none',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ fontSize: 26, flexShrink: 0 }}>{MEDALS[i] || `#${i+1}`}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 6 }}>{r.nome}</div>
                  <div style={{ background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${r.taxa}%`, height: '100%', background: `linear-gradient(90deg,${barColor},${barColor}bb)`, borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14, flexShrink: 0, textAlign: 'center' }}>
                  {[['#64748b', r.contatos, 'contatos'],['#d97706', r.ordem, 'ordem'],['#16a34a', r.carregou, 'carregou']].map(([cor, val, lbl]) => (
                    <div key={lbl}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: cor, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{lbl}</div>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: barColor, lineHeight: 1 }}>{r.taxa}%</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>taxa</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {aba === 'produtos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rankProd.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>Sem dados ainda.</p>}
          {rankProd.map((r, i) => {
            const c = OP_CORES[r.produto] || OP_CORES.Outro
            return (
              <div key={r.produto} style={{
                background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: c.color, flexShrink: 0,
                }}>#{i+1}</div>
                <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{r.produto}</div>
                <div style={{ display: 'flex', gap: 14, flexShrink: 0, textAlign: 'center' }}>
                  {[['#64748b', r.contatos, 'contatos'],['#16a34a', r.carregou, 'carregou']].map(([cor, val, lbl]) => (
                    <div key={lbl}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: cor, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ────── COMPONENTE PRINCIPAL ───────────────────────────────────────────────
export default function Captacao() {
  const { captacoes = [], adicionarCaptacao, atualizarCaptacao, atualizarStatusCaptacao, excluirCaptacao, usuarioAtual, toast } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'

  const [busca, setBusca] = useState('')
  const [filtroOp, setFiltroOp] = useState('Todas')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmExcluir, setConfirmExcluir] = useState(null)
  const [abaAdmin, setAbaAdmin] = useState('lista')

  const minhaCaptacao = useMemo(() =>
    captacoes.filter(c => c.captadoPor === usuarioAtual?.usuario)
  , [captacoes, usuarioAtual])

  const lista = useMemo(() => {
    const base = isAdmin ? captacoes : minhaCaptacao
    const q = busca.toLowerCase()
    return base
      .filter(c => filtroOp === 'Todas' || (c.produto || c.operacao) === filtroOp)
      .filter(c => !busca || [
        c.motorista, c.telefone, c.obs, c.placa, c.origem, c.destino,
      ].filter(Boolean).some(v => v.toLowerCase().includes(q)))
      .sort((a, b) => {
        const oa = STATUS[a.status]?.ordem ?? 1
        const ob = STATUS[b.status]?.ordem ?? 1
        return ob - oa
      })
  }, [captacoes, minhaCaptacao, isAdmin, busca, filtroOp])

  const stats = useMemo(() => {
    const base = isAdmin ? captacoes : minhaCaptacao
    return {
      total:    base.length,
      ordem:    base.filter(c => c.status === 'ordem' || c.status === 'carregou').length,
      carregou: base.filter(c => c.status === 'carregou').length,
    }
  }, [captacoes, minhaCaptacao, isAdmin])

  const conversao = stats.total ? Math.round(stats.carregou / stats.total * 100) : 0

  const avancar = (c) => {
    const proximo = c.status === 'contatado' ? 'ordem' : 'carregou'
    if (c.status === 'carregou') return
    atualizarStatusCaptacao(c.id, proximo, '')
  }

  const salvarModal = async (form) => {
    if (editando) {
      await atualizarCaptacao(editando.id, form)
    } else {
      await adicionarCaptacao({
        motorista: form.motorista,
        telefone:  form.telefone,
        placa:     form.placa,
        produto:   form.operacao,
        operacao:  form.operacao,
        status:    form.status,
        obs:       form.obs,
        origem:    form.origem,
        destino:   form.destino,
      })
    }
    setModal(false)
    setEditando(null)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
      paddingBottom: 100,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .cap-list-item:hover { border-color: #e2e8f0 !important; box-shadow: 0 6px 20px -8px rgba(0,0,0,.1) !important; }
        .cap-avancar:hover { filter: brightness(.92); transform: translateY(-1px); }
        .cap-avancar { transition: all .15s; }
      `}</style>

      {/* HEADER */}
      <header style={{
        background: 'linear-gradient(135deg,#0f172a,#1e293b)',
        padding: '22px 20px 28px',
        borderRadius: '0 0 26px 26px',
        color: '#fff',
        marginBottom: -10,
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '.4px' }}>CENTRAL DE CAPTAÇÃO</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>
                {isAdmin ? 'Visão Admin' : `Olá, ${usuarioAtual?.nome?.split(' ')[0]}`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg,#d97706,#f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 17, color: '#fff',
              }}>{usuarioAtual?.avatar || usuarioAtual?.nome?.[0] || '?'}</div>
            </div>
          </div>

          {/* Tabs admin no header */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
              {[['lista', 'Lista'], ['ranking', '🏆 Ranking']].map(([id, lbl]) => (
                <button key={id} onClick={() => setAbaAdmin(id)} style={{
                  padding: '7px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  border: 'none',
                  background: abaAdmin === id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: abaAdmin === id ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>{lbl}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 14px' }}>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <StatCard IconComp={Phone}         label='Contatos'   valor={stats.total}    cor='#64748b' />
          <StatCard IconComp={ClipboardCheck} label='Com ordem'  valor={stats.ordem}    cor='#d97706' />
          <StatCard IconComp={PackageCheck}  label='Carregou'   valor={stats.carregou} cor='#16a34a' />
        </div>

        {/* CONVERSÃO */}
        <div style={{
          background: '#fff', borderRadius: 18, padding: 18, marginTop: 10,
          border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, marginBottom: 8 }}>
              <TrendingUp size={15} /> Taxa de carregamento
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 99, height: 10, overflow: 'hidden' }}>
              <div style={{ width: `${conversao}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#16a34a,#22c55e)', transition: 'width .5s' }} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{conversao}%</div>
        </div>

        {/* RANKING (admin) */}
        {isAdmin && abaAdmin === 'ranking' && (
          <div style={{ marginTop: 16 }}>
            <RankingAdmin captacoes={captacoes} />
          </div>
        )}

        {/* LISTA */}
        {(!isAdmin || abaAdmin === 'lista') && (
          <>
            {/* BUSCA + FILTROS */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                <Search size={16} color='#94a3b8' style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder='Buscar motorista, placa...'
                  style={{ ...inputSt, marginBottom: 0, paddingLeft: 36 }}
                />
              </div>
              {['Todas', ...OPERACOES].map(op => (
                <button key={op} onClick={() => setFiltroOp(op)} style={{
                  padding: '10px 14px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 12,
                  border: filtroOp === op ? '2px solid #d97706' : '1px solid #e2e8f0',
                  background: filtroOp === op ? '#fffbeb' : '#fff',
                  color: filtroOp === op ? '#b45309' : '#64748b',
                  whiteSpace: 'nowrap',
                }}>{op}</button>
              ))}
            </div>

            {/* CARDS */}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lista.length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                  <Users size={40} style={{ opacity: .3, marginBottom: 10 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Nenhum motorista por aqui.</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13 }}>Clique no + para adicionar.</p>
                </div>
              )}
              {lista.map(c => {
                const s   = STATUS[c.status] || STATUS.contatado
                const Icon = s.IconComp
                const opCor = OP_CORES[c.produto || c.operacao] || OP_CORES.Outro
                const telefLimpo = (c.telefone || '').replace(/\D/g, '')

                return (
                  <div key={c.id} className='cap-list-item' style={{
                    background: '#fff', borderRadius: 16, padding: 16,
                    border: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: 12,
                    boxShadow: '0 2px 8px -4px rgba(0,0,0,.05)', transition: 'all .15s',
                  }}>
                    {/* Ícone status */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, background: `${s.cor}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                    }}>
                      <Icon size={21} color={s.cor} />
                    </div>

                    {/* Informações */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{c.motorista}</span>
                        {c.placa && <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: '#f1f5f9', borderRadius: 6, padding: '2px 7px' }}>{c.placa}</span>}
                        {(c.produto || c.operacao) && (
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99,
                            background: opCor.bg, color: opCor.color,
                          }}>{c.produto || c.operacao}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: 13, marginTop: 2 }}>
                        <Phone size={12} />
                        <a href={`https://wa.me/55${telefLimpo}`} target='_blank' rel='noopener noreferrer'
                          style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
                          {c.telefone}
                        </a>
                        {c.origem && <><span style={{ opacity: .4 }}>·</span><span>{c.origem}</span></>}
                        {c.destino && <><span style={{ opacity: .4 }}>→</span><span>{c.destino}</span></>}
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 600, color: s.cor, marginTop: 4 }}>{s.label}</div>

                      {isAdmin && c.captadoPor && (
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>por <strong>{c.captadoPor}</strong></div>
                      )}

                      {c.obs && (
                        <div style={{
                          marginTop: 8, padding: '7px 10px', borderRadius: 9,
                          background: '#fef2f2', border: '1px solid #fecaca',
                          color: '#b91c1c', fontSize: 12.5,
                          display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.4,
                        }}>
                          <MessageSquare size={13} style={{ marginTop: 1, flexShrink: 0 }} /> {c.obs}
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      {c.status !== 'carregou' && (c.captadoPor === usuarioAtual?.usuario || isAdmin) && (
                        <button className='cap-avancar' onClick={() => avancar(c)} style={{
                          border: 'none', background: s.cor, color: '#fff', borderRadius: 9,
                          padding: '7px 10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
                        }}>Avançar <ChevronRight size={13} /></button>
                      )}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(c.captadoPor === usuarioAtual?.usuario || isAdmin) && (
                          <button onClick={() => { setEditando(c); setModal(true) }} style={iconBtn}>
                            <Pencil size={14} color='#64748b' />
                          </button>
                        )}
                        {(c.captadoPor === usuarioAtual?.usuario || isAdmin) && (
                          <button onClick={() => setConfirmExcluir(c.id)} style={iconBtn}>
                            <Trash2 size={14} color='#dc2626' />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <button onClick={() => { setEditando(null); setModal(true) }} style={{
        position: 'fixed', bottom: 28, right: 22, width: 58, height: 58, borderRadius: 18, border: 'none',
        background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff', cursor: 'pointer',
        boxShadow: '0 12px 30px -8px rgba(217,119,6,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 40,
      }}>
        <Plus size={28} />
      </button>

      <ModalMotorista
        aberto={modal}
        fechar={() => { setModal(false); setEditando(null) }}
        salvar={salvarModal}
        editando={editando}
      />

      {confirmExcluir && (
        <ConfirmDialog
          message='Excluir esta captação permanentemente?'
          onConfirm={() => { excluirCaptacao(confirmExcluir); setConfirmExcluir(null) }}
          onCancel={() => setConfirmExcluir(null)}
        />
      )}
    </div>
  )
}
