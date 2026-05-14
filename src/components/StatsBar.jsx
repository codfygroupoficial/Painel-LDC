import { useApp } from '../context/AppContext'
import { dinheiro, moedaNumero } from '../utils/index'

export default function StatsBar() {
  const { estadias, estadiasALancar } = useApp()

  const stats = [
    { label: 'Total lançadas', value: estadias.length },
    { label: 'Valor total', value: dinheiro(estadias.reduce((s, e) => s + moedaNumero(e.valor), 0)) },
    { label: 'Abertas', value: estadias.filter(e => e.status === 'Aberto').length },
    { label: 'Feitas', value: estadias.filter(e => e.status === 'Feito' || e.status === 'Finalizado').length },
    { label: 'A lançar', value: estadiasALancar.length },
    { label: 'Urgentes', value: estadiasALancar.filter(e => e.prioridade === 'Urgente').length },
  ]

  return (
    <section className="stats">
      {stats.map(s => (
        <div key={s.label} className="stat">
          <span>{s.label}</span>
          <strong>{s.value}</strong>
        </div>
      ))}
    </section>
  )
}
