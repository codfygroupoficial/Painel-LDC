import { useRef } from 'react'

export function useSound(somAtivo) {
  const ctxRef = useRef(null)

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  const tocar = (tipo = 'normal') => {
    if (!somAtivo) return
    try {
      const ctx = getCtx()
      const now = ctx.currentTime
      const master = ctx.createGain()
      master.gain.setValueAtTime(0.001, now)
      master.gain.exponentialRampToValueAtTime(0.35, now + 0.02)
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
      master.connect(ctx.destination)

      const notas = tipo === 'alerta' ? [440, 880, 660] : tipo === 'ok' ? [523, 659, 784] : [659, 987]
      notas.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = tipo === 'alerta' ? 'square' : 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.11)
        gain.gain.setValueAtTime(0.0001, now + i * 0.11)
        gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.11 + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.11 + 0.16)
        osc.connect(gain); gain.connect(master)
        osc.start(now + i * 0.11); osc.stop(now + i * 0.11 + 0.2)
      })

      if (tipo === 'alerta' && navigator.vibrate) navigator.vibrate([90, 40, 90])
    } catch {}
  }

  return { tocar }
}
