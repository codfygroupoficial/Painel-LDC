const limparTelefone = (v) => String(v || '').replace(/[^0-9]/g, '')
const texto = (v) => String(v || '').trim()
const isCarregou = (status) => String(status || '').toLowerCase().includes('carregou')

export function montarMotoristasQueCarregam(captacoes) {
  const map = new Map()

  captacoes
    .filter(c => isCarregou(c.status))
    .forEach(c => {
      const nome = texto(c.nome || c.motorista || 'Motorista sem nome')
      const telefone = texto(c.numero || c.telefone || c.telefoneMotorista || '')
      const telLimpo = limparTelefone(telefone)
      const chave = telLimpo || `${nome.toLowerCase()}-${c.filial || 'jatai-go'}`
      const atual = map.get(chave) || {
        chave,
        nome,
        telefone,
        operacoes: new Set(),
        filiais: new Set(),
        captadores: new Set(),
        carregamentos: 0,
        primeiraData: c.data || c.dataISO || '',
        ultimaData: c.ultimaAtualizacao || c.data || c.dataISO || '',
        obs: '',
      }

      atual.nome = nome || atual.nome
      atual.telefone = telefone || atual.telefone
      atual.operacoes.add(c.operacao || c.produto || 'Não informado')
      atual.filiais.add(c.filial || 'jatai-go')
      atual.captadores.add(c.nomeCaptador || c.nomeUsuario || c.captador || c.usuario || '-')
      atual.carregamentos += 1
      atual.ultimaData = c.ultimaAtualizacao || c.data || c.dataISO || atual.ultimaData
      if (c.obs || c.observacao || c.ultimaObs) atual.obs = c.obs || c.observacao || c.ultimaObs
      map.set(chave, atual)
    })

  return [...map.values()]
    .map(m => ({ ...m, operacoesLista: [...m.operacoes], filiaisLista: [...m.filiais], captadoresLista: [...m.captadores] }))
    .sort((a, b) => b.carregamentos - a.carregamentos || a.nome.localeCompare(b.nome))
}
