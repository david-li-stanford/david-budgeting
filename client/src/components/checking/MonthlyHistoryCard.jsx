import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import Card from '../ui/Card'
import { formatCurrency } from '../../utils/formatCurrency'
import clsx from 'clsx'

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(key) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function buildMonthlyData(expenses, allocatedIncome) {
  const grouped = expenses.reduce((acc, e) => {
    const key = getMonthKey(new Date(e.date + 'T00:00:00'))
    if (e.amount > 0) acc[key] = (acc[key] || 0) + e.amount
    return acc
  }, {})

  const currentKey = getMonthKey(new Date())
  if (!grouped[currentKey]) grouped[currentKey] = 0

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, spent]) => ({
      month: formatMonthLabel(key),
      spent,
      surplus: allocatedIncome - spent,
      isCurrent: key === currentKey,
    }))
}

function ExpensesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-taupe/30 rounded-xl shadow-card-hover px-4 py-3 text-sm pointer-events-none">
      <p className="font-semibold text-[#3D3530] mb-1">{label}</p>
      <p className="text-danger">{formatCurrency(payload[0].value)} spent</p>
    </div>
  )
}

function SurplusTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-taupe/30 rounded-xl shadow-card-hover px-4 py-3 text-sm pointer-events-none">
      <p className="font-semibold text-[#3D3530] mb-1">{label}</p>
      <p className={val >= 0 ? 'text-sage' : 'text-danger'}>
        {val >= 0 ? '+' : ''}{formatCurrency(val)}
      </p>
    </div>
  )
}

const TABS = [
  { key: 'expenses', label: 'Monthly Expenses' },
  { key: 'surplus', label: 'Monthly Surplus' },
]

export default function MonthlyHistoryCard({ expenses, allocatedIncome }) {
  const [tab, setTab] = useState('expenses')

  if (!expenses.length) {
    return (
      <Card>
        <p className="section-title mb-4">Monthly History</p>
        <div className="flex items-center justify-center h-48 text-warmGray text-sm">
          No expense history yet
        </div>
      </Card>
    )
  }

  const data = buildMonthlyData(expenses, allocatedIncome)

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="section-title mb-0.5">Monthly History</p>
          <p className="text-xs text-warmGray">Current month highlighted</p>
        </div>
        <div className="flex items-center gap-1 bg-cream rounded-btn p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150',
                tab === t.key
                  ? 'bg-white text-[#3D3530] shadow-sm'
                  : 'text-warmGray hover:text-[#3D3530]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'expenses' && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D6CFC4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9B9189' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: '#9B9189' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<ExpensesTooltip />} wrapperStyle={{ outline: 'none' }} cursor={{ fill: 'rgba(214,207,196,0.3)' }} />
            <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.isCurrent ? '#C27B5A' : '#D6CFC4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {tab === 'surplus' && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D6CFC4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9B9189' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: '#9B9189' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<SurplusTooltip />} wrapperStyle={{ outline: 'none' }} cursor={{ fill: 'rgba(214,207,196,0.3)' }} />
            <ReferenceLine y={0} stroke="#B8AFA3" strokeWidth={1.5} />
            <Bar dataKey="surplus" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.surplus >= 0
                    ? entry.isCurrent ? '#7A8C6E' : '#95A889'
                    : entry.isCurrent ? '#B85C5C' : '#CC7A7A'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
