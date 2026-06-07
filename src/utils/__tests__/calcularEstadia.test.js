import { describe, it, expect } from 'vitest'
import { calcularEstadia } from '../index'

describe('calcularEstadia', () => {
  it('retorna null quando faltam dados obrigatórios', () => {
    expect(calcularEstadia('', '2026-01-01', '08:00', '2026-01-01', '20:00')).toBeNull()
    expect(calcularEstadia('1000', '', '08:00', '2026-01-01', '20:00')).toBeNull()
  })

  it('retorna null quando a saída é antes ou igual à chegada', () => {
    expect(calcularEstadia('1000', '2026-01-02', '08:00', '2026-01-01', '20:00')).toBeNull()
    expect(calcularEstadia('1000', '2026-01-01', '08:00', '2026-01-01', '08:00')).toBeNull()
  })

  it('zera as horas quando a estadia é menor que a franquia de 12h', () => {
    const r = calcularEstadia('1000', '2026-01-01', '08:00', '2026-01-01', '14:00')
    expect(r).not.toBeNull()
    expect(r.horas).toBe('0.00')
  })

  it('calcula horas excedentes e valor para peso em quilos', () => {
    const r = calcularEstadia('1000', '2026-01-01', '08:00', '2026-01-02', '08:00')
    expect(r).not.toBeNull()
    expect(r.horas).toBe('12.00')
    expect(r.valor).toContain('R$')
  })

  it('trata peso já em toneladas (<= 1000) sem dividir novamente', () => {
    const emQuilos = calcularEstadia('2000', '2026-01-01', '08:00', '2026-01-02', '08:00')
    const emToneladas = calcularEstadia('2', '2026-01-01', '08:00', '2026-01-02', '08:00')
    expect(emQuilos.valor).toBe(emToneladas.valor)
  })
})
