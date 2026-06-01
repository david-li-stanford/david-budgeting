const { PlaidApi, PlaidEnvironments, Configuration } = require('plaid')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rlforrddajmuhyqnstzt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-Vkg0FMcLtsCt78fFkRfTw_6drAt2Yh'

function makePlaidClient() {
  const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'production'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
  return new PlaidApi(config)
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  // Fetch all plaid_items with their linked accounts
  const { data: items, error: itemsError } = await supabase
    .from('plaid_items')
    .select('*, plaid_accounts(*)')

  if (itemsError) return res.status(500).json({ error: itemsError.message })

  const plaid = makePlaidClient()

  const results = await Promise.all((items ?? []).map(async (item) => {
    const institutionName = item.institution_name
    try {
      const linkedAccounts = item.plaid_accounts ?? []

      // 1. Get balances and update app accounts
      const balanceResponse = await plaid.accountsBalanceGet({ access_token: item.access_token })
      const balanceMap = {}
      for (const acct of balanceResponse.data.accounts) {
        balanceMap[acct.account_id] = acct.balances
      }

      for (const acct of linkedAccounts) {
        const balances = balanceMap[acct.plaid_account_id]
        if (!balances) continue

        let balance
        if (acct.app_account_type === 'investment') {
          balance = balances.current
        } else if (acct.app_account_type === 'checking') {
          balance = balances.available ?? balances.current
        } else {
          // credit
          balance = balances.current
        }

        if (balance == null) continue

        const table =
          acct.app_account_type === 'checking' ? 'checkingAccounts'
          : acct.app_account_type === 'investment' ? 'investmentAccounts'
          : 'creditAccounts'

        await supabase.from(table).update({ balance }).eq('id', acct.app_account_id)
      }

      // 2. Sync transactions
      let cursor = item.transactions_cursor ?? null
      let added = []
      let modified = []
      let removed = []
      let hasMore = true

      while (hasMore) {
        const syncResponse = await plaid.transactionsSync({
          access_token: item.access_token,
          cursor: cursor ?? undefined,
        })
        const syncData = syncResponse.data
        added = added.concat(syncData.added)
        modified = modified.concat(syncData.modified)
        removed = removed.concat(syncData.removed)
        hasMore = syncData.has_more
        cursor = syncData.next_cursor
      }

      // Build a map from plaid_account_id -> app_account_id for this item
      const accountMap = {}
      for (const acct of linkedAccounts) {
        accountMap[acct.plaid_account_id] = { app_account_id: acct.app_account_id }
      }

      // Upsert added + modified
      const toUpsert = [...added, ...modified]
        .filter((tx) => accountMap[tx.account_id])
        .map((tx) => ({
          plaid_account_id: tx.account_id,
          app_account_id: accountMap[tx.account_id].app_account_id,
          transaction_id: tx.transaction_id,
          date: tx.date,
          name: tx.name,
          amount: tx.amount,
          category: tx.personal_finance_category?.primary ?? tx.category?.[0] ?? null,
          status: tx.pending ? 'pending' : 'posted',
        }))

      if (toUpsert.length > 0) {
        await supabase.from('plaid_transactions').upsert(toUpsert, { onConflict: 'transaction_id' })
      }

      // Delete removed transactions
      if (removed.length > 0) {
        const removedIds = removed.map((r) => r.transaction_id)
        await supabase.from('plaid_transactions').delete().in('transaction_id', removedIds)
      }

      // Save updated cursor
      await supabase.from('plaid_items').update({ transactions_cursor: cursor }).eq('id', item.id)

      // Build account summary for response
      const accountSummary = linkedAccounts.map((acct) => {
        const balances = balanceMap[acct.plaid_account_id]
        let balance = null
        if (balances) {
          if (acct.app_account_type === 'investment') balance = balances.current
          else if (acct.app_account_type === 'checking') balance = balances.available ?? balances.current
          else balance = balances.current
        }
        return { name: acct.name, balance }
      })

      return {
        institution: institutionName,
        accounts: accountSummary,
        transactions_added: toUpsert.length,
      }
    } catch (err) {
      const message = err.response?.data?.error_message ?? err.message ?? 'Unknown error'
      return { institution: institutionName, error: message }
    }
  }))

  return res.status(200).json({ synced: results })
}
