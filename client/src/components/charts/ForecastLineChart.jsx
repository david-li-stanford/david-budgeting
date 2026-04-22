import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { formatCurrencyCompact, formatCurrency } from '../../utils/formatCurrency'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-taupe/40 rounded-card shadow-card px-4 py-3 text-sm min-w-[160px]">
      <p className="font-semibold text-[#3D3530] mb-2">Year {label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="text-[#3D3530]">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function ForecastLineChart({ scenarios }) {
  if (!scenarios?.length) return null

  // Merge all data points by year
  const allYears = [...new Set(scenarios.flatMap((s) => s.data.map((d) => d.year)))].sort((a, b) => a - b)
  const chartData = allYears.map((year) => {
    const row = { year }
    for (const s of scenarios) {
      const point = s.data.find((d) => d.year === year)
      if (point) row[s.label] = point.value
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D6CFC4" />
        <XAxis
          dataKey="year"
          tickFormatter={(v) => `Yr ${v}`}
          tick={{ fontSize: 11, fill: '#9B9189' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrencyCompact(v)}
          tick={{ fontSize: 11, fill: '#9B9189' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ fontSize: 11, color: '#9B9189' }}>{value}</span>}
          iconType="circle"
          iconSize={8}
        />
        <ReferenceLine x={0} stroke="#D6CFC4" strokeDasharray="4 4" />
        {scenarios.map((s) => (
          <Line
            key={s.label}
            type="monotone"
            dataKey={s.label}
            stroke={s.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: s.color, stroke: 'white', strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
