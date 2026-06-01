import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const COLORS = ['#C27B5A', '#7A8C6E', '#D4A843', '#9B9189', '#6B8CAE', '#B85C5C', '#C2A97E', '#8C7A6E']

const CATEGORY_LABELS = {
  FOOD_AND_DRINK: 'Food & Drink',
  TRAVEL: 'Travel',
  TRANSPORTATION: 'Transportation',
  GENERAL_MERCHANDISE: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  PERSONAL_CARE: 'Personal Care',
  GENERAL_SERVICES: 'Services',
  GOVERNMENT_AND_NON_PROFIT: 'Government',
  HOME_IMPROVEMENT: 'Home',
  MEDICAL: 'Medical',
  RENT_AND_UTILITIES: 'Utilities',
  LOAN_PAYMENTS: 'Loans',
  TRANSFER_OUT: 'Transfers',
  INCOME: 'Income',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: inner } = payload[0]
  const pct = inner?.percent != null ? `${(inner.percent * 100).toFixed(1)}%` : null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-taupe/30 rounded-xl shadow-card-hover px-4 py-3 text-sm pointer-events-none">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: inner?.fill }} />
        <span className="font-semibold text-[#3D3530]">{name}</span>
      </div>
      <p className="text-warmGray pl-4">
        {formatCurrency(value)}
        {pct && <span className="ml-2 text-xs text-taupe-dark">({pct})</span>}
      </p>
    </div>
  )
}

export default function ExpensePieChart({ expenses }) {
  if (!expenses.length) {
    return (
      <div className="flex items-center justify-center h-40 text-warmGray text-sm">
        No expenses this month
      </div>
    )
  }

  const grouped = expenses.reduce((acc, e) => {
    if (e.amount <= 0) return acc
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
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
        <Legend
          formatter={(value) => <span style={{ fontSize: 11, color: '#9B9189' }}>{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
