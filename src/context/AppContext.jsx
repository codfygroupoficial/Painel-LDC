import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { defaultUsers } from '../data/defaultUsers'
import { FILIAIS } from '../data/filiais'
import { dinheiro, moedaNumero, gerarId, baixarArquivo, dataISOTexto, calcularEstadia } from '../utils/index'
import * as sb from '../lib/supabase'

const hashSenha = async (senha) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(senha + 'ldc2025'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
const isHash = (s) => /^[a-f0-9]{64}$/.test(s)

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const initialState = {
  usuarioAtual: load('usuarioLogadoViaLog', null),
  usuarios: load('usuariosPainelViaLog', defaultUsers),
  filiais: load('filiaisViaLog', FILIAIS),
  estadias: load('estadias', []),
  estadiasALancar: load('estadiasALancar', []),
  historico: load('historicoEstadias', []),
  captacoes: load('captacoesViaLog', []),
  abaAtiva: 'inicio',
  itemParaLancar: null,
  tema: load('temaPainelViaLog', 'dark'),
  somAtivo: load('somPainelViaLog', 'off') === 'on',
  cloudStatus: 'offline',
  cloudText: 'Faça login para conectar.',
  filaNuvem: load('filaSupabaseViaLog', []),
  ultimoSave: load('ultimoSaveSupabaseViaLog', ''),
  usuariosOnline: [],
  activityFeed: [],
  toasts: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USUARIO': return { ...state, usuarioAtual: action.payload }
    case 'SET_USUARIOS': return { ...state, usuarios: action.payload }
    case 'SET_FILIAIS': return { ...state, filiais: action.payload }
    case 'SET_ESTADIAS': return { ...state, estadias: action.payload }
    case 'SET_A_LANCAR': return { ...state, estadiasALancar: action.payload }
    case 'SET_HISTORICO': return { ...state, historico: action.payload }
    case 'SET_CAPTACOES': return { ...state, captacoes: action.payload }
    case 'SET_ABA': return { ...state, abaAtiva: action.payload }
    case 'SET_ITEM_LANCAR': return { ...state, itemParaLancar: action.payload }
    case 'SET_TEMA': return { ...state, tema: action.payload }
    case 'SET_SOM': return { ...state, somAtivo: action.payload }
    case 'SET_CLOUD': return { ...state, cloudStatus: action.status, cloudText: action.text }
    case 'SET_FILA': return { ...state, filaNuvem: action.payload }
    case 'SET_ULTIMO_SAVE': return { ...state, ultimoSave: action.payload }
    case 'SET_ONLINE': return { ...state, usuariosOnline: action.payload }
    case 'ADD_FEED': return { ...state, activityFeed: [action.payload, ...state.activityFeed].slice(0, 8) }
    case 'ADD_TOAST': return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }
    default: return state
  }
}

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const supabaseOnline = useRef(false)
  const canalRealtime = useRef(null)
  const canalPresenca = useRef(null)
  const recebendoNuvem = useRef(false)
  const conectarRef = useRef(null)
  const usuarioRef = useRef(initialState.usuarioAtual)

  useEffect(() => {
    if (!navigator.onLine) return
    const init = async () => {
      try {
        const remotos = await sb.carregarUsuarios()
        if (remotos.length > 0) dispatch({ type: 'SET_USUARIOS', payload: remotos })
        else for (const u of initialState.usuarios) await sb.salvarUsuario(u).catch(() => {})
      } catch {}
      if (initialState.usuarioAtual) {
        iniciarPresenca(initialState.usuarioAtual)
        conectarRef.current?.()
      }
    }
    init()
  }, [])

  useEffect(() => {
    localStorage.setItem('usuariosPainelViaLog', JSON.stringify(state.usuarios))
    localStorage.setItem('filiaisViaLog', JSON.stringify(state.filiais))
    localStorage.setItem('estadias', JSON.stringify(state.estadias))
    localStorage.setItem('estadiasALancar', JSON.stringify(state.estadiasALancar))
    localStorage.setItem('historicoEstadias', JSON.stringify(state.historico))
    localStorage.setItem('captacoesViaLog', JSON.stringify(state.captacoes))
  }, [state.usuarios, state.filiais, state.estadias, state.estadiasALancar, state.historico, state.captacoes])

  useEffect(() => {
    localStorage.setItem('temaPainelViaLog', state.tema)
    document.documentElement.classList.toggle('dark', state.tema === 'dark')
  }, [state.tema])

  useEffect(() => {
    localStorage.setItem('somPainelViaLog', state.somAtivo ? 'on' : 'off')
  }, [state.somAtivo])

  useEffect(() => {
    localStorage.setItem('filaSupabaseViaLog', JSON.stringify(state.filaNuvem))
  }, [state.filaNuvem])

  useEffect(() => { usuarioRef.current = state.usuarioAtual }, [state.usuarioAtual])

  const iniciarPresenca = useCallback((usuario) => {
    if (canalPresenca.current) { canalPresenca.current.unsubscribe(); canalPresenca.current = null }
    canalPresenca.current = sb.iniciarPresenca(usuario, (ativos) => {
      dispatch({ type: 'SET_ONLINE', payload: ativos })
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      if (usuarioRef.current && !supabaseOnline.current && navigator.onLine) conectarRef.current?.()
    }, 15000)
    return () => clearInterval(id)
  }, [])

  const toast = useCallback((texto, tipo = '') => {
    const id = gerarId()
    dispatch({ type: 'ADD_TOAST', payload: { id, texto, tipo } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3800)
  }, [])

  const feed = useCallback((titulo, texto, icone = '⚡') => {
    dispatch({ type: 'ADD_FEED', payload: { titulo, texto, icone, tempo: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } })
  }, [])

  const registrarHistorico = useCallback((acao, detalhes) => {
    const novo = { data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao, detalhes }
    const hist = [novo, ...state.historico].slice(0, 300)
    dispatch({ type: 'SET_HISTORICO', payload: hist })
    feed(acao, detalhes, '📋')
  }, [state.usuarioAtual, state.historico, feed])

  const setCloud = useCallback((status, text) => {
    dispatch({ type: 'SET_CLOUD', status, text })
  }, [])

  const salvarNuvem = useCallback(async (item, tipo) => {
    const filial = state.usuarioAtual?.filial || 'principal'
    if (!supabaseOnline.current || !navigator.onLine) {
      const fila = [...state.filaNuvem, { acao: 'upsert', payload: sb.payload(item, tipo, filial) }]
      dispatch({ type: 'SET_FILA', payload: fila })
      return
    }
    try {
      setCloud('syncing', 'Salvando na nuvem...')
      await sb.salvar(item, tipo, filial)
      const agora = new Date().toLocaleString('pt-BR')
      localStorage.setItem('ultimoSaveSupabaseViaLog', agora)
      dispatch({ type: 'SET_ULTIMO_SAVE', payload: agora })
      setCloud('online', 'Salvo automaticamente.')
    } catch {
      supabaseOnline.current = false
      const fila = [...state.filaNuvem, { acao: 'upsert', payload: sb.payload(item, tipo, filial) }]
      dispatch({ type: 'SET_FILA', payload: fila })
      setCloud('offline', 'Falhou. Guardado na fila offline.')
    }
  }, [state.filaNuvem, setCloud])

  const deletarNuvem = useCallback(async (id) => {
    if (!supabaseOnline.current || !navigator.onLine) {
      const fila = [...state.filaNuvem, { acao: 'delete', local_id: String(id) }]
      dispatch({ type: 'SET_FILA', payload: fila })
      return
    }
    try { await sb.deletar(id) } catch {
      const fila = [...state.filaNuvem, { acao: 'delete', local_id: String(id) }]
      dispatch({ type: 'SET_FILA', payload: fila })
    }
  }, [state.filaNuvem])

  const sincronizarFila = useCallback(async () => {
    if (!navigator.onLine || !state.filaNuvem.length) return
    setCloud('syncing', `Subindo ${state.filaNuvem.length} item(s) offline...`)
    const restante = []
    const client = sb.getClient()
    for (const item of state.filaNuvem) {
      try {
        if (item.acao === 'upsert') await client.from(sb.TABLE).upsert(item.payload, { onConflict: 'local_id' })
        if (item.acao === 'delete') await client.from(sb.TABLE).delete().eq('local_id', String(item.local_id))
      } catch { restante.push(item) }
    }
    dispatch({ type: 'SET_FILA', payload: restante })
    const agora = new Date().toLocaleString('pt-BR')
    localStorage.setItem('ultimoSaveSupabaseViaLog', agora)
    dispatch({ type: 'SET_ULTIMO_SAVE', payload: agora })
    setCloud(restante.length ? 'offline' : 'online', restante.length ? 'Ainda há pendências.' : 'Tudo sincronizado.')
  }, [state.filaNuvem, setCloud])

  const baixarNuvem = useCallback(async (aviso = true) => {
    if (!supabaseOnline.current) return
    try {
      const isAdmin = state.usuarioAtual?.cargo === 'Admin'
      const filial = isAdmin ? null : (state.usuarioAtual?.filial || 'principal')
      const data = await sb.baixarTodos(filial)
      recebendoNuvem.current = true
      const lancadas = data.filter(x => x.tipo === 'lancada').map(x => x.dados).filter(Boolean)
      const pendentes = data.filter(x => x.tipo === 'a_lancar').map(x => x.dados).filter(Boolean)
      if (lancadas.length || pendentes.length) {
        dispatch({ type: 'SET_ESTADIAS', payload: lancadas })
        dispatch({ type: 'SET_A_LANCAR', payload: pendentes })
      }
      recebendoNuvem.current = false
      if (aviso) toast('Dados baixados da nuvem.', 'ok')
    } catch { recebendoNuvem.current = false }
  }, [toast])

  const conectarSupabase = useCallback(async () => {
    if (!navigator.onLine) { setCloud('offline', 'Sem internet.'); return }
    if (supabaseOnline.current) return
    try {
      setCloud('syncing', 'Conectando...')
      if (!canalRealtime.current) {
        canalRealtime.current = sb.iniciarRealtime(async () => {
          if (recebendoNuvem.current) return
          await baixarNuvem(false)
          feed('Atualização em tempo real', 'Painel recebeu mudança da nuvem.', '☁️')
          setCloud('online', 'Atualizado em tempo real.')
        })
      }
      await Promise.all([sincronizarFila(), baixarNuvem(false)])
      supabaseOnline.current = true
      setCloud('online', 'Conectado. Salvamento automático ativo.')
      toast('Nuvem conectada.', 'ok')
    } catch {
      supabaseOnline.current = false
      canalRealtime.current = null
      setCloud('offline', 'Erro na nuvem. Verifique o Supabase.')
    }
  }, [sincronizarFila, baixarNuvem, setCloud, feed, toast])

  useEffect(() => { conectarRef.current = conectarSupabase }, [conectarSupabase])

  const uploadAnexoItem = useCallback(async (file) => {
    if (supabaseOnline.current) {
      try { return await sb.uploadAnexo(file) } catch { toast('Storage falhou. Arquivo local.', 'warn') }
    }
    return sb.uploadAnexoLocal(file)
  }, [toast])

  const entrar = useCallback(async (login, senha) => {
    const usuarios = JSON.parse(localStorage.getItem('usuariosPainelViaLog') || 'null') || state.usuarios
    const senhaH = await hashSenha(senha)
    const user = usuarios.find(u => {
      if (u.usuario.toLowerCase() !== login.toLowerCase()) return false
      return isHash(u.senha) ? u.senha === senhaH : u.senha === senha
    })
    if (!user) { toast('Login inválido.', 'err'); return false }
    if (!isHash(user.senha)) {
      const lista = usuarios.map(u => u.usuario === user.usuario ? { ...u, senha: senhaH } : u)
      dispatch({ type: 'SET_USUARIOS', payload: lista })
    }
    dispatch({ type: 'SET_USUARIO', payload: user })
    localStorage.setItem('usuarioLogadoViaLog', JSON.stringify(user))
    iniciarPresenca(user)
    setTimeout(() => conectarSupabase(), 100)
    feed('Login', `${user.nome} entrou no painel.`, '👤')
    return true
  }, [state.usuarios, toast, iniciarPresenca, conectarSupabase, feed])

  const logout = useCallback(() => {
    localStorage.removeItem('usuarioLogadoViaLog')
    dispatch({ type: 'SET_USUARIO', payload: null })
    if (canalPresenca.current) { canalPresenca.current.unsubscribe(); canalPresenca.current = null }
  }, [])

  const verificarSenhaAdmin = useCallback(async (senha) => {
    const usuarios = JSON.parse(localStorage.getItem('usuariosPainelViaLog') || 'null') || state.usuarios
    const admin = usuarios.find(u => u.usuario === 'admin')
    if (!admin) return false
    const senhaH = await hashSenha(senha)
    return isHash(admin.senha) ? admin.senha === senhaH : admin.senha === senha
  }, [state.usuarios])

  const criarUsuario = useCallback(async (dados) => {
    if (state.usuarios.some(u => u.usuario === dados.usuario)) { toast('Usuário já existe.', 'err'); return false }
    const avatar = dados.nome.split(' ').filter(Boolean).map(x => x[0]).slice(0, 2).join('').toUpperCase() || dados.usuario.slice(0, 2).toUpperCase()
    const senhaH = await hashSenha(dados.senha)
    const novoUser = { ...dados, senha: senhaH, avatar }
    try { await sb.salvarUsuario(novoUser) } catch { toast('Erro ao salvar usuário na nuvem.', 'warn') }
    dispatch({ type: 'SET_USUARIOS', payload: [...state.usuarios, novoUser] })
    toast('Usuário criado.', 'ok')
    return true
  }, [state.usuarios, toast])

  const excluirUsuario = useCallback(async (login) => {
    if (login === 'admin') return
    dispatch({ type: 'SET_USUARIOS', payload: state.usuarios.filter(u => u.usuario !== login) })
    try { await sb.deletarUsuario(login) } catch {}
    toast('Usuário excluído.', 'ok')
  }, [state.usuarios, toast])

  const criarFilial = useCallback((dados) => {
    if (!dados.id || !dados.nome) { toast('Preencha ID e nome da filial.', 'err'); return false }
    if (state.filiais.some(f => f.id === dados.id)) { toast('ID de filial já existe.', 'err'); return false }
    const nova = { id: dados.id, nome: dados.nome, cidade: dados.cidade || '', estado: dados.estado || '' }
    dispatch({ type: 'SET_FILIAIS', payload: [...state.filiais, nova] })
    toast(`Filial "${nova.nome}" criada.`, 'ok')
    return true
  }, [state.filiais, toast])

  const excluirFilial = useCallback((id) => {
    if (id === 'rondonopolis-mt') { toast('Filial padrão não pode ser excluída.', 'err'); return }
    dispatch({ type: 'SET_FILIAIS', payload: state.filiais.filter(f => f.id !== id) })
    toast('Filial removida.', 'ok')
  }, [state.filiais, toast])

  const adicionarLancada = useCallback(async (item) => {
    const novo = { ...item, id: gerarId(), filial: state.usuarioAtual?.filial || 'principal', status: 'Aberto', lancadoPor: state.usuarioAtual?.usuario || '-', dataLancamento: new Date().toLocaleString('pt-BR') }
    dispatch({ type: 'SET_ESTADIAS', payload: [novo, ...state.estadias] })
    dispatch({ type: 'SET_HISTORICO', payload: [{ data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao: 'Adicionou estadia lançada', detalhes: `Placa ${novo.placa} | ${novo.valor}` }, ...state.historico].slice(0, 300) })
    feed('Estadia lançada', `Placa ${novo.placa} salva.`, '✅')
    toast('Estadia salva.', 'ok')
    await salvarNuvem(novo, 'lancada')
  }, [state.estadias, state.historico, state.usuarioAtual, salvarNuvem, toast, feed])

  const atualizarLancada = useCallback(async (id, changes) => {
    const lista = state.estadias.map(e => String(e.id) === String(id) ? { ...e, ...changes } : e)
    dispatch({ type: 'SET_ESTADIAS', payload: lista })
    const item = lista.find(e => String(e.id) === String(id))
    if (item) await salvarNuvem(item, 'lancada')
  }, [state.estadias, salvarNuvem])

  const marcarFeito = useCallback(async (id) => {
    await atualizarLancada(id, { status: 'Feito', feitoPor: state.usuarioAtual?.usuario || '-', dataFeito: new Date().toLocaleString('pt-BR') })
    dispatch({ type: 'SET_HISTORICO', payload: [{ data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao: 'Marcou como feito', detalhes: `ID ${id}` }, ...state.historico].slice(0, 300) })
  }, [atualizarLancada, state.usuarioAtual, state.historico])

  const finalizar = useCallback(async (id) => {
    await atualizarLancada(id, { status: 'Finalizado', finalizadoPor: state.usuarioAtual?.usuario || '-', dataFinalizado: new Date().toLocaleString('pt-BR') })
  }, [atualizarLancada, state.usuarioAtual])

  const reabrir = useCallback(async (id) => {
    await atualizarLancada(id, { status: 'Aberto', feitoPor: '', finalizadoPor: '' })
  }, [atualizarLancada])

  const excluirLancada = useCallback(async (id) => {
    dispatch({ type: 'SET_ESTADIAS', payload: state.estadias.filter(e => String(e.id) !== String(id)) })
    toast('Estadia excluída.', 'ok')
    await deletarNuvem(id)
  }, [state.estadias, deletarNuvem, toast])

  const adicionarALancar = useCallback(async (dados, arquivos) => {
    const anexos = []
    for (const file of arquivos.slice(0, 2)) {
      const up = await uploadAnexoItem(file)
      if (up) anexos.push(up)
    }
    const novo = { ...dados, id: gerarId(), anexos, filial: state.usuarioAtual?.filial || 'principal', status: 'A lançar', criadoPor: state.usuarioAtual?.usuario || '-', dataCriacao: new Date().toLocaleString('pt-BR') }
    dispatch({ type: 'SET_A_LANCAR', payload: [novo, ...state.estadiasALancar] })
    dispatch({ type: 'SET_HISTORICO', payload: [{ data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao: 'Adicionou pendência', detalhes: `Placa ${novo.placa}` }, ...state.historico].slice(0, 300) })
    feed('Pendência criada', `Placa ${novo.placa}.`, '📋')
    toast(`Pendência salva com ${anexos.length} anexo(s).`, novo.prioridade === 'Urgente' ? 'warn' : 'ok')
    await salvarNuvem(novo, 'a_lancar')
  }, [state.estadiasALancar, state.historico, state.usuarioAtual, uploadAnexoItem, salvarNuvem, toast, feed])

  const abrirParaLancar = useCallback(async (id) => {
    const item = state.estadiasALancar.find(e => String(e.id) === String(id))
    dispatch({ type: 'SET_A_LANCAR', payload: state.estadiasALancar.filter(e => String(e.id) !== String(id)) })
    dispatch({ type: 'SET_ABA', payload: 'lancadas' })
    dispatch({ type: 'SET_ITEM_LANCAR', payload: item })
    await deletarNuvem(id)
    toast('Preencha os dados e salve a estadia.', 'ok')
  }, [state.estadiasALancar, deletarNuvem, toast])

  const limparItemParaLancar = useCallback(() => {
    dispatch({ type: 'SET_ITEM_LANCAR', payload: null })
  }, [])

  const editarLancada = useCallback(async (id, dados) => {
    const calc = calcularEstadia(dados.peso, dados.chegadaData, dados.chegadaHora, dados.saidaData, dados.saidaHora)
    if (!calc) { toast('Verifique peso, chegada e saída.', 'err'); return }
    const existente = state.estadias.find(e => String(e.id) === String(id))
    const item = { ...existente, ...dados, ...calc }
    dispatch({ type: 'SET_ESTADIAS', payload: state.estadias.map(e => String(e.id) === String(id) ? item : e) })
    dispatch({ type: 'SET_HISTORICO', payload: [{ data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao: 'Editou estadia', detalhes: `Placa ${item.placa}` }, ...state.historico].slice(0, 300) })
    feed('Estadia editada', `Placa ${item.placa} atualizada.`, '✏️')
    toast('Estadia atualizada.', 'ok')
    await salvarNuvem(item, 'lancada')
  }, [state.estadias, state.historico, state.usuarioAtual, salvarNuvem, toast, feed])

  const excluirALancar = useCallback(async (id) => {
    dispatch({ type: 'SET_A_LANCAR', payload: state.estadiasALancar.filter(e => String(e.id) !== String(id)) })
    await deletarNuvem(id)
  }, [state.estadiasALancar, deletarNuvem])

  const limparHistorico = useCallback(() => {
    dispatch({ type: 'SET_HISTORICO', payload: [] })
  }, [])

  const exportarBackup = useCallback(() => {
    const dados = { estadias: state.estadias, estadiasALancar: state.estadiasALancar, historico: state.historico, usuarios: state.usuarios, exportadoEm: new Date().toLocaleString('pt-BR') }
    baixarArquivo('backup-painel-ldc.json', JSON.stringify(dados, null, 2), 'application/json')
  }, [state])

  const importarBackup = useCallback((dados) => {
    dispatch({ type: 'SET_ESTADIAS', payload: dados.estadias || [] })
    dispatch({ type: 'SET_A_LANCAR', payload: dados.estadiasALancar || [] })
    dispatch({ type: 'SET_HISTORICO', payload: dados.historico || [] })
    if (dados.usuarios) dispatch({ type: 'SET_USUARIOS', payload: dados.usuarios })
    toast('Backup importado.', 'ok')
  }, [toast])

  const exportarCSV = useCallback(() => {
    const header = ['Chamado', 'Motorista', 'Transportadora', 'Placa', 'Peso', 'Horas', 'Valor', 'Pago por', 'Prioridade', 'Status', 'Lançado por', 'Data'].join(';')
    const rows = state.estadias.map(e =>
      [e.chamado, e.motorista, e.transportadora, e.placa, e.peso, e.horas, e.valor, e.pagoPor, e.prioridade, e.status, e.lancadoPor, e.dataLancamento]
        .map(x => `"${String(x || '').replaceAll('"', '""')}"`).join(';')
    )
    baixarArquivo('estadias-ldc.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8')
  }, [state.estadias])

  const adicionarCaptacao = useCallback((dados) => {
    const nova = {
      ...dados,
      id: gerarId(),
      captadoPor: state.usuarioAtual?.usuario || '-',
      carregou: false,
      data: new Date().toLocaleString('pt-BR'),
      filial: state.usuarioAtual?.filial || 'principal',
    }
    dispatch({ type: 'SET_CAPTACOES', payload: [nova, ...state.captacoes] })
    toast('Contato salvo.', 'ok')
  }, [state.captacoes, state.usuarioAtual, toast])

  const marcarCarregou = useCallback((id) => {
    dispatch({
      type: 'SET_CAPTACOES',
      payload: state.captacoes.map(c => String(c.id) === String(id) ? { ...c, carregou: !c.carregou } : c),
    })
  }, [state.captacoes])

  const excluirCaptacao = useCallback((id) => {
    dispatch({ type: 'SET_CAPTACOES', payload: state.captacoes.filter(c => String(c.id) !== String(id)) })
    toast('Contato excluído.', 'ok')
  }, [state.captacoes, toast])

  const mudarAba = useCallback((aba) => dispatch({ type: 'SET_ABA', payload: aba }), [])
  const alternarTema = useCallback(() => dispatch({ type: 'SET_TEMA', payload: state.tema === 'light' ? 'dark' : 'light' }), [state.tema])
  const alternarSom = useCallback(() => dispatch({ type: 'SET_SOM', payload: !state.somAtivo }), [state.somAtivo])

  const value = {
    ...state,
    supabaseOnline: supabaseOnline.current,
    toast, feed,
    entrar, logout, criarUsuario, excluirUsuario, verificarSenhaAdmin, criarFilial, excluirFilial,
    adicionarLancada, marcarFeito, finalizar, reabrir, excluirLancada,
    adicionarALancar, abrirParaLancar, excluirALancar,
    limparHistorico, exportarBackup, importarBackup, exportarCSV,
    adicionarCaptacao, marcarCarregou, excluirCaptacao,
    mudarAba, alternarTema, alternarSom,
    conectarSupabase, sincronizarFila,
    editarLancada, limparItemParaLancar,
    uploadAnexoItem, dataISOTexto,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
