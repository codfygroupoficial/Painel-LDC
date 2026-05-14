export const dinheiro = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const moedaNumero = (v) =>
  Number(String(v || '').replace('R$', '').replaceAll(' ', '').replaceAll('.', '').replace(',', '.').trim()) || 0

export const formatarData = (d, h) => {
  if (!d || !h) return '-'
  const [ano, mes, dia] = d.split('-')
  return `${dia}/${mes}/${ano} ${h}`
}

export const dataISOTexto = (txt) => {
  if (!txt) return ''
  const dia = String(txt).split(',')[0] || ''
  const p = dia.split('/')
  if (p.length !== 3) return ''
  return `${p[2]}-${p[1]}-${p[0]}`
}

export const linkWhatsapp = (e) => {
  if (!e.telefoneMotorista) return ''
  let n = String(e.telefoneMotorista).replace(/[^0-9]/g, '')
  if (!n.startsWith('55')) n = '55' + n
  const msg = `Olá ${e.motorista || ''}, sua estadia da placa ${e.placa || ''}${e.chamado ? ' do chamado ' + e.chamado : ''} já foi lançada. Valor: ${e.valor || ''}.`
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`
}

export const calcularEstadia = (peso, chegadaData, chegadaHora, saidaData, saidaHora) => {
  const p = Number(String(peso).replaceAll('.', '').replace(',', '.'))
  if (!p || !chegadaData || !chegadaHora || !saidaData || !saidaHora) return null

  const chegada = new Date(`${chegadaData}T${chegadaHora}`)
  const saida = new Date(`${saidaData}T${saidaHora}`)
  if (saida <= chegada) return null

  let horas = (saida - chegada) / 3_600_000 - 12
  if (horas < 0) horas = 0
  const toneladas = p > 1000 ? p / 1000 : p
  const valor = toneladas * 0.8 * horas

  return {
    horas: horas.toFixed(2),
    valor: dinheiro(valor),
    chegada: formatarData(chegadaData, chegadaHora),
    saida: formatarData(saidaData, saidaHora),
  }
}

export const gerarId = () => Date.now() + Math.floor(Math.random() * 1000)

export const baixarArquivo = (nome, conteudo, tipo) => {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  URL.revokeObjectURL(url)
}
