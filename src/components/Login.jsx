import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { entrar } = useApp()
  const [form, setForm] = useState({ usuario: '', senha: '' })
  const [carregando, setCarregando] = useState(false)
  const canvasRef = useRef(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async () => {
    if (carregando) return
    setCarregando(true)
    await entrar(form.usuario, form.senha)
    setCarregando(false)
  }

  /* Estrada animada no canvas */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let offset = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      /* céu / fundo */
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#020917')
      sky.addColorStop(0.6, '#0a1628')
      sky.addColorStop(1, '#111827')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      /* estrelas */
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137.5 + offset * 0.05) % W)
        const sy = (i * 53) % (H * 0.55)
        const sr = (i % 3 === 0) ? 1.2 : 0.6
        ctx.beginPath()
        ctx.arc(sx, sy, sr, 0, Math.PI * 2)
        ctx.fill()
      }

      /* estrada */
      const roadY = H * 0.62
      const roadH = H - roadY

      /* asfalto */
      const road = ctx.createLinearGradient(0, roadY, 0, H)
      road.addColorStop(0, '#1a1a2e')
      road.addColorStop(1, '#0d0d1a')
      ctx.fillStyle = road
      ctx.fillRect(0, roadY, W, roadH)

      /* linha divisória central animada */
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 3
      ctx.setLineDash([40, 30])
      ctx.lineDashOffset = -offset
      ctx.beginPath()
      ctx.moveTo(0, roadY + roadH * 0.3)
      ctx.lineTo(W, roadY + roadH * 0.3)
      ctx.stroke()
      ctx.setLineDash([])

      /* linhas laterais brancas */
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, roadY + 2)
      ctx.lineTo(W, roadY + 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, H - 2)
      ctx.lineTo(W, H - 2)
      ctx.stroke()

      /* reflexo da estrada */
      const refl = ctx.createLinearGradient(0, roadY, 0, roadY + 60)
      refl.addColorStop(0, 'rgba(37,99,235,0.08)')
      refl.addColorStop(1, 'transparent')
      ctx.fillStyle = refl
      ctx.fillRect(0, roadY, W, 60)

      /* montanhas ao fundo */
      ctx.fillStyle = '#0f1f3d'
      ctx.beginPath()
      ctx.moveTo(0, roadY)
      ctx.lineTo(W * 0.1, roadY - 80)
      ctx.lineTo(W * 0.22, roadY - 40)
      ctx.lineTo(W * 0.35, roadY - 120)
      ctx.lineTo(W * 0.5, roadY - 60)
      ctx.lineTo(W * 0.65, roadY - 140)
      ctx.lineTo(W * 0.78, roadY - 50)
      ctx.lineTo(W * 0.9, roadY - 90)
      ctx.lineTo(W, roadY - 30)
      ctx.lineTo(W, roadY)
      ctx.closePath()
      ctx.fill()

      /* luzes de faróis na pista (carro vindo) */
      const lightX = ((offset * 1.5) % (W + 200)) - 100
      const lg = ctx.createRadialGradient(lightX, roadY + roadH * 0.25, 0, lightX, roadY + roadH * 0.25, 120)
      lg.addColorStop(0, 'rgba(255,220,100,0.18)')
      lg.addColorStop(1, 'transparent')
      ctx.fillStyle = lg
      ctx.fillRect(0, roadY, W, roadH)

      offset += 1.5
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020917',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes truckDrive {
          from { transform: translateX(-160px); }
          to   { transform: translateX(calc(100vw + 20px)); }
        }
        @keyframes loginCardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(37,99,235,0.3); }
          50% { box-shadow: 0 0 40px rgba(37,99,235,0.6); }
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px 14px 46px;
          color: white;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }
        .login-input:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.08);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.25); }
        .login-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #1d4ed8, #7c3aed);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          animation: glow 3s ease-in-out infinite;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; animation: none; }
      `}</style>

      {/* Canvas — cena da estrada */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Caminhão SVG animado */}
      <div style={{
        position: 'absolute',
        bottom: '22%',
        left: 0,
        zIndex: 2,
        animation: 'truckDrive 8s linear infinite',
      }}>
        <svg width="140" height="60" viewBox="0 0 140 60" fill="none">
          {/* carroceria */}
          <rect x="0" y="10" width="90" height="36" rx="4" fill="#1e3a5f" stroke="#2563eb" strokeWidth="1.5"/>
          {/* listras */}
          <rect x="10" y="10" width="3" height="36" fill="rgba(37,99,235,0.4)"/>
          <rect x="20" y="10" width="3" height="36" fill="rgba(37,99,235,0.3)"/>
          <rect x="30" y="10" width="3" height="36" fill="rgba(37,99,235,0.2)"/>
          {/* cabine */}
          <rect x="90" y="18" width="42" height="28" rx="5" fill="#0f2744" stroke="#3b82f6" strokeWidth="1.5"/>
          {/* vidro */}
          <rect x="105" y="22" width="22" height="14" rx="3" fill="#60a5fa" opacity="0.7"/>
          {/* para-choque */}
          <rect x="128" y="38" width="8" height="5" rx="2" fill="#374151"/>
          {/* farol */}
          <circle cx="133" cy="34" r="3" fill="#fde68a" opacity="0.9"/>
          <ellipse cx="136" cy="34" rx="6" ry="3" fill="rgba(253,230,138,0.25)"/>
          {/* escapamento */}
          <rect x="88" y="4" width="5" height="16" rx="2" fill="#374151"/>
          <ellipse cx="90.5" cy="4" rx="4" ry="2" fill="rgba(156,163,175,0.4)"/>
          {/* rodas */}
          <circle cx="25" cy="48" r="10" fill="#111827" stroke="#4b5563" strokeWidth="2"/>
          <circle cx="25" cy="48" r="5" fill="#374151"/>
          <circle cx="75" cy="48" r="10" fill="#111827" stroke="#4b5563" strokeWidth="2"/>
          <circle cx="75" cy="48" r="5" fill="#374151"/>
          <circle cx="112" cy="48" r="10" fill="#111827" stroke="#4b5563" strokeWidth="2"/>
          <circle cx="112" cy="48" r="5" fill="#374151"/>
          {/* logo na carroceria */}
          <text x="45" y="32" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontWeight="700">VIA LOG</text>
        </svg>
      </div>

      {/* Overlay escuro para legibilidade */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,9,23,0.55)', zIndex: 1 }} />

      {/* Conteúdo central */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '20px',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeUp 0.6s ease' }}>
          <img src="/logo.png" alt="Via Log" style={{ height: 56, marginBottom: 16, filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.5))' }} />
          <h1 style={{
            fontSize: 36, fontWeight: 900, color: 'white',
            letterSpacing: '-1px', margin: 0,
            textShadow: '0 0 40px rgba(59,130,246,0.4)',
          }}>Via Log</h1>
          <p style={{ color: 'rgba(148,163,184,0.9)', marginTop: 6, fontSize: 14 }}>
            Sistema de controle de estadias
          </p>
        </div>

        {/* Card de login */}
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(10,16,30,0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'loginCardIn 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>

          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Entrar no painel</h2>
          <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13, marginBottom: 24 }}>Acesso autorizado somente a usuários cadastrados</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Usuário */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>👤</span>
              <input
                className="login-input"
                type="text"
                placeholder="Usuário"
                value={form.usuario}
                onChange={e => set('usuario', e.target.value)}
                autoComplete="username"
                onKeyDown={e => e.key === 'Enter' && document.getElementById('ldc-senha')?.focus()}
              />
            </div>

            {/* Senha */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>🔒</span>
              <input
                id="ldc-senha"
                className="login-input"
                type="password"
                placeholder="Senha"
                value={form.senha}
                onChange={e => set('senha', e.target.value)}
                autoComplete="current-password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button className="login-btn" onClick={handleLogin} disabled={carregando}>
              {carregando ? (
                <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Verificando...</>
              ) : (
                <><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Acessar o painel</>
              )}
            </button>
          </div>

          {/* Stats rápidos */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: 'Uptime', value: '99.9%' },
              { label: 'Segurança', value: '256-bit' },
              { label: 'Sync', value: 'Real-time' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>{s.value}</div>
                <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(100,116,139,0.6)', fontSize: 12, marginTop: 24, zIndex: 3 }}>
          © Via Log {new Date().getFullYear()} · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
