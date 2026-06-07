export default function InsightCard({ titulo, valor, detalhe, cor = '#2563eb', icon = '◆' }) {
  return (
    <div className="cap-insight-card">
      <div className="cap-insight-icon" style={{ color: cor, background: `${cor}18` }}>
        {icon}
      </div>
      <div>
        <span>{titulo}</span>
        <strong>{valor || '-'}</strong>
        <small>{detalhe}</small>
      </div>
    </div>
  )
}
