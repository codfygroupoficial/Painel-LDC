import { useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function Backup() {
  const { exportarBackup, importarBackup, exportarCSV, toast } = useApp()
  const inputRef = useRef()

  const handleImportar = () => {
    const file = inputRef.current?.files?.[0]
    if (!file) { alert('Selecione um arquivo JSON.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const dados = JSON.parse(reader.result)
        importarBackup(dados)
      } catch { alert('Arquivo inválido.') }
    }
    reader.readAsText(file)
  }

  return (
    <section className="aba active" id="abaBackup">
      <div className="box">
        <div className="box-title">
          <h2>Backup e exportação</h2>
          <span>Use para guardar uma cópia manual dos dados.</span>
        </div>
        <div className="backup-row">
          <button className="btn-blue" onClick={exportarBackup}>Exportar backup JSON</button>
          <input ref={inputRef} type="file" accept=".json" style={{ maxWidth: 320 }} />
          <button className="btn-green" onClick={handleImportar}>Importar backup</button>
          <button className="btn-purple" onClick={exportarCSV}>Exportar CSV</button>
        </div>
      </div>
    </section>
  )
}
