const { getStore } = require("@netlify/blobs");

exports.handler = async function(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const jobId = event.queryStringParameters?.jobId;
    if (!jobId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No jobId provided' }) };
    }

    const store = getStore('governance-reports');
    const result = await store.get(jobId, { type: 'json' });

    if (!result) {
      return { statusCode: 404, headers, body: JSON.stringify({ status: 'not_found' }) };
    }

    // Clean up completed or errored jobs
    if (result.status === 'complete' || result.status === 'error') {
      await store.delete(jobId);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', detail: err.message }),
    };
  }
};
