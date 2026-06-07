export default function Motivos({ dados }) {
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
