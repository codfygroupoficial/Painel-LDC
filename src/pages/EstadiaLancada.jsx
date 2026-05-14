import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { calcularEstadia, linkWhatsapp, dataISOTexto } from '../utils/index'

const EMPTY = { chamado: '', motorista: '', telefoneMotorista: '', transportadora: '', placa: '', peso: '', prioridade: 'Normal', pagoPor: 'Logística', chegadaData: '', chegadaHora: '', saidaData: '', saidaHora: '' }

function badgePago(p) {
  return p === 'Transportes'
    ? <span className="badge badge-transportes">Transportes</span>
    : <span className="badge badge-logistica">Logística</span>
}

function classePrio(p) {
  if (p === 'Urgente') return 'prio-urgente'
  if (p === 'Média') return 'prio-media'
  return 'prio-normal'
}

function classeStatus(s) {
  if (s === 'Finalizado') return 'status-finalizado'
  if (s === 'Feito') return 'status-feito'
  return 'status-aberto'
}

export default function EstadiaLancada({ formRef }) {
  const { estadias, adicionarLancada, marcarFeito, finalizar, reabrir, excluirLancada, dataISOTexto: iso } = useApp()
  const [form, setForm] = useState(EMPTY)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const calc = calcularEstadia(form.peso, form.chegadaData, form.chegadaHora, form.saidaData, form.saidaHora)

  const handleSalvar = async () => {
    if (!calc) { alert('Preencha peso, chegada e saída corretamente.'); return }
    if (!form.motorista.trim() || !form.placa.trim()) { alert('Preencha motorista e placa.'); return }
    await adicionarLancada({ ...form, ...calc })
    setForm(EMPTY)
  }

  const lista = estadias.filter(e => {
    const txt = ((e.placa || '') + ' ' + (e.motorista || '') + ' ' + (e.chamado || '') + ' ' + (e.transportadora || '')).toUpperCase()
    const data = dataISOTexto(e.dataLancamento)
    return (!busca || txt.includes(busca.toUpperCase()))
      && (!filtroStatus || e.status === filtroStatus)
      && (!dataInicio || data >= dataInicio)
      && (!dataFim || data <= dataFim)
  })

  return (
    <section className="aba active" id="abaLancadas">
      {/* Formulário */}
      <div className="box" ref={formRef}>
        <div className="box-title">
          <h2>Adicionar estadia lançada</h2>
          <span>Cálculo: peso (ton) × R$ 0,80 × horas após 12h</span>
        </div>

        <div className="form-grid">
          {[
            ['chamado', 'Número do chamado', 'Ex: 16820752'],
            ['motorista', 'Motorista', 'Nome do motorista'],
          ].map(([k, lbl, ph]) => (
            <div key={k} className="field">
              <label>{lbl}</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} />
            </div>
          ))}

          <div className="field">
            <label>WhatsApp do motorista</label>
            <input value={form.telefoneMotorista} onChange={e => set('telefoneMotorista', e.target.value.replace(/[^0-9]/g, ''))} placeholder="64999999999" />
          </div>

          <div className="field">
            <label>Transportadora</label>
            <input value={form.transportadora} onChange={e => set('transportadora', e.target.value)} placeholder="Ex: LDC" />
          </div>

          <div className="field">
            <label>Placa</label>
            <input value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="JBU0H16" />
          </div>

          <div className="field">
            <label>Peso</label>
            <input value={form.peso} onChange={e => set('peso', e.target.value)} placeholder="38380" />
          </div>

          <div className="field">
            <label>Prioridade</label>
            <select value={form.prioridade} onChange={e => set('prioridade', e.target.value)}>
              <option>Normal</option><option>Média</option><option>Urgente</option>
            </select>
          </div>

          <div className="field">
            <label>Pago por</label>
            <select value={form.pagoPor} onChange={e => set('pagoPor', e.target.value)}>
              <option>Logística</option><option>Transportes</option>
            </select>
          </div>

          {[
            ['chegadaData', 'chegadaHora', 'Data chegada', 'Hora chegada'],
            ['saidaData', 'saidaHora', 'Data saída', 'Hora saída'],
          ].map(([kd, kh, ld, lh]) => (
            <>
              <div key={kd} className="field">
                <label>{ld}</label>
                <input type="date" value={form[kd]} onChange={e => set(kd, e.target.value)} />
              </div>
              <div key={kh} className="field">
                <label>{lh}</label>
                <input type="time" value={form[kh]} onChange={e => set(kh, e.target.value)} />
              </div>
            </>
          ))}
        </div>

        <div className="calc-preview">
          <div className="preview-card">
            <span>Horas válidas</span>
            <strong>{calc ? `${parseFloat(calc.horas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} h` : '0,00 h'}</strong>
          </div>
          <div className="preview-card">
            <span>Valor automático</span>
            <strong>{calc?.valor || 'R$ 0,00'}</strong>
          </div>
        </div>

        <button className="btn-green btn-full" onClick={handleSalvar}>Salvar estadia lançada</button>
      </div>

      {/* Filtros */}
      <div className="box">
        <div className="box-title">
          <h2>Consultar estadias lançadas</h2>
          <button className="btn-light btn-small" onClick={() => { setBusca(''); setFiltroStatus(''); setDataInicio(''); setDataFim('') }}>Limpar filtros</button>
        </div>
        <div className="filters">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar placa, motorista, chamado..." />
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos status</option>
            <option>Aberto</option><option>Feito</option><option>Finalizado</option>
          </select>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Chamado</th><th>Motorista</th><th>Transportadora</th><th>Placa</th>
                <th>Peso</th><th>Horas</th><th>Valor</th><th>Pago por</th>
                <th>Prioridade</th><th>Lançado por</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0
                ? <tr><td colSpan={12} className="empty">Nenhuma estadia encontrada.</td></tr>
                : lista.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.chamado || '-'}</strong><br /><small>{e.dataLancamento || ''}</small></td>
                    <td>{e.motorista || '-'}<br /><small>Chegada: {e.chegada || '-'}<br />Saída: {e.saida || '-'}</small></td>
                    <td>{e.transportadora || '-'}</td>
                    <td><span className="plate">{e.placa || '-'}</span></td>
                    <td>{e.peso || '-'}</td>
                    <td><strong>{e.horas || '0.00'} h</strong></td>
                    <td><strong>{e.valor || 'R$ 0,00'}</strong></td>
                    <td>{badgePago(e.pagoPor)}</td>
                    <td><span className={`prio ${classePrio(e.prioridade)}`}>{e.prioridade || 'Normal'}</span></td>
                    <td>{e.lancadoPor || '-'}</td>
                    <td>
                      <span className={`status ${classeStatus(e.status)}`}>{e.status}</span>
                      {e.feitoPor && <><br /><small>Feito por {e.feitoPor}</small></>}
                      {e.finalizadoPor && <><br /><small>Finalizado por {e.finalizadoPor}</small></>}
                    </td>
                    <td>
                      <div className="actions">
                        {e.status === 'Aberto' && <button className="btn-green btn-small" onClick={() => marcarFeito(e.id)}>Feito</button>}
                        {e.status === 'Feito' && <button className="btn-purple btn-small" onClick={() => finalizar(e.id)}>Finalizar</button>}
                        {e.status !== 'Aberto' && <button className="btn-orange btn-small" onClick={() => reabrir(e.id)}>Reabrir</button>}
                        {e.telefoneMotorista && <a className="btn btn-green btn-small" href={linkWhatsapp(e)} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                        <button className="btn-red btn-small" onClick={() => confirm('Excluir esta estadia?') && excluirLancada(e.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
