import { createClient } from '@supabase/supabase-js'

const URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://dwyaedcrfgtnzkkflmge.supabase.co'
const KEY  = import.meta.env.VITE_SUPABASE_KEY  || 'sb_publishable_ko9HUoztqY26AIzw4rxAHA_jGH005Md'

// Tables
export const TABLE         = 'vl_estadias'          // kept for fila compat
export const T_ESTADIAS    = 'vl_estadias'
export const T_A_LANCAR    = 'vl_estadias_a_lancar'
export const T_CAPTACOES   = 'vl_captacoes'
export const T_MOTORISTAS  = 'vl_motoristas'
export const T_PROFILES    = 'vl_profiles'
export const T_FILIAIS     = 'vl_filiais'
export const BUCKET        = 'ldc-anexos'

let _client = null
export const getClient = () => {
  if (!_client) _client = createClient(URL, KEY)
  return _client
}

// ---------------------------------------------------------------
// Status mapping  UI (contatado/ordem/carregou)  ↔  DB (mesmos valores)
// ---------------------------------------------------------------
const mapStatusDB = (status) => {
  if (status === 'carregou') return 'carregou'
  if (status === 'ordem')    return 'ordem'
  return 'contatado'
}

const mapStatusUI = (dbStatus) => {
  if (dbStatus === 'carregou') return 'carregou'
  if (dbStatus === 'ordem')    return 'ordem'
  return 'contatado'
}

// ---------------------------------------------------------------
// Payload para a fila offline  (campo _tipo é removido ao salvar)
// ---------------------------------------------------------------
export const payload = (item, tipo, filial = 'principal') => {
  if (tipo === 'captacao') return {
    _tipo: 'captacao',
    local_id: String(item.id),
    captador_usuario: item.captadoPor || null,
    filial_id: item.filial || filial,
    operacao: item.produto || item.operacao || 'Farelo',
    status: mapStatusDB(item.status),
    observacao: item.obs || '',
    quantidade_cargas: Math.max(1, Number(item.qtdCargas) || 1),
    dados: item,
    _motorista_nome:    item.motorista       || '',
    _motorista_tel:     item.telefone        || '',
    _motorista_cidade:  item.cidadeMotorista || '',
  }
  if (tipo === 'a_lancar') return {
    _tipo: 'a_lancar',
    local_id: String(item.id),
    filial_id: item.filial || filial,
    placa: item.placa || '',
    transportadora: item.transportadora || '',
    prioridade: item.prioridade || 'Normal',
    status: item.status || 'A lançar',
    criado_por: item.criadoPor || null,
    dados: item,
  }
  return {
    _tipo: 'lancada',
    local_id: String(item.id),
    filial_id: item.filial || filial,
    placa: item.placa || '',
    motorista: item.motorista || '',
    transportadora: item.transportadora || '',
    status: item.status || 'Aberto',
    prioridade: item.prioridade || 'Normal',
    lancado_por: item.lancadoPor || null,
    dados: item,
  }
}

// ---------------------------------------------------------------
// Upsert motorista por telefone (returns id | null)
// ---------------------------------------------------------------
const upsertMotorista = async (sb, item) => {
  const telefLimpo = (item.telefone || '').replace(/\D/g, '')
  if (!item.motorista || !telefLimpo) return null
  const { data, error } = await sb.from(T_MOTORISTAS).upsert(
    {
      nome: item.motorista,
      telefone: item.telefone || '',
      telefone_limpo: telefLimpo,
      cidade: item.cidadeMotorista || '',
      observacao: item.obs || '',
      criado_por: item.captadoPor || null,
    },
    { onConflict: 'telefone_limpo' }
  ).select('id').single()
  if (error) return null
  return data?.id ?? null
}

// ---------------------------------------------------------------
// Salvar  (detecta tipo pelo campo _tipo no payload)
// ---------------------------------------------------------------
export const salvar = async (item, tipo, filial = 'principal') => {
  const sb = getClient()
  const p  = payload(item, tipo, filial)
  const { _tipo, _motorista_nome, _motorista_tel, _motorista_cidade, ...row } = p

  if (_tipo === 'captacao') {
    const motItem = {
      motorista: _motorista_nome,
      telefone:  _motorista_tel,
      cidadeMotorista: _motorista_cidade,
      obs: item.obs || '',
      captadoPor: item.captadoPor || null,
    }
    const motId = await upsertMotorista(sb, motItem)
    const { error } = await sb.from(T_CAPTACOES).upsert(
      { ...row, motorista_id: motId },
      { onConflict: 'local_id' }
    )
    if (error) throw error
    return
  }

  if (_tipo === 'a_lancar') {
    const { error } = await sb.from(T_A_LANCAR).upsert(row, { onConflict: 'local_id' })
    if (error) throw error
    return
  }

  const { error } = await sb.from(T_ESTADIAS).upsert(row, { onConflict: 'local_id' })
  if (error) throw error
}

// ---------------------------------------------------------------
// Deletar (tipo obrigatório para rotear a tabela correta)
// ---------------------------------------------------------------
export const deletar = async (id, tipo = 'lancada') => {
  const sb  = getClient()
  const lid = String(id)
  const table = tipo === 'captacao' ? T_CAPTACOES
              : tipo === 'a_lancar'  ? T_A_LANCAR
              : T_ESTADIAS
  const { error } = await sb.from(table).delete().eq('local_id', lid)
  if (error) throw error
}

// ---------------------------------------------------------------
// Baixar estadias (lancadas + a_lancar)
// ---------------------------------------------------------------
export const baixarTodos = async (filial = null) => {
  const sb = getClient()
  let q1 = sb.from(T_ESTADIAS).select('dados').order('updated_at', { ascending: false })
  let q2 = sb.from(T_A_LANCAR).select('dados').order('updated_at', { ascending: false })
  if (filial) { q1 = q1.eq('filial_id', filial); q2 = q2.eq('filial_id', filial) }
  const [r1, r2] = await Promise.all([q1, q2])
  const lancadas = (r1.data || []).map(x => ({ tipo: 'lancada',  dados: x.dados }))
  const alancar  = (r2.data || []).map(x => ({ tipo: 'a_lancar', dados: x.dados }))
  return [...lancadas, ...alancar]
}

// ---------------------------------------------------------------
// Baixar captações (joins motorista)
// ---------------------------------------------------------------
export const baixarCaptacoes = async (filial = null) => {
  const sb = getClient()
  let q = sb.from(T_CAPTACOES)
    .select('*, vl_motoristas(nome, telefone, telefone_limpo, cidade)')
    .order('data_captacao', { ascending: false })
  if (filial) q = q.eq('filial_id', filial)
  const { data, error } = await q
  if (error) throw error
  return (data || []).map(c => {
    const mot  = c.vl_motoristas
    const base = c.dados || {}
    return {
      ...base,
      id:              c.local_id          || c.id,
      _supabase_id:    c.id,
      captadoPor:      c.captador_usuario  || base.captadoPor      || '',
      filial:          c.filial_id         || base.filial          || '',
      produto:         c.operacao          || base.produto         || 'Farelo',
      operacao:        c.operacao          || base.operacao        || 'Farelo',
      qtdCargas:       c.quantidade_cargas ?? base.qtdCargas       ?? 1,
      status:          base.status         || mapStatusUI(c.status),
      obs:             base.obs            || c.observacao         || '',
      motorista:       mot?.nome           || base.motorista       || '',
      telefone:        mot?.telefone       || base.telefone        || '',
      cidadeMotorista: mot?.cidade         || base.cidadeMotorista || '',
      placa:           base.placa          || '',
      origem:          base.origem         || '',
      destino:         base.destino        || '',
    }
  })
}

// ---------------------------------------------------------------
// Baixar filiais do banco
// ---------------------------------------------------------------
export const baixarFiliais = async () => {
  const sb = getClient()
  const { data, error } = await sb.from(T_FILIAIS).select('*').eq('ativa', true)
  if (error) throw error
  return (data || []).map(f => ({ id: f.id, nome: f.nome, cidade: f.cidade, estado: f.estado }))
}

// ---------------------------------------------------------------
// Usuários  (vl_profiles)
// ---------------------------------------------------------------
export const carregarUsuarios = async () => {
  const sb = getClient()
  const { data, error } = await sb.from(T_PROFILES).select('*').eq('ativo', true)
  if (error) throw error
  return (data || []).map(u => ({
    usuario: u.usuario,
    nome:    u.nome,
    cargo:   u.cargo,
    avatar:  u.avatar || '',
    foto:    u.foto   || '',
    filial:  u.filial_id || 'rondonopolis-mt',
    senha:   u.senha  || '',
  }))
}

export const salvarUsuario = async (user) => {
  const sb = getClient()
  const { error } = await sb.from(T_PROFILES).upsert({
    usuario:  user.usuario,
    nome:     user.nome,
    cargo:    user.cargo || 'Operador',
    avatar:   user.avatar || '',
    foto:     user.foto   || '',
    filial_id: user.filial || 'rondonopolis-mt',
    senha:    user.senha  || '',
  }, { onConflict: 'usuario' })
  if (error) throw error
}

export const deletarUsuario = async (usuario) => {
  const sb = getClient()
  const { error } = await sb.from(T_PROFILES).update({ ativo: false }).eq('usuario', usuario)
  if (error) throw error
}

// ---------------------------------------------------------------
// Realtime
// ---------------------------------------------------------------
export const iniciarRealtime = (onMudanca) => {
  const sb = getClient()
  return sb
    .channel('vl-realtime-v2')
    .on('postgres_changes', { event: '*', schema: 'public', table: T_ESTADIAS }, onMudanca)
    .on('postgres_changes', { event: '*', schema: 'public', table: T_A_LANCAR }, onMudanca)
    .on('postgres_changes', { event: '*', schema: 'public', table: T_CAPTACOES }, onMudanca)
    .subscribe()
}

// ---------------------------------------------------------------
// Presença
// ---------------------------------------------------------------
export const iniciarPresenca = (usuario, onUpdate) => {
  const sb    = getClient()
  const canal = sb.channel('presenca-online', {
    config: { presence: { key: usuario.usuario } },
  })
  canal
    .on('presence', { event: 'sync' }, () => {
      const ativos = Object.values(canal.presenceState()).flat()
      onUpdate(ativos)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await canal.track({ ...usuario, t: Date.now() })
    })
  return canal
}

// ---------------------------------------------------------------
// Anexos
// ---------------------------------------------------------------
export const uploadAnexo = async (file) => {
  const sb   = getClient()
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safe}`
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined })
  if (error) throw error
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path)
  return { nome: file.name, tipo: file.type, tamanho: file.size, url: data.publicUrl, cloud: true }
}

export const uploadAnexoLocal = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve({ nome: file.name, tipo: file.type, tamanho: file.size, url: reader.result, cloud: false })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
