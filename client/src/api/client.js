import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

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
