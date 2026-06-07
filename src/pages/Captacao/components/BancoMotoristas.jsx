import { abrirWhatsNumero } from '../helpers'

export default function BancoMotoristas({ motoristas }) {
  return (
    <section className="cap-intel-card cap-bank-card">
      <div className="cap-intel-head">
        <div>
          <h3>Banco de motoristas</h3>
          <span>Números salvos para futuras cargas</span>
        </div>
        <strong>{motoristas.length}</strong>
      </div>
      <div className="cap-bank-list">
        {motoristas.length === 0 ? (
          <div className="cap-empty-mini">Nenhum motorista no banco ainda.</div>
        ) : (
          motoristas.slice(0, 10).map((m) => (
            <div key={m.chave} className="cap-bank-row">
              <div>
                <strong>{m.nome}</strong>
                <span>
                  {m.numero || 'Sem telefone'} · {m.statusLabel}
                </span>
                <small>
                  {m.total} contato(s) · {m.carregou} carregou · {m.ordem} ordem
                </small>
              </div>
              <div className="cap-bank-actions">
                {m.numero && (
                  <a href={abrirWhatsNumero(m.numero, m.nome)} target="_blank" rel="noopener noreferrer">
                    Whats
                  </a>
                )}
                <button onClick={() => navigator.clipboard?.writeText(m.numero || '')}>Copiar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
