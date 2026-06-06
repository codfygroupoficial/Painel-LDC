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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let t = 0

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    /* ---- partículas de neblina ---- */
    const fog = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * 1920,
      y: 300 + Math.random() * 200,
      r: 80 + Math.random() * 120,
      speed: 0.15 + Math.random() * 0.25,
      alpha: 0.03 + Math.random() * 0.06,
    }))

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const VP = { x: W / 2, y: H * 0.46 } // ponto de fuga

      ctx.clearRect(0, 0, W, H)

      /* === CÉU === */
      const sky = ctx.createLinearGradient(0, 0, 0, VP.y + 40)
      sky.addColorStop(0,   '#000510')
      sky.addColorStop(0.4, '#020c1f')
      sky.addColorStop(0.75,'#071428')
      sky.addColorStop(1,   '#0d1f3c')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, VP.y + 40)

      /* === ESTRELAS === */
      for (let i = 0; i < 160; i++) {
        const sx = (i * 197.3 + 50) % W
        const sy = (i * 83.7) % (VP.y * 0.9)
        const flicker = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.02 + i))
        const size = i % 5 === 0 ? 1.4 : 0.7
        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${flicker * (i % 3 === 0 ? 0.9 : 0.5)})`
        ctx.fill()
      }

      /* === VIA LÁCTEA sutil === */
      const mw = ctx.createLinearGradient(W*0.2, 0, W*0.8, VP.y*0.7)
      mw.addColorStop(0, 'transparent')
      mw.addColorStop(0.5, 'rgba(100,120,200,0.04)')
      mw.addColorStop(1, 'transparent')
      ctx.fillStyle = mw
      ctx.fillRect(0, 0, W, VP.y)

      /* === CIDADE ao fundo === */
      const buildings = [
        {x:0.02,w:0.04,h:0.22},{x:0.06,w:0.03,h:0.16},{x:0.09,w:0.05,h:0.28},
        {x:0.14,w:0.03,h:0.18},{x:0.17,w:0.06,h:0.32},{x:0.23,w:0.04,h:0.20},
        {x:0.27,w:0.03,h:0.14},{x:0.30,w:0.05,h:0.26},{x:0.35,w:0.04,h:0.19},
        {x:0.39,w:0.06,h:0.35},{x:0.45,w:0.04,h:0.24},{x:0.49,w:0.03,h:0.17},
        {x:0.52,w:0.05,h:0.30},{x:0.57,w:0.04,h:0.21},{x:0.61,w:0.06,h:0.38},
        {x:0.67,w:0.03,h:0.15},{x:0.70,w:0.05,h:0.27},{x:0.75,w:0.04,h:0.20},
        {x:0.79,w:0.06,h:0.33},{x:0.85,w:0.03,h:0.18},{x:0.88,w:0.05,h:0.25},
        {x:0.93,w:0.04,h:0.22},{x:0.97,w:0.03,h:0.15},
      ]

      /* glow da cidade */
      const cityGlow = ctx.createLinearGradient(0, VP.y - 120, 0, VP.y)
      cityGlow.addColorStop(0, 'transparent')
      cityGlow.addColorStop(1, 'rgba(30,80,180,0.18)')
      ctx.fillStyle = cityGlow
      ctx.fillRect(0, VP.y - 120, W, 120)

      buildings.forEach(b => {
        const bx = b.x * W
        const bw = b.w * W
        const bh = b.h * VP.y
        const by = VP.y - bh

        /* sombra/reflexo */
        const bg = ctx.createLinearGradient(bx, by, bx, VP.y)
        bg.addColorStop(0, 'rgba(15,35,80,0.85)')
        bg.addColorStop(1, 'rgba(8,18,45,0.95)')
        ctx.fillStyle = bg
        ctx.fillRect(bx, by, bw, bh)

        /* janelas */
        const cols = Math.max(1, Math.floor(bw / 8))
        const rows = Math.max(1, Math.floor(bh / 12))
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const on = Math.sin(b.x * 100 + r * 7 + c * 13) > 0.1
            if (!on) continue
            const wx = bx + c * (bw / cols) + 1.5
            const wy = by + r * (bh / rows) + 2
            const ww = bw / cols - 3
            const wh = bh / rows - 4
            ctx.fillStyle = Math.random() > 0.97
              ? `rgba(255,200,80,${0.5 + 0.5 * Math.abs(Math.sin(t*0.03 + r + c))})`
              : `rgba(150,200,255,${0.3 + 0.4 * Math.abs(Math.sin(t*0.015 + r*3 + c*7))})`
            ctx.fillRect(wx, wy, ww, wh)
          }
        }
      })

      /* === ESTRADA em perspectiva 3D === */
      const roadBottom = H
      const roadLeft  = VP.x - W * 0.52
      const roadRight = VP.x + W * 0.52

      /* asfalto */
      const asphalt = ctx.createLinearGradient(0, VP.y, 0, roadBottom)
      asphalt.addColorStop(0, '#141822')
      asphalt.addColorStop(0.4, '#0e1218')
      asphalt.addColorStop(1, '#080a0e')
      ctx.fillStyle = asphalt
      ctx.beginPath()
      ctx.moveTo(VP.x - 2, VP.y)
      ctx.lineTo(VP.x + 2, VP.y)
      ctx.lineTo(roadRight, roadBottom)
      ctx.lineTo(roadLeft, roadBottom)
      ctx.closePath()
      ctx.fill()

      /* reflexo azul na pista */
      const roadGlow = ctx.createLinearGradient(0, VP.y, 0, VP.y + (roadBottom - VP.y) * 0.5)
      roadGlow.addColorStop(0, 'rgba(37,99,235,0.12)')
      roadGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = roadGlow
      ctx.beginPath()
      ctx.moveTo(VP.x - 2, VP.y)
      ctx.lineTo(VP.x + 2, VP.y)
      ctx.lineTo(roadRight, roadBottom)
      ctx.lineTo(roadLeft, roadBottom)
      ctx.closePath()
      ctx.fill()

      /* linhas da pista em perspectiva */
      const lanes = 4
      for (let l = 1; l < lanes; l++) {
        const frac = l / lanes
        const bx = roadLeft + (roadRight - roadLeft) * frac
        ctx.strokeStyle = l === 2 ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.15)'
        ctx.lineWidth = l === 2 ? 2 : 1
        ctx.beginPath()
        ctx.moveTo(VP.x, VP.y + 2)
        ctx.lineTo(bx, roadBottom)
        ctx.stroke()
      }

      /* tracejado central animado em perspectiva */
      const dashCount = 12
      for (let d = 0; d < dashCount; d++) {
        const p0 = ((d / dashCount + t * 0.004) % 1)
        const p1 = ((d / dashCount + t * 0.004 + 0.035) % 1)
        if (p0 > 0.98) continue
        const lerp = (a, b, f) => a + (b - a) * f
        const x0 = lerp(VP.x, VP.x + (roadRight - roadLeft) * 0.5 - (roadRight - roadLeft) * 0.5 + (roadRight-roadLeft)*0.49, p0)
        const x1 = lerp(VP.x, VP.x + (roadRight - roadLeft) * 0.5 - (roadRight - roadLeft) * 0.5 + (roadRight-roadLeft)*0.49, p1)
        const y0 = lerp(VP.y, roadBottom, p0)
        const y1 = lerp(VP.y, roadBottom, p1)
        const alpha = 0.3 + p0 * 0.5
        ctx.strokeStyle = `rgba(245,158,11,${alpha})`
        ctx.lineWidth = 2 + p0 * 3
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.stroke()
      }

      /* postes de luz em perspectiva */
      const poles = [0.15, 0.35, 0.55, 0.75, 0.9]
      poles.forEach((p, i) => {
        const px = roadLeft + (roadRight - roadLeft) * p
        const py = VP.y + (roadBottom - VP.y) * p
        const poleH = 40 + p * 80
        const poleW = 1 + p * 3

        /* poste */
        ctx.fillStyle = 'rgba(100,120,150,0.6)'
        ctx.fillRect(px - poleW/2, py - poleH, poleW, poleH)

        /* luminária */
        ctx.fillStyle = 'rgba(80,100,130,0.7)'
        ctx.fillRect(px - poleW*3, py - poleH, poleW*6, poleW*2)

        /* halo de luz */
        const halo = ctx.createRadialGradient(px, py - poleH + 4, 0, px, py - poleH + 4, 40 + p * 40)
        halo.addColorStop(0, `rgba(255,220,100,${0.12 + p * 0.08})`)
        halo.addColorStop(1, 'transparent')
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(px, py - poleH + 4, 40 + p * 40, 0, Math.PI * 2)
        ctx.fill()

        /* cone de luz na pista */
        const coneAlpha = 0.04 + p * 0.04
        const cone = ctx.createLinearGradient(px, py - poleH, px, py + 60)
        cone.addColorStop(0, `rgba(255,220,100,${coneAlpha})`)
        cone.addColorStop(1, 'transparent')
        ctx.fillStyle = cone
        ctx.beginPath()
        ctx.moveTo(px - 2, py - poleH)
        ctx.lineTo(px - 30 - p*40, py + 60)
        ctx.lineTo(px + 30 + p*40, py + 60)
        ctx.closePath()
        ctx.fill()
      })

      /* === NEBLINA === */
      fog.forEach(f => {
        f.x -= f.speed
        if (f.x + f.r < 0) f.x = W + f.r
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r)
        g.addColorStop(0, `rgba(100,140,200,${f.alpha})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      })

      /* === CAMINHÃO === */
      const truckX = ((t * 1.2) % (W + 300)) - 200
      const truckY = H * 0.76
      const sc = 1.3
      ctx.save()
      ctx.translate(truckX, truckY)
      ctx.scale(sc, sc)

      /* sombra do caminhão */
      const shadowGrad = ctx.createRadialGradient(75, 52, 0, 75, 52, 90)
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.35)')
      shadowGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(75, 54, 90, 12, 0, 0, Math.PI * 2)
      ctx.fill()

      /* carroceria */
      const bodyGrad = ctx.createLinearGradient(0, 8, 0, 44)
      bodyGrad.addColorStop(0, '#1e3a5f')
      bodyGrad.addColorStop(1, '#0f1f3d')
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.roundRect(0, 8, 95, 38, 4)
      ctx.fill()
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 1
      ctx.stroke()

      /* faixa lateral */
      ctx.fillStyle = 'rgba(37,99,235,0.5)'
      ctx.fillRect(2, 18, 91, 3)
      ctx.fillRect(2, 38, 91, 3)

      /* texto na carroceria */
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = 'bold 8px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('VIA LOG', 47, 32)
      ctx.textAlign = 'left'

      /* cabine */
      const cabGrad = ctx.createLinearGradient(95, 14, 137, 46)
      cabGrad.addColorStop(0, '#162d52')
      cabGrad.addColorStop(1, '#0a1628')
      ctx.fillStyle = cabGrad
      ctx.beginPath()
      ctx.roundRect(95, 14, 42, 32, [0, 8, 4, 0])
      ctx.fill()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 1
      ctx.stroke()

      /* vidro dianteiro */
      const glassGrad = ctx.createLinearGradient(110, 18, 110, 34)
      glassGrad.addColorStop(0, 'rgba(147,197,253,0.8)')
      glassGrad.addColorStop(1, 'rgba(59,130,246,0.5)')
      ctx.fillStyle = glassGrad
      ctx.beginPath()
      ctx.roundRect(110, 18, 24, 16, 3)
      ctx.fill()

      /* reflexo no vidro */
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath()
      ctx.roundRect(112, 19, 8, 4, 2)
      ctx.fill()

      /* para-choque dianteiro */
      ctx.fillStyle = '#374151'
      ctx.beginPath()
      ctx.roundRect(132, 36, 8, 7, 2)
      ctx.fill()

      /* escapamento */
      ctx.fillStyle = '#374151'
      ctx.beginPath()
      ctx.roundRect(92, 2, 5, 18, 2)
      ctx.fill()
      /* fumaça */
      for (let s = 0; s < 3; s++) {
        const sa = 0.15 - s * 0.04
        const sr = 4 + s * 3
        const sy = -2 - s * 6 + Math.sin(t * 0.08 + s) * 2
        const sx2 = 94 + Math.sin(t * 0.05 + s) * 2
        ctx.beginPath()
        ctx.arc(sx2, sy, sr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,180,180,${sa})`
        ctx.fill()
      }

      /* farol dianteiro */
      ctx.beginPath()
      ctx.arc(135, 28, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#fde68a'
      ctx.fill()
      /* halo do farol */
      const headlight = ctx.createRadialGradient(142, 28, 0, 142, 28, 30)
      headlight.addColorStop(0, 'rgba(253,230,138,0.25)')
      headlight.addColorStop(1, 'transparent')
      ctx.fillStyle = headlight
      ctx.beginPath()
      ctx.arc(142, 28, 30, 0, Math.PI * 2)
      ctx.fill()

      /* luz traseira vermelha */
      ctx.beginPath()
      ctx.arc(3, 22, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(239,68,68,${0.6 + 0.4 * Math.sin(t * 0.05)})`
      ctx.fill()

      /* rodas */
      const wheels = [22, 60, 70, 108, 120]
      wheels.forEach(wx => {
        /* pneu */
        ctx.beginPath()
        ctx.arc(wx, 46, 10, 0, Math.PI * 2)
        ctx.fillStyle = '#111827'
        ctx.fill()
        ctx.strokeStyle = '#374151'
        ctx.lineWidth = 1.5
        ctx.stroke()
        /* aro */
        ctx.beginPath()
        ctx.arc(wx, 46, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#1f2937'
        ctx.fill()
        /* raios girando */
        for (let r = 0; r < 5; r++) {
          const angle = (r / 5) * Math.PI * 2 + t * 0.12
          ctx.strokeStyle = 'rgba(156,163,175,0.7)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(wx, 46)
          ctx.lineTo(wx + Math.cos(angle) * 5.5, 46 + Math.sin(angle) * 5.5)
          ctx.stroke()
        }
      })

      ctx.restore()

      /* === LINHA DO HORIZONTE com glow === */
      const horizon = ctx.createLinearGradient(0, VP.y - 3, 0, VP.y + 3)
      horizon.addColorStop(0, 'transparent')
      horizon.addColorStop(0.5, 'rgba(37,99,235,0.5)')
      horizon.addColorStop(1, 'transparent')
      ctx.fillStyle = horizon
      ctx.fillRect(0, VP.y - 3, W, 6)

      t++
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes loginIn {
          from { opacity:0; transform:translateY(28px) scale(0.96); }
          to   { opacity:1; transform:none; }
        }
        @keyframes titleIn {
          from { opacity:0; transform:translateY(-16px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(37,99,235,0.5); }
          50%      { box-shadow:0 0 0 8px rgba(37,99,235,0); }
        }
        @keyframes roadLine {
          from { transform:scaleX(0); opacity:0; }
          to   { transform:scaleX(1); opacity:1; }
        }
        .ldc-input {
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1.5px solid rgba(255,255,255,0.08);
          border-radius:14px;
          padding:14px 16px 14px 48px;
          color:white;
          font-size:14px;
          font-family:inherit;
          outline:none;
          transition:all 0.2s;
        }
        .ldc-input:focus {
          border-color:#3b82f6;
          background:rgba(37,99,235,0.08);
          box-shadow:0 0 0 4px rgba(37,99,235,0.15);
          transform:translateY(-1px);
        }
        .ldc-input::placeholder { color:rgba(255,255,255,0.2); }
        .ldc-btn {
          width:100%; padding:15px;
          background:linear-gradient(135deg,#1d4ed8 0%,#6d28d9 100%);
          border:none; border-radius:14px; color:white;
          font-size:15px; font-weight:800; font-family:inherit;
          cursor:pointer; transition:all 0.25s;
          display:flex; align-items:center; justify-content:center; gap:10px;
          animation:pulse 2.5s ease-in-out infinite;
          letter-spacing:0.3px;
        }
        .ldc-btn:hover:not(:disabled) {
          transform:translateY(-3px) scale(1.01);
          box-shadow:0 20px 50px rgba(37,99,235,0.45);
          filter:brightness(1.1);
        }
        .ldc-btn:active:not(:disabled) { transform:scale(0.98); }
        .ldc-btn:disabled { opacity:0.6; cursor:not-allowed; animation:none; }
        .ldc-stat { flex:1; text-align:center; padding:12px 8px; border-radius:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); }
        .ldc-stat:hover { background:rgba(255,255,255,0.06); }
      `}</style>

      {/* Canvas cena */}
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />

      {/* Overlay gradiente */}
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(to bottom, rgba(0,5,16,0.3) 0%, rgba(0,5,16,0.15) 45%, rgba(0,5,16,0.7) 100%)'
      }} />

      {/* Conteúdo */}
      <div style={{
        position:'relative', zIndex:2,
        display:'flex', alignItems:'center', justifyContent:'center',
        minHeight:'100vh', padding:'20px',
        gap: 60,
      }}>

        {/* Lado esquerdo — visível só em desktop */}
        <div className="ldc-hero-side" style={{ flex:1, maxWidth:480, color:'white' }}>
          <style>{`.ldc-hero-side { display:none } @media(min-width:1024px){ .ldc-hero-side { display:block !important; animation:titleIn 1s ease; } }`}</style>

          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.3)',
            borderRadius:999, padding:'6px 14px', marginBottom:28, fontSize:12, fontWeight:700,
            color:'#93c5fd', letterSpacing:1,
          }}>🚛 SISTEMA DE LOGÍSTICA</div>

          <h1 style={{
            fontSize:62, fontWeight:900, lineHeight:1.0,
            letterSpacing:'-2px', margin:'0 0 20px',
            background:'linear-gradient(180deg, #ffffff 0%, #93c5fd 60%, #3b82f6 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            filter:'drop-shadow(0 0 30px rgba(59,130,246,0.3))',
          }}>Via Log<br/>Painel</h1>

          <p style={{ fontSize:17, color:'rgba(148,163,184,0.85)', lineHeight:1.7, maxWidth:380, marginBottom:36 }}>
            Controle de estadias, pendências e sincronização em tempo real com múltiplas filiais.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { icon:'🚀', text:'Sincronização em tempo real via Supabase' },
              { icon:'🔒', text:'Acesso por filial com controle de permissões' },
              { icon:'📊', text:'Dashboard com gráficos e relatórios' },
              { icon:'📎', text:'Anexos de documentos por pendência' },
            ].map(f => (
              <div key={f.text} style={{ display:'flex', alignItems:'center', gap:12, fontSize:14, color:'rgba(203,213,225,0.8)' }}>
                <span style={{ fontSize:18 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Card de login */}
        <div style={{
          width:'100%', maxWidth:420,
          background:'rgba(6,12,26,0.88)',
          backdropFilter:'blur(32px)',
          WebkitBackdropFilter:'blur(32px)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:28,
          padding:'36px 32px',
          boxShadow:'0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation:'loginIn 0.8s cubic-bezier(0.16,1,0.3,1)',
          position:'relative', overflow:'hidden',
        }}>

          {/* decoração interna */}
          <div style={{
            position:'absolute', top:-60, right:-60,
            width:180, height:180, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)',
            pointerEvents:'none',
          }} />

          {/* logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:'linear-gradient(135deg,#1d4ed8,#7c3aed)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 8px 24px rgba(37,99,235,0.4)',
              fontSize:22,
            }}>🚛</div>
            <div>
              <div style={{ color:'white', fontWeight:900, fontSize:18, letterSpacing:'-0.3px' }}>Via Log</div>
              <div style={{ color:'rgba(148,163,184,0.6)', fontSize:12 }}>Sistema de estadias</div>
            </div>
          </div>

          {/* título */}
          <h2 style={{ color:'white', fontSize:22, fontWeight:800, marginBottom:4, letterSpacing:'-0.3px' }}>Entrar no painel</h2>
          <p style={{ color:'rgba(148,163,184,0.55)', fontSize:13, marginBottom:26 }}>Use suas credenciais de acesso</p>

          {/* campos */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:0.35, pointerEvents:'none' }}>👤</span>
              <input
                className="ldc-input"
                type="text"
                placeholder="Nome de usuário"
                value={form.usuario}
                onChange={e => set('usuario', e.target.value)}
                autoComplete="username"
                onKeyDown={e => e.key === 'Enter' && document.getElementById('ldc-pw')?.focus()}
              />
            </div>

            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:0.35, pointerEvents:'none' }}>🔐</span>
              <input
                id="ldc-pw"
                className="ldc-input"
                type="password"
                placeholder="Senha"
                value={form.senha}
                onChange={e => set('senha', e.target.value)}
                autoComplete="current-password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button className="ldc-btn" onClick={handleLogin} disabled={carregando} style={{ marginTop:6 }}>
              {carregando ? (
                <>
                  <span style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.65s linear infinite' }} />
                  Verificando acesso...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Acessar o painel
                </>
              )}
            </button>
          </div>

          {/* divisor */}
          <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'24px 0' }} />

          {/* stats */}
          <div style={{ display:'flex', gap:8 }}>
            {[
              { icon:'⚡', label:'Uptime', value:'99.9%' },
              { icon:'🔒', label:'Criptografia', value:'256-bit' },
              { icon:'☁️', label:'Sync', value:'Real-time' },
            ].map(s => (
              <div key={s.label} className="ldc-stat">
                <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
                <div style={{ color:'white', fontWeight:800, fontSize:13 }}>{s.value}</div>
                <div style={{ color:'rgba(148,163,184,0.45)', fontSize:10, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
