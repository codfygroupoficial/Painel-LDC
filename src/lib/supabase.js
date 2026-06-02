import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL || 'https://qzjwjylpbmnggczrbgoe.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6andqeWxwYm1uZ2djenJiZ29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODc3MzEsImV4cCI6MjA5NDI2MzczMX0.YdRUHObnqW4ru1iWzp79NgQvvZCm26xSFnbh7AlJ4lE'
export const TABLE = 'ldc_estadias'
export const USUARIOS_TABLE = 'ldc_usuarios'
export const BUCKET = 'ldc-anexos'

let client = null

export const getClient = () => {
  if (!client) client = createClient(URL, KEY)
  return client
}

export const payload = (item, tipo, filial = 'principal') => ({
  local_id: String(item.id),
  tipo,
  filial,
  placa: item.placa || '',
  status: item.status || '',
  prioridade: item.prioridade || 'Normal',
  dados: item,
  updated_at: new Date().toISOString(),
})

export const salvar = async (item, tipo, filial = 'principal') => {
  const sb = getClient()
  const { error } = await sb.from(TABLE).upsert(payload(item, tipo, filial), { onConflict: 'local_id' })
  if (error) throw error
}

export const deletar = async (id) => {
  const sb = getClient()
  const { error } = await sb.from(TABLE).delete().eq('local_id', String(id))
  if (error) throw error
}

export const baixarTodos = async (filial = null) => {
  const sb = getClient()
  let query = sb.from(TABLE).select('*').order('updated_at', { ascending: false })
  if (filial) query = query.eq('filial', filial)
  const { data, error } = await query
  if (error) throw error
  return data
}

export const baixarAdmin = async () => {
  const sb = getClient()
  const { data, error } = await sb.from(TABLE).select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export const uploadAnexo = async (file) => {
  const sb = getClient()
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
    reader.onload = () =>
      resolve({ nome: file.name, tipo: file.type, tamanho: file.size, url: reader.result, cloud: false })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export const iniciarRealtime = (onMudanca) => {
  const sb = getClient()
  return sb
    .channel('ldc-estadias-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, onMudanca)
    .subscribe()
}

export const carregarUsuarios = async () => {
  const sb = getClient()
  const { data, error } = await sb.from(USUARIOS_TABLE).select('*')
  if (error) throw error
  return data || []
}

export const salvarUsuario = async (user) => {
  const sb = getClient()
  const { error } = await sb.from(USUARIOS_TABLE).upsert({
    usuario: user.usuario,
    senha: user.senha,
    nome: user.nome,
    cargo: user.cargo || 'Operador',
    avatar: user.avatar || '',
    foto: user.foto || '',
    filial: user.filial || 'principal',
  }, { onConflict: 'usuario' })
  if (error) throw error
}

export const deletarUsuario = async (usuario) => {
  const sb = getClient()
  const { error } = await sb.from(USUARIOS_TABLE).delete().eq('usuario', usuario)
  if (error) throw error
}

export const iniciarPresenca = (usuario, onUpdate) => {
  const sb = getClient()
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
