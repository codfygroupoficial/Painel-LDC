import { useEffect, useState } from 'react'
import { EMPTY, OPERACOES, MOTIVOS_NAO_CARREGOU, STATUS, inputStyle, lblStyle } from '../constants'
import { statusKey, formatarTelefone } from '../helpers'

export default function ModalMotorista({ aberto, fechar, salvarMotorista, editando }) {
  const [form, setForm] = useState(EMPTY)
  useEffect(() => {
    setForm(
      editando
        ? {
            nome: editando.nome || '',
            numero: editando.numero || '',
            operacao: editando.operacao || 'Farelo',
            status: statusKey(editando.status),
            obs: editando.obs || '',
            quantidadeCargas: String(editando.quantidadeCargas || 1),
            motivoNaoCarregou: editando.motivoNaoCarregou || '',
            justificativaNaoCarregou: editando.justificativaNaoCarregou || '',
          }
        : EMPTY,
    )
  }, [editando, aberto])
  if (!aberto) return null
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))
  const confirmar = () => {
    if (!form.nome.trim() || !form.numero.trim()) return
    if (form.status === 'nao_carregou' && (!form.motivoNaoCarregou || !form.justificativaNaoCarregou.trim())) {
      alert('Informe o motivo e a justificativa de não carregamento.')
      return
    }
    salvarMotorista({
      ...form,
      nome: form.nome.trim(),
      numero: formatarTelefone(form.numero),
      obs: form.obs.trim(),
      motivoNaoCarregou: form.status === 'nao_carregou' ? form.motivoNaoCarregou : '',
      justificativaNaoCarregou: form.status === 'nao_carregou' ? form.justificativaNaoCarregou.trim() : '',
      quantidadeCargas: String(Math.max(1, Number(form.quantidadeCargas || 1) || 1)),
    })
  }
  return (
    <div className="cap-modal-backdrop" onClick={fechar}>
      <div className="cap-modal cap-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="cap-modal-head">
          <h2>{editando ? 'Editar motorista' : 'Novo motorista'}</h2>
          <button onClick={fechar} className="cap-close">
            ×
          </button>
        </div>
        <label style={lblStyle}>Nome do motorista</label>
        <input value={form.nome} onChange={(e) => set('nome', e.target.value)} style={inputStyle} placeholder="Ex: José Pereira" />
        <label style={lblStyle}>Número</label>
        <input value={form.numero} onChange={(e) => set('numero', e.target.value)} style={inputStyle} placeholder="(65) 99999-9999" />
        <div className="cap-modal-grid">
          <div>
            <label style={lblStyle}>Operação</label>
            <div className="cap-choice-row">
              {OPERACOES.map((op) => (
                <button key={op} onClick={() => set('operacao', op)} className={`cap-choice ${form.operacao === op ? 'active' : ''}`}>
                  {op}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lblStyle}>Qtd. cargas</label>
            <input
              value={form.quantidadeCargas}
              onChange={(e) => set('quantidadeCargas', e.target.value.replace(/[^0-9]/g, ''))}
              style={inputStyle}
              placeholder="1"
            />
          </div>
        </div>
        <label style={lblStyle}>Status</label>
        <div className="cap-choice-row status-row status-row-4">
          {Object.entries(STATUS).map(([key, s]) => (
            <button
              key={key}
              onClick={() => set('status', key)}
              className={`cap-status-choice ${key === 'nao_carregou' ? 'danger' : ''} ${form.status === key ? 'active' : ''}`}
              style={form.status === key ? { borderColor: s.cor, color: s.cor, background: `${s.cor}12` } : {}}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        {form.status === 'nao_carregou' && (
          <div className="cap-no-load-form">
            <label style={lblStyle}>Motivo de não carregamento</label>
            <select value={form.motivoNaoCarregou} onChange={(e) => set('motivoNaoCarregou', e.target.value)} style={inputStyle}>
              <option value="">Selecione o motivo...</option>
              {MOTIVOS_NAO_CARREGOU.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <label style={lblStyle}>Justificativa obrigatória</label>
            <textarea
              value={form.justificativaNaoCarregou}
              onChange={(e) => set('justificativaNaoCarregou', e.target.value)}
              placeholder="Explique o que aconteceu. Ex: motorista informou que a seguradora não libera carregamento LDC."
              style={{ ...inputStyle, minHeight: 86, resize: 'vertical' }}
            />
          </div>
        )}
        <label style={lblStyle}>Observação</label>
        <textarea
          value={form.obs}
          onChange={(e) => set('obs', e.target.value)}
          placeholder="Ex: falou que retorna mais tarde, prefere farelo, contato do agenciador..."
          style={{ ...inputStyle, minHeight: 74, resize: 'vertical' }}
        />
        <button onClick={confirmar} className="cap-save-btn">
          {editando ? 'Salvar alterações' : 'Cadastrar motorista'}
        </button>
      </div>
    </div>
  )
}
