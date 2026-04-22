/**
 * Calculate how much each account receives from monthly income.
 *
 * Rules:
 * 1. Fixed-mode accounts are allocated first (in dollar amounts).
 * 2. Percent-mode accounts split the remainder proportionally.
 * 3. Returns an object keyed by accountId → allocated dollar amount.
 * 4. Also returns `unallocated` — leftover after all allocations.
 * 5. Returns `errors` array for validation issues.
 */
export function calculateDistribution(monthlyIncome, distribution = []) {
  const errors = []
  const result = {}

  const fixedEntries = distribution.filter((d) => d.mode === 'fixed')
  const percentEntries = distribution.filter((d) => d.mode === 'percent')

  // Sum fixed allocations
  const fixedTotal = fixedEntries.reduce((sum, d) => sum + (Number(d.value) || 0), 0)

  if (fixedTotal > monthlyIncome) {
    errors.push(`Fixed allocations ($${fixedTotal.toFixed(2)}) exceed monthly income ($${monthlyIncome.toFixed(2)})`)
  }

  const remainder = Math.max(0, monthlyIncome - fixedTotal)

  // Validate percent total
  const percentTotal = percentEntries.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  if (percentTotal > 100) {
    errors.push(`Percent allocations total ${percentTotal.toFixed(1)}% which exceeds 100%`)
  }

  // Apply fixed allocations
  for (const entry of fixedEntries) {
    result[entry.accountId] = Number(entry.value) || 0
  }

  // Apply percent allocations from remainder
  for (const entry of percentEntries) {
    result[entry.accountId] = ((Number(entry.value) || 0) / 100) * remainder
  }

  // Unallocated = remainder - sum of percent allocations
  const percentAllocated = percentEntries.reduce(
    (sum, d) => sum + ((Number(d.value) || 0) / 100) * remainder,
    0
  )
  const unallocated = remainder - percentAllocated

  return { allocations: result, unallocated: Math.max(0, unallocated), errors }
}

/**
 * Get the allocated amount for a single account.
 */
export function getAllocationForAccount(monthlyIncome, distribution, accountId) {
  const { allocations } = calculateDistribution(monthlyIncome, distribution)
  return allocations[accountId] ?? 0
}
