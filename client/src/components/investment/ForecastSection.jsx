import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ForecastLineChart from '../charts/ForecastLineChart'
import { generateForecastData, generateForecastTable } from '../../utils/forecasting'
import { formatCurrency } from '../../utils/formatCurrency'

function ForecastTable({ rows }) {
  return (
    <div className="rounded-card border border-taupe/40 overflow-hidden mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cream-dark border-b border-taupe/40">
            {['Year', 'Projected Value', 'Total Contributed', 'Net Gain'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-xs font-semibold text-warmGray uppercase tracking-wider text-right first:text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-taupe/20">
          {rows.map((row) => (
            <tr key={row.years} className="hover:bg-cream transition-colors">
              <td className="px-4 py-3 font-medium text-[#3D3530]">{row.years} yr{row.years !== 1 ? 's' : ''}</td>
              <td className="px-4 py-3 text-right font-semibold text-[#3D3530] tabular-nums">{formatCurrency(row.projected)}</td>
              <td className="px-4 py-3 text-right text-warmGray tabular-nums">{formatCurrency(row.contributions)}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                <span className={row.gain >= 0 ? 'text-sage font-medium' : 'text-danger font-medium'}>
                  {row.gain >= 0 ? '+' : ''}{formatCurrency(row.gain)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ForecastSection({ account, scenarios, onAddScenario, onRemoveScenario }) {
  const [showAddScenario, setShowAddScenario] = useState(false)
  const [newScenario, setNewScenario] = useState({ label: '', annualReturnRate: '' })

  const currentData = generateForecastData(account.balance, account.annualReturnRate, account.monthlyContribution)
  const tableRows = generateForecastTable(account.balance, account.annualReturnRate, account.monthlyContribution)

  const chartScenarios = [
    { label: `Current (${account.annualReturnRate}%)`, color: '#C27B5A', data: currentData },
    ...scenarios.map((s) => ({
      label: s.label,
      color: s.color,
      data: generateForecastData(account.balance, s.annualReturnRate, account.monthlyContribution),
    })),
  ]

  const handleAddScenario = () => {
    if (!newScenario.label || !newScenario.annualReturnRate) return
    onAddScenario({
      label: newScenario.label,
      annualReturnRate: parseFloat(newScenario.annualReturnRate) || 0,
    })
    setNewScenario({ label: '', annualReturnRate: '' })
    setShowAddScenario(false)
  }

  return (
    <div className="space-y-5">
      {/* Growth Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#3D3530]">Growth Forecast</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowAddScenario(!showAddScenario)}>
            {showAddScenario ? 'Cancel' : '+ Compare Scenario'}
          </Button>
        </div>

        {showAddScenario && (
          <div className="flex gap-3 items-end mb-4 p-3 bg-cream rounded-btn">
            <Input
              label="Scenario Label"
              value={newScenario.label}
              onChange={(e) => setNewScenario((s) => ({ ...s, label: e.target.value }))}
              placeholder="e.g. Bear Case"
              className="flex-1"
            />
            <Input
              label="Annual Rate"
              suffix="%"
              type="number"
              step="0.1"
              value={newScenario.annualReturnRate}
              onChange={(e) => setNewScenario((s) => ({ ...s, annualReturnRate: e.target.value }))}
              placeholder="5.0"
              className="w-28"
            />
            <Button variant="primary" size="sm" onClick={handleAddScenario} className="mb-0.5">
              Add
            </Button>
          </div>
        )}

        {/* Scenario chips */}
        {scenarios.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {scenarios.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 bg-cream rounded-full pl-3 pr-1.5 py-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs font-medium text-[#3D3530]">{s.label}</span>
                <button
                  onClick={() => onRemoveScenario(s.id)}
                  className="text-warmGray hover:text-danger transition-colors ml-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <ForecastLineChart scenarios={chartScenarios} />
      </Card>

      {/* Projection Table */}
      <Card>
        <h3 className="font-semibold text-[#3D3530] mb-1">Projections at {account.annualReturnRate}% annual return</h3>
        <p className="text-xs text-warmGray mb-2">Starting balance {formatCurrency(account.balance)}, contributing {formatCurrency(account.monthlyContribution)}/mo</p>
        <ForecastTable rows={tableRows} />
      </Card>
    </div>
  )
}
