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

// Transfers
export const getTransfers = async () => {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('date', { ascending: false })
  check(error)
  return data
}

export const createTransfer = async (transfer) => {
  const { data, error } = await supabase.from('transfers').insert(transfer).select().single()
  check(error)
  return data
}

export const deleteTransfer = async (id) => {
  const { error } = await supabase.from('transfers').delete().eq('id', id)
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

// Teller Enrollments
export const getTellerEnrollments = async () => {
  const { data, error } = await supabase.from('teller_enrollments').select('*').order('created_at', { ascending: true })
  check(error); return data
}
export const createTellerEnrollment = async (enrollment) => {
  const { data, error } = await supabase.from('teller_enrollments').insert(enrollment).select().single()
  check(error); return data
}
export const patchTellerEnrollment = async (id, updates) => {
  const { data, error } = await supabase.from('teller_enrollments').update(updates).eq('id', id).select().single()
  check(error); return data
}
export const deleteTellerEnrollment = async (id) => {
  const { error } = await supabase.from('teller_enrollments').delete().eq('id', id)
  check(error)
}

// Teller Transactions
export const getTellerTransactions = async (appAccountId) => {
  const { data, error } = await supabase
    .from('teller_transactions')
    .select('*')
    .eq('app_account_id', appAccountId)
    .order('date', { ascending: false })
  check(error); return data
}

// Edge Function calls
export const discoverTellerAccounts = async (accessToken) => {
  const res = await fetch('/api/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Discovery failed')
  return data
}

export const syncTeller = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
