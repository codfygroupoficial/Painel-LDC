let audioCtx = null
let masterGain = null

const getAudio = () => {
  if (typeof window === 'undefined') return null
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null

  if (!audioCtx) {
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 0.24
    masterGain.connect(audioCtx.destination)
  }

  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

export const unlockAudio = () => {
  const ctx = getAudio()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
}

const tone = ({ freq = 440, start = 0, duration = 0.12, type = 'sine', gain = 0.08, endGain = 0.0001 }) => {
  const ctx = getAudio()
  if (!ctx || !masterGain) return

  const now = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const g = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, now)

  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(gain, now + 0.015)
  g.gain.exponentialRampToValueAtTime(endGain, now + duration)

  osc.connect(g)
  g.connect(masterGain)
  osc.start(now)
  osc.stop(now + duration + 0.03)
}

const sweep = ({ from = 300, to = 700, duration = 0.18, type = 'sine', gain = 0.06 }) => {
  const ctx = getAudio()
  if (!ctx || !masterGain) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(from, now)
  osc.frequency.exponentialRampToValueAtTime(to, now + duration)

  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(gain, now + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(g)
  g.connect(masterGain)
  osc.start(now)
  osc.stop(now + duration + 0.03)
}

const noiseTick = (gainValue = 0.025, duration = 0.035) => {
  const ctx = getAudio()
  if (!ctx || !masterGain) return

  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.22))

  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const g = ctx.createGain()

  filter.type = 'highpass'
  filter.frequency.value = 1200
  g.gain.value = gainValue

  src.buffer = buffer
  src.connect(filter)
  filter.connect(g)
  g.connect(masterGain)
  src.start()
}

const chord = (notes, duration = 0.16, gain = 0.035, type = 'sine') => {
  notes.forEach(freq => tone({ freq, duration, type, gain }))
}

export const playSound = (name = 'tap') => {
  try {
    switch (name) {
      case 'tap':
        tone({ freq: 740, duration: 0.045, type: 'triangle', gain: 0.032 })
        break
      case 'select':
        tone({ freq: 520, duration: 0.055, type: 'triangle', gain: 0.035 })
        tone({ freq: 780, start: 0.045, duration: 0.075, type: 'sine', gain: 0.04 })
        break
      case 'hover':
        tone({ freq: 980, duration: 0.03, type: 'sine', gain: 0.018 })
        break
      case 'success':
        tone({ freq: 523.25, duration: 0.09, type: 'sine', gain: 0.055 })
        tone({ freq: 659.25, start: 0.075, duration: 0.11, type: 'sine', gain: 0.055 })
        tone({ freq: 880, start: 0.16, duration: 0.16, type: 'triangle', gain: 0.045 })
        break
      case 'save':
        tone({ freq: 392, duration: 0.08, type: 'triangle', gain: 0.05 })
        tone({ freq: 587.33, start: 0.07, duration: 0.12, type: 'triangle', gain: 0.045 })
        break
      case 'launch':
        noiseTick(0.022, 0.045)
        sweep({ from: 360, to: 980, duration: 0.22, type: 'triangle', gain: 0.04 })
        tone({ freq: 1174.66, start: 0.16, duration: 0.09, type: 'sine', gain: 0.032 })
        break
      case 'pending':
        tone({ freq: 493.88, duration: 0.08, type: 'triangle', gain: 0.045 })
        tone({ freq: 392, start: 0.09, duration: 0.08, type: 'triangle', gain: 0.04 })
        tone({ freq: 493.88, start: 0.18, duration: 0.12, type: 'sine', gain: 0.035 })
        break
      case 'finish':
        chord([523.25, 659.25, 783.99], 0.18, 0.026, 'sine')
        tone({ freq: 1046.5, start: 0.14, duration: 0.18, type: 'triangle', gain: 0.035 })
        break
      case 'edit':
        tone({ freq: 660, duration: 0.04, type: 'triangle', gain: 0.026 })
        tone({ freq: 560, start: 0.04, duration: 0.07, type: 'triangle', gain: 0.026 })
        break
      case 'delete':
        tone({ freq: 260, duration: 0.06, type: 'sawtooth', gain: 0.035 })
        tone({ freq: 180, start: 0.06, duration: 0.12, type: 'triangle', gain: 0.032 })
        break
      case 'export':
        tone({ freq: 440, duration: 0.06, type: 'sine', gain: 0.035 })
        tone({ freq: 660, start: 0.05, duration: 0.06, type: 'sine', gain: 0.035 })
        tone({ freq: 990, start: 0.10, duration: 0.16, type: 'triangle', gain: 0.035 })
        break
      case 'upload':
        sweep({ from: 420, to: 740, duration: 0.16, type: 'sine', gain: 0.035 })
        tone({ freq: 880, start: 0.12, duration: 0.09, type: 'triangle', gain: 0.03 })
        break
      case 'warning':
        tone({ freq: 440, duration: 0.08, type: 'triangle', gain: 0.05 })
        tone({ freq: 392, start: 0.09, duration: 0.12, type: 'triangle', gain: 0.045 })
        break
      case 'error':
        tone({ freq: 220, duration: 0.11, type: 'sawtooth', gain: 0.045 })
        tone({ freq: 164.81, start: 0.08, duration: 0.15, type: 'triangle', gain: 0.045 })
        break
      case 'notify':
        tone({ freq: 830, duration: 0.08, type: 'sine', gain: 0.045 })
        tone({ freq: 1108, start: 0.085, duration: 0.12, type: 'sine', gain: 0.04 })
        break
      case 'login':
        sweep({ from: 260, to: 860, duration: 0.28, type: 'sine', gain: 0.045 })
        tone({ freq: 1046.5, start: 0.20, duration: 0.16, type: 'triangle', gain: 0.035 })
        break
      case 'sync':
        tone({ freq: 330, duration: 0.06, type: 'sine', gain: 0.035 })
        tone({ freq: 440, start: 0.05, duration: 0.06, type: 'sine', gain: 0.035 })
        tone({ freq: 550, start: 0.10, duration: 0.08, type: 'sine', gain: 0.035 })
        break
      case 'open':
        noiseTick()
        tone({ freq: 660, start: 0.02, duration: 0.07, type: 'triangle', gain: 0.03 })
        break
      case 'admin':
        chord([392, 493.88, 587.33], 0.14, 0.022, 'triangle')
        tone({ freq: 783.99, start: 0.12, duration: 0.12, type: 'sine', gain: 0.032 })
        break
      default:
        tone({ freq: 640, duration: 0.06, type: 'triangle', gain: 0.032 })
    }
  } catch {}
}

export const soundForToast = (tipo = '') => {
  if (tipo === 'ok') return 'success'
  if (tipo === 'err') return 'error'
  if (tipo === 'warn') return 'warning'
  return 'notify'
}
