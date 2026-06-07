import { gerarId } from '../../utils/index'
import * as v2 from '../../lib/supabaseV2'
import { STORAGE_KEY, STATUS } from './constants'

export function normalizarTelefone(v) {
  return String(v || '').replace(/[^0-9]/g, '')
}

export function formatarTelefone(v) {
  const n = normalizarTelefone(v)
  if (n.length <= 2) return n
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`
}

export function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export function agoraBR() {
  return new Date().toLocaleString('pt-BR')
}

export function pct(a, b) {
  return b ? Math.round((a / b) * 100) : 0
}

export const statusKey = v2.statusV2

export function normalizarItem(item) {
  const key = statusKey(item.status)
  return {
    ...item,
    id: item.id || gerarId(),
    nome: item.nome || item.motorista || '',
    numero: item.numero || item.telefone || '',
    operacao: item.operacao || item.produto || 'Farelo',
    status: key,
    obs: item.obs || item.observacao || item.ultimaObs || '',
    motivoNaoCarregou: item.motivoNaoCarregou || item.motivo_nao_carregou || '',
    justificativaNaoCarregou: item.justificativaNaoCarregou || item.justificativa_nao_carregou || '',
    quantidadeCargas: String(item.quantidadeCargas || item.quantidade_cargas || 1),
    captador: item.captador || item.usuario || '-',
    nomeCaptador: item.nomeCaptador || item.nomeUsuario || item.usuario || '-',
    filial: item.filial || 'jatai-go',
    data: item.data || agoraBR(),
    dataISO: item.dataISO || hojeISO(),
  }
}

export const loadLocal = () => {
  try {
    return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(normalizarItem)
  } catch {
    return []
  }
}

export const saveLocal = (lista) => localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))

export function abrirWhatsNumero(numero, nome = '') {
  let n = normalizarTelefone(numero)
  if (!n) return '#'
  if (!n.startsWith('55')) n = '55' + n
  return `https://wa.me/${n}?text=${encodeURIComponent(`Olá ${nome || ''}, tudo bem? Sou da logística. Estou verificando disponibilidade para carga.`)}`
}

export { STATUS }
