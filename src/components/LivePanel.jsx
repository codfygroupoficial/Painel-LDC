import { useApp } from '../context/AppContext'

export default function LivePanel() {
  const { usuariosOnline, activityFeed, mudarAba } = useApp()

  return (
    <section className="live-dashboard">
      <div className="live-card">
        <div className="live-head">
          <div>
            <h2>👥 Usuários online</h2>
            <p>Quem está com o painel aberto agora</p>
          </div>
          <span className="live-count">{usuariosOnline.length}</span>
        </div>
        <div className="online-list">
          {usuariosOnline.length === 0
            ? <div className="online-user-pill"><div className="online-user-left"><span className="avatar mini">?</span><div><strong>Ninguém online</strong><small>Aguardando presença.</small></div></div></div>
            : usuariosOnline.map(u => (
              <div key={u.usuario} className="online-user-pill">
                <div className="online-user-left">
                  <span className="avatar mini">{u.avatar || u.usuario.slice(0, 2).toUpperCase()}</span>
                  <div><strong>{u.nome || u.usuario}</strong><small>{u.cargo || 'Operador'}</small></div>
                </div>
                <span className="online-status" />
              </div>
            ))}
        </div>
      </div>

      <div className="live-card">
        <div className="live-head">
          <div>
            <h2>⚡ Atividade em tempo real</h2>
            <p>Últimas alterações sincronizadas</p>
          </div>
          <span className="live-dot" />
        </div>
        <div className="activity-feed">
          {activityFeed.length === 0
            ? <div className="feed-item"><div className="feed-icon">🏠</div><div><strong>Aguardando ações</strong><span>Nenhuma alteração recente.</span></div></div>
            : activityFeed.map((i, idx) => (
              <div key={idx} className="feed-item">
                <div className="feed-icon">{i.icone}</div>
                <div><strong>{i.titulo}</strong><span>{i.texto}<br />{i.tempo}</span></div>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
