const BASE = '/api'

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// Settings
export const getSettings = () => fetch(`${BASE}/settings`).then(handle)
export const patchSettings = (data) =>
  fetch(`${BASE}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)

// Checking Accounts
export const getCheckingAccounts = () => fetch(`${BASE}/checkingAccounts`).then(handle)
export const createCheckingAccount = (data) =>
  fetch(`${BASE}/checkingAccounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)
export const patchCheckingAccount = (id, data) =>
  fetch(`${BASE}/checkingAccounts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)
export const deleteCheckingAccount = (id) =>
  fetch(`${BASE}/checkingAccounts/${id}`, { method: 'DELETE' }).then(handle)

// Investment Accounts
export const getInvestmentAccounts = () => fetch(`${BASE}/investmentAccounts`).then(handle)
export const createInvestmentAccount = (data) =>
  fetch(`${BASE}/investmentAccounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)
export const patchInvestmentAccount = (id, data) =>
  fetch(`${BASE}/investmentAccounts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)
export const deleteInvestmentAccount = (id) =>
  fetch(`${BASE}/investmentAccounts/${id}`, { method: 'DELETE' }).then(handle)

// Expenses
export const getExpenses = (accountId) =>
  fetch(`${BASE}/expenses?accountId=${accountId}`).then(handle)
export const createExpense = (data) =>
  fetch(`${BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)
export const patchExpense = (id, data) =>
  fetch(`${BASE}/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)
export const deleteExpense = (id) =>
  fetch(`${BASE}/expenses/${id}`, { method: 'DELETE' }).then(handle)

// Forecast Scenarios
export const getForecastScenarios = (accountId) =>
  fetch(`${BASE}/forecastScenarios?accountId=${accountId}`).then(handle)
export const createForecastScenario = (data) =>
  fetch(`${BASE}/forecastScenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle)
export const deleteForecastScenario = (id) =>
  fetch(`${BASE}/forecastScenarios/${id}`, { method: 'DELETE' }).then(handle)
