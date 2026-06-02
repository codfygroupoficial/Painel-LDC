import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { entrar } = useApp()
  const [form, setForm] = useState({ usuario: '', senha: '' })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const handleLogin = async () => entrar(form.usuario, form.senha)

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-hero">
          <img src="/logo.png" alt="Via Log" style={{ height: 72, width: 'auto', objectFit: 'contain', marginBottom: 4 }} />
          <h1>Painel de Estadias</h1>
          <p>Central para lançar estadias, acompanhar pendências, anexar documentos e sincronizar em tempo real.</p>
          <div className="badges">
            <span>☁️ Nuvem automática</span>
            <span>🔔 Alertas ao vivo</span>
            <span>📎 Anexos</span>
            <span>⚡ Tempo real</span>
          </div>
        </div>

        <label>Usuário</label>
        <input value={form.usuario} onChange={e => set('usuario', e.target.value)} placeholder="Ex: admin" autoComplete="username"
          onKeyDown={e => e.key === 'Enter' && document.getElementById('senha-input')?.focus()} />

        <label>Senha</label>
        <input id="senha-input" type="password" value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="Senha" autoComplete="current-password"
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        <button className="btn-full btn-blue" style={{ marginTop: 14 }} onClick={handleLogin}>Entrar no painel</button>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Acesso autorizado apenas para usuários cadastrados.</p>
      </div>
    </div>
  )
}
