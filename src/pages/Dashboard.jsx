import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { dinheiro, moedaNumero } from '../utils/index'

const CORES_STATUS = ['#fb923c', '#60a5fa', '#4ade80']
const CORES_PRIO   = ['#94a3b8', '#f59e0b', '#f87171']
const CORES_TIPO   = ['#a78bfa', '#34d399']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
      <strong>{payload[0].name}</strong>: {payload[0].value}
    </div>
  )
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function Pizza({ titulo, subtitulo, dados, cores, total }) {
  const vazio = dados.every(d => d.value === 0)
  return (
    <div className="box" style={{ flex: 1, minWidth: 280, textAlign: 'center' }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 15, marginBottom: 2 }}>{titulo}</h2>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitulo}</span>
      </div>

      {vazio ? (
        <div style={{ padding: '40px 0', color: 'var(--muted)', fontSize: 13 }}>
          Nenhum dado registrado ainda
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dados} cx="50%" cy="50%" outerRadius={82} dataKey="value"
                labelLine={false} label={renderLabel}>
                {dados.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda manual com valores */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
            {dados.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: cores[i % cores.length], display: 'inline-block' }} />
                <span style={{ color: 'var(--muted)' }}>{d.name}</span>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>

          {total != null && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>
              Total: <strong>{total}</strong>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Dashboard({ onNovaLancada, onNovaPendencia }) {
  const { estadias, estadiasALancar, usuarioAtual, usuariosOnline, cloudStatus } = useApp()

  const abertas     = estadias.filter(e => e.status === 'Aberto').length
  const feitas      = estadias.filter(e => e.status === 'Feito').length
  const finalizadas = estadias.filter(e => e.status === 'Finalizado').length
  const urgentes    = estadiasALancar.filter(e => e.prioridade === 'Urgente').length
  const medias      = estadiasALancar.filter(e => e.prioridade === 'Média').length
  const normais     = estadiasALancar.filter(e => e.prioridade === 'Normal').length
  const valorTotal  = dinheiro(estadias.reduce((s, e) => s + moedaNumero(e.valor), 0))

  return (
    <section className="aba active">

      {/* Header */}
      <div className="box" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 2 }}>
              Olá, {usuarioAtual?.nome?.split(' ')[0]} 👋
            </h2>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>
              {usuarioAtual?.cargo === 'Admin' ? 'Visão geral do sistema' : `Filial: ${usuarioAtual?.filial || 'principal'}`}
              &nbsp;·&nbsp;
              <span style={{ color: cloudStatus === 'online' ? '#4ade80' : '#f87171' }}>
                {cloudStatus === 'online' ? '● Nuvem online' : '● Nuvem offline'}
              </span>
              &nbsp;·&nbsp;{usuariosOnline.length} online
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-green" onClick={onNovaLancada}>＋ Nova estadia</button>
            <button className="btn-purple" onClick={onNovaPendencia}>📋 Nova pendência</button>
          </div>
        </div>
      </div>

      {/* Gráficos de pizza — destaque principal */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Pizza
          titulo="Status das estadias"
          subtitulo={`${estadias.length} estadia(s) lançada(s)`}
          dados={[
            { name: 'Abertas',     value: abertas },
            { name: 'Feitas',      value: feitas },
            { name: 'Finalizadas', value: finalizadas },
          ]}
          cores={CORES_STATUS}
          total={`Valor: ${valorTotal}`}
        />

        <Pizza
          titulo="Prioridade das pendências"
          subtitulo={`${estadiasALancar.length} pendência(s) a lançar`}
          dados={[
            { name: 'Normal',  value: normais },
            { name: 'Média',   value: medias },
            { name: 'Urgente', value: urgentes },
          ]}
          cores={CORES_PRIO}
        />

        <Pizza
          titulo="Lançadas × Pendências"
          subtitulo="Distribuição geral do sistema"
          dados={[
            { name: 'Lançadas',  value: estadias.length },
            { name: 'A lançar',  value: estadiasALancar.length },
          ]}
          cores={CORES_TIPO}
          total={`${estadias.length + estadiasALancar.length} registros no total`}
        />
      </div>

    </section>
  )
}
