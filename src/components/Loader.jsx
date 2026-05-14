export default function Loader() {
  return (
    <div className="loader">
      <div className="loader-card">
        <div className="logo">LDC</div>
        <div className="spinner" />
        <strong style={{ color: 'white', fontSize: 16 }}>Preparando Painel LDC</strong>
        <small style={{ color: '#dbeafe' }}>conectando nuvem e carregando dados</small>
        <div className="loader-bar"><span /></div>
      </div>
    </div>
  )
}
