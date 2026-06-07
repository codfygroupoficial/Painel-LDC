export const STORAGE_KEY = 'captacoesVeiculosViaLog'

export const STATUS = {
  contatado: { label: 'Contatado', cor: '#64748b', icon: '📞', ordem: 1 },
  ordem: { label: 'Pegou ordem', cor: '#d97706', icon: '📋', ordem: 2 },
  nao_carregou: { label: 'Não carregou', cor: '#dc2626', icon: '⛔', ordem: 3 },
  carregou: { label: 'Carregou', cor: '#16a34a', icon: '✅', ordem: 4 },
}

export const OPERACOES = ['Farelo', 'Grãos']

export const MOTIVOS_NAO_CARREGOU = [
  'Sem retorno',
  'Preço não fechou',
  'Sem agenda',
  'Seguradora não libera',
  'Documentação pendente',
  'Motorista desistiu',
  'Veículo carregou em outra empresa',
  'Outro',
]

export const EMPTY = {
  nome: '',
  numero: '',
  operacao: 'Farelo',
  status: 'contatado',
  obs: '',
  quantidadeCargas: '1',
  motivoNaoCarregou: '',
  justificativaNaoCarregou: '',
}

export const MODO_BANCO_INFO = {
  auto: { label: 'Verificando conexão...', cor: '#94a3b8' },
  v2: { label: 'Sincronizado (nuvem)', cor: '#16a34a' },
  'v2+legado': { label: 'Sincronizado (nuvem + backup)', cor: '#16a34a' },
  legado: { label: 'Salvo no banco antigo', cor: '#d97706' },
  local: { label: 'Apenas neste aparelho — sem nuvem', cor: '#dc2626' },
}

export const MEDALHAS = ['🥇', '🥈', '🥉']

export const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 11,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--text)',
  fontSize: 14,
  marginBottom: 16,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
export const lblStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }
export const iconBtn = {
  border: '1px solid var(--line)',
  background: 'var(--card)',
  borderRadius: 8,
  padding: 7,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
