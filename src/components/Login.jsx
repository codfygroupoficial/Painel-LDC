import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { entrar, usuarios, criarUsuario, excluirUsuario } = useApp()
  const [form, setForm] = useState({ usuario: '', senha: '' })
  const [admin, setAdmin] = useState({ senha: '', nome: '', usuario: '', senha2: '', cargo: 'Operador' })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setA = (k, v) => setAdmin(p => ({ ...p, [k]: v }))

  const handleLogin = () => entrar(form.usuario, form.senha)

  const handleCriar = () => {
    if (admin.senha !== '1234') { alert('Senha admin incorreta.'); return }
    if (!admin.nome || !admin.usuario || !admin.senha2) { alert('Preencha nome, login e senha.'); return }
    criarUsuario({ usuario: admin.usuario.toLowerCase(), senha: admin.senha2, nome: admin.nome, cargo: admin.cargo, foto: '' })
    setAdmin({ senha: '', nome: '', usuario: '', senha2: '', cargo: 'Operador' })
  }

  const handleExcluir = (login) => {
    if (admin.senha !== '1234') { alert('Digite a senha admin primeiro.'); return }
    if (!confirm(`Excluir usuário ${login}?`)) return
    excluirUsuario(login)
  }

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-hero">
          <div className="logo" style={{ background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.20)' }}>LDC</div>
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

        <details className="admin-box">
          <summary>⚙️ Admin: criar usuário</summary>
          <div className="admin-grid">
            <input type="password" placeholder="Senha admin: 1234" value={admin.senha} onChange={e => setA('senha', e.target.value)} />
            <input placeholder="Nome" value={admin.nome} onChange={e => setA('nome', e.target.value)} />
            <input placeholder="Login" value={admin.usuario} onChange={e => setA('usuario', e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))} />
            <input type="password" placeholder="Senha" value={admin.senha2} onChange={e => setA('senha2', e.target.value)} />
            <select value={admin.cargo} onChange={e => setA('cargo', e.target.value)}>
              <option>Operador</option><option>Admin</option><option>Visualizador</option>
            </select>
            <button className="btn-purple" onClick={handleCriar}>Criar usuário</button>
            <div>
              {usuarios.map(u => (
                <div key={u.usuario} className="usuario-item">
                  <div className="usuario-left">
                    <span className="avatar mini">{u.avatar || u.usuario.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <strong>{u.nome}</strong>
                      <small>{u.usuario} • {u.cargo}</small>
                    </div>
                  </div>
                  {u.usuario === 'admin'
                    ? <small>principal</small>
                    : <button className="btn-red btn-small" onClick={() => handleExcluir(u.usuario)}>Excluir</button>}
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
