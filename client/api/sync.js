const https = require('https')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rlforrddajmuhyqnstzt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-Vkg0FMcLtsCt78fFkRfTw_6drAt2Yh'

function tellerGet(path, accessToken, cert, key) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.teller.io',
      path,
      method: 'GET',
      cert,
      key,
      headers: {
        Authorization: 'Basic ' + Buffer.from(accessToken + ':').toString('base64'),
      },
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error('Failed to parse: ' + data)) }
      })
    })
    req.on('error', reject)
    req.end()
  })
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

  const cert = Buffer.from((process.env.TELLER_CERT || '').replace(/\\n/g, '\n'), 'utf8')
  const key = Buffer.from((process.env.TELLER_KEY || '').replace(/\\n/g, '\n'), 'utf8')

  const { data: enrollments, error: enrollError } = await supabase
    .from('teller_enrollments')
    .select('*')
    .not('app_account_id', 'is', null)

  if (enrollError) return res.status(500).json({ error: enrollError.message })

  const results = await Promise.all((enrollments ?? []).map(async (e) => {
    try {
      const bal = await tellerGet(`/accounts/${e.teller_account_id}/balances`, e.access_token, cert, key)
      if (bal.error) return { account: e.account_name, error: bal.error?.message ?? JSON.stringify(bal.error) }

      const balance = parseFloat(
        e.app_account_type === 'credit'
          ? (bal.ledger ?? bal.available ?? 0)
          : (bal.available ?? bal.ledger ?? 0)
      )

      const table = e.app_account_type === 'checking' ? 'checkingAccounts'
        : e.app_account_type === 'investment' ? 'investmentAccounts'
        : 'creditAccounts'

      await supabase.from(table).update({ balance }).eq('id', e.app_account_id)

      if (e.app_account_type !== 'investment') {
        const txs = await tellerGet(`/accounts/${e.teller_account_id}/transactions`, e.access_token, cert, key)
        if (Array.isArray(txs)) {
          await supabase.from('teller_transactions').upsert(
            txs.map((tx) => ({
              id: tx.id,
              teller_account_id: e.teller_account_id,
              app_account_id: e.app_account_id,
              app_account_type: e.app_account_type,
              date: tx.date,
              description: tx.description,
              amount: parseFloat(tx.amount),
              type: tx.type,
              status: tx.status,
              category: tx.details?.category ?? null,
              user_id: user.id,
            })),
            { onConflict: 'id', ignoreDuplicates: true }
          )
        }
      }

      await supabase.from('teller_enrollments')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', e.id)

      return { account: e.account_name, balance, institution: e.institution }
    } catch (err) {
      return { account: e.account_name, error: err.message }
    }
  }))

  return res.status(200).json({ synced: results })
}
