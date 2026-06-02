import { useState } from 'react'
import { useApp } from '../context/AppContext'
import DropZone from '../components/DropZone'

function classePrio(p) {
  if (p === 'Urgente') return 'prio-urgente'
  if (p === 'Média') return 'prio-media'
  return 'prio-normal'
}

export default function EstadiaALancar({ formRef }) {
  const { estadiasALancar, adicionarALancar, abrirParaLancar, excluirALancar } = useApp()
  const [form, setForm] = useState({ placa: '', transportadora: '', prioridade: 'Normal', obs: '' })
  const [arquivos, setArquivos] = useState([])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSalvar = async () => {
    if (!form.placa.trim()) { alert('Preencha a placa.'); return }
    await adicionarALancar(form, arquivos)
    setForm({ placa: '', transportadora: '', prioridade: 'Normal', obs: '' })
    setArquivos([])
  }

  return (
    <section className="aba active" id="abaALancar">
      <div className="box" ref={formRef}>
        <div className="box-title">
          <h2>Adicionar estadia a lançar</h2>
          <span>Arraste até 2 documentos para anexar na pendência.</span>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Placa</label>
            <input value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="JBU0H16" />
          </div>

          <div className="field">
            <label>Transportadora</label>
            <input value={form.transportadora} onChange={e => set('transportadora', e.target.value)} placeholder="Ex: Via Log" />
          </div>

          <div className="field">
            <label>Prioridade</label>
            <select value={form.prioridade} onChange={e => set('prioridade', e.target.value)}>
              <option>Normal</option><option>Média</option><option>Urgente</option>
            </select>
          </div>

          <div className="field wide">
            <label>Observação</label>
            <input value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Ex: aguardando lançamento, conferir documentos..." />
          </div>

          <DropZone arquivos={arquivos} onChange={setArquivos} />
        </div>

        <button className="btn-purple btn-full" onClick={handleSalvar}>Salvar em estadias a lançar</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Placa</th><th>Transportadora</th><th>Prioridade</th>
                <th>Anexo</th><th>Observação</th><th>Criado por</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {estadiasALancar.length === 0
                ? <tr><td colSpan={8} className="empty">Nenhuma estadia a lançar.</td></tr>
                : estadiasALancar.map(e => (
                  <tr key={e.id}>
                    <td><span className="plate">{e.placa || '-'}</span></td>
                    <td>{e.transportadora || '-'}</td>
                    <td><span className={`prio ${classePrio(e.prioridade)}`}>{e.prioridade || 'Normal'}</span></td>
                    <td>
                      {e.anexos?.length
                        ? e.anexos.map((a, i) => <a key={i} className="anexo-link" href={a.url} target="_blank" rel="noopener noreferrer">Arquivo {i + 1}</a>)
                        : '-'}
                    </td>
                    <td>{e.obs || '-'}</td>
                    <td>{e.criadoPor || '-'}<br /><small>{e.dataCriacao || ''}</small></td>
                    <td><span className="status status-lancar">A lançar</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn-green btn-small" onClick={() => abrirParaLancar(e.id)}>Lançar</button>
                        <button className="btn-red btn-small" onClick={() => confirm('Excluir esta pendência?') && excluirALancar(e.id)}>Excluir</button>
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
