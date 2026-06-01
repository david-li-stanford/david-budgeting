const { PlaidApi, PlaidEnvironments, Configuration } = require('plaid')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rlforrddajmuhyqnstzt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-Vkg0FMcLtsCt78fFkRfTw_6drAt2Yh'

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

  const { public_token, institution, accounts } = req.body

  if (!public_token) return res.status(400).json({ error: 'Missing public_token' })

  const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'production'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })

  const plaid = new PlaidApi(config)

  try {
    const exchangeResponse = await plaid.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = exchangeResponse.data

    // Insert plaid_item
    const { data: plaidItem, error: itemError } = await supabase
      .from('plaid_items')
      .insert({
        item_id,
        access_token,
        institution_id: institution.institution_id,
        institution_name: institution.name,
      })
      .select()
      .single()

    if (itemError) return res.status(500).json({ error: itemError.message })

    // Insert linked accounts (only those with a non-empty app_account_id)
    const accountsToInsert = (accounts ?? []).filter((a) => a.app_account_id)
    if (accountsToInsert.length > 0) {
      const { error: acctError } = await supabase.from('plaid_accounts').insert(
        accountsToInsert.map((a) => ({
          plaid_item_id: plaidItem.id,
          plaid_account_id: a.plaid_account_id,
          name: a.name,
          type: a.type,
          subtype: a.subtype,
          mask: a.mask,
          app_account_id: a.app_account_id,
          app_account_type: a.app_account_type,
        }))
      )
      if (acctError) return res.status(500).json({ error: acctError.message })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    const message = err.response?.data?.error_message ?? err.message ?? 'Token exchange failed'
    return res.status(500).json({ error: message })
  }
}
