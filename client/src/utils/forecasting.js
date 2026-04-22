/**
 * Project account value using compound interest with regular monthly contributions.
 * FV = P*(1+r)^n + PMT*[((1+r)^n - 1) / r]
 *
 * @param {number} balance        - Current principal balance
 * @param {number} annualRate     - Annual return rate as a percentage (e.g. 7.5 for 7.5%)
 * @param {number} monthlyContrib - Monthly contribution amount
 * @param {number} years          - Number of years to project
 * @returns {number} Projected future value
 */
export function projectValue(balance, annualRate, monthlyContrib, years) {
  const r = annualRate / 100 / 12  // monthly rate
  const n = years * 12             // total months

  if (r === 0) {
    return balance + monthlyContrib * n
  }

  const growth = Math.pow(1 + r, n)
  const fv = balance * growth + monthlyContrib * ((growth - 1) / r)
  return fv
}

/**
 * Total contributions made over a period (not including initial balance).
 */
export function totalContributions(monthlyContrib, years) {
  return monthlyContrib * years * 12
}

/**
 * Generate chart data points for a given scenario.
 * Returns array of { year, value } objects.
 */
export function generateForecastData(balance, annualRate, monthlyContrib) {
  const years = [0, 1, 2, 3, 5, 7, 10, 15, 20, 25, 30]
  return years.map((y) => ({
    year: y,
    value: Math.round(projectValue(balance, annualRate, monthlyContrib, y)),
  }))
}

/**
 * Summary table rows at standard milestone years.
 */
export function generateForecastTable(balance, annualRate, monthlyContrib) {
  const milestones = [1, 5, 10, 20, 30]
  return milestones.map((y) => {
    const projected = projectValue(balance, annualRate, monthlyContrib, y)
    const contributions = totalContributions(monthlyContrib, y)
    const gain = projected - balance - contributions
    return {
      years: y,
      projected: Math.round(projected),
      contributions: Math.round(contributions),
      gain: Math.round(gain),
    }
  })
}
