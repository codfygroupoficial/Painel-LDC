import * as v2 from '../../lib/supabaseV2'

export function pct(a, b) {
  return b ? Math.round((a / b) * 100) : 0
}

export function limparTelefone(v) {
  return String(v || '').replace(/[^0-9]/g, '')
}

export function statusKey(status) {
  return v2.statusV2(status)
}

export function normalizarLegado(row) {
  const d = row.dados || {}
  return {
    ...d,
    id: d.id || row.local_id,
    captador: d.captador || d.usuario || row.dados?.usuario || '-',
    nomeCaptador: d.nomeCaptador || d.nomeUsuario || d.captador || d.usuario || '-',
    filial: d.filial || row.filial || 'jatai-go',
    nome: d.nome || d.motorista || '',
    numero: d.numero || d.telefone || '',
    operacao: d.operacao || d.produto || 'Farelo',
    status: statusKey(d.status),
    motivoNaoCarregou: d.motivoNaoCarregou || '',
    justificativaNaoCarregou: d.justificativaNaoCarregou || '',
    quantidadeCargas: d.quantidadeCargas || 1,
    dataISO: d.dataISO || String(row.updated_at || '').slice(0, 10),
    data: d.data || new Date(row.updated_at || Date.now()).toLocaleString('pt-BR'),
  }
}

export function confiancaMotorista(m) {
  if (m.carregou >= 3) return { label: 'Carrega sempre', className: 'strong' }
  if (m.carregou >= 1) return { label: 'Confiável', className: 'good' }
  if (m.naoCarregou >= 2) return { label: 'Risco', className: 'risk' }
  if (m.naoCarregou >= 1) return { label: 'Atenção', className: 'warn' }
  return { label: 'Novo', className: 'new' }
}
