import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const COMANDOS = [
  { nome: 'Nova estadia lançada', desc: 'Abrir formulário de lançamento', icone: '＋', aba: 'lancadas' },
  { nome: 'Nova pendência', desc: 'Abrir estadia a lançar com anexos', icone: '📋', aba: 'alancar' },
  { nome: 'Histórico', desc: 'Ver alterações do painel', icone: '📜', aba: 'historico' },
  { nome: 'Backup', desc: 'Ir para backup e exportação', icone: '💾', aba: 'backup' },
]

export default function CommandPalette({ show, onClose }) {
  const { mudarAba } = useApp()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!show) { setQuery(''); return }
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [show, onClose])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!show) return null

  const filtrados = COMANDOS.filter(c =>
    (c.nome + ' ' + c.desc).toLowerCase().includes(query.toLowerCase())
  )

  const executar = (c) => { mudarAba(c.aba); onClose() }

  return (
    <div className="command-palette show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="command-card">
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Digite uma ação... Ex: lançar, pendência, backup" />
        <div className="command-list">
          {filtrados.map((c, i) => (
            <div key={i} className="command-item" onClick={() => executar(c)}>
              <div><strong>{c.icone} {c.nome}</strong><small>{c.desc}</small></div>
              <small>Enter</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
