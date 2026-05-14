import { createClient } from '@supabase/supabase-js'

const URL = 'https://qzjwjylpbmnggczrbgoe.supabase.co'
const KEY = 'sb_publishable_om8iQIEuLHPQpxgXCOqLgw_xOGyCko_'
export const TABLE = 'ldc_estadias'
export const BUCKET = 'ldc-anexos'

let client = null

export const getClient = () => {
  if (!client) client = createClient(URL, KEY)
  return client
}

export const payload = (item, tipo) => ({
  local_id: String(item.id),
  tipo,
  placa: item.placa || '',
  status: item.status || '',
  prioridade: item.prioridade || 'Normal',
  dados: item,
  updated_at: new Date().toISOString(),
})

export const salvar = async (item, tipo) => {
  const sb = getClient()
  const { error } = await sb.from(TABLE).upsert(payload(item, tipo), { onConflict: 'local_id' })
  if (error) throw error
}

export const deletar = async (id) => {
  const sb = getClient()
  const { error } = await sb.from(TABLE).delete().eq('local_id', String(id))
  if (error) throw error
}

export const baixarTodos = async () => {
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
