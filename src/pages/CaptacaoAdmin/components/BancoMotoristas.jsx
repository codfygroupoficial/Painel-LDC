import { confiancaMotorista, limparTelefone } from '../helpers'

export default function BancoMotoristas({ dados }) {
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
