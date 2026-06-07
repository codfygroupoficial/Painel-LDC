export default function StatCard({ icon, label, valor, cor }) {
  return (
    <div className="cap-stat-card">
      <div className="cap-stat-icon" style={{ background: `${cor}1a`, color: cor }}>
        {icon}
      </div>
      <div className="cap-stat-value">{valor}</div>
      <div className="cap-stat-label">{label}</div>
    </div>
  )
}
