export default function Loader() {
  return (
    <div className="loader">
      <div className="loader-card">
        <img src="/logo.png" alt="Via Log" style={{ height: 56, width: 'auto', objectFit: 'contain', marginBottom: 8 }} />
        <div className="spinner" />
        <strong style={{ color: 'white', fontSize: 16 }}>Preparando Painel Via Log</strong>
        <small style={{ color: '#dbeafe' }}>conectando nuvem e carregando dados</small>
        <div className="loader-bar"><span /></div>
      </div>
    </div>
  )
}
