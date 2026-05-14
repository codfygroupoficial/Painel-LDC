import { useRef, useState } from 'react'

export default function DropZone({ arquivos, onChange }) {
  const inputRef = useRef()
  const [drag, setDrag] = useState(false)

  const atualizar = (files) => onChange(Array.from(files).slice(0, 2))
  const remover = (i) => { const nova = [...arquivos]; nova.splice(i, 1); onChange(nova) }

  return (
    <div
      className={`drop-zone ${drag ? 'dragover' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); atualizar(e.dataTransfer.files) }}
    >
      <div className="drop-icon">📎</div>
      <strong>Arraste até 2 arquivos aqui</strong>
      <p>PDF, imagem, Word ou Excel. Também dá para clicar.</p>
      <div className="drop-list">
        {arquivos.length === 0
          ? 'Nenhum arquivo selecionado.'
          : arquivos.map((f, i) => (
            <span key={i} className="drop-file-pill">
              📄 {f.name}
              <button type="button" onClick={e => { e.stopPropagation(); remover(i) }}>×</button>
            </span>
          ))}
      </div>
      <input ref={inputRef} type="file" multiple hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
        onChange={e => atualizar(e.target.files)} />
    </div>
  )
}
