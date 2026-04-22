import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const COLORS = ['#C27B5A', '#7A8C6E', '#D4A843', '#9B9189', '#6B8CAE', '#B85C5C', '#C2A97E', '#8C7A6E']

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
      <p className="text-warmGray pl-4">{formatCurrency(value)}{pct && <span className="ml-2 text-xs text-taupe-dark">({pct})</span>}</p>
    </div>
  )
}

function CenterLabel({ cx, cy, totalNetWorth }) {
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-warmGray text-xs" fontSize={11} fill="#9B9189">
        Net Worth
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontWeight={600} fontSize={15} fill="#3D3530">
        {formatCurrency(totalNetWorth)}
      </text>
    </g>
  )
}

export default function NetWorthDonut({ accounts }) {
  const data = accounts
    .filter((a) => a.balance > 0)
    .map((a, i) => ({ name: a.name, value: a.balance, color: COLORS[i % COLORS.length] }))

  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-warmGray text-sm">
        No account balances yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.color} stroke="white" strokeWidth={2} />
          ))}
          <CenterLabel cx="50%" cy="50%" totalNetWorth={total} />
        </Pie>
        <Tooltip
          content={<CustomTooltip />}
          wrapperStyle={{ outline: 'none' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
