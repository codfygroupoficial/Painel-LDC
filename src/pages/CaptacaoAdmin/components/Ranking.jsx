export default function Ranking({ dados }) {
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
