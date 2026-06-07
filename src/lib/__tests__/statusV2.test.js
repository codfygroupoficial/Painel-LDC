import { describe, it, expect } from 'vitest'
import { statusV2, limparTelefone } from '../supabaseV2'

describe('statusV2', () => {
  it('normaliza variações de "não carregou" para nao_carregou', () => {
    expect(statusV2('nao_carregou')).toBe('nao_carregou')
    expect(statusV2('Não carregou')).toBe('nao_carregou')
    expect(statusV2('nao carregou')).toBe('nao_carregou')
    expect(statusV2('NÃO CARREGOU')).toBe('nao_carregou')
  })

  it('normaliza variações de carregou', () => {
    expect(statusV2('carregou')).toBe('carregou')
    expect(statusV2('Carregado')).toBe('carregou')
  })

  it('normaliza variações de ordem', () => {
    expect(statusV2('ordem')).toBe('ordem')
    expect(statusV2('programado')).toBe('ordem')
    expect(statusV2('chegou no pátio')).toBe('ordem')
  })

  it('usa contatado como fallback para valores desconhecidos ou vazios', () => {
    expect(statusV2('')).toBe('contatado')
    expect(statusV2(null)).toBe('contatado')
    expect(statusV2('qualquer coisa')).toBe('contatado')
  })
})

describe('limparTelefone', () => {
  it('remove tudo que não é dígito', () => {
    expect(limparTelefone('(65) 99999-9999')).toBe('65999999999')
    expect(limparTelefone('')).toBe('')
    expect(limparTelefone(null)).toBe('')
  })
})
