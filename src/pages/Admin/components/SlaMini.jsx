export default function SlaMini({ resumo }) {
  const total = resumo.normal + resumo.atencao + resumo.urgente + resumo.critico || 1
  return (
    <div className="admin-sla-mini">
      {[
        ['Normal', resumo.normal, '#22c55e'],
        ['Atenção', resumo.atencao, '#f59e0b'],
        ['Urgente', resumo.urgente, '#f97316'],
        ['Crítico', resumo.critico, '#dc2626'],
      ].map(([label, value, cor]) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}><span>{label}</span><strong style={{ color: cor }}>{value}</strong></div>
          <div style={{ height: 6, borderRadius: 999, background: 'rgba(148,163,184,.14)', overflow: 'hidden' }}><i style={{ display: 'block', width: `${Math.max(4, (value / total) * 100)}%`, height: '100%', background: cor }} /></div>
        </div>
      ))}
    </div>
  )
}
