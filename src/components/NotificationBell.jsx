import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function NotificationBell() {
  const { estadiasALancar } = useApp()
  const [open, setOpen] = useState(false)
  const pendentes = estadiasALancar

  return (
    <div className="notif-wrap" style={{ position: 'relative' }}>
      <button className={`btn-light notif-button ${pendentes.length > 0 ? 'alert' : ''}`} onClick={() => setOpen(o => !o)}>
        🔔 <span className="pending-badge bell-badge">{pendentes.length}</span>
      </button>

      {open && (
        <div className="notif-panel show">
          <div className="notif-head">
            <strong>🔔 Notificações</strong>
            <button className="btn-light btn-small" onClick={() => setOpen(false)}>Fechar</button>
          </div>
          <p className="muted">Pendências e atualizações importantes.</p>
          <div className="notif-list">
            {pendentes.length === 0
              ? <div className="notif-empty">Nenhuma pendência. Painel sob controle ✅</div>
              : pendentes.slice(0, 8).map(e => (
                <div key={e.id} className="notif-item">
                  <strong>{e.prioridade === 'Urgente' ? '🚨' : '📋'} Placa {e.placa || '-'} • {e.prioridade || 'Normal'}</strong>
                  <span>{e.transportadora || 'Sem transportadora'}<br />Criado por {e.criadoPor || '-'} em {e.dataCriacao || '-'}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
