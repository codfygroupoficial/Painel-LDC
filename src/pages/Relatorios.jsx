import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { baixarArquivo, dataISOTexto, dinheiro, moedaNumero, resumirSLA } from '../utils/index'
import { nomeFilial } from '../data/filiais'
import '../relatorios-pro.css'

const safe = (v, fallback = 'Não informado') => {
  const txt = String(v || '').trim()
  return txt || fallback
}

function somarPor(lista, campo) {
  const map = new Map()
  lista.forEach(item => {
    const chave = safe(item[campo])
    const atual = map.get(chave) || { nome: chave, qtd: 0, valor: 0, horas: 0 }
    atual.qtd += 1
    atual.valor += moedaNumero(item.valor)
    atual.horas += Number(String(item.horas || 0).replace(',', '.')) || 0
    map.set(chave, atual)
  })
  return [...map.values()].sort((a, b) => b.qtd - a.qtd || b.valor - a.valor)
}

function csvEscape(v) {
  return `"${String(v ?? '').replaceAll('"', '""')}"`
}

function RankingCard({ titulo, subtitulo, dados }) {
  const maior = Math.max(...dados.map(d => d.qtd), 1)
  return (
    <div className="dash-chart-card">
      <div className="dash-chart-head"><div><h3>{titulo}</h3><span>{subtitulo}</span></div></div>
      <div style={{ display: 'grid', gap: 10 }}>
        {dados.length === 0 && <div className="empty" style={{ padding: 18 }}>Sem dados no período.</div>}
        {dados.slice(0, 8).map((item, idx) => (
          <div key={item.nome} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 12, background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: 14 }}>{idx + 1}. {item.nome}</strong>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>{item.qtd} ocorrência(s) · {dinheiro(item.valor)} · {item.horas.toFixed(2)} h</div>
              </div>
              <strong style={{ fontSize: 20 }}>{item.qtd}</strong>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: 'rgba(148,163,184,.22)', marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(8, (item.qtd / maior) * 100)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Relatorios() {
  const { estadias, estadiasALancar, usuarioAtual } = useApp()
  const [tipoBase, setTipoBase] = useState('lancadas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [busca, setBusca] = useState('')

  const isAdmin = usuarioAtual?.cargo === 'Admin'

  const base = useMemo(() => {
    const lancadas = estadias.map(e => ({ ...e, origemRelatorio: 'Lançada' }))
    const pendentes = estadiasALancar.map(e => ({ ...e, origemRelatorio: 'A lançar' }))
    if (tipoBase === 'todas') return [...lancadas, ...pendentes]
    if (tipoBase === 'alancar') return pendentes
    return lancadas
  }, [estadias, estadiasALancar, tipoBase])

  const lista = useMemo(() => {
    return base.filter(item => {
      const data = dataISOTexto(item.dataLancamento || item.dataCriacao || item.dataFinalizado || item.dataFeito || '')
      const texto = [item.chamado, item.motorista, item.transportadora, item.placa, item.filial, item.motivoEstadia, item.localEstadia, item.tipoFrete, item.pagoPor, item.status].join(' ').toUpperCase()
      return (!dataInicio || data >= dataInicio)
        && (!dataFim || data <= dataFim)
        && (!busca || texto.includes(busca.toUpperCase()))
    })
  }, [base, dataInicio, dataFim, busca])

  const linhas = useMemo(() => lista.map(item => ({
    origem: item.origemRelatorio,
    data: item.dataLancamento || item.dataCriacao || '',
    filial: nomeFilial(item.filial),
    local: item.localEstadia || item.local || '',
    motivo: item.motivoEstadia || item.motivo || '',
    tipoFrete: item.tipoFrete || item.pagoPor || '',
    transportadora: item.transportadora || '',
    motorista: item.motorista || '',
    placa: item.placa || '',
    horas: item.horas || '',
    valorEstadia: item.valor || '',
    status: item.status || '',
  })), [lista])

  const totalEstadias = lista.length
  const valorTotal = lista.reduce((s, e) => s + moedaNumero(e.valor), 0)
  const horasTotal = lista.reduce((s, e) => s + (Number(String(e.horas || 0).replace(',', '.')) || 0), 0)
  const slaResumo = resumirSLA(estadiasALancar)

  const porFilial = useMemo(() => somarPor(lista.map(i => ({ ...i, filialNome: nomeFilial(i.filial) })), 'filialNome'), [lista])
  const porMotivo = useMemo(() => somarPor(lista.map(i => ({ ...i, motivoRel: i.motivoEstadia || i.motivo })), 'motivoRel'), [lista])
  const porLocal = useMemo(() => somarPor(lista.map(i => ({ ...i, localRel: i.localEstadia || i.local })), 'localRel'), [lista])
  const porFrete = useMemo(() => somarPor(lista.map(i => ({ ...i, freteRel: i.tipoFrete || i.pagoPor })), 'freteRel'), [lista])
  const porTransportadora = useMemo(() => somarPor(lista, 'transportadora'), [lista])

  const limparFiltros = () => {
    setDataInicio('')
    setDataFim('')
    setBusca('')
    setTipoBase('lancadas')
  }

  const exportarCSV = () => {
    const header = ['Origem', 'Data', 'Filial', 'Local', 'Motivo', 'Tipo frete', 'Transportadora', 'Placa', 'Motorista', 'Horas', 'Valor estadia', 'Status']
    const body = linhas.map(l => [l.origem, l.data, l.filial, l.local, l.motivo, l.tipoFrete, l.transportadora, l.placa, l.motorista, l.horas, l.valorEstadia, l.status].map(csvEscape).join(';'))
    baixarArquivo(`relatorio-estadias-${new Date().toISOString().slice(0, 10)}.csv`, [header.map(csvEscape).join(';'), ...body].join('\n'), 'text/csv;charset=utf-8')
  }

  const exportarResumo = () => {
    const resumo = {
      geradoEm: new Date().toLocaleString('pt-BR'),
      filtros: { tipoBase, dataInicio, dataFim, busca },
      totais: { registros: totalEstadias, valorTotal: dinheiro(valorTotal), horasTotal: horasTotal.toFixed(2) },
      slaPendencias: slaResumo,
      porFilial,
      porMotivo,
      porLocal,
      porFrete,
      porTransportadora,
    }
    baixarArquivo(`resumo-executivo-estadias-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(resumo, null, 2), 'application/json')
  }

  const exportarPDF = () => {
    const htmlRank = (titulo, dados) => `
      <section class="rank"><h2>${titulo}</h2>${dados.slice(0, 8).map((d, i) => `<div class="row"><span>${i + 1}. ${d.nome}</span><strong>${d.qtd}</strong><em>${dinheiro(d.valor)}</em></div>`).join('') || '<p>Sem dados.</p>'}</section>
    `
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Relatório Via Log</title><style>
      *{box-sizing:border-box} body{font-family:Inter,Arial,sans-serif;margin:0;background:#f8fafc;color:#0f172a} .cover{padding:36px;background:linear-gradient(135deg,#020617,#1d4ed8);color:white} .cover h1{font-size:34px;margin:0 0 8px}.cover p{opacity:.78;margin:0}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:22px}.kpi{background:white;border:1px solid #e2e8f0;border-radius:18px;padding:18px}.kpi span{display:block;color:#64748b;font-size:12px}.kpi strong{font-size:24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0 22px 22px}.rank{background:white;border:1px solid #e2e8f0;border-radius:18px;padding:18px}.rank h2{font-size:17px;margin:0 0 12px}.row{display:grid;grid-template-columns:1fr 44px 110px;gap:10px;border-top:1px solid #e2e8f0;padding:9px 0;font-size:12px}.table{padding:0 22px 30px} table{width:100%;border-collapse:collapse;background:white;border-radius:16px;overflow:hidden} th,td{border-bottom:1px solid #e2e8f0;padding:9px;font-size:11px;text-align:left} th{background:#f1f5f9;color:#475569;text-transform:uppercase} @media print{button{display:none}.cover{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body>
      <div class="cover"><h1>Relatório Executivo de Estadias</h1><p>Via Log · Gerado em ${new Date().toLocaleString('pt-BR')}</p></div>
      <div class="kpis"><div class="kpi"><span>Valor total</span><strong>${dinheiro(valorTotal)}</strong></div><div class="kpi"><span>Registros</span><strong>${totalEstadias}</strong></div><div class="kpi"><span>Horas totais</span><strong>${horasTotal.toFixed(2)}h</strong></div><div class="kpi"><span>SLA crítico</span><strong>${slaResumo.critico}</strong></div></div>
      <div class="grid">${htmlRank('Filiais com mais estadia', porFilial)}${htmlRank('Motivos mais frequentes', porMotivo)}${htmlRank('Locais mais críticos', porLocal)}${htmlRank('Tipo de frete / responsável', porFrete)}</div>
      <div class="table"><table><thead><tr><th>Data</th><th>Filial</th><th>Placa</th><th>Motorista</th><th>Valor</th><th>Status</th></tr></thead><tbody>${linhas.slice(0, 80).map(l => `<tr><td>${l.data || '-'}</td><td>${l.filial}</td><td>${l.placa || '-'}</td><td>${l.motorista || '-'}</td><td>${l.valorEstadia || '-'}</td><td>${l.status || '-'}</td></tr>`).join('')}</tbody></table></div>
      <script>setTimeout(()=>window.print(),400)</script>
    </body></html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
  }

  if (!isAdmin) {
    return <section className="aba active"><div className="box" style={{ padding: 28, textAlign: 'center' }}><h2>Acesso restrito</h2><p style={{ color: 'var(--muted)' }}>Relatórios ficam disponíveis somente no Painel Admin.</p></div></section>
  }

  return (
    <section className="aba active">
      <div className="report-pro-hero">
        <div className="report-pro-head">
          <div>
            <h1>Relatórios Administrativos</h1>
            <p>Analise quais filiais, motivos, locais, fretes e transportadoras mais geram estadia. Exporte os dados para planilha, PDF ou resumo executivo.</p>
          </div>
          <div className="report-actions">
            <button className="report-export-btn" onClick={exportarCSV}>Exportar CSV</button>
            <button className="report-export-btn secondary" onClick={exportarPDF}>Relatório PDF</button>
            <button className="report-export-btn dark" onClick={exportarResumo}>Resumo JSON</button>
          </div>
        </div>
        <div className="report-kpis">
          <div className="report-kpi"><span>Valor total filtrado</span><strong>{dinheiro(valorTotal)}</strong></div>
          <div className="report-kpi"><span>Registros encontrados</span><strong>{totalEstadias}</strong></div>
          <div className="report-kpi"><span>Horas totais</span><strong>{horasTotal.toFixed(2)} h</strong></div>
          <div className="report-kpi"><span>Pendências críticas</span><strong>{slaResumo.critico}</strong></div>
        </div>
      </div>

      <div className="box report-filter-card">
        <div className="box-title"><h2>Filtros do relatório</h2><button className="btn-light btn-small" onClick={limparFiltros}>Limpar filtros</button></div>
        <div className="filters">
          <select value={tipoBase} onChange={e => setTipoBase(e.target.value)}><option value="lancadas">Somente estadias lançadas</option><option value="alancar">Somente pendências a lançar</option><option value="todas">Tudo</option></select>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar filial, motivo, local, placa..." />
        </div>
      </div>

      <div className="report-ranking-grid">
        <RankingCard titulo="Filiais com mais estadia" subtitulo="Quantidade, valor e horas" dados={porFilial} />
        <RankingCard titulo="Motivos mais frequentes" subtitulo="O que mais gerou estadia" dados={porMotivo} />
        <RankingCard titulo="Locais mais críticos" subtitulo="Onde a estadia mais aparece" dados={porLocal} />
        <RankingCard titulo="Tipo de frete / responsável" subtitulo="CIF, FOB, Spot, Transportes, Logística..." dados={porFrete} />
        <RankingCard titulo="Transportadoras" subtitulo="Ranking por ocorrência" dados={porTransportadora} />
      </div>

      <div className="report-table-card"><div className="table-scroll"><table><thead><tr><th>Origem</th><th>Data</th><th>Filial</th><th>Local</th><th>Motivo</th><th>Tipo frete</th><th>Transportadora</th><th>Placa</th><th>Motorista</th><th>Horas</th><th>Valor estadia</th><th>Status</th></tr></thead><tbody>{linhas.length === 0 ? <tr><td colSpan={12} className="empty">Nenhum dado nesse filtro.</td></tr> : linhas.slice(0, 120).map((l, i) => <tr key={`${l.origem}-${l.placa}-${i}`}><td><span className="badge badge-logistica">{l.origem}</span></td><td>{l.data || '-'}</td><td>{l.filial}</td><td>{l.local || '-'}</td><td>{l.motivo || '-'}</td><td>{l.tipoFrete || '-'}</td><td>{l.transportadora || '-'}</td><td><span className="plate">{l.placa || '-'}</span></td><td>{l.motorista || '-'}</td><td>{l.horas || '-'}</td><td><strong>{l.valorEstadia || '-'}</strong></td><td>{l.status || '-'}</td></tr>)}</tbody></table></div></div>
    </section>
  )
}
