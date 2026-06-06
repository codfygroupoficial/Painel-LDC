import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { entrar } = useApp()
  const [form, setForm] = useState({ usuario: '', senha: '' })
  const [carregando, setCarregando] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async () => {
    if (carregando) return
    setCarregando(true)
    await entrar(form.usuario, form.senha)
    setCarregando(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #030712 0%, #0a0f1e 40%, #0d1424 70%, #050d1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 55%)', pointerEvents: 'none' }} />

      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }
        @keyframes glowPulse { 0%,100% { box-shadow:0 0 0 0 rgba(37,99,235,0.4); } 50% { box-shadow:0 0 0 6px rgba(37,99,235,0); } }
        .login-wrap { animation: fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
        .login-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.035);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 13px 16px 13px 44px;
          color: white; font-size: 14px; font-family: inherit;
          outline: none; transition: all .2s;
        }
        .login-input:focus {
          border-color: rgba(59,130,246,0.6);
          background: rgba(37,99,235,0.06);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.13);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.16); }
        .login-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%);
          border: none; border-radius: 12px; color: white;
          font-size: 14px; font-weight: 700; font-family: inherit;
          cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          animation: glowPulse 2.5s ease-in-out infinite;
          letter-spacing: .2px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(37,99,235,0.45);
          filter: brightness(1.08);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .login-btn:disabled { opacity: .5; cursor: not-allowed; animation: none; }
        .login-icon-wrap { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Layout desktop: hero + card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 64, padding: '24px 20px', width: '100%', maxWidth: 960, zIndex: 1 }}>

        {/* Hero (desktop only) */}
        <div style={{ flex: 1, color: 'white', display: 'none' }} className="login-hero">
          <style>{`@media(min-width:900px){ .login-hero { display:block !important; animation: fadeUp .8s .15s cubic-bezier(.16,1,.3,1) both; } }`}</style>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
            borderRadius: 999, padding: '5px 14px', marginBottom: 24,
            fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: 1,
          }}>🚛 SISTEMA DE LOGÍSTICA</div>

          <h1 style={{
            fontSize: 58, fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px',
            margin: '0 0 18px',
            background: 'linear-gradient(180deg, #ffffff 0%, #93c5fd 55%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Via Log<br/>Painel</h1>

          <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.75)', lineHeight: 1.7, maxWidth: 360, marginBottom: 32 }}>
            Gestão de estadias, captação de leads e sincronização em tempo real com múltiplas filiais.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['🚀', 'Sincronização em tempo real via Supabase'],
              ['🔒', 'Acesso por filial com controle de permissões'],
              ['📊', 'Dashboard com métricas e histórico'],
              ['📱', 'Captação de leads com ranking da equipe'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(203,213,225,0.7)' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="login-wrap" style={{
          width: '100%', maxWidth: 400, flexShrink: 0,
          background: 'rgba(7,12,28,0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.065)',
          borderRadius: 24,
          padding: '38px 32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'relative', overflow: 'hidden',
          margin: '0 auto',
        }}>

          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #3b82f6 35%, #7c3aed 65%, transparent 100%)' }} />

          {/* Inner glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1), transparent 70%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
            <div className="login-icon-wrap" style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 6px 20px rgba(29,78,216,0.4)',
            }}>🚛</div>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 17, letterSpacing: '-.3px' }}>Via Log</div>
              <div style={{ color: 'rgba(148,163,184,0.45)', fontSize: 11, fontWeight: 500 }}>Sistema de estadias</div>
            </div>
          </div>

          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-.3px' }}>Bem-vindo de volta</h2>
          <p style={{ color: 'rgba(148,163,184,0.4)', fontSize: 13, margin: '0 0 22px' }}>Entre com suas credenciais para acessar</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .28, pointerEvents: 'none' }}>👤</span>
              <input
                className="login-input"
                type="text"
                placeholder="Usuário"
                value={form.usuario}
                onChange={e => set('usuario', e.target.value)}
                autoComplete="username"
                onKeyDown={e => e.key === 'Enter' && document.getElementById('ldc-pw')?.focus()}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .28, pointerEvents: 'none' }}>🔑</span>
              <input
                id="ldc-pw"
                className="login-input"
                type="password"
                placeholder="Senha"
                value={form.senha}
                onChange={e => set('senha', e.target.value)}
                autoComplete="current-password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button className="login-btn" onClick={handleLogin} disabled={carregando} style={{ marginTop: 4 }}>
              {carregando ? (
                <>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.2)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .55s linear infinite' }} />
                  Verificando...
                </>
              ) : 'Entrar no painel →'}
            </button>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '22px 0' }} />

          <div style={{ display: 'flex', gap: 6 }}>
            {[['🔒','Seguro'],['☁️','Nuvem'],['⚡','Real-time']].map(([icon, label]) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', padding: '10px 6px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 14 }}>{icon}</div>
                <div style={{ color: 'rgba(148,163,184,0.35)', fontSize: 10, fontWeight: 600, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
