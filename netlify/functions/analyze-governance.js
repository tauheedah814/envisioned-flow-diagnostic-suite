exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No prompt provided' }) };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Anthropic API error:', response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Anthropic API error', detail: errorText }),
      };
    }

    const data = await response.json();
    console.log('Response received successfully');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (err) {
    console.log('Function error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', detail: err.message }),
    };
  }
};
