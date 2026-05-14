import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { defaultUsers } from '../data/defaultUsers'
import { dinheiro, moedaNumero, gerarId, baixarArquivo, dataISOTexto } from '../utils/index'
import * as sb from '../lib/supabase'

/* ─── Estado inicial ────────────────────────────────────── */
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const initialState = {
  usuarioAtual: load('usuarioLogadoLDC', null),
  usuarios: load('usuariosPainelLDC', defaultUsers),
  estadias: load('estadias', []),
  estadiasALancar: load('estadiasALancar', []),
  historico: load('historicoEstadias', []),
  abaAtiva: 'lancadas',
  tema: load('temaPainelLDC', 'light'),
  somAtivo: load('somPainelLDC', 'off') === 'on',
  cloudStatus: 'offline',
  cloudText: 'Faça login para conectar.',
  filaNuvem: load('filaSupabaseLDC', []),
  ultimoSave: load('ultimoSaveSupabaseLDC', ''),
  usuariosOnline: [],
  activityFeed: [],
  toasts: [],
}

/* ─── Reducer ───────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case 'SET_USUARIO': return { ...state, usuarioAtual: action.payload }
    case 'SET_USUARIOS': return { ...state, usuarios: action.payload }
    case 'SET_ESTADIAS': return { ...state, estadias: action.payload }
    case 'SET_A_LANCAR': return { ...state, estadiasALancar: action.payload }
    case 'SET_HISTORICO': return { ...state, historico: action.payload }
    case 'SET_ABA': return { ...state, abaAtiva: action.payload }
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

/* ─── Context ───────────────────────────────────────────── */
const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const supabaseOnline = useRef(false)
  const canalRealtime = useRef(null)
  const recebendoNuvem = useRef(false)
  const presencaTimer = useRef(null)

  /* Persistência local */
  useEffect(() => {
    localStorage.setItem('usuariosPainelLDC', JSON.stringify(state.usuarios))
    localStorage.setItem('estadias', JSON.stringify(state.estadias))
    localStorage.setItem('estadiasALancar', JSON.stringify(state.estadiasALancar))
    localStorage.setItem('historicoEstadias', JSON.stringify(state.historico))
  }, [state.usuarios, state.estadias, state.estadiasALancar, state.historico])

  useEffect(() => {
    localStorage.setItem('temaPainelLDC', state.tema)
    document.documentElement.classList.toggle('dark', state.tema === 'dark')
  }, [state.tema])

  useEffect(() => {
    localStorage.setItem('somPainelLDC', state.somAtivo ? 'on' : 'off')
  }, [state.somAtivo])

  useEffect(() => {
    localStorage.setItem('filaSupabaseLDC', JSON.stringify(state.filaNuvem))
  }, [state.filaNuvem])

  /* Presença online via localStorage */
  useEffect(() => {
    const sync = () => {
      try {
        const raw = JSON.parse(localStorage.getItem('usuariosOnlineLDC') || '{}')
        const ativos = Object.values(raw).filter(u => Date.now() - (u.t || 0) < 30000)
        dispatch({ type: 'SET_ONLINE', payload: ativos })
      } catch {}
    }
    const id = setInterval(sync, 5000)
    window.addEventListener('storage', sync)
    return () => { clearInterval(id); window.removeEventListener('storage', sync) }
  }, [])

  const salvarPresenca = useCallback(() => {
    if (!state.usuarioAtual) return
    const raw = JSON.parse(localStorage.getItem('usuariosOnlineLDC') || '{}')
    raw[state.usuarioAtual.usuario] = { ...state.usuarioAtual, t: Date.now() }
    localStorage.setItem('usuariosOnlineLDC', JSON.stringify(raw))
  }, [state.usuarioAtual])

  const iniciarPresenca = useCallback(() => {
    clearInterval(presencaTimer.current)
    salvarPresenca()
    presencaTimer.current = setInterval(salvarPresenca, 8000)
  }, [salvarPresenca])

  /* Reconectar automático */
  useEffect(() => {
    const id = setInterval(() => {
      if (state.usuarioAtual && !supabaseOnline.current && navigator.onLine) conectarSupabase()
    }, 15000)
    return () => clearInterval(id)
  })

  /* ─── Helpers internos ────────────────────────────────── */
  const toast = useCallback((texto, tipo = '') => {
    const id = gerarId()
    dispatch({ type: 'ADD_TOAST', payload: { id, texto, tipo } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3800)
  }, [])

  const feed = useCallback((titulo, texto, icone = '⚡') => {
    dispatch({ type: 'ADD_FEED', payload: { titulo, texto, icone, tempo: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } })
  }, [])

  const registrarHistorico = useCallback((acao, detalhes) => {
    dispatch(s => {
      const novo = { data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao, detalhes }
      const hist = [novo, ...state.historico].slice(0, 300)
      dispatch({ type: 'SET_HISTORICO', payload: hist })
    })
    feed(acao, detalhes, '📋')
  }, [state.usuarioAtual, state.historico, feed])

  const setCloud = useCallback((status, text) => {
    dispatch({ type: 'SET_CLOUD', status, text })
  }, [])

  /* ─── Supabase ────────────────────────────────────────── */
  const salvarNuvem = useCallback(async (item, tipo) => {
    if (!supabaseOnline.current || !navigator.onLine) {
      dispatch(prev => ({ ...prev }))
      const fila = [...state.filaNuvem, { acao: 'upsert', payload: sb.payload(item, tipo) }]
      dispatch({ type: 'SET_FILA', payload: fila })
      return
    }
    try {
      setCloud('syncing', 'Salvando na nuvem...')
      await sb.salvar(item, tipo)
      const agora = new Date().toLocaleString('pt-BR')
      localStorage.setItem('ultimoSaveSupabaseLDC', agora)
      dispatch({ type: 'SET_ULTIMO_SAVE', payload: agora })
      setCloud('online', 'Salvo automaticamente.')
    } catch {
      supabaseOnline.current = false
      const fila = [...state.filaNuvem, { acao: 'upsert', payload: sb.payload(item, tipo) }]
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
    try {
      await sb.deletar(id)
    } catch {
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
    localStorage.setItem('ultimoSaveSupabaseLDC', agora)
    dispatch({ type: 'SET_ULTIMO_SAVE', payload: agora })
    setCloud(restante.length ? 'offline' : 'online', restante.length ? 'Ainda há pendências.' : 'Tudo sincronizado.')
  }, [state.filaNuvem, setCloud])

  const baixarNuvem = useCallback(async (aviso = true) => {
    if (!supabaseOnline.current) return
    try {
      const data = await sb.baixarTodos()
      recebendoNuvem.current = true
      const lancadas = data.filter(x => x.tipo === 'lancada').map(x => x.dados).filter(Boolean)
      const pendentes = data.filter(x => x.tipo === 'a_lancar').map(x => x.dados).filter(Boolean)
      if (lancadas.length || pendentes.length) {
        dispatch({ type: 'SET_ESTADIAS', payload: lancadas })
        dispatch({ type: 'SET_A_LANCAR', payload: pendentes })
      }
      recebendoNuvem.current = false
      if (aviso) toast('Dados baixados da nuvem.', 'ok')
    } catch {
      recebendoNuvem.current = false
    }
  }, [toast])

  const conectarSupabase = useCallback(async () => {
    if (!navigator.onLine) { setCloud('offline', 'Sem internet.'); return }
    try {
      setCloud('syncing', 'Testando conexão...')
      const client = sb.getClient()
      const { error } = await client.from(sb.TABLE).select('id').limit(1)
      if (error) throw error
      supabaseOnline.current = true
      setCloud('online', 'Conectado. Salvamento automático ativo.')
      toast('Nuvem conectada.', 'ok')
      await sincronizarFila()
      if (!canalRealtime.current) {
        canalRealtime.current = sb.iniciarRealtime(async () => {
          if (recebendoNuvem.current) return
          await baixarNuvem(false)
          feed('Atualização em tempo real', 'Painel recebeu mudança da nuvem.', '☁️')
          setCloud('online', 'Atualizado em tempo real.')
        })
      }
      await baixarNuvem(false)
    } catch (e) {
      supabaseOnline.current = false
      setCloud('offline', 'Erro na nuvem. Verifique o Supabase.')
    }
  }, [sincronizarFila, baixarNuvem, setCloud, feed, toast])

  const uploadAnexoItem = useCallback(async (file) => {
    if (supabaseOnline.current) {
      try { return await sb.uploadAnexo(file) } catch { toast('Storage falhou. Arquivo local.', 'warn') }
    }
    return sb.uploadAnexoLocal(file)
  }, [toast])

  /* ─── Auth ────────────────────────────────────────────── */
  const entrar = useCallback((login, senha) => {
    const usuarios = JSON.parse(localStorage.getItem('usuariosPainelLDC') || 'null') || state.usuarios
    const user = usuarios.find(u => u.usuario.toLowerCase() === login.toLowerCase() && u.senha === senha)
    if (!user) { toast('Login inválido.', 'err'); return false }
    dispatch({ type: 'SET_USUARIO', payload: user })
    localStorage.setItem('usuarioLogadoLDC', JSON.stringify(user))
    iniciarPresenca()
    setTimeout(() => conectarSupabase(), 100)
    feed('Login', `${user.nome} entrou no painel.`, '👤')
    return true
  }, [state.usuarios, toast, iniciarPresenca, conectarSupabase, feed])

  const logout = useCallback(() => {
    localStorage.removeItem('usuarioLogadoLDC')
    dispatch({ type: 'SET_USUARIO', payload: null })
    clearInterval(presencaTimer.current)
  }, [])

  const criarUsuario = useCallback((dados) => {
    if (state.usuarios.some(u => u.usuario === dados.usuario)) { toast('Usuário já existe.', 'err'); return false }
    const avatar = dados.nome.split(' ').filter(Boolean).map(x => x[0]).slice(0, 2).join('').toUpperCase() || dados.usuario.slice(0, 2).toUpperCase()
    const novoUser = { ...dados, avatar }
    const lista = [...state.usuarios, novoUser]
    dispatch({ type: 'SET_USUARIOS', payload: lista })
    toast('Usuário criado.', 'ok')
    return true
  }, [state.usuarios, toast])

  const excluirUsuario = useCallback((login) => {
    if (login === 'admin') return
    const lista = state.usuarios.filter(u => u.usuario !== login)
    dispatch({ type: 'SET_USUARIOS', payload: lista })
    toast('Usuário excluído.', 'ok')
  }, [state.usuarios, toast])

  /* ─── Estadias lançadas ───────────────────────────────── */
  const adicionarLancada = useCallback(async (item) => {
    const novo = { ...item, id: gerarId(), status: 'Aberto', lancadoPor: state.usuarioAtual?.usuario || '-', dataLancamento: new Date().toLocaleString('pt-BR') }
    const lista = [novo, ...state.estadias]
    dispatch({ type: 'SET_ESTADIAS', payload: lista })
    const hist = [{ data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao: 'Adicionou estadia lançada', detalhes: `Placa ${novo.placa} | ${novo.valor}` }, ...state.historico].slice(0, 300)
    dispatch({ type: 'SET_HISTORICO', payload: hist })
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
    const hist = [{ data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao: 'Marcou como feito', detalhes: `ID ${id}` }, ...state.historico].slice(0, 300)
    dispatch({ type: 'SET_HISTORICO', payload: hist })
  }, [atualizarLancada, state.usuarioAtual, state.historico])

  const finalizar = useCallback(async (id) => {
    await atualizarLancada(id, { status: 'Finalizado', finalizadoPor: state.usuarioAtual?.usuario || '-', dataFinalizado: new Date().toLocaleString('pt-BR') })
  }, [atualizarLancada, state.usuarioAtual])

  const reabrir = useCallback(async (id) => {
    await atualizarLancada(id, { status: 'Aberto', feitoPor: '', finalizadoPor: '' })
  }, [atualizarLancada])

  const excluirLancada = useCallback(async (id) => {
    const lista = state.estadias.filter(e => String(e.id) !== String(id))
    dispatch({ type: 'SET_ESTADIAS', payload: lista })
    toast('Estadia excluída.', 'ok')
    await deletarNuvem(id)
  }, [state.estadias, deletarNuvem, toast])

  /* ─── A lançar ────────────────────────────────────────── */
  const adicionarALancar = useCallback(async (dados, arquivos) => {
    const anexos = []
    for (const file of arquivos.slice(0, 2)) {
      const up = await uploadAnexoItem(file)
      if (up) anexos.push(up)
    }
    const novo = { ...dados, id: gerarId(), anexos, status: 'A lançar', criadoPor: state.usuarioAtual?.usuario || '-', dataCriacao: new Date().toLocaleString('pt-BR') }
    const lista = [novo, ...state.estadiasALancar]
    dispatch({ type: 'SET_A_LANCAR', payload: lista })
    const hist = [{ data: new Date().toLocaleString('pt-BR'), usuario: state.usuarioAtual?.usuario || '-', acao: 'Adicionou pendência', detalhes: `Placa ${novo.placa}` }, ...state.historico].slice(0, 300)
    dispatch({ type: 'SET_HISTORICO', payload: hist })
    feed('Pendência criada', `Placa ${novo.placa}.`, '📋')
    toast(`Pendência salva com ${anexos.length} anexo(s).`, novo.prioridade === 'Urgente' ? 'warn' : 'ok')
    await salvarNuvem(novo, 'a_lancar')
  }, [state.estadiasALancar, state.historico, state.usuarioAtual, uploadAnexoItem, salvarNuvem, toast, feed])

  const abrirParaLancar = useCallback(async (id) => {
    const item = state.estadiasALancar.find(e => String(e.id) === String(id))
    const lista = state.estadiasALancar.filter(e => String(e.id) !== String(id))
    dispatch({ type: 'SET_A_LANCAR', payload: lista })
    dispatch({ type: 'SET_ABA', payload: 'lancadas' })
    await deletarNuvem(id)
    toast('Placa aberta no formulário de lançamento.', 'ok')
    return item
  }, [state.estadiasALancar, deletarNuvem, toast])

  const excluirALancar = useCallback(async (id) => {
    const lista = state.estadiasALancar.filter(e => String(e.id) !== String(id))
    dispatch({ type: 'SET_A_LANCAR', payload: lista })
    await deletarNuvem(id)
  }, [state.estadiasALancar, deletarNuvem])

  /* ─── Histórico ───────────────────────────────────────── */
  const limparHistorico = useCallback(() => {
    dispatch({ type: 'SET_HISTORICO', payload: [] })
  }, [])

  /* ─── Backup ──────────────────────────────────────────── */
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
        .map(x => `"${String(x || '').replaceAll('"', '""')}"`)
        .join(';')
    )
    baixarArquivo('estadias-ldc.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8')
  }, [state.estadias])

  /* ─── UI ──────────────────────────────────────────────── */
  const mudarAba = useCallback((aba) => dispatch({ type: 'SET_ABA', payload: aba }), [])
  const alternarTema = useCallback(() => dispatch({ type: 'SET_TEMA', payload: state.tema === 'light' ? 'dark' : 'light' }), [state.tema])
  const alternarSom = useCallback(() => dispatch({ type: 'SET_SOM', payload: !state.somAtivo }), [state.somAtivo])

  /* Retorno do contexto */
  const value = {
    ...state,
    supabaseOnline: supabaseOnline.current,
    toast,
    feed,
    entrar, logout, criarUsuario, excluirUsuario,
    adicionarLancada, marcarFeito, finalizar, reabrir, excluirLancada,
    adicionarALancar, abrirParaLancar, excluirALancar,
    limparHistorico, exportarBackup, importarBackup, exportarCSV,
    mudarAba, alternarTema, alternarSom,
    conectarSupabase, sincronizarFila,
    dataISOTexto,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
