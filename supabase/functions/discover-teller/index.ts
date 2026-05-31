import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { access_token } = await req.json()
    if (!access_token) return new Response('access_token required', { status: 400, headers: cors })

    const tellerClient = Deno.createHttpClient({
      certChain: Deno.env.get('TELLER_CERT')!,
      privateKey: Deno.env.get('TELLER_KEY')!,
    })

    const res = await fetch('https://api.teller.io/accounts', {
      client: tellerClient,
      headers: { Authorization: `Basic ${btoa(access_token + ':')}` },
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
