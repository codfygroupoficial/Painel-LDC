import { useApp } from '../context/AppContext'

const ABAS = [
  { id: 'lancadas', label: '📦 Estadias lançadas' },
  { id: 'alancar', label: '📋 Estadias a lançar' },
  { id: 'historico', label: '📜 Histórico' },
  { id: 'backup', label: '💾 Backup' },
]

export default function Sidebar({ onFechar }) {
  const { abaAtiva, mudarAba, estadiasALancar, cloudStatus, cloudText, usuarioAtual } = useApp()

  const handleTab = (id) => { mudarAba(id); onFechar?.() }

  return (
    <aside className="sidebar-pro" id="sidebarPro">
      <div className="brand-pro">
        <div className="logo">LDC</div>
        <div><h1>Painel LDC</h1><p>Sistema de estadias</p></div>
      </div>

      <nav className="sidebar-nav">
        {ABAS.map(a => (
          <button key={a.id} className={`tab ${abaAtiva === a.id ? 'active' : ''}`} onClick={() => handleTab(a.id)}>
            {a.label}
            {a.id === 'alancar' && <span className="pending-badge">{estadiasALancar.length}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-status">
        <div className="sidebar-card">
          <div className="sidebar-card-title">
            <span className={`cloud-dot ${cloudStatus === 'online' ? 'online' : cloudStatus === 'syncing' ? 'syncing' : ''}`} />
            <span>{cloudStatus === 'online' ? 'Nuvem online' : cloudStatus === 'syncing' ? 'Sincronizando' : 'Nuvem offline'}</span>
          </div>
          <small>{cloudText}</small>
        </div>
        <div className="sidebar-card">
          <div className="sidebar-card-title">👤 Usuário</div>
          <small>{usuarioAtual ? `${usuarioAtual.nome} • ${usuarioAtual.cargo}` : 'Não logado'}</small>
        </div>
      </div>
    </aside>
  )
}
