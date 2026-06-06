import { useApp } from '../context/AppContext'

const icons = {
  inicio: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
  lancadas: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>),
  alancar: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
  captacao: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  historico: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  backup: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>),
  admin: (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
}

const ABAS = [
  { id: 'inicio',    label: 'Início',              group: 'main' },
  { id: 'lancadas',  label: 'Estadias lançadas',    group: 'main' },
  { id: 'alancar',   label: 'A lançar',             group: 'main' },
  { id: 'captacao',  label: 'Captação',              group: 'main' },
  { id: 'historico', label: 'Histórico',            group: 'extra' },
  { id: 'backup',    label: 'Backup',               group: 'extra' },
]

export default function Sidebar({ onFechar }) {
  const { abaAtiva, mudarAba, estadiasALancar, cloudStatus, cloudText, usuarioAtual } = useApp()
  const isAdmin = usuarioAtual?.cargo === 'Admin'

  const handleTab = (id) => { mudarAba(id); onFechar?.() }

  const mainAbas  = ABAS.filter(a => a.group === 'main')
  const extraAbas = ABAS.filter(a => a.group === 'extra')

  return (
    <aside className="sidebar-pro" id="sidebarPro">
      <div className="brand-pro">
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: 'white', flexShrink: 0 }}>VL</div>
        <div><h1>Via Log</h1><p>Sistema de estadias</p></div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Principal</div>
        {mainAbas.map(a => (
          <button key={a.id} className={`tab ${abaAtiva === a.id ? 'active' : ''}`} onClick={() => handleTab(a.id)}>
            <span className="tab-icon">{icons[a.id]}</span>
            <span className="tab-label">{a.label}</span>
            {a.id === 'alancar' && estadiasALancar.length > 0 && (
              <span className="pending-badge">{estadiasALancar.length}</span>
            )}
          </button>
        ))}

        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Ferramentas</div>
        {extraAbas.map(a => (
          <button key={a.id} className={`tab ${abaAtiva === a.id ? 'active' : ''}`} onClick={() => handleTab(a.id)}>
            <span className="tab-icon">{icons[a.id]}</span>
            <span className="tab-label">{a.label}</span>
          </button>
        ))}

        {isAdmin && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">Administração</div>
            <button className={`tab ${abaAtiva === 'admin' ? 'active' : ''}`} onClick={() => handleTab('admin')}>
              <span className="tab-icon">{icons.admin}</span>
              <span className="tab-label">Painel Admin</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-status">
        <div className="sidebar-card">
          <div className="sidebar-card-title">
            <span className={`cloud-dot ${cloudStatus === 'online' ? 'online' : cloudStatus === 'syncing' ? 'syncing' : ''}`} />
            <span>{cloudStatus === 'online' ? 'Nuvem online' : cloudStatus === 'syncing' ? 'Sincronizando' : 'Offline'}</span>
          </div>
          <small>{cloudText}</small>
        </div>
        <div className="sidebar-user-card">
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, flexShrink: 0 }}>{usuarioAtual?.avatar || '?'}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 900, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usuarioAtual?.nome || 'Usuário'}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{usuarioAtual?.cargo || ''}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
