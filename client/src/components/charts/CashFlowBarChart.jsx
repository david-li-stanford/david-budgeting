import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-taupe/40 rounded-card shadow-card px-3 py-2 text-sm">
      <p className="font-medium text-[#3D3530] mb-1">{payload[0]?.payload?.name}</p>
      <p className="text-warmGray">{formatCurrency(payload[0]?.value)}</p>
    </div>
  )
}

export default function CashFlowBarChart({ allocatedIncome, totalExpenses }) {
  const surplus = allocatedIncome - totalExpenses
  const data = [
    { name: 'Allocated Income', value: allocatedIncome, color: '#7A8C6E' },
    { name: 'Total Expenses', value: totalExpenses, color: '#C27B5A' },
    { name: surplus >= 0 ? 'Surplus' : 'Deficit', value: Math.abs(surplus), color: surplus >= 0 ? '#D4A843' : '#B85C5C' },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D6CFC4" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#9B9189' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: '#9B9189' }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(214,207,196,0.3)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
