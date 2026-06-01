const https = require('https')

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

  try {
    const { access_token } = req.body ?? {}
    if (!access_token) return res.status(400).json({ error: 'access_token required' })

    const cert = Buffer.from((process.env.TELLER_CERT || '').replace(/\\n/g, '\n'), 'utf8')
    const key = Buffer.from((process.env.TELLER_KEY || '').replace(/\\n/g, '\n'), 'utf8')

    const accounts = await tellerGet('/accounts', access_token, cert, key)
    return res.status(200).json(accounts)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
