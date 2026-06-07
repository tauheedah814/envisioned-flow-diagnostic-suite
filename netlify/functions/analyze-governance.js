exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No prompt provided' }) };
    }

    const shortPrompt = prompt.split('Return ONLY valid JSON')[0] + `Return ONLY valid JSON with this exact structure (no markdown, no preamble):
{
  "maturity_level": "one of: Initial / Developing / Defined / Managed / Optimizing",
  "executive_summary": "2-3 sentence summary of governance posture",
  "strengths": ["strength 1", "strength 2"],
  "critical_gaps": ["gap 1", "gap 2"],
  "quick_wins": [
    {"title": "win title", "desc": "action completable in under 2 weeks"},
    {"title": "win title", "desc": "action completable in under 2 weeks"}
  ],
  "recommendations": [
    {"title": "rec title", "desc": "1-2 sentence description", "phase": "Envision/Architect/Automate/Amplify/Govern", "timeframe": "e.g. 30 days"},
    {"title": "rec title", "desc": "1-2 sentence description", "phase": "...", "timeframe": "..."}
  ],
  "uae_alignment": "1-2 sentences on UAE regulatory alignment"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: shortPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Anthropic API error:', response.status, errorText);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Anthropic API error', detail: errorText }),
      };
    }

    const data = await response.json();
    console.log('Response received successfully');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };

  } catch (err) {
    console.log('Function error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error', detail: err.message }),
    };
  }
};
