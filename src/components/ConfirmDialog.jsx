export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990,
      background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      animation: 'loginIn .18s ease',
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20,
        padding: '28px 32px', maxWidth: 380, width: '100%', textAlign: 'center',
        boxShadow: '0 30px 80px rgba(0,0,0,.3)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 24, color: 'var(--text)', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn-light" style={{ minWidth: 90 }} onClick={onCancel}>Cancelar</button>
          <button className="btn-red" style={{ minWidth: 90 }} onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}
