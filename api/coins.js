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

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: COINGECKO_API_KEY is not set.' });
  }

  const url = 'https://api.coingecko.com/api/v3/coins/markets?' + new URLSearchParams({
    vs_currency: 'krw',
    order: 'market_cap_desc',
    per_page: '50',
    page: '1',
    sparkline: 'true',
    price_change_percentage: '1h,24h,7d'
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
    console.error('Error fetching data from CoinGecko:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
