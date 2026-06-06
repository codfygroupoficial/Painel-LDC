import { useApp } from '../context/AppContext'
import { dinheiro, moedaNumero } from '../utils/index'

export default function StatsBar() {
  const { estadias, estadiasALancar } = useApp()

  const total = estadias.length
  const abertas = estadias.filter(e => e.status === 'Aberto').length
  const feitas = estadias.filter(e => e.status === 'Feito' || e.status === 'Finalizado').length
  const aLancar = estadiasALancar.length
  const urgentes = estadiasALancar.filter(e => e.prioridade === 'Urgente').length

  const stats = [
    { label: 'Total lançadas', value: total, icon: '📦', color: 'blue', bar: Math.min(100, total * 5) },
    { label: 'Valor total', value: dinheiro(estadias.reduce((s, e) => s + moedaNumero(e.valor), 0)), icon: '💰', color: 'green', bar: null },
    { label: 'Abertas', value: abertas, icon: '🔓', color: 'orange', bar: total ? Math.round((abertas / total) * 100) : 0 },
    { label: 'Concluídas', value: feitas, icon: '✅', color: 'teal', bar: total ? Math.round((feitas / total) * 100) : 0 },
    { label: 'A lançar', value: aLancar, icon: '📋', color: 'purple', bar: Math.min(100, aLancar * 5) },
    { label: 'Urgentes', value: urgentes, icon: '🚨', color: 'red', bar: aLancar ? Math.round((urgentes / aLancar) * 100) : 0 },
  ]

  return (
    <section className="stats">
      {stats.map(s => (
        <div key={s.label} className="stat">
          <div className={`stat-icon ${s.color}`}>{s.icon}</div>
          <span>{s.label}</span>
          <strong>{s.value}</strong>
          {s.bar !== null && (
            <div className="stat-bar">
              <span style={{ width: `${s.bar}%` }} />
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
