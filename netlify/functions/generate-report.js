const { getStore } = require("@netlify/blobs");

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

    const jobId = `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const store = getStore('governance-reports');
    await store.setJSON(jobId, { status: 'pending' });

    // Fire Anthropic API call asynchronously — do not await
    (async () => {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          await store.setJSON(jobId, { status: 'error', error: err });
          return;
        }

        const data = await response.json();
        await store.setJSON(jobId, { status: 'complete', data });
      } catch (err) {
        await store.setJSON(jobId, { status: 'error', error: err.message });
      }
    })();

    return {
      statusCode: 202,
      headers,
      body: JSON.stringify({ jobId }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', detail: err.message }),
    };
  }
};
