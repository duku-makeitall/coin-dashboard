export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Bad request: Coin id parameter is required.' });
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: COINGECKO_API_KEY is not set.' });
  }

  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?` + new URLSearchParams({
    vs_currency: 'krw',
    days: '7'
  });

  try {
    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-cg-demo-api-key': apiKey
      }
    });

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ 
        error: `CoinGecko API returned status ${apiResponse.status}: ${apiResponse.statusText}` 
      });
    }

    const data = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching market chart from CoinGecko:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
