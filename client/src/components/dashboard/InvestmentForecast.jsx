import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../ui/Card'
import { formatCurrency } from '../../utils/formatCurrency'

const SCENARIOS = [
  { key: 'conservative', label: '5% conservative', rate: 0.05, color: '#9B9189' },
  { key: 'moderate', label: '7% moderate', rate: 0.07, color: '#7A8C6E' },
  { key: 'aggressive', label: '10% aggressive', rate: 0.10, color: '#C27B5A' },
]

function project(principal, monthly, annualRate, years) {
  const r = annualRate / 12
  const n = years * 12
  if (r === 0) return principal + monthly * n
  return principal * Math.pow(1 + r, n) + monthly * (Math.pow(1 + r, n) - 1) / r
}

function formatAxis(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  return `$${(v / 1000).toFixed(0)}k`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-taupe/30 rounded-xl shadow-card-hover px-4 py-3 text-sm pointer-events-none">
      <p className="font-semibold text-[#3D3530] mb-2">{label} years</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="mb-0.5">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function InvestmentForecast({ totalInvestments }) {
  const [monthly, setMonthly] = useState('')

  const monthlyNum = parseFloat(monthly) || 0

  const data = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const year = i * 5
      const entry = { year }
      for (const { key, rate } of SCENARIOS) {
        entry[key] = Math.round(project(totalInvestments, monthlyNum, rate, year))
      }
      return entry
    })
  }, [totalInvestments, monthlyNum])

  const milestones = [10, 20, 30].map((yr) => ({
    yr,
    value: Math.round(project(totalInvestments, monthlyNum, 0.07, yr)),
  }))

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-title mb-0.5">Investment Forecast</p>
          <p className="text-xs text-warmGray">Starting from {formatCurrency(totalInvestments)}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-warmGray whitespace-nowrap">Monthly contribution</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-warmGray pointer-events-none">$</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className="pl-5 pr-2 py-1.5 text-xs border border-taupe/50 rounded-btn bg-white w-28 text-right focus:outline-none focus:ring-1 focus:ring-terracotta/40"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {milestones.map(({ yr, value }) => (
          <div key={yr} className="text-center bg-cream rounded-card p-3">
            <p className="text-xs text-warmGray mb-1">{yr}yr at 7%</p>
            <p className="text-lg font-semibold text-[#3D3530] tabular-nums">{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D6CFC4" vertical={false} />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `${v}yr`}
            tick={{ fontSize: 11, fill: '#9B9189' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAxis}
            tick={{ fontSize: 11, fill: '#9B9189' }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
          <Legend
            formatter={(value) => <span style={{ fontSize: 11, color: '#9B9189' }}>{value}</span>}
            iconType="circle"
            iconSize={8}
          />
          {SCENARIOS.map(({ key, label, color }) => (
            <Line key={key} type="monotone" dataKey={key} name={label} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
