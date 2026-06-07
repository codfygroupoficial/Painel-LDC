import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { playSound, soundForToast, unlockAudio } from '../utils/sounds'

const somPorTexto = (texto = '') => {
  const t = texto.toLowerCase()
  if (t.includes('excluir') || t.includes('remover') || t.includes('deletar')) return 'delete'
  if (t.includes('exportar') || t.includes('csv') || t.includes('backup') || t.includes('resumo')) return 'export'
  if (t.includes('salvar') || t.includes('cadastrar')) return 'save'
  if (t.includes('lançar') || t.includes('lancar') || t.includes('lançamento')) return 'launch'
  if (t.includes('pendência') || t.includes('pendencia') || t.includes('enviar')) return 'pending'
  if (t.includes('finalizar') || t.includes('feito') || t.includes('conclu')) return 'finish'
  if (t.includes('editar') || t.includes('alterar')) return 'edit'
  if (t.includes('admin') || t.includes('relatório') || t.includes('relatorio')) return 'admin'
  if (t.includes('sair')) return 'warning'
  return 'tap'
}

export default function SoundManager() {
  const { toasts, cloudStatus, usuarioAtual, abaAtiva } = useApp()
  const lastToastId = useRef(null)
  const lastCloud = useRef(cloudStatus)
  const lastUser = useRef(usuarioAtual?.usuario || null)
  const lastAba = useRef(abaAtiva)
  const lastHoverAt = useRef(0)

  useEffect(() => {
    const unlock = () => unlockAudio()
    document.addEventListener('pointerdown', unlock, { once: true, capture: true })
    document.addEventListener('keydown', unlock, { once: true, capture: true })
    return () => {
      document.removeEventListener('pointerdown', unlock, { capture: true })
      document.removeEventListener('keydown', unlock, { capture: true })
    }
  }, [])

  useEffect(() => {
    if (!toasts.length) return
    const ultimo = toasts[toasts.length - 1]
    if (!ultimo || ultimo.id === lastToastId.current) return
    lastToastId.current = ultimo.id
    playSound(soundForToast(ultimo.tipo))
  }, [toasts])

  useEffect(() => {
    if (lastCloud.current !== cloudStatus) {
      if (cloudStatus === 'syncing') playSound('sync')
      if (cloudStatus === 'online') playSound('success')
      if (cloudStatus === 'offline') playSound('warning')
      lastCloud.current = cloudStatus
    }
  }, [cloudStatus])

  useEffect(() => {
    const atual = usuarioAtual?.usuario || null
    if (atual && atual !== lastUser.current) playSound('login')
    lastUser.current = atual
  }, [usuarioAtual])

  useEffect(() => {
    if (abaAtiva !== lastAba.current) {
      const aba = String(abaAtiva || '').toLowerCase()
      playSound(aba.includes('admin') || aba.includes('relatorio') ? 'admin' : 'open')
    }
    lastAba.current = abaAtiva
  }, [abaAtiva])

  useEffect(() => {
    const handleClick = (event) => {
      unlockAudio()
      const target = event.target?.closest?.('button, a, select, input[type="checkbox"], input[type="radio"]')
      if (!target) return
      if (target.dataset?.sound === 'off') return

      const texto = `${target.innerText || target.textContent || ''} ${target.title || ''} ${target.getAttribute('aria-label') || ''}`
      playSound(somPorTexto(texto))
    }

    const handleChange = (event) => {
      const target = event.target
      if (!target) return
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) playSound('select')
    }

    const handleMouseOver = (event) => {
      const target = event.target?.closest?.('button, a, .tab, .operator-action-card, .access-module')
      if (!target) return
      const now = Date.now()
      if (now - lastHoverAt.current < 220) return
      lastHoverAt.current = now
      playSound('hover')
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('change', handleChange, true)
    document.addEventListener('mouseover', handleMouseOver, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('change', handleChange, true)
      document.removeEventListener('mouseover', handleMouseOver, true)
    }
  }, [])

  return null
}
