import { useApp } from '../context/AppContext'

export default function HeroSection({ onNovaLancada, onNovaPendencia, onComandos }) {
  const { cloudStatus, estadiasALancar, usuariosOnline } = useApp()

  return (
    <section className="dashboard-hero">
      <div className="hero-pro-card">
        <h2>Controle de estadias em tempo real</h2>
        <p>Um painel moderno e profissional para lançar estadias, acompanhar pendências, receber alertas, ver usuários online e sincronizar tudo na nuvem automaticamente.</p>
        <div className="hero-actions">
          <button onClick={onNovaLancada}>＋ Nova estadia lançada</button>
          <button onClick={onNovaPendencia}>📋 Nova pendência</button>
          <button onClick={onComandos}>⌘ Comandos rápidos</button>
        </div>
      </div>

      <div className="hero-side-card">
        <h3>Resumo do sistema</h3>
        <div className="system-health">
          <div className="health-row">
            <span>Status da nuvem</span>
            <strong>{cloudStatus === 'online' ? 'Online' : cloudStatus === 'syncing' ? 'Sincronizando' : 'Offline'}</strong>
          </div>
          <div className="health-row">
            <span>Pendências</span>
            <strong>{estadiasALancar.length}</strong>
          </div>
          <div className="health-row">
            <span>Usuários online</span>
            <strong>{usuariosOnline.length}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
