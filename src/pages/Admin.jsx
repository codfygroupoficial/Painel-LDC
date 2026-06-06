import { useState, useEffect, useCallback } from 'react'
import { baixarAdmin } from '../lib/supabase'
import { dinheiro, moedaNumero } from '../utils/index'
import { nomeFilial } from '../data/filiais'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Admin() {
  const { criarUsuario, usuarios, excluirUsuario, filiais, criarFilial, excluirFilial, toast } = useApp()
  const [confirmExcluirUser, setConfirmExcluirUser] = useState(null)
  const [confirmExcluirFilial, setConfirmExcluirFilial] = useState(null)
  const [rows, setRows] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filialFiltro, setFilialFiltro] = useState('')
  const [busca, setBusca] = useState('')
  const [novaFilial, setNovaFilial] = useState({ id: '', nome: '', cidade: '', estado: '' })
  const [novoUsuario, setNovoUsuario] = useState({ usuario: '', senha: '', nome: '', cargo: 'Operador', filial: '' })

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
      const data = await Promise.race([baixarAdmin(), timeout])
      setRows(data || [])
    } catch {
      setRows([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const lancadas = rows
    .filter(r => r.tipo === 'lancada')
    .map(r => ({ ...r.dados, filial: r.filial }))
    .filter(Boolean)

  const pendentes = rows
    .filter(r => r.tipo === 'a_lancar')
    .map(r => ({ ...r.dados, filial: r.filial }))
    .filter(Boolean)

  const filiaisAtivas = [...new Set(rows.map(r => r.filial || 'principal'))]

  const statsGlobal = {
    filiais: filiaisAtivas.length,
    totalEstadias: lancadas.length,
    totalPendentes: pendentes.length,
    valorTotal: dinheiro(lancadas.reduce((s, e) => s + moedaNumero(e.valor), 0)),
    urgentes: pendentes.filter(e => e.prioridade === 'Urgente').length,
    abertas: lancadas.filter(e => e.status === 'Aberto').length,
  }

  const statsFilial = (filial) => {
    const l = lancadas.filter(e => e.filial === filial)
    const p = pendentes.filter(e => e.filial === filial)
    return {
      nome: nomeFilial(filial),
      lancadas: l.length,
      pendentes: p.length,
      abertas: l.filter(e => e.status === 'Aberto').length,
      finalizadas: l.filter(e => e.status === 'Finalizado').length,
      valor: dinheiro(l.reduce((s, e) => s + moedaNumero(e.valor), 0)),
      urgentes: p.filter(e => e.prioridade === 'Urgente').length,
    }
  }

  const listaFiltrada = lancadas.filter(e => {
    const txt = `${e.placa} ${e.motorista} ${e.chamado} ${e.transportadora}`.toUpperCase()
    return (!filialFiltro || e.filial === filialFiltro) && (!busca || txt.includes(busca.toUpperCase()))
  })

  const handleCriarUsuario = async () => {
    if (!novoUsuario.usuario || !novoUsuario.senha || !novoUsuario.nome || !novoUsuario.filial) {
      toast('Preencha todos os campos obrigatórios.', 'err'); return
    }
    await criarUsuario(novoUsuario)
    setNovoUsuario({ usuario: '', senha: '', nome: '', cargo: 'Operador', filial: '' })
  }

  const handleAdicionarFilial = () => {
    if (criarFilial(novaFilial)) {
      setNovaFilial({ id: '', nome: '', cidade: '', estado: '' })
    }
  }

  if (carregando) return (
    <section className="aba active">
      <div className="box" style={{ textAlign: 'center', padding: 40 }}>
        <p>Carregando dados de todas as filiais...</p>
        <small style={{ color: 'var(--muted)' }}>Aguarde até 8 segundos</small>
      </div>
    </section>
  )

  return (
    <>
    <section className="aba active">

      <div className="box" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', border: 'none' }}>
        <div className="box-title">
          <div>
            <h2 style={{ color: '#fff', fontSize: 22 }}>🏢 Painel Administrativo</h2>
            <span style={{ color: 'rgba(255,255,255,.7)' }}>Visão consolidada de todas as filiais</span>
          </div>
          <button className="btn-light btn-small" onClick={carregar}>↺ Atualizar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
          {[
            { label: 'Filiais ativas', value: statsGlobal.filiais, cor: '#4ade80' },
            { label: 'Total lançadas', value: statsGlobal.totalEstadias, cor: '#60a5fa' },
            { label: 'A lançar', value: statsGlobal.totalPendentes, cor: '#f59e0b' },
            { label: 'Valor total', value: statsGlobal.valorTotal, cor: '#a78bfa' },
            { label: 'Abertas', value: statsGlobal.abertas, cor: '#fb923c' },
            { label: 'Urgentes', value: statsGlobal.urgentes, cor: '#f87171' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.cor }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {filiaisAtivas.map(filial => {
          const s = statsFilial(filial)
          return (
            <div key={filial} className="box" style={{ margin: 0 }}>
              <div className="box-title">
                <h2 style={{ fontSize: 16 }}>🏭 {s.nome}</h2>
                <span className="badge badge-logistica">{filial}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {[
                  { label: 'Lançadas', value: s.lancadas },
                  { label: 'A lançar', value: s.pendentes },
                  { label: 'Abertas', value: s.abertas },
                  { label: 'Finalizadas', value: s.finalizadas },
                ].map(i => (
                  <div key={i.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{i.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{i.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Valor total</span>
                <strong style={{ color: '#4ade80' }}>{s.valor}</strong>
              </div>
              {s.urgentes > 0 && <div style={{ marginTop: 6, color: '#f87171', fontSize: 13 }}>⚠️ {s.urgentes} urgente(s)</div>}
            </div>
          )
        })}
        {filiaisAtivas.length === 0 && (
          <div className="box" style={{ margin: 0, textAlign: 'center', color: 'var(--muted)' }}>Nenhuma filial com dados ainda.</div>
        )}
      </div>

      <div className="box">
        <div className="box-title">
          <h2>Todas as estadias</h2>
          <span>{listaFiltrada.length} registro(s)</span>
        </div>
        <div className="filters">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar placa, motorista, chamado..." />
          <select value={filialFiltro} onChange={e => setFilialFiltro(e.target.value)}>
            <option value="">Todas as filiais</option>
            {filiaisAtivas.map(f => <option key={f} value={f}>{nomeFilial(f)}</option>)}
          </select>
          <button className="btn-light btn-small" onClick={() => { setBusca(''); setFilialFiltro('') }}>Limpar</button>
        </div>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Filial</th><th>Chamado</th><th>Motorista</th><th>Placa</th><th>Valor</th><th>Status</th><th>Lançado por</th></tr>
              </thead>
              <tbody>
                {listaFiltrada.length === 0
                  ? <tr><td colSpan={7} className="empty">Nenhuma estadia encontrada.</td></tr>
                  : listaFiltrada.map(e => (
                    <tr key={e.id}>
                      <td><span className="badge badge-logistica">{nomeFilial(e.filial)}</span></td>
                      <td><strong>{e.chamado || '-'}</strong></td>
                      <td>{e.motorista || '-'}</td>
                      <td><span className="plate">{e.placa || '-'}</span></td>
                      <td><strong>{e.valor || 'R$ 0,00'}</strong></td>
                      <td><span className={`status ${e.status === 'Finalizado' ? 'status-finalizado' : e.status === 'Feito' ? 'status-feito' : 'status-aberto'}`}>{e.status}</span></td>
                      <td>{e.lancadoPor || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="box-title"><h2>👥 Gerenciar usuários</h2></div>
        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="field"><label>Nome</label><input value={novoUsuario.nome} onChange={e => setNovoUsuario(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" /></div>
          <div className="field"><label>Login</label><input value={novoUsuario.usuario} onChange={e => setNovoUsuario(p => ({ ...p, usuario: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))} placeholder="username" /></div>
          <div className="field"><label>Senha</label><input type="password" value={novoUsuario.senha} onChange={e => setNovoUsuario(p => ({ ...p, senha: e.target.value }))} placeholder="Senha do usuário" /></div>
          <div className="field">
            <label>Cargo</label>
            <select value={novoUsuario.cargo} onChange={e => setNovoUsuario(p => ({ ...p, cargo: e.target.value }))}>
              <option>Operador</option><option>Admin</option><option>Visualizador</option>
            </select>
          </div>
          <div className="field">
            <label>Filial</label>
            <select value={novoUsuario.filial} onChange={e => setNovoUsuario(p => ({ ...p, filial: e.target.value }))}>
              <option value="">Selecione...</option>
              {filiais.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
        </div>
        <button className="btn-blue" onClick={handleCriarUsuario}>Criar usuário</button>
        <div style={{ marginTop: 16 }}>
          {usuarios.map(u => (
            <div key={u.usuario} className="online-user-pill" style={{ marginBottom: 8 }}>
              <div className="online-user-left">
                <span className="avatar mini">{u.avatar}</span>
                <div><strong>{u.nome}</strong><small>{u.usuario} • {u.cargo} • {nomeFilial(u.filial)}</small></div>
              </div>
              {u.usuario !== 'admin' && (
                <button className="btn-red btn-small" onClick={() => setConfirmExcluirUser(u.usuario)}>Excluir</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="box">
        <div className="box-title">
          <h2>🏭 Gerenciar filiais</h2>
          <span>{filiais.length} filial(is) cadastrada(s)</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          {filiais.map(f => (
            <div key={f.id} className="online-user-pill" style={{ marginBottom: 8 }}>
              <div className="online-user-left">
                <div>
                  <strong>{f.nome}</strong>
                  <small>{f.cidade}{f.estado ? ` — ${f.estado}` : ''} • <code style={{ fontSize: 11 }}>{f.id}</code></small>
                </div>
              </div>
              {f.id !== 'rondonopolis-mt' && (
                <button className="btn-red btn-small" onClick={() => setConfirmExcluirFilial(f.id)}>Excluir</button>
              )}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Adicionar nova filial:</p>
          <div className="form-grid">
            <div className="field"><label>ID da filial</label><input value={novaFilial.id} onChange={e => setNovaFilial(p => ({ ...p, id: e.target.value.toLowerCase().replace(/\s/g, '-') }))} placeholder="ex: sorriso-mt" /></div>
            <div className="field"><label>Nome</label><input value={novaFilial.nome} onChange={e => setNovaFilial(p => ({ ...p, nome: e.target.value }))} placeholder="ex: Via Log Sorriso" /></div>
            <div className="field"><label>Cidade</label><input value={novaFilial.cidade} onChange={e => setNovaFilial(p => ({ ...p, cidade: e.target.value }))} placeholder="ex: Sorriso" /></div>
            <div className="field"><label>Estado</label><input value={novaFilial.estado} onChange={e => setNovaFilial(p => ({ ...p, estado: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="MT" maxLength={2} /></div>
          </div>
          <button className="btn-purple" onClick={handleAdicionarFilial}>Adicionar filial</button>
        </div>
      </div>

    </section>

    {confirmExcluirUser && (
      <ConfirmDialog
        message={`Excluir o usuário "${confirmExcluirUser}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => { excluirUsuario(confirmExcluirUser); setConfirmExcluirUser(null) }}
        onCancel={() => setConfirmExcluirUser(null)}
      />
    )}
    {confirmExcluirFilial && (
      <ConfirmDialog
        message={`Excluir a filial "${nomeFilial(confirmExcluirFilial)}"?`}
        onConfirm={() => { excluirFilial(confirmExcluirFilial); setConfirmExcluirFilial(null) }}
        onCancel={() => setConfirmExcluirFilial(null)}
      />
    )}
    </>
  )
}
