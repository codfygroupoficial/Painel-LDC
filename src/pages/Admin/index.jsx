import { useState, useEffect, useCallback } from 'react'
import { baixarAdmin } from '../../lib/supabase'
import { dinheiro, moedaNumero, slaPendencia, resumirSLA, tempoDecorrido } from '../../utils/index'
import { nomeFilial } from '../../data/filiais'
import { useApp } from '../../context/AppContext'
import { ADMIN_USERNAME } from '../../data/defaultUsers'
import { montarMotoristasQueCarregam } from './helpers'
import SlaMini from './components/SlaMini'

const funcionarioVazio = { usuario: '', senha: '', nome: '', cargo: 'Operador', filial: '' }

export default function Admin() {
  const { criarUsuario, editarUsuario, usuarios, excluirUsuario, filiais, criarFilial, excluirFilial } = useApp()

  const [rows, setRows] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filialFiltro, setFilialFiltro] = useState('')
  const [busca, setBusca] = useState('')
  const [buscaMotorista, setBuscaMotorista] = useState('')
  const [filtroOperacaoMotorista, setFiltroOperacaoMotorista] = useState('')
  const [novaFilial, setNovaFilial] = useState({ id: '', nome: '', cidade: '', estado: '' })
  const [funcionario, setFuncionario] = useState(funcionarioVazio)
  const [editandoUsuario, setEditandoUsuario] = useState(null)

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

  const lancadas = rows.filter(r => r.tipo === 'lancada').map(r => ({ ...r.dados, filial: r.filial })).filter(Boolean)
  const pendentes = rows.filter(r => r.tipo === 'a_lancar').map(r => ({ ...r.dados, filial: r.filial })).filter(Boolean)
  const captacoes = rows.filter(r => r.tipo === 'captacao').map(r => ({ ...r.dados, filial: r.filial || r.dados?.filial })).filter(Boolean)

  const motoristasQueCarregam = montarMotoristasQueCarregam(captacoes)
  const operacoesMotoristas = [...new Set(motoristasQueCarregam.flatMap(m => m.operacoesLista))].filter(Boolean)
  const motoristasFiltrados = motoristasQueCarregam.filter(m => {
    const t = [m.nome, m.telefone, m.obs, m.operacoesLista.join(' '), m.filiaisLista.map(nomeFilial).join(' '), m.captadoresLista.join(' ')].join(' ').toUpperCase()
    return (!buscaMotorista || t.includes(buscaMotorista.toUpperCase())) && (!filtroOperacaoMotorista || m.operacoesLista.includes(filtroOperacaoMotorista))
  })

  const filiaisAtivas = [...new Set([...rows.map(r => r.filial || 'jatai-go'), ...pendentes.map(p => p.filial || 'jatai-go')])]
  const slaGlobal = resumirSLA(pendentes)

  const statsGlobal = {
    filiais: filiaisAtivas.length,
    totalEstadias: lancadas.length,
    totalPendentes: pendentes.length,
    valorTotal: dinheiro(lancadas.reduce((s, e) => s + moedaNumero(e.valor), 0)),
    urgentes: pendentes.filter(e => e.prioridade === 'Urgente').length,
    abertas: lancadas.filter(e => e.status === 'Aberto').length,
    motoristasCarregam: motoristasQueCarregam.length,
    criticas: slaGlobal.critico,
  }

  const statsFilial = (filial) => {
    const l = lancadas.filter(e => e.filial === filial)
    const p = pendentes.filter(e => e.filial === filial)
    const sla = resumirSLA(p)
    const pior = p.map(x => ({ ...x, sla: slaPendencia(x.dataCriacao) })).sort((a, b) => b.sla.ordem - a.sla.ordem)[0]
    return {
      nome: nomeFilial(filial),
      lancadas: l.length,
      pendentes: p.length,
      abertas: l.filter(e => e.status === 'Aberto').length,
      finalizadas: l.filter(e => e.status === 'Finalizado').length,
      valor: dinheiro(l.reduce((s, e) => s + moedaNumero(e.valor), 0)),
      urgentes: p.filter(e => e.prioridade === 'Urgente').length,
      sla,
      pior,
    }
  }

  const listaFiltrada = lancadas.filter(e => {
    const txt = `${e.placa} ${e.motorista} ${e.chamado} ${e.transportadora}`.toUpperCase()
    return (!filialFiltro || e.filial === filialFiltro) && (!busca || txt.includes(busca.toUpperCase()))
  })

  const limparFuncionario = () => { setFuncionario(funcionarioVazio); setEditandoUsuario(null) }
  const iniciarEdicao = (u) => { setEditandoUsuario(u.usuario); setFuncionario({ usuario: u.usuario, senha: '', nome: u.nome || '', cargo: u.cargo || 'Operador', filial: u.filial || '' }) }

  const handleSalvarFuncionario = async () => {
    if (!funcionario.nome || !funcionario.filial || !funcionario.cargo) { alert('Preencha nome, cargo e filial.'); return }
    if (editandoUsuario) { const ok = await editarUsuario(editandoUsuario, funcionario); if (ok) limparFuncionario(); return }
    if (!funcionario.usuario || !funcionario.senha) { alert('Preencha login e senha para criar o funcionário.'); return }
    const ok = await criarUsuario(funcionario)
    if (ok) limparFuncionario()
  }

  const handleAdicionarFilial = () => {
    if (criarFilial(novaFilial)) setNovaFilial({ id: '', nome: '', cidade: '', estado: '' })
  }

  if (carregando) return <section className="aba active"><div className="box" style={{ textAlign: 'center', padding: 40 }}><p>Carregando dados de todas as filiais...</p><small style={{ color: 'var(--muted)' }}>Aguarde até 8 segundos</small></div></section>

  return (
    <section className="aba active">
      <div className="box" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', border: 'none' }}>
        <div className="box-title"><div><h2 style={{ color: '#fff', fontSize: 22 }}>🏢 Painel Administrativo</h2><span style={{ color: 'rgba(255,255,255,.7)' }}>Visão consolidada de todas as filiais, SLA e motoristas confiáveis</span></div><button className="btn-light btn-small" onClick={carregar}>↺ Atualizar</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
          {[
            { label: 'Filiais ativas', value: statsGlobal.filiais, cor: '#4ade80' },
            { label: 'Total lançadas', value: statsGlobal.totalEstadias, cor: '#60a5fa' },
            { label: 'A lançar', value: statsGlobal.totalPendentes, cor: '#f59e0b' },
            { label: 'Valor total', value: statsGlobal.valorTotal, cor: '#a78bfa' },
            { label: 'Abertas', value: statsGlobal.abertas, cor: '#fb923c' },
            { label: 'SLA crítico', value: statsGlobal.criticas, cor: '#f87171' },
            { label: 'Motoristas carregam', value: statsGlobal.motoristasCarregam, cor: '#22c55e' },
          ].map(s => <div key={s.label} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 16px' }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 4 }}>{s.label}</div><div style={{ fontSize: 20, fontWeight: 700, color: s.cor }}>{s.value}</div></div>)}
        </div>
      </div>

      <div className="box">
        <div className="box-title"><div><h2>⏱️ SLA por filial</h2><span>Mostra quais filiais têm pendências paradas e o nível de risco.</span></div><span className="sla-badge sla-critico">{slaGlobal.critico} críticas</span></div>
        <div className="admin-sla-grid">
          {filiaisAtivas.map(filial => {
            const s = statsFilial(filial)
            return (
              <div key={filial} className={`admin-sla-card ${s.sla.critico ? 'critico' : s.sla.urgente ? 'urgente' : s.sla.atencao ? 'atencao' : ''}`}>
                <div className="admin-sla-card-head"><div><strong>{s.nome}</strong><small>{filial}</small></div><span>{s.pendentes} pend.</span></div>
                <SlaMini resumo={s.sla} />
                {s.pior && <div className="admin-sla-worst"><strong>{s.pior.placa || 'Sem placa'}</strong><span>{s.pior.sla.label} · {tempoDecorrido(s.pior.dataCriacao)} aguardando</span></div>}
              </div>
            )
          })}
          {filiaisAtivas.length === 0 && <div className="empty">Nenhuma filial com dados ainda.</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {filiaisAtivas.map(filial => { const s = statsFilial(filial); return <div key={filial} className="box" style={{ margin: 0 }}><div className="box-title"><h2 style={{ fontSize: 16 }}>🏭 {s.nome}</h2><span className="badge badge-logistica">{filial}</span></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>{[{ label: 'Lançadas', value: s.lancadas }, { label: 'A lançar', value: s.pendentes }, { label: 'Abertas', value: s.abertas }, { label: 'Finalizadas', value: s.finalizadas }].map(i => <div key={i.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 12px' }}><div style={{ fontSize: 11, color: 'var(--muted)' }}>{i.label}</div><div style={{ fontSize: 18, fontWeight: 700 }}>{i.value}</div></div>)}</div><div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: 'var(--muted)' }}>Valor total</span><strong style={{ color: '#4ade80' }}>{s.valor}</strong></div>{s.urgentes > 0 && <div style={{ marginTop: 6, color: '#f87171', fontSize: 13 }}>⚠️ {s.urgentes} urgente(s)</div>}</div> })}
      </div>

      <div className="box">
        <div className="box-title"><div><h2>🚛 Motoristas que realmente carregaram</h2><span>Cadastro oficial gerado automaticamente pelas captações marcadas como “Carregou”.</span></div><span className="badge badge-logistica">{motoristasFiltrados.length} motorista(s)</span></div>
        <div className="filters"><input value={buscaMotorista} onChange={e => setBuscaMotorista(e.target.value)} placeholder="Buscar nome, telefone, operação, captador..." /><select value={filtroOperacaoMotorista} onChange={e => setFiltroOperacaoMotorista(e.target.value)}><option value="">Todas operações</option>{operacoesMotoristas.map(op => <option key={op} value={op}>{op}</option>)}</select><button className="btn-light btn-small" onClick={() => { setBuscaMotorista(''); setFiltroOperacaoMotorista('') }}>Limpar</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 14 }}>{[{ label: 'Motoristas confiáveis', value: motoristasQueCarregam.length, icon: '👤' }, { label: 'Carregamentos confirmados', value: motoristasQueCarregam.reduce((s, m) => s + m.carregamentos, 0), icon: '✅' }, { label: 'Operações atendidas', value: operacoesMotoristas.length, icon: '🌾' }].map(item => <div key={item.label} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}><div style={{ color: 'var(--muted)', fontSize: 12 }}>{item.icon} {item.label}</div><strong style={{ fontSize: 24 }}>{item.value}</strong></div>)}</div>
        <div className="table-wrap" style={{ marginTop: 14 }}><div className="table-scroll"><table><thead><tr><th>Motorista</th><th>Telefone</th><th>WhatsApp</th><th>Operações</th><th>Filiais</th><th>Captadores</th><th>Carregamentos</th><th>Último carregamento</th><th>Observação</th></tr></thead><tbody>{motoristasFiltrados.length === 0 ? <tr><td colSpan={9} className="empty">Nenhum motorista com status carregou ainda.</td></tr> : motoristasFiltrados.map(m => <tr key={m.chave}><td><strong>{m.nome}</strong></td><td>{m.telefone || '-'}</td><td>{m.telefone ? <a className="btn-green btn-small" href={`https://wa.me/55${limparTelefone(m.telefone)}`} target="_blank" rel="noopener noreferrer">Chamar</a> : '-'}</td><td>{m.operacoesLista.map(op => <span key={op} className="badge badge-logistica" style={{ marginRight: 4 }}>{op}</span>)}</td><td>{m.filiaisLista.map(f => nomeFilial(f)).join(', ')}</td><td>{m.captadoresLista.join(', ')}</td><td><strong style={{ color: '#22c55e' }}>{m.carregamentos}</strong></td><td>{m.ultimaData || '-'}</td><td>{m.obs || '-'}</td></tr>)}</tbody></table></div></div>
      </div>

      <div className="box"><div className="box-title"><h2>Todas as estadias</h2><span>{listaFiltrada.length} registro(s)</span></div><div className="filters"><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar placa, motorista, chamado..." /><select value={filialFiltro} onChange={e => setFilialFiltro(e.target.value)}><option value="">Todas as filiais</option>{filiaisAtivas.map(f => <option key={f} value={f}>{nomeFilial(f)}</option>)}</select><button className="btn-light btn-small" onClick={() => { setBusca(''); setFilialFiltro('') }}>Limpar</button></div><div className="table-wrap" style={{ marginTop: 12 }}><div className="table-scroll"><table><thead><tr><th>Filial</th><th>Chamado</th><th>Motorista</th><th>Placa</th><th>Valor</th><th>Status</th><th>Lançado por</th></tr></thead><tbody>{listaFiltrada.length === 0 ? <tr><td colSpan={7} className="empty">Nenhuma estadia encontrada.</td></tr> : listaFiltrada.map(e => <tr key={e.id}><td><span className="badge badge-logistica">{nomeFilial(e.filial)}</span></td><td><strong>{e.chamado || '-'}</strong></td><td>{e.motorista || '-'}</td><td><span className="plate">{e.placa || '-'}</span></td><td><strong>{e.valor || 'R$ 0,00'}</strong></td><td><span className={`status ${e.status === 'Finalizado' ? 'status-finalizado' : e.status === 'Feito' ? 'status-feito' : 'status-aberto'}`}>{e.status}</span></td><td>{e.lancadoPor || '-'}</td></tr>)}</tbody></table></div></div></div>

      <div className="box"><div className="box-title"><div><h2>👥 Gerenciar funcionários</h2><span>{editandoUsuario ? `Editando ${editandoUsuario}` : 'Criar, editar filial, cargo e senha dos funcionários'}</span></div>{editandoUsuario && <button className="btn-light btn-small" onClick={limparFuncionario}>Cancelar edição</button>}</div><div className="form-grid" style={{ marginBottom: 12 }}><div className="field"><label>Nome</label><input value={funcionario.nome} onChange={e => setFuncionario(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" /></div><div className="field"><label>Login</label><input disabled={!!editandoUsuario} value={funcionario.usuario} onChange={e => setFuncionario(p => ({ ...p, usuario: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))} placeholder="username" /></div><div className="field"><label>{editandoUsuario ? 'Nova senha opcional' : 'Senha'}</label><input type="password" value={funcionario.senha} onChange={e => setFuncionario(p => ({ ...p, senha: e.target.value }))} placeholder={editandoUsuario ? 'Deixe vazio para manter' : 'Senha do funcionário'} /></div><div className="field"><label>Cargo</label><select value={funcionario.cargo} onChange={e => setFuncionario(p => ({ ...p, cargo: e.target.value }))}><option>Operador</option><option>Admin</option><option>Visualizador</option></select></div><div className="field"><label>Filial</label><select value={funcionario.filial} onChange={e => setFuncionario(p => ({ ...p, filial: e.target.value }))}><option value="">Selecione...</option>{filiais.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></div></div><button className={editandoUsuario ? 'btn-green' : 'btn-blue'} onClick={handleSalvarFuncionario}>{editandoUsuario ? 'Salvar funcionário' : 'Criar funcionário'}</button><div style={{ marginTop: 16 }}>{usuarios.map(u => <div key={u.usuario} className="online-user-pill" style={{ marginBottom: 8 }}><div className="online-user-left"><span className="avatar mini">{u.avatar}</span><div><strong>{u.nome}</strong><small>{u.usuario} • {u.cargo} • {nomeFilial(u.filial)}</small></div></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn-light btn-small" onClick={() => iniciarEdicao(u)}>Editar</button>{u.usuario !== ADMIN_USERNAME && <button className="btn-red btn-small" onClick={() => confirm(`Excluir ${u.usuario}?`) && excluirUsuario(u.usuario)}>Excluir</button>}</div></div>)}</div></div>

      <div className="box"><div className="box-title"><h2>🏭 Gerenciar filiais</h2><span>{filiais.length} filial(is) cadastrada(s)</span></div><div style={{ marginBottom: 16 }}>{filiais.map(f => <div key={f.id} className="online-user-pill" style={{ marginBottom: 8 }}><div className="online-user-left"><div><strong>{f.nome}</strong><small>{f.cidade}{f.estado ? ` — ${f.estado}` : ''} • <code style={{ fontSize: 11 }}>{f.id}</code></small></div></div>{f.id !== 'jatai-go' && f.id !== 'mineiros-go' && <button className="btn-red btn-small" onClick={() => confirm(`Excluir filial ${f.nome}?`) && excluirFilial(f.id)}>Excluir</button>}</div>)}</div><div className="form-grid"><div className="field"><label>ID da filial</label><input value={novaFilial.id} onChange={e => setNovaFilial(p => ({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} placeholder="ex: jatai-go" /></div><div className="field"><label>Nome</label><input value={novaFilial.nome} onChange={e => setNovaFilial(p => ({ ...p, nome: e.target.value }))} placeholder="Via Log Jataí" /></div><div className="field"><label>Cidade</label><input value={novaFilial.cidade} onChange={e => setNovaFilial(p => ({ ...p, cidade: e.target.value }))} placeholder="Jataí" /></div><div className="field"><label>Estado</label><input value={novaFilial.estado} onChange={e => setNovaFilial(p => ({ ...p, estado: e.target.value.toUpperCase() }))} placeholder="GO" maxLength={2} /></div></div><button className="btn-green btn-full" onClick={handleAdicionarFilial}>Adicionar filial</button></div>
    </section>
  )
}
