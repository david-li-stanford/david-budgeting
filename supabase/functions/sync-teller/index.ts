import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const auth = req.headers.get('Authorization')
    if (!auth) return new Response('Unauthorized', { status: 401, headers: cors })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401, headers: cors })

    const tellerClient = Deno.createHttpClient({
      certChain: Deno.env.get('TELLER_CERT')!,
      privateKey: Deno.env.get('TELLER_KEY')!,
    })

    const { data: enrollments } = await supabase
      .from('teller_enrollments')
      .select('*')
      .not('app_account_id', 'is', null)

    const results = []

    for (const e of enrollments ?? []) {
      const headers = { Authorization: `Basic ${btoa(e.access_token + ':')}` }

      const balRes = await fetch(
        `https://api.teller.io/accounts/${e.teller_account_id}/balances`,
        { client: tellerClient, headers }
      )
      if (!balRes.ok) {
        results.push({ account: e.account_name, error: `Balance fetch failed (${balRes.status})` })
        continue
      }

      const bal = await balRes.json()
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
        const txRes = await fetch(
          `https://api.teller.io/accounts/${e.teller_account_id}/transactions`,
          { client: tellerClient, headers }
        )
        if (txRes.ok) {
          const txs = await txRes.json()
          if (Array.isArray(txs) && txs.length > 0) {
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
      }

      await supabase.from('teller_enrollments')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', e.id)

      results.push({ account: e.account_name, balance, institution: e.institution })
    }

    return new Response(JSON.stringify({ synced: results }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
