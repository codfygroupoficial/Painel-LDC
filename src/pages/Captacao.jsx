import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const EMPTY = { nome: '', telefone: '', empresa: '', tipo: 'Motorista', obs: '' }

function medalha(pos) {
  if (pos === 0) return { icon: '🥇', cor: '#f59e0b' }
  if (pos === 1) return { icon: '🥈', cor: '#94a3b8' }
  if (pos === 2) return { icon: '🥉', cor: '#b45309' }
  return { icon: `#${pos + 1}`, cor: 'var(--muted)' }
}

export default function Captacao() {
  const { captacoes, adicionarCaptacao, marcarCarregou, excluirCaptacao, usuarioAtual, toast } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'
  const [form, setForm] = useState(EMPTY)
  const [confirmExcluir, setConfirmExcluir] = useState(null)
  const [busca, setBusca] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSalvar = () => {
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast('Preencha nome e telefone.', 'err'); return
    }
    adicionarCaptacao(form)
    setForm(EMPTY)
  }

  /* ── ranking ── */
  const ranking = () => {
    const map = {}
    for (const c of captacoes) {
      const u = c.captadoPor || 'desconhecido'
      if (!map[u]) map[u] = { total: 0, carregou: 0 }
      map[u].total++
      if (c.carregou) map[u].carregou++
    }
    return Object.entries(map)
      .map(([nome, s]) => ({ nome, ...s }))
      .sort((a, b) => b.total - a.total)
  }

  const lista = captacoes.filter(c => {
    const txt = `${c.nome} ${c.empresa} ${c.telefone}`.toUpperCase()
    return !busca || txt.includes(busca.toUpperCase())
  })

  /* ── VIEW OPERADOR ── */
  const viewOperador = (
    <>
      {/* Form */}
      <div className="box">
        <div className="box-title">
          <h2>Novo contato captado</h2>
          <span>Registre motoristas e transportadoras para contato</span>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Nome</label>
            <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="field">
            <label>Telefone / WhatsApp</label>
            <input value={form.telefone} onChange={e => set('telefone', e.target.value.replace(/[^0-9]/g, ''))} placeholder="64999999999" />
          </div>
          <div className="field">
            <label>Empresa / Transportadora</label>
            <input value={form.empresa} onChange={e => set('empresa', e.target.value)} placeholder="Ex: Via Log" />
          </div>
          <div className="field">
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              <option>Motorista</option>
              <option>Transportadora</option>
              <option>Autônomo</option>
              <option>Outro</option>
            </select>
          </div>
          <div className="field wide">
            <label>Observação</label>
            <input value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Ex: prefere carregar de manhã, tem caminhão baú..." />
          </div>
        </div>
        <button className="btn-blue btn-full" onClick={handleSalvar}>Salvar contato</button>
      </div>

      {/* Lista pessoal */}
      <div className="box">
        <div className="box-title">
          <h2>Meus contatos captados</h2>
          <span>{captacoes.filter(c => c.captadoPor === usuarioAtual?.usuario).length} contato(s)</span>
        </div>
        <div className="filters" style={{ marginBottom: 12 }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar nome, empresa, telefone..." />
          {busca && <button className="btn-light btn-small" onClick={() => setBusca('')}>Limpar</button>}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>Telefone</th><th>Empresa</th><th>Tipo</th><th>Obs</th><th>Carregou?</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {lista.filter(c => !isAdmin && c.captadoPor === usuarioAtual?.usuario).length === 0
                ? <tr><td colSpan={7} className="empty">Nenhum contato ainda.</td></tr>
                : lista.filter(c => c.captadoPor === usuarioAtual?.usuario).map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.nome}</strong><br /><small style={{ color: 'var(--muted)' }}>{c.data}</small></td>
                    <td>
                      <a href={`https://wa.me/55${c.telefone}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
                        {c.telefone}
                      </a>
                    </td>
                    <td>{c.empresa || '-'}</td>
                    <td><span className="badge badge-logistica">{c.tipo}</span></td>
                    <td style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.obs || '-'}</td>
                    <td>
                      <button
                        onClick={() => marcarCarregou(c.id)}
                        style={{
                          background: c.carregou ? 'linear-gradient(135deg,#15803d,#16a34a)' : 'var(--bg)',
                          color: c.carregou ? 'white' : 'var(--muted)',
                          border: `1px solid ${c.carregou ? 'transparent' : 'var(--line)'}`,
                          borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          boxShadow: c.carregou ? '0 4px 12px rgba(22,163,74,.3)' : 'none',
                        }}
                      >
                        {c.carregou ? '✓ Carregou' : 'Marcar'}
                      </button>
                    </td>
                    <td>
                      <button className="btn-red btn-small" onClick={() => setConfirmExcluir(c.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  /* ── VIEW ADMIN ── */
  const rank = ranking()
  const totalGeral = captacoes.length
  const totalCarregou = captacoes.filter(c => c.carregou).length

  const viewAdmin = (
    <>
      {/* Hero stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16,
      }}>
        {[
          { label: 'Total captados', value: totalGeral, cor: '#60a5fa', icon: '📋' },
          { label: 'Carregaram', value: totalCarregou, cor: '#4ade80', icon: '✅' },
          { label: 'Taxa conversão', value: totalGeral ? `${Math.round(totalCarregou / totalGeral * 100)}%` : '0%', cor: '#a78bfa', icon: '📈' },
          { label: 'Captadores ativos', value: rank.length, cor: '#f59e0b', icon: '👥' },
        ].map(s => (
          <div key={s.label} className="box" style={{ margin: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 26 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.cor }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Ranking captações */}
        <div className="box" style={{ margin: 0 }}>
          <div className="box-title">
            <h2>🏆 Ranking de captações</h2>
            <span>Quem mais captou contatos</span>
          </div>
          {rank.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhuma captação ainda.</p>
            : rank.map((r, i) => {
              const m = medalha(i)
              return (
                <div key={r.nome} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: i < rank.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  <div style={{ width: 36, textAlign: 'center', fontSize: i < 3 ? 22 : 13, fontWeight: 900, color: m.cor, flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.carregou} de {r.total} carregaram</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: m.cor }}>{r.total}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>captados</div>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Ranking conversão */}
        <div className="box" style={{ margin: 0 }}>
          <div className="box-title">
            <h2>📈 Ranking de conversão</h2>
            <span>Cujos contatos mais carregaram</span>
          </div>
          {rank.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhuma conversão ainda.</p>
            : [...rank].sort((a, b) => b.carregou - a.carregou).map((r, i) => {
              const m = medalha(i)
              const taxa = r.total ? Math.round(r.carregou / r.total * 100) : 0
              return (
                <div key={r.nome} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: i < rank.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  <div style={{ width: 36, textAlign: 'center', fontSize: i < 3 ? 22 : 13, fontWeight: 900, color: m.cor, flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.nome}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${taxa}%`, background: taxa >= 60 ? '#4ade80' : taxa >= 30 ? '#f59e0b' : '#f87171', borderRadius: 3, transition: 'width .4s' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', minWidth: 28 }}>{taxa}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80' }}>{r.carregou}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>carregaram</div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Todos contatos */}
      <div className="box">
        <div className="box-title">
          <h2>Todos os contatos captados</h2>
          <span>{captacoes.length} total</span>
        </div>
        <div className="filters" style={{ marginBottom: 12 }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar nome, empresa, telefone..." />
          {busca && <button className="btn-light btn-small" onClick={() => setBusca('')}>Limpar</button>}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>Telefone</th><th>Empresa</th><th>Tipo</th><th>Captado por</th><th>Carregou?</th><th>Data</th></tr>
            </thead>
            <tbody>
              {lista.length === 0
                ? <tr><td colSpan={7} className="empty">Nenhum contato encontrado.</td></tr>
                : lista.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.nome}</strong></td>
                    <td>
                      <a href={`https://wa.me/55${c.telefone}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
                        {c.telefone}
                      </a>
                    </td>
                    <td>{c.empresa || '-'}</td>
                    <td><span className="badge badge-logistica">{c.tipo}</span></td>
                    <td><strong>{c.captadoPor}</strong></td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        color: c.carregou ? '#4ade80' : 'var(--muted)',
                        fontWeight: 700, fontSize: 12,
                      }}>
                        {c.carregou ? '✓ Sim' : '— Não'}
                      </span>
                    </td>
                    <td><small>{c.data}</small></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  return (
    <>
      <section className="aba active" id="abaCaptacao">
        {isAdmin ? viewAdmin : viewOperador}
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
