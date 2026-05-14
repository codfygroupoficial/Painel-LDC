import { useState } from 'react'
import { useApp } from '../context/AppContext'
import NotificationBell from './NotificationBell'
import ConfigModal from './modals/ConfigModal'
import CommandPalette from './modals/CommandPalette'

export default function Header({ onMenuMobile }) {
  const { cloudStatus, cloudText, usuarioAtual, estadiasALancar, alternarSom, somAtivo, alternarTema, tema, logout, conectarSupabase, sincronizarFila } = useApp()
  const [showConfig, setShowConfig] = useState(false)
  const [showCommand, setShowCommand] = useState(false)

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div>
            <h1><span>🏠</span> Painel LDC</h1>
            <p>Estadias, pendências, anexos e nuvem em tempo real.</p>
          </div>

          <div className="top-actions">
            <button className="btn-light mobile-menu-btn" onClick={onMenuMobile}>☰ Menu</button>

            <div className={`cloud-mini ${cloudStatus}`}>
              <span className={`cloud-dot ${cloudStatus === 'online' ? 'online' : cloudStatus === 'syncing' ? 'syncing' : ''}`} />
              <div>
                <strong>{cloudStatus === 'online' ? 'Nuvem online' : cloudStatus === 'syncing' ? 'Sincronizando' : 'Nuvem offline'}</strong>
                <small>{cloudText}</small>
              </div>
            </div>

            <NotificationBell />

            <button className={`btn-light sound-toggle ${somAtivo ? 'on' : ''}`} onClick={alternarSom}>
              {somAtivo ? '🔔 Som' : '🔕 Som'}
            </button>

            <button className="btn-light" onClick={() => setShowConfig(true)}>⚙️ Config</button>
            <button className="btn-light" onClick={alternarTema}>{tema === 'dark' ? '☀️ Tema' : '🌙 Tema'}</button>
            <button className="btn-light" onClick={() => setShowCommand(true)} title="Ctrl+K">⌘ Cmd</button>

            <div className="profile-pill">
              <span className="avatar">{usuarioAtual?.avatar || '?'}</span>
              <span>{usuarioAtual?.nome || 'Logado'}</span>
              <span className="pending-badge">{estadiasALancar.length}</span>
            </div>

            <button className="btn-light" onClick={logout}>Sair</button>
          </div>
        </div>
      </header>

      <ConfigModal show={showConfig} onClose={() => setShowConfig(false)} />
      <CommandPalette show={showCommand} onClose={() => setShowCommand(false)} />
    </>
  )
}
