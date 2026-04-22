const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const fmtCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export const formatCurrency = (value) => fmt.format(value ?? 0)
export const formatCurrencyCompact = (value) => fmtCompact.format(value ?? 0)
export const formatPercent = (value) =>
  `${Number(value ?? 0).toFixed(1)}%`
