import { STATUS_LABEL } from '../constants'

export default function Auditoria({ eventos }) {
  return (
    <div className="capadm-box capadm-wide">
      <div className="capadm-box-head">
        <div>
          <h3>Auditoria de captação</h3>
          <p>Eventos registrados em vl_captacao_eventos</p>
        </div>
      </div>
      <div className="capadm-events">
        {eventos.length === 0 ? (
          <div className="capadm-empty">Sem eventos V2 ainda.</div>
        ) : (
          eventos.slice(0, 50).map((e) => (
            <div key={e.id} className="capadm-event">
              <span>{new Date(e.created_at).toLocaleString('pt-BR')}</span>
              <strong>
                {e.usuario || 'Sistema'} mudou para {STATUS_LABEL[e.status_novo] || e.status_novo}
              </strong>
              <small>
                {e.captacao?.motorista?.nome || 'Motorista'} · anterior: {STATUS_LABEL[e.status_anterior] || e.status_anterior || '-'}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
