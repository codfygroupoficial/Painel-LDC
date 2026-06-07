import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import * as legacy from '../../lib/supabase'
import * as v2 from '../../lib/supabaseV2'
import { gerarId } from '../../utils/index'
import { nomeFilial } from '../../data/filiais'
import '../../styles/captacao-base.css'
import '../../styles/captacao-nao-carregou.css'
import '../../styles/captacao-intelligence.css'

import { STATUS, OPERACOES, MODO_BANCO_INFO, iconBtn } from './constants'
import { agoraBR, hojeISO, normalizarItem, normalizarTelefone, loadLocal, saveLocal, abrirWhatsNumero, pct } from './helpers'
import StatCard from './components/StatCard'
import InsightCard from './components/InsightCard'
import ModalMotorista from './components/ModalMotorista'
import RankingEfetividade from './components/RankingEfetividade'
import MotivosNaoCarregou from './components/MotivosNaoCarregou'
import BancoMotoristas from './components/BancoMotoristas'

export default function Captacao() {
  const { usuarioAtual, toast } = useApp()
  const [motoristas, setMotoristas] = useState(loadLocal)
  const [busca, setBusca] = useState('')
  const [filtroOp, setFiltroOp] = useState('Todas')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [modoBanco, setModoBanco] = useState('auto')

  const isAdmin = usuarioAtual?.cargo === 'Admin'
  const filialAtual = usuarioAtual?.filial || 'jatai-go'
  const captadorId = usuarioAtual?.usuario || '-'
  const nomeCaptador = usuarioAtual?.nome || usuarioAtual?.usuario || 'Usuário'
  const corCaptador = isAdmin ? '#7c3aed' : '#d97706'

  useEffect(() => {
    saveLocal(motoristas)
  }, [motoristas])
  useEffect(() => {
    const carregarNuvem = async () => {
      setCarregando(true)
      try {
        const listaV2 = await v2.listarCaptacoesV2({ admin: isAdmin, filial: filialAtual })
        if (listaV2.length) setMotoristas(listaV2.map(normalizarItem))
        setModoBanco('v2')
      } catch {
        try {
          const rows = await legacy.baixarTodos(isAdmin ? null : filialAtual)
          const lista = rows
            .filter((r) => r.tipo === 'captacao')
            .map((r) => normalizarItem({ ...r.dados, filial: r.filial || r.dados?.filial }))
            .filter(Boolean)
          if (lista.length) setMotoristas(lista)
          setModoBanco('legado')
        } catch {
          setModoBanco('local')
        }
      } finally {
        setCarregando(false)
      }
    }
    carregarNuvem()
  }, [isAdmin, filialAtual])

  const base = useMemo(
    () =>
      motoristas.filter((m) => {
        if (!isAdmin && (m.captador || m.usuario) !== captadorId) return false
        if (!isAdmin && (m.filial || filialAtual) !== filialAtual) return false
        return true
      }),
    [motoristas, isAdmin, captadorId, filialAtual],
  )
  const escopoAnalise = isAdmin ? motoristas : base

  const stats = useMemo(
    () => ({
      total: base.length,
      ordem: base.filter((m) => m.status === 'ordem' || m.status === 'carregou').length,
      carregou: base.filter((m) => m.status === 'carregou').length,
      naoCarregou: base.filter((m) => m.status === 'nao_carregou').length,
    }),
    [base],
  )
  const conversao = stats.total ? Math.round((stats.carregou / stats.total) * 100) : 0

  const ranking = useMemo(() => {
    const map = new Map()
    escopoAnalise.forEach((m) => {
      const key = m.captador || 'sem-usuario'
      const atual = map.get(key) || { id: key, nome: m.nomeCaptador || key, total: 0, ordem: 0, carregou: 0, naoCarregou: 0, efetividade: 0, ordemPct: 0 }
      atual.total += 1
      if (m.status === 'ordem' || m.status === 'carregou') atual.ordem += 1
      if (m.status === 'carregou') atual.carregou += 1
      if (m.status === 'nao_carregou') atual.naoCarregou += 1
      atual.efetividade = pct(atual.carregou, atual.total)
      atual.ordemPct = pct(atual.ordem, atual.total)
      map.set(key, atual)
    })
    return [...map.values()].sort((a, b) => b.carregou - a.carregou || b.efetividade - a.efetividade || b.total - a.total)
  }, [escopoAnalise])

  const motivosNaoCarregou = useMemo(() => {
    const map = new Map()
    escopoAnalise
      .filter((m) => m.status === 'nao_carregou')
      .forEach((m) => {
        const motivo = m.motivoNaoCarregou || 'Sem motivo'
        const atual = map.get(motivo) || { motivo, qtd: 0 }
        atual.qtd += 1
        map.set(motivo, atual)
      })
    return [...map.values()].sort((a, b) => b.qtd - a.qtd)
  }, [escopoAnalise])

  const bancoMotoristas = useMemo(() => {
    const map = new Map()
    escopoAnalise.forEach((m) => {
      const tel = normalizarTelefone(m.numero)
      const chave = tel || `${String(m.nome || '').toLowerCase()}-${m.captador || ''}`
      const atual = map.get(chave) || {
        chave,
        nome: m.nome || 'Motorista sem nome',
        numero: m.numero || '',
        total: 0,
        ordem: 0,
        carregou: 0,
        naoCarregou: 0,
        statusLabel: STATUS[m.status]?.label || 'Contatado',
      }
      atual.total += 1
      if (m.status === 'ordem' || m.status === 'carregou') atual.ordem += 1
      if (m.status === 'carregou') atual.carregou += 1
      if (m.status === 'nao_carregou') atual.naoCarregou += 1
      atual.statusLabel = STATUS[m.status]?.label || atual.statusLabel
      map.set(chave, atual)
    })
    return [...map.values()].sort((a, b) => b.carregou - a.carregou || b.ordem - a.ordem || b.total - a.total)
  }, [escopoAnalise])

  const topCaptador = ranking[0]
  const topEfetivo = [...ranking].filter((r) => r.total > 0).sort((a, b) => b.efetividade - a.efetividade || b.carregou - a.carregou)[0]
  const topOrdem = [...ranking].sort((a, b) => b.ordem - a.ordem || b.ordemPct - a.ordemPct)[0]
  const motivoTop = motivosNaoCarregou[0]

  const lista = useMemo(
    () =>
      base
        .filter((m) => filtroOp === 'Todas' || m.operacao === filtroOp)
        .filter((m) => filtroStatus === 'Todos' || m.status === filtroStatus)
        .filter(
          (m) =>
            !busca ||
            [m.nome, m.numero, m.operacao, m.status, m.obs, m.motivoNaoCarregou, m.justificativaNaoCarregou, m.nomeCaptador, m.captador]
              .join(' ')
              .toLowerCase()
              .includes(busca.toLowerCase()),
        )
        .sort((a, b) => (STATUS[b.status]?.ordem || 0) - (STATUS[a.status]?.ordem || 0)),
    [base, busca, filtroOp, filtroStatus],
  )

  const persistir = async (item, listaAtualizada, mensagem = 'Captação salva.') => {
    setMotoristas(listaAtualizada)
    saveLocal(listaAtualizada)
    try {
      await v2.salvarCaptacaoV2(item, usuarioAtual)
      try {
        await legacy.salvar(item, 'captacao', item.filial)
      } catch {}
      setModoBanco('v2+legado')
      toast?.(mensagem, 'ok')
    } catch {
      try {
        await legacy.salvar(item, 'captacao', item.filial)
        setModoBanco('legado')
        toast?.(`${mensagem} Banco legado.`, 'ok')
      } catch {
        setModoBanco('local')
        toast?.('Salvo localmente. Nuvem falhou.', 'warn')
      }
    }
  }
  const salvarMotorista = async (dados) => {
    if (editando) {
      const atualizado = {
        ...editando,
        ...dados,
        usuario: editando.captador || captadorId,
        captador: editando.captador || captadorId,
        nomeCaptador: editando.nomeCaptador || nomeCaptador,
        motorista: dados.nome,
        telefone: dados.numero,
        produto: dados.operacao,
        ultimaAtualizacao: agoraBR(),
        atualizadoPor: captadorId,
      }
      await persistir(
        atualizado,
        motoristas.map((m) => (String(m.id) === String(editando.id) ? atualizado : m)),
        'Motorista atualizado.',
      )
    } else {
      const novo = {
        id: gerarId(),
        captador: captadorId,
        usuario: captadorId,
        nomeCaptador,
        nomeUsuario: nomeCaptador,
        filial: filialAtual,
        data: agoraBR(),
        dataISO: hojeISO(),
        ...dados,
        motorista: dados.nome,
        telefone: dados.numero,
        produto: dados.operacao,
        ultimaAtualizacao: agoraBR(),
        atualizadoPor: captadorId,
      }
      await persistir(novo, [novo, ...motoristas], 'Motorista cadastrado.')
    }
    setModal(false)
    setEditando(null)
  }
  const avancar = async (m) => {
    const proximo = m.status === 'contatado' ? 'ordem' : 'carregou'
    const atualizado = { ...m, status: proximo, motivoNaoCarregou: '', justificativaNaoCarregou: '', ultimaAtualizacao: agoraBR(), atualizadoPor: captadorId }
    await persistir(
      atualizado,
      motoristas.map((x) => (String(x.id) === String(m.id) ? atualizado : x)),
      `Status atualizado para ${STATUS[proximo].label}.`,
    )
  }
  const marcarNaoCarregou = (m) => {
    setEditando({ ...m, status: 'nao_carregou' })
    setModal(true)
  }
  const excluir = async (id) => {
    const listaAtualizada = motoristas.filter((m) => String(m.id) !== String(id))
    setMotoristas(listaAtualizada)
    saveLocal(listaAtualizada)
    let removidoNaNuvem = false
    try {
      await v2.deletarCaptacaoV2(id)
      removidoNaNuvem = true
    } catch {}
    try {
      await legacy.deletar(id)
      removidoNaNuvem = true
    } catch {}
    if (removidoNaNuvem) toast?.('Motorista excluído.', 'ok')
    else toast?.('Removido localmente, mas a nuvem recusou a exclusão (verifique permissões). O registro pode reaparecer.', 'warn')
  }
  const abrirWhats = (m) => abrirWhatsNumero(m.numero, m.nome)

  return (
    <div className="captacao-simple-shell">
      <header className="cap-header">
        <div className="cap-header-inner">
          <div className="cap-user">
            <div className="cap-avatar" style={{ background: corCaptador }}>
              {nomeCaptador[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <small>{isAdmin ? 'Visão administrativa' : 'Captador'}</small>
              <strong>{nomeCaptador}</strong>
            </div>
          </div>
          <div className="cap-filial">
            {isAdmin ? 'Admin · Geral' : nomeFilial(filialAtual)} {carregando ? ' · Sync' : ''}
          </div>
        </div>
      </header>
      <main className="cap-main">
        <div className="cap-stats">
          <StatCard icon="📞" label="Contatos" valor={stats.total} cor="#64748b" />
          <StatCard icon="📋" label="Com ordem" valor={stats.ordem} cor="#d97706" />
          <StatCard icon="✅" label="Carregou" valor={stats.carregou} cor="#16a34a" />
          <StatCard icon="⛔" label="Não carregou" valor={stats.naoCarregou} cor="#dc2626" />
        </div>
        <div className="cap-conversion">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, marginBottom: 8, fontWeight: 800 }}>
              📈 Taxa de carregamento efetivo
            </div>
            <div className="cap-bar">
              <i style={{ width: `${conversao}%` }} />
            </div>
          </div>
          <div style={{ fontSize: 27, fontWeight: 900, color: '#16a34a' }}>{conversao}%</div>
        </div>

        <section className="cap-intelligence-hero">
          <div>
            <span>Inteligência de captação</span>
            <h2>Quem contrata mais, quem contrata melhor e por que perdemos motorista</h2>
            <p>Use esse painel para comparar volume de contatos com resultado real: ordem, carregamento confirmado e motivos de não carregamento.</p>
          </div>
        </section>
        <div className="cap-insights-grid">
          <InsightCard icon="🏆" titulo="Mais captou" valor={topCaptador?.nome} detalhe={`${topCaptador?.total || 0} contato(s)`} cor="#2563eb" />
          <InsightCard
            icon="✅"
            titulo="Mais efetivo"
            valor={topEfetivo?.nome}
            detalhe={`${topEfetivo?.efetividade || 0}% · ${topEfetivo?.carregou || 0} carregou`}
            cor="#16a34a"
          />
          <InsightCard
            icon="📋"
            titulo="Mais pegou ordem"
            valor={topOrdem?.nome}
            detalhe={`${topOrdem?.ordem || 0} ordem(ns) · ${topOrdem?.ordemPct || 0}%`}
            cor="#d97706"
          />
          <InsightCard icon="⛔" titulo="Maior motivo de perda" valor={motivoTop?.motivo} detalhe={`${motivoTop?.qtd || 0} ocorrência(s)`} cor="#dc2626" />
        </div>
        <div className="cap-intel-grid">
          <RankingEfetividade ranking={ranking} />
          <MotivosNaoCarregou motivos={motivosNaoCarregou} />
        </div>
        <BancoMotoristas motoristas={bancoMotoristas} />

        <div className="cap-search-row">
          <div className="cap-search">
            <span>🔎</span>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar motorista, número, motivo ou justificativa..." />
          </div>
          {['Todas', ...OPERACOES].map((op) => (
            <button key={op} onClick={() => setFiltroOp(op)} className={`cap-filter ${filtroOp === op ? 'active' : ''}`}>
              {op}
            </button>
          ))}
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="cap-status-filter">
            <option value="Todos">Todos status</option>
            {Object.entries(STATUS).map(([k, s]) => (
              <option key={k} value={k}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="cap-list">
          {lista.length === 0 && (
            <div className="cap-empty">
              <div style={{ fontSize: 38, opacity: 0.55 }}>👥</div>
              <p>Nenhum motorista por aqui ainda.</p>
            </div>
          )}
          {lista.map((m) => {
            const s = STATUS[m.status] || STATUS.contatado
            const isNaoCarregou = m.status === 'nao_carregou'
            return (
              <div key={m.id} className={`cap-driver-card ${isNaoCarregou ? 'cap-driver-no-load' : ''}`}>
                <div className="cap-driver-icon" style={{ background: `${s.cor}15`, color: s.cor }}>
                  {s.icon}
                </div>
                <div className="cap-driver-main">
                  <div className="cap-driver-top">
                    <span className="cap-driver-name">{m.nome}</span>
                    <span
                      className="cap-op-badge"
                      style={{ background: m.operacao === 'Farelo' ? '#fef3c7' : '#dcfce7', color: m.operacao === 'Farelo' ? '#92400e' : '#166534' }}
                    >
                      🌾 {m.operacao}
                    </span>
                    {Number(m.quantidadeCargas || 1) > 1 && <span className="cap-load-count">{m.quantidadeCargas} cargas</span>}
                  </div>
                  <div className="cap-phone">📞 {m.numero}</div>
                  <div className="cap-status-text" style={{ color: s.cor }}>
                    {s.label}
                  </div>
                  {m.obs && <div className="cap-obs">💬 {m.obs}</div>}
                  {isNaoCarregou && (
                    <div className="cap-no-load-box">
                      <strong>Não carregou: {m.motivoNaoCarregou || 'Sem motivo'}</strong>
                      <span>{m.justificativaNaoCarregou || 'Sem justificativa informada.'}</span>
                    </div>
                  )}
                  {isAdmin && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Captador: {m.nomeCaptador || m.captador}</div>}
                </div>
                <div className="cap-card-actions">
                  {!['carregou', 'nao_carregou'].includes(m.status) && (
                    <button onClick={() => avancar(m)} className="cap-next-btn" style={{ background: s.cor }}>
                      Avançar ›
                    </button>
                  )}
                  {!['carregou', 'nao_carregou'].includes(m.status) && (
                    <button onClick={() => marcarNaoCarregou(m)} className="cap-no-load-btn">
                      Não carregou
                    </button>
                  )}
                  <div className="cap-small-actions">
                    {m.numero && (
                      <a href={abrirWhats(m)} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: 'none' }}>
                        💬
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setEditando(m)
                        setModal(true)
                      }}
                      style={iconBtn}
                    >
                      ✏️
                    </button>
                    <button onClick={() => confirm('Excluir motorista?') && excluir(m.id)} style={iconBtn}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
      <div className="cap-db-pill" style={{ borderColor: `${(MODO_BANCO_INFO[modoBanco] || MODO_BANCO_INFO.auto).cor}55` }}>
        <i
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: (MODO_BANCO_INFO[modoBanco] || MODO_BANCO_INFO.auto).cor,
            marginRight: 7,
          }}
        />
        {(MODO_BANCO_INFO[modoBanco] || MODO_BANCO_INFO.auto).label}
      </div>
      <button
        onClick={() => {
          setEditando(null)
          setModal(true)
        }}
        className="cap-fab"
      >
        +
      </button>
      <ModalMotorista
        aberto={modal}
        fechar={() => {
          setModal(false)
          setEditando(null)
        }}
        salvarMotorista={salvarMotorista}
        editando={editando}
      />
    </div>
  )
}
