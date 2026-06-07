import { useEffect, useMemo, useState } from 'react'
import * as legacy from '../lib/supabase'
import * as v2 from '../lib/supabaseV2'
import { baixarArquivo } from '../utils/index'
import { nomeFilial } from '../data/filiais'
import '../captacao-admin.css'
import { ADMIN_USERNAME } from '../data/defaultUsers'

const STATUS_LABEL = {
  contatado: 'Contatado',
  ordem: 'Pegou ordem',
  carregou: 'Carregou',
  nao_carregou: 'Não carregou',
}

const STATUS_COLOR = {
  contatado: '#64748b',
  ordem: '#d97706',
  carregou: '#16a34a',
  nao_carregou: '#dc2626',
}

function pct(a, b) {
  return b ? Math.round((a / b) * 100) : 0
}
function limparTelefone(v) {
  return String(v || '').replace(/[^0-9]/g, '')
}
function statusKey(status) {
  return v2.statusV2(status)
}
function normalizarLegado(row) {
  const d = row.dados || {}
  return {
    ...d,
    id: d.id || row.local_id,
    captador: d.captador || d.usuario || row.dados?.usuario || '-',
    nomeCaptador: d.nomeCaptador || d.nomeUsuario || d.captador || d.usuario || '-',
    filial: d.filial || row.filial || 'jatai-go',
    nome: d.nome || d.motorista || '',
    numero: d.numero || d.telefone || '',
    operacao: d.operacao || d.produto || 'Farelo',
    status: statusKey(d.status),
    motivoNaoCarregou: d.motivoNaoCarregou || '',
    justificativaNaoCarregou: d.justificativaNaoCarregou || '',
    quantidadeCargas: d.quantidadeCargas || 1,
    dataISO: d.dataISO || String(row.updated_at || '').slice(0, 10),
    data: d.data || new Date(row.updated_at || Date.now()).toLocaleString('pt-BR'),
  }
}

function confiancaMotorista(m) {
  if (m.carregou >= 3) return { label: 'Carrega sempre', className: 'strong' }
  if (m.carregou >= 1) return { label: 'Confiável', className: 'good' }
  if (m.naoCarregou >= 2) return { label: 'Risco', className: 'risk' }
  if (m.naoCarregou >= 1) return { label: 'Atenção', className: 'warn' }
  return { label: 'Novo', className: 'new' }
}

function Card({ label, value, sub, color = '#2563eb' }) {
  return (
    <div className="capadm-card">
      <span>{label}</span>
      <strong style={{ color }}>{value}</strong>
      <small>{sub}</small>
    </div>
  )
}

function Ranking({ dados }) {
  const max = Math.max(...dados.map((x) => x.total), 1)
  return (
    <div className="capadm-box">
      <div className="capadm-box-head">
        <div>
          <h3>Ranking de funcionários</h3>
          <p>Volume, ordem, carregamento e efetividade real</p>
        </div>
      </div>
      <div className="capadm-rank-list">
        {dados.length === 0 ? (
          <div className="capadm-empty">Sem dados.</div>
        ) : (
          dados.map((r, i) => (
            <div key={r.id} className="capadm-rank">
              <div className="capadm-rank-top">
                <strong>
                  {i + 1}. {r.nome}
                </strong>
                <span>{r.efetividade}% efetivo</span>
              </div>
              <div className="capadm-rank-numbers">
                <b>{r.total}</b>
                <small>captou</small>
                <b>{r.ordem}</b>
                <small>ordem</small>
                <b>{r.carregou}</b>
                <small>carregou</small>
                <b>{r.naoCarregou}</b>
                <small>não</small>
              </div>
              <div className="capadm-progress">
                <i style={{ width: `${Math.max(5, (r.total / max) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Motivos({ dados }) {
  const max = Math.max(...dados.map((x) => x.qtd), 1)
  return (
    <div className="capadm-box">
      <div className="capadm-box-head">
        <div>
          <h3>Motivos de perda</h3>
          <p>Por que o motorista não carrega conosco</p>
        </div>
      </div>
      <div className="capadm-reasons">
        {dados.length === 0 ? (
          <div className="capadm-empty">Sem perdas registradas.</div>
        ) : (
          dados.map((m) => (
            <div key={m.motivo} className="capadm-reason">
              <div>
                <strong>{m.motivo}</strong>
                <span>{m.qtd} ocorrência(s)</span>
              </div>
              <b>{m.qtd}</b>
              <div className="capadm-lossbar">
                <i style={{ width: `${Math.max(8, (m.qtd / max) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function BancoMotoristas({ dados }) {
  return (
    <div className="capadm-box capadm-wide">
      <div className="capadm-box-head">
        <div>
          <h3>Banco de motoristas</h3>
          <p>Carteira consolidada com status de confiança e telefone para contato</p>
        </div>
        <strong>{dados.length}</strong>
      </div>
      <div className="capadm-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Motorista</th>
              <th>Telefone</th>
              <th>Confiança</th>
              <th>Contatos</th>
              <th>Ordem</th>
              <th>Carregou</th>
              <th>Não carregou</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr>
                <td colSpan={8} className="capadm-empty">
                  Sem motoristas ainda.
                </td>
              </tr>
            ) : (
              dados.map((m) => {
                const conf = confiancaMotorista(m)
                return (
                  <tr key={m.chave}>
                    <td>
                      <strong>{m.nome}</strong>
                      <small>{m.operacoes.join(', ') || 'Sem operação'}</small>
                    </td>
                    <td>{m.numero || '-'}</td>
                    <td>
                      <span className={`trust ${conf.className}`}>{conf.label}</span>
                    </td>
                    <td>{m.total}</td>
                    <td>{m.ordem}</td>
                    <td>{m.carregou}</td>
                    <td>{m.naoCarregou}</td>
                    <td>
                      {m.numero ? (
                        <a className="capadm-whats" href={`https://wa.me/55${limparTelefone(m.numero)}`} target="_blank" rel="noreferrer">
                          WhatsApp
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Auditoria({ eventos }) {
  return (
    <div className="capadm-box capadm-wide">
      <div className="capadm-box-head">
        <div>
          <h3>Auditoria de captação</h3>
          <p>Eventos registrados em vl_captacao_eventos</p>
        </div>
      </div>
      <div className="capadm-events">
        {eventos.length === 0 ? (
          <div className="capadm-empty">Sem eventos V2 ainda.</div>
        ) : (
          eventos.slice(0, 50).map((e) => (
            <div key={e.id} className="capadm-event">
              <span>{new Date(e.created_at).toLocaleString('pt-BR')}</span>
              <strong>
                {e.usuario || 'Sistema'} mudou para {STATUS_LABEL[e.status_novo] || e.status_novo}
              </strong>
              <small>
                {e.captacao?.motorista?.nome || 'Motorista'} · anterior: {STATUS_LABEL[e.status_anterior] || e.status_anterior || '-'}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function CaptacaoAdmin() {
  const [captacoes, setCaptacoes] = useState([])
  const [eventos, setEventos] = useState([])
  const [legadoQtd, setLegadoQtd] = useState(0)
  const [loading, setLoading] = useState(true)
  const [migrando, setMigrando] = useState(false)
  const [busca, setBusca] = useState('')

  const carregar = async () => {
    setLoading(true)
    try {
      const [v2Rows, ev, legado] = await Promise.all([
        v2.listarCaptacoesV2({ admin: true }).catch(() => []),
        v2.listarEventosCaptacaoV2(80).catch(() => []),
        legacy.baixarTodos().catch(() => []),
      ])
      setCaptacoes(v2Rows)
      setEventos(ev)
      setLegadoQtd((legado || []).filter((r) => r.tipo === 'captacao').length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const migrarLegado = async () => {
    setMigrando(true)
    try {
      const rows = await legacy.baixarTodos()
      const itens = rows.filter((r) => r.tipo === 'captacao').map(normalizarLegado)
      for (const item of itens) {
        await v2.salvarCaptacaoV2(item, {
          usuario: item.captador || ADMIN_USERNAME,
          nome: item.nomeCaptador || item.captador || 'Admin',
          cargo: 'Admin',
          filial: item.filial || 'jatai-go',
        })
      }
      await carregar()
      alert(`Migração concluída: ${itens.length} captação(ões) enviadas para vl_captacoes.`)
    } catch (e) {
      alert(`Falha na migração: ${e.message || e}`)
    } finally {
      setMigrando(false)
    }
  }

  const listaFiltrada = useMemo(
    () =>
      captacoes.filter(
        (c) =>
          !busca ||
          [c.nome, c.numero, c.captador, c.nomeCaptador, c.filial, c.operacao, c.status, c.motivoNaoCarregou]
            .join(' ')
            .toLowerCase()
            .includes(busca.toLowerCase()),
      ),
    [captacoes, busca],
  )

  const ranking = useMemo(() => {
    const map = new Map()
    listaFiltrada.forEach((c) => {
      const id = c.captador || '-'
      const atual = map.get(id) || { id, nome: c.nomeCaptador || id, total: 0, ordem: 0, carregou: 0, naoCarregou: 0, efetividade: 0 }
      atual.total += 1
      if (['ordem', 'carregou'].includes(c.status)) atual.ordem += 1
      if (c.status === 'carregou') atual.carregou += 1
      if (c.status === 'nao_carregou') atual.naoCarregou += 1
      atual.efetividade = pct(atual.carregou, atual.total)
      map.set(id, atual)
    })
    return [...map.values()].sort((a, b) => b.carregou - a.carregou || b.efetividade - a.efetividade || b.total - a.total)
  }, [listaFiltrada])

  const motivos = useMemo(() => {
    const map = new Map()
    listaFiltrada
      .filter((c) => c.status === 'nao_carregou')
      .forEach((c) => {
        const motivo = c.motivoNaoCarregou || 'Sem motivo'
        const atual = map.get(motivo) || { motivo, qtd: 0 }
        atual.qtd += 1
        map.set(motivo, atual)
      })
    return [...map.values()].sort((a, b) => b.qtd - a.qtd)
  }, [listaFiltrada])

  const banco = useMemo(() => {
    const map = new Map()
    listaFiltrada.forEach((c) => {
      const tel = limparTelefone(c.numero)
      const chave = tel || `${String(c.nome || '').toLowerCase()}-${c.captador || ''}`
      const atual = map.get(chave) || {
        chave,
        nome: c.nome || 'Motorista sem nome',
        numero: c.numero || '',
        total: 0,
        ordem: 0,
        carregou: 0,
        naoCarregou: 0,
        operacoes: [],
      }
      atual.total += 1
      if (['ordem', 'carregou'].includes(c.status)) atual.ordem += 1
      if (c.status === 'carregou') atual.carregou += 1
      if (c.status === 'nao_carregou') atual.naoCarregou += 1
      if (c.operacao && !atual.operacoes.includes(c.operacao)) atual.operacoes.push(c.operacao)
      map.set(chave, atual)
    })
    return [...map.values()].sort((a, b) => b.carregou - a.carregou || b.ordem - a.ordem || b.total - a.total)
  }, [listaFiltrada])

  const exportar = () => {
    const header = 'Motorista;Telefone;Captador;Filial;Operacao;Status;Motivo;Justificativa\n'
    const body = listaFiltrada
      .map((c) =>
        [
          c.nome,
          c.numero,
          c.nomeCaptador || c.captador,
          nomeFilial(c.filial),
          c.operacao,
          STATUS_LABEL[c.status] || c.status,
          c.motivoNaoCarregou || '',
          c.justificativaNaoCarregou || '',
        ]
          .map((v) => `"${String(v || '').replaceAll('"', '""')}"`)
          .join(';'),
      )
      .join('\n')
    baixarArquivo(`captacao-admin-${new Date().toISOString().slice(0, 10)}.csv`, header + body, 'text/csv;charset=utf-8')
  }

  const total = listaFiltrada.length
  const ordens = listaFiltrada.filter((c) => ['ordem', 'carregou'].includes(c.status)).length
  const carregou = listaFiltrada.filter((c) => c.status === 'carregou').length
  const perdas = listaFiltrada.filter((c) => c.status === 'nao_carregou').length

  if (loading)
    return (
      <section className="aba active">
        <div className="box">Carregando captação admin...</div>
      </section>
    )

  return (
    <section className="aba active capadm-shell">
      <div className="capadm-hero">
        <div>
          <span>AYRES · Admin</span>
          <h1>Captação Admin</h1>
          <p>Controle de quem captou, quem foi efetivo, motivos de perda, auditoria e migração do legado para tabelas vl_.</p>
        </div>
        <div className="capadm-actions">
          <button onClick={carregar}>Atualizar</button>
          <button onClick={exportar}>Exportar CSV</button>
          <button className="danger" onClick={migrarLegado} disabled={migrando}>
            {migrando ? 'Migrando...' : `Migrar legado (${legadoQtd})`}
          </button>
        </div>
      </div>

      <div className="capadm-filters">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar motorista, funcionário, filial, motivo..." />
      </div>

      <div className="capadm-cards">
        <Card label="Captados" value={total} sub="total no filtro" />
        <Card label="Pegou ordem" value={ordens} sub={`${pct(ordens, total)}% dos captados`} color="#d97706" />
        <Card label="Carregou" value={carregou} sub={`${pct(carregou, total)}% efetivo`} color="#16a34a" />
        <Card label="Não carregou" value={perdas} sub={`${pct(perdas, total)}% perdas`} color="#dc2626" />
      </div>

      <div className="capadm-grid">
        <Ranking dados={ranking} />
        <Motivos dados={motivos} />
      </div>
      <BancoMotoristas dados={banco} />
      <Auditoria eventos={eventos} />
    </section>
  )
}
