import { supabase } from '../lib/supabase'

function check(error) {
  if (error) throw new Error(error.message)
}

// Settings
export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'global')
    .single()
  check(error)
  return data
}

export const patchSettings = async (updates) => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ id: 'global', ...updates })
    .select()
    .single()
  check(error)
  return data
}

// Checking Accounts
export const getCheckingAccounts = async () => {
  const { data, error } = await supabase.from('checkingAccounts').select('*')
  check(error)
  return data
}

export const createCheckingAccount = async (account) => {
  const { data, error } = await supabase.from('checkingAccounts').insert(account).select().single()
  check(error)
  return data
}

export const patchCheckingAccount = async (id, updates) => {
  const { data, error } = await supabase.from('checkingAccounts').update(updates).eq('id', id).select().single()
  check(error)
  return data
}

export const deleteCheckingAccount = async (id) => {
  const { error } = await supabase.from('checkingAccounts').delete().eq('id', id)
  check(error)
}

// Investment Accounts
export const getInvestmentAccounts = async () => {
  const { data, error } = await supabase.from('investmentAccounts').select('*')
  check(error)
  return data
}

export const createInvestmentAccount = async (account) => {
  const { data, error } = await supabase.from('investmentAccounts').insert(account).select().single()
  check(error)
  return data
}

export const patchInvestmentAccount = async (id, updates) => {
  const { data, error } = await supabase.from('investmentAccounts').update(updates).eq('id', id).select().single()
  check(error)
  return data
}

export const deleteInvestmentAccount = async (id) => {
  const { error } = await supabase.from('investmentAccounts').delete().eq('id', id)
  check(error)
}

// Expenses
export const getExpenses = async (accountId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('accountId', accountId)
  check(error)
  return data
}

export const createExpense = async (expense) => {
  const { data, error } = await supabase.from('expenses').insert(expense).select().single()
  check(error)
  return data
}

export const patchExpense = async (id, updates) => {
  const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single()
  check(error)
  return data
}

export const deleteExpense = async (id) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  check(error)
}

// Forecast Scenarios
export const getForecastScenarios = async (accountId) => {
  const { data, error } = await supabase
    .from('forecastScenarios')
    .select('*')
    .eq('accountId', accountId)
  check(error)
  return data
}

export const createForecastScenario = async (scenario) => {
  const { data, error } = await supabase.from('forecastScenarios').insert(scenario).select().single()
  check(error)
  return data
}

export const deleteForecastScenario = async (id) => {
  const { error } = await supabase.from('forecastScenarios').delete().eq('id', id)
  check(error)
}

// Deposit History
export const getDepositHistory = async () => {
  const { data, error } = await supabase
    .from('depositHistory')
    .select('*')
    .order('date', { ascending: false })
  check(error)
  return data
}

export const createDeposit = async (deposit) => {
  const { data, error } = await supabase.from('depositHistory').insert(deposit).select().single()
  check(error)
  return data
}

export const deleteDeposit = async (id) => {
  const { error } = await supabase.from('depositHistory').delete().eq('id', id)
  check(error)
}


// Credit Accounts
export const getCreditAccounts = async () => {
  const { data, error } = await supabase.from('creditAccounts').select('*')
  check(error); return data
}
export const createCreditAccount = async (account) => {
  const { data, error } = await supabase.from('creditAccounts').insert(account).select().single()
  check(error); return data
}
export const patchCreditAccount = async (id, updates) => {
  const { data, error } = await supabase.from('creditAccounts').update(updates).eq('id', id).select().single()
  check(error); return data
}
export const deleteCreditAccount = async (id) => {
  const { error } = await supabase.from('creditAccounts').delete().eq('id', id)
  check(error)
}


// Plaid
export const createPlaidLinkToken = async () => {
  const res = await fetch('/api/plaid/create-link-token', { method: 'POST' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to create link token')
  return data.link_token
}

export const exchangePlaidToken = async (publicToken, institution, accounts) => {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/plaid/exchange-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ public_token: publicToken, institution, accounts }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Token exchange failed')
  return data
}

export const syncPlaid = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/plaid/sync', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getPlaidAccounts = async () => {
  const { data, error } = await supabase
    .from('plaid_accounts')
    .select('*, plaid_items(id, institution_name)')
    .order('created_at', { ascending: true })
  check(error)
  return data
}

export const deletePlaidItem = async (id) => {
  const { error } = await supabase.from('plaid_items').delete().eq('id', id)
  check(error)
}

export const getPlaidTransactions = async (appAccountId) => {
  const { data, error } = await supabase
    .from('plaid_transactions')
    .select('*')
    .eq('app_account_id', appAccountId)
    .order('date', { ascending: false })
  check(error)
  return data
}
