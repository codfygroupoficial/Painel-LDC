import { MEDALHAS } from '../constants'

export default function RankingEfetividade({ ranking }) {
  const max = Math.max(...ranking.map((r) => r.total), 1)
  return (
    <section className="cap-intel-card">
      <div className="cap-intel-head">
        <div>
          <h3>Ranking por funcionário</h3>
          <span>Quem captou mais e quem converte melhor</span>
        </div>
      </div>
      <div className="cap-rank-list">
        {ranking.length === 0 ? (
          <div className="cap-empty-mini">Sem captações ainda.</div>
        ) : (
          ranking.slice(0, 8).map((r, i) => (
            <div key={r.id} className={`cap-rank-pro ${i < 3 ? 'cap-rank-top3' : ''}`}>
              <div className="cap-rank-title">
                <strong>
                  {MEDALHAS[i] || `${i + 1}.`} {r.nome}
                </strong>
                <span>{r.efetividade}% efetivo</span>
              </div>
              <div className="cap-rank-metrics">
                <b>{r.total}</b>
                <small>captados</small>
                <b>{r.ordem}</b>
                <small>ordem</small>
                <b>{r.carregou}</b>
                <small>carregou</small>
                <b>{r.naoCarregou}</b>
                <small>não</small>
              </div>
              <div className="cap-rank-bar">
                <i style={{ width: `${Math.max(6, (r.total / max) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
