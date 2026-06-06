import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const EMPTY = { nome: '', telefone: '', empresa: '', tipo: 'Motorista', obs: '' }

const MEDAL = (i) => {
  if (i === 0) return { bg: 'linear-gradient(135deg,#92400e,#f59e0b)', border: 'rgba(245,158,11,0.35)', icon: '🥇', glow: 'rgba(245,158,11,0.25)', color: '#f59e0b' }
  if (i === 1) return { bg: 'linear-gradient(135deg,#374151,#9ca3af)', border: 'rgba(156,163,175,0.3)', icon: '🥈', glow: 'rgba(156,163,175,0.15)', color: '#9ca3af' }
  if (i === 2) return { bg: 'linear-gradient(135deg,#7c2d12,#ea580c)', border: 'rgba(234,88,12,0.3)', icon: '🥉', glow: 'rgba(234,88,12,0.15)', color: '#ea580c' }
  return { bg: 'var(--bg)', border: 'var(--line)', icon: `${i + 1}`, glow: 'transparent', color: 'var(--muted)' }
}

export default function Captacao() {
  const { captacoes = [], adicionarCaptacao, marcarCarregou, excluirCaptacao, usuarioAtual, toast } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'
  const [form, setForm] = useState(EMPTY)
  const [confirmExcluir, setConfirmExcluir] = useState(null)
  const [busca, setBusca] = useState('')
  const [tab, setTab] = useState('ranking')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSalvar = () => {
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast('Preencha nome e telefone.', 'err'); return
    }
    adicionarCaptacao(form)
    setForm(EMPTY)
  }

  const ranking = () => {
    const map = {}
    for (const c of captacoes) {
      const u = c.captadoPor || 'Desconhecido'
      if (!map[u]) map[u] = { total: 0, carregou: 0 }
      map[u].total++
      if (c.carregou) map[u].carregou++
    }
    return Object.entries(map)
      .map(([nome, s]) => ({ nome, ...s, taxa: s.total ? Math.round(s.carregou / s.total * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
  }

  const rank = ranking()
  const meusCaptados = captacoes.filter(c => c.captadoPor === usuarioAtual?.usuario)
  const meusCarregaram = meusCaptados.filter(c => c.carregou)
  const taxa = meusCaptados.length ? Math.round(meusCarregaram.length / meusCaptados.length * 100) : 0

  const listaFiltrada = captacoes.filter(c => {
    const txt = `${c.nome} ${c.empresa} ${c.telefone}`.toUpperCase()
    return !busca || txt.includes(busca.toUpperCase())
  })

  /* ── OPERADOR ── */
  if (!isAdmin) {
    return (
      <>
        <section className="aba active">
          {/* Mini stats pessoais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'Captados', value: meusCaptados.length, color: '#60a5fa', icon: '📋' },
              { label: 'Carregaram', value: meusCarregaram.length, color: '#4ade80', icon: '✅' },
              { label: 'Conversão', value: `${taxa}%`, color: '#a78bfa', icon: '📈' },
            ].map(s => (
              <div key={s.label} className="box" style={{ margin: 0, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="box">
            <div className="box-title"><h2>Novo contato</h2><span>Registre motoristas e transportadoras</span></div>
            <div className="form-grid">
              <div className="field"><label>Nome *</label><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo" /></div>
              <div className="field"><label>Telefone / WhatsApp *</label><input value={form.telefone} onChange={e => set('telefone', e.target.value.replace(/[^0-9]/g, ''))} placeholder="64999999999" /></div>
              <div className="field"><label>Empresa</label><input value={form.empresa} onChange={e => set('empresa', e.target.value)} placeholder="Transportadora..." /></div>
              <div className="field">
                <label>Tipo</label>
                <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  <option>Motorista</option><option>Transportadora</option><option>Autônomo</option><option>Outro</option>
                </select>
              </div>
              <div className="field wide"><label>Observação</label><input value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Ex: prefere carregar de manhã..." /></div>
            </div>
            <button className="btn-blue btn-full" onClick={handleSalvar}>+ Salvar contato</button>
          </div>

          {/* Lista pessoal */}
          <div className="box">
            <div className="box-title"><h2>Meus contatos</h2><span>{meusCaptados.length} contato(s)</span></div>
            {meusCaptados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14 }}>Nenhum contato ainda. Adicione o primeiro acima.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {meusCaptados.map(c => (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--bg)', border: '1px solid var(--line)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <a href={`https://wa.me/55${c.telefone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', fontWeight: 600, textDecoration: 'none' }}>📱 {c.telefone}</a>
                        {c.empresa && <span>· {c.empresa}</span>}
                        <span className="badge badge-logistica" style={{ fontSize: 10, padding: '1px 7px' }}>{c.tipo}</span>
                      </div>
                      {c.obs && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, opacity: .65 }}>{c.obs}</div>}
                    </div>
                    <button
                      onClick={() => marcarCarregou(c.id)}
                      style={{
                        flexShrink: 0,
                        background: c.carregou ? 'linear-gradient(135deg,#15803d,#16a34a)' : 'var(--card)',
                        color: c.carregou ? 'white' : 'var(--muted)',
                        border: `1px solid ${c.carregou ? 'transparent' : 'var(--line)'}`,
                        borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: c.carregou ? '0 4px 12px rgba(22,163,74,.25)' : 'none',
                      }}
                    >{c.carregou ? '✓ Carregou' : 'Carregou?'}</button>
                    <button className="btn-red btn-small" onClick={() => setConfirmExcluir(c.id)} style={{ flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {confirmExcluir && (
          <ConfirmDialog
            message="Excluir este contato permanentemente?"
            onConfirm={() => { excluirCaptacao(confirmExcluir); setConfirmExcluir(null) }}
            onCancel={() => setConfirmExcluir(null)}
          />
        )}
      </>
    )
  }

  /* ── ADMIN ── */
  const totalGeral = captacoes.length
  const totalCarregou = captacoes.filter(c => c.carregou).length

  return (
    <>
      <section className="aba active">
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Captação de Leads</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Ranking de captações e conversões da equipe</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total captados', value: totalGeral, color: '#60a5fa', icon: '📋' },
            { label: 'Carregaram', value: totalCarregou, color: '#4ade80', icon: '✅' },
            { label: 'Conversão geral', value: totalGeral ? `${Math.round(totalCarregou / totalGeral * 100)}%` : '0%', color: '#a78bfa', icon: '📈' },
            { label: 'Captadores', value: rank.length, color: '#f59e0b', icon: '👥' },
          ].map(s => (
            <div key={s.label} className="box" style={{ margin: 0, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['ranking', '🏆 Ranking'],['contatos', '📋 Todos os contatos']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: tab === id ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)' : 'var(--card)',
              color: tab === id ? 'white' : 'var(--muted)',
              border: tab === id ? 'none' : '1px solid var(--line)',
            }}>{label}</button>
          ))}
        </div>

        {/* ── RANKING ── */}
        {tab === 'ranking' && (
          rank.length === 0 ? (
            <div className="box" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Nenhuma captação registrada ainda</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>As captações dos operadores aparecerão aqui</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rank.map((r, i) => {
                const m = MEDAL(i)
                const barColor = r.taxa >= 60 ? '#4ade80' : r.taxa >= 30 ? '#f59e0b' : '#f87171'
                return (
                  <div key={r.nome} style={{
                    background: 'var(--card)',
                    border: `1.5px solid ${m.border}`,
                    borderRadius: 16,
                    padding: '18px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: i < 3 ? `0 4px 24px ${m.glow}` : 'none',
                  }}>
                    {/* Medal */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                      background: m.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: i < 3 ? 24 : 14, fontWeight: 900,
                      color: i < 3 ? undefined : m.color,
                      boxShadow: i < 3 ? `0 4px 12px ${m.glow}` : 'none',
                    }}>{m.icon}</div>

                    {/* Name + bar */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.nome}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${r.taxa}%`, background: barColor, borderRadius: 4, transition: 'width .5s ease' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 34, textAlign: 'right' }}>{r.taxa}%</span>
                      </div>
                    </div>

                    {/* Counts */}
                    <div style={{ display: 'flex', gap: 16, flexShrink: 0, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>{r.total}</div>
                        <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 3 }}>captados</div>
                      </div>
                      <div style={{ width: 1, height: 32, background: 'var(--line)' }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>{r.carregou}</div>
                        <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 3 }}>carregaram</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ── TODOS CONTATOS ── */}
        {tab === 'contatos' && (
          <div className="box">
            <div className="filters" style={{ marginBottom: 14 }}>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar nome, empresa, telefone..." />
              {busca && <button className="btn-light btn-small" onClick={() => setBusca('')}>Limpar</button>}
            </div>
            {listaFiltrada.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>Nenhum contato encontrado.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {listaFiltrada.map(c => (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--bg)', border: '1px solid var(--line)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{c.nome}</span>
                        <span className="badge badge-logistica" style={{ fontSize: 10 }}>{c.tipo}</span>
                        {c.carregou && <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>✓ Carregou</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <a href={`https://wa.me/55${c.telefone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', fontWeight: 600, textDecoration: 'none' }}>📱 {c.telefone}</a>
                        {c.empresa && <span>{c.empresa}</span>}
                        <span style={{ opacity: .6 }}>por <strong>{c.captadoPor}</strong></span>
                        <span style={{ opacity: .45 }}>{c.data}</span>
                      </div>
                      {c.obs && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, opacity: .6 }}>{c.obs}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}
