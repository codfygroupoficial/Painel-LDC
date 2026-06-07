import { useEffect, useMemo, useState } from 'react'
import * as legacy from '../../lib/supabase'
import * as v2 from '../../lib/supabaseV2'
import { baixarArquivo } from '../../utils/index'
import { nomeFilial } from '../../data/filiais'
import '../../styles/captacao-admin.css'
import { ADMIN_USERNAME } from '../../data/defaultUsers'

import { STATUS_LABEL } from './constants'
import { pct, limparTelefone, normalizarLegado } from './helpers'
import Card from './components/Card'
import Ranking from './components/Ranking'
import Motivos from './components/Motivos'
import BancoMotoristas from './components/BancoMotoristas'
import Auditoria from './components/Auditoria'

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
