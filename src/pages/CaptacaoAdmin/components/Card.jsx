export default function Card({ label, value, sub, color = '#2563eb' }) {
  return (
    <div className="capadm-card">
      <span>{label}</span>
      <strong style={{ color }}>{value}</strong>
      <small>{sub}</small>
    </div>
  )
}
