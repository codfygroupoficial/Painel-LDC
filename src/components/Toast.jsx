import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toasts } = useApp()
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.tipo}`}>{t.texto}</div>
      ))}
    </div>
  )
}
