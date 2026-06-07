export default function MotivosNaoCarregou({ motivos }) {
  const max = Math.max(...motivos.map((m) => m.qtd), 1)
  return (
    <section className="cap-intel-card">
      <div className="cap-intel-head">
        <div>
          <h3>Por que não carrega conosco?</h3>
          <span>Motivos mais registrados nas perdas</span>
        </div>
      </div>
      <div className="cap-reason-list">
        {motivos.length === 0 ? (
          <div className="cap-empty-mini">Nenhum motivo registrado ainda.</div>
        ) : (
          motivos.slice(0, 7).map((m) => (
            <div key={m.motivo} className="cap-reason-row">
              <div>
                <strong>{m.motivo}</strong>
                <span>{m.qtd} motorista(s)</span>
              </div>
              <b>{m.qtd}</b>
              <div className="cap-reason-bar">
                <i style={{ width: `${Math.max(8, (m.qtd / max) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
