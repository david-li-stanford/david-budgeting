const { PlaidApi, PlaidEnvironments, Configuration } = require('plaid')

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: 'david' },
      client_name: "David's Budget",
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    })
    return res.status(200).json({ link_token: response.data.link_token })
  } catch (err) {
    const message = err.response?.data?.error_message ?? err.message ?? 'Failed to create link token'
    return res.status(500).json({ error: message })
  }
}
