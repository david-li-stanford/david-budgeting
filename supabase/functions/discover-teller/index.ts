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

    const rawCert = Deno.env.get('TELLER_CERT') ?? ''
    const rawKey = Deno.env.get('TELLER_KEY') ?? ''

    // Normalize Windows CRLF line endings that may have been introduced when setting secrets
    const cert = rawCert.replace(/\r\n/g, '\n').trim()
    const key = rawKey.replace(/\r\n/g, '\n').trim()

    console.log('cert starts with:', cert.slice(0, 30))
    console.log('key starts with:', key.slice(0, 30))

    const tellerClient = Deno.createHttpClient({ certChain: cert, privateKey: key })

    const res = await fetch('https://api.teller.io/accounts', {
      client: tellerClient,
      headers: { Authorization: `Basic ${btoa(access_token + ':')}` },
    })

    console.log('teller response status:', res.status)
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('discover-teller error:', err)
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
