import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { entrar } = useApp()
  const [form, setForm] = useState({ usuario: '', senha: '' })
  const [carregando, setCarregando] = useState(false)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async () => {
    if (carregando) return
    setCarregando(true)
    await entrar(form.usuario, form.senha)
    setCarregando(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMouse)

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 100 + 50
        this.color = Math.random() > 0.5 ? 'rgba(59,130,246,0.05)' : 'rgba(124,58,237,0.05)'
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        const dx = mouseRef.current.x - this.x
        const dy = mouseRef.current.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 300) { this.x += dx * 0.01; this.y += dy * 0.01 }
        if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) this.reset()
      }
      draw() {
        ctx.beginPath()
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
        g.addColorStop(0, this.color)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const particles = Array.from({ length: 30 }, () => new Particle())
    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  const stars = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    size: Math.random() * 2.5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }))

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020408',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: 'white',
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes logoPulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(59,130,246,0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(59,130,246,0.7)); }
        }
        .login-input-wrap { position:relative; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); transition:all 0.3s ease; }
        .login-input-wrap:focus-within { border-color:#3b82f6; box-shadow:0 0 25px rgba(59,130,246,0.2); background:rgba(255,255,255,0.05); transform:translateY(-2px); }
        .login-input-wrap input { background:transparent; border:none; outline:none; width:100%; padding:14px 14px 14px 48px; color:white; font-family:inherit; font-size:15px; }
        .login-input-wrap input::placeholder { color:rgba(255,255,255,0.3); }
        .btn-launch { background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%); border:none; cursor:pointer; transition:all 0.3s ease; color:white; font-weight:700; font-size:16px; letter-spacing:1px; border-radius:16px; padding:18px; width:100%; display:flex; align-items:center; justify-content:center; gap:10px; }
        .btn-launch:hover:not(:disabled) { transform:scale(1.02); box-shadow:0 0 40px rgba(124,58,237,0.4); }
        .btn-launch:disabled { opacity:0.7; cursor:not-allowed; }
        .login-hero-side { display:none; }
        @media(min-width:1024px){ .login-hero-side { display:flex !important; } .login-panel-wrap { padding:48px !important; } }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, opacity:0.6, zIndex:0, pointerEvents:'none' }} />

      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        {stars.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            width: s.size, height: s.size,
            background: 'white', borderRadius: '50%',
            left: s.left + '%', top: s.top + '%',
            animation: `twinkle ${s.duration}s ${s.delay}s infinite ease-in-out`,
          }} />
        ))}
      </div>

      <div style={{ position:'relative', zIndex:1, display:'flex', minHeight:'100vh', width:'100%' }}>

        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 80px' }} className="login-hero-side">
          <img src="/logo.png" alt="Via Log" style={{ height:72, width:'auto', objectFit:'contain', marginBottom:40, animation:'logoPulse 3s infinite ease-in-out' }} />
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 64, fontWeight: 700, lineHeight: 1.05,
            background: 'linear-gradient(180deg, #fff 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 15px rgba(59,130,246,0.3))',
            marginBottom: 20,
          }}>SISTEMA DE<br />ESTADIAS</h1>
          <p style={{ fontSize:18, color:'#94a3b8', maxWidth:440, lineHeight:1.7, fontWeight:300, marginBottom:40 }}>
            A próxima geração em logística e controle.{' '}
            <span style={{ color:'#60a5fa', fontWeight:600 }}>Sincronização em tempo real.</span>
          </p>
          <div style={{ display:'flex', gap:32, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:28, fontWeight:700 }}>99.9%</div>
              <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:3 }}>Uptime</div>
            </div>
            <div style={{ width:1, height:48, background:'#1e293b' }} />
            <div>
              <div style={{ fontSize:28, fontWeight:700 }}>256-bit</div>
              <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:3 }}>Criptografia</div>
            </div>
          </div>
        </div>

        <div style={{ width:'100%', maxWidth:550, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }} className="login-panel-wrap">
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
            borderRadius: 36,
            padding: '48px 40px',
            animation: 'slideIn 0.8s cubic-bezier(0.16,1,0.3,1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:150, height:150, background:'rgba(59,130,246,0.08)', borderRadius:'50%', filter:'blur(30px)', pointerEvents:'none' }} />

            <div style={{ marginBottom:36 }}>
              <h2 style={{ fontSize:36, fontWeight:700, margin:'0 0 6px' }}>Acesso</h2>
              <p style={{ color:'#64748b', margin:0, fontSize:15 }}>Identifique-se para entrar no painel</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:3, display:'block', marginBottom:8 }}>Usuário</label>
                <div className="login-input-wrap">
                  <span style={{ position:'absolute', top:'50%', left:16, transform:'translateY(-50%)', color:'rgba(59,130,246,0.5)', fontSize:16 }}>👤</span>
                  <input
                    type="text"
                    placeholder="Nome de usuário"
                    value={form.usuario}
                    onChange={e => set('usuario', e.target.value)}
                    autoComplete="username"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('ldc-senha')?.focus()}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:3, display:'block', marginBottom:8 }}>Senha</label>
                <div className="login-input-wrap">
                  <span style={{ position:'absolute', top:'50%', left:16, transform:'translateY(-50%)', color:'rgba(59,130,246,0.5)', fontSize:16 }}>🔒</span>
                  <input
                    id="ldc-senha"
                    type="password"
                    placeholder="••••••••••••"
                    value={form.senha}
                    onChange={e => set('senha', e.target.value)}
                    autoComplete="current-password"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <button className="btn-launch" onClick={handleLogin} disabled={carregando} style={{ marginTop:8 }}>
                {carregando ? '⏳ Verificando...' : (<><span>ENTRAR NO PAINEL</span><span>⚡</span></>)}
              </button>
            </div>

            <p style={{ textAlign:'center', marginTop:32, fontSize:13, color:'#334155' }}>
              Acesso autorizado apenas para usuários cadastrados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
