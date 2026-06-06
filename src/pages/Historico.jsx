import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Historico() {
  const { historico, limparHistorico } = useApp()
  const [confirmLimpar, setConfirmLimpar] = useState(false)

  return (
    <>
    <section className="aba active" id="abaHistorico">
      <div className="box">
        <div className="box-title">
          <h2>Histórico de alterações</h2>
          <button className="btn-red btn-small" onClick={() => setConfirmLimpar(true)}>Limpar histórico</button>
        </div>
        <div className="table-wrap" style={{ marginBottom: 0 }}>
          <table>
            <thead><tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Detalhes</th></tr></thead>
            <tbody>
              {historico.length === 0
                ? <tr><td colSpan={4} className="empty">Nenhum histórico ainda.</td></tr>
                : historico.map((h, i) => (
                  <tr key={i}>
                    <td>{h.data}</td>
                    <td>{h.usuario}</td>
                    <td><strong>{h.acao}</strong></td>
                    <td>{h.detalhes}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {confirmLimpar && (
      <ConfirmDialog
        message="Limpar todo o histórico? Esta ação não pode ser desfeita."
        onConfirm={() => { limparHistorico(); setConfirmLimpar(false) }}
        onCancel={() => setConfirmLimpar(false)}
      />
    )}
    </>
  )
}
