import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const COLORS = ['#C27B5A', '#7A8C6E', '#D4A843', '#9B9189', '#6B8CAE', '#B85C5C', '#C2A97E', '#8C7A6E']

const CATEGORY_LABELS = {
  housing: 'Housing',
  food: 'Food',
  utilities: 'Utilities',
  insurance: 'Insurance',
  subscriptions: 'Subscriptions',
  transport: 'Transport',
  health: 'Health',
  entertainment: 'Entertainment',
  other: 'Other',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-taupe/40 rounded-card shadow-card px-3 py-2 text-sm">
      <p className="font-medium text-[#3D3530]">{payload[0].name}</p>
      <p className="text-warmGray">{formatCurrency(payload[0].value)}/mo</p>
    </div>
  )
}

export default function ExpensePieChart({ expenses }) {
  const active = expenses.filter((e) => e.isActive)
  if (active.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-warmGray text-sm">
        No active expenses
      </div>
    )
  }

  // Group by category
  const grouped = active.reduce((acc, e) => {
    const cat = CATEGORY_LABELS[e.category] ?? e.category ?? 'Other'
    acc[cat] = (acc[cat] || 0) + e.amount
    return acc
  }, {})

  const data = Object.entries(grouped).map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ fontSize: 11, color: '#9B9189' }}>{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
