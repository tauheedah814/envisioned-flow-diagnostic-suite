exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { name, email, organization, role, score, maturity_level, report_html, assessment_type } = payload;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Envisioned Flow™ <reports@envisionedflow.com>',
        to: [process.env.REPORT_RECIPIENT_EMAIL],
        subject: `New ${assessment_type} Lead — ${name} (${organization}) — Score: ${score}/100`,
        html: `
          <div style="font-family:'DM Sans',Arial,sans-serif;max-width:700px;margin:0 auto;background:#0A0A0A;color:#ffffff;border-radius:8px;overflow:hidden;">
            <div style="background:#0A0A0A;padding:32px 40px;border-bottom:1px solid rgba(196,163,90,0.3);">
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C4A35A;margin-bottom:8px;">${assessment_type}</div>
              <h1 style="font-size:24px;font-weight:700;margin:0;color:#ffffff;">New Assessment Lead</h1>
            </div>
            <div style="padding:32px 40px;background:#111111;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
                <tr><td style="padding:8px 0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;width:120px;">Name</td><td style="padding:8px 0;font-size:15px;color:#ffffff;font-weight:500;">${name}</td></tr>
                <tr><td style="padding:8px 0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:8px 0;font-size:15px;color:#C4A35A;"><a href="mailto:${email}" style="color:#C4A35A;">${email}</a></td></tr>
                <tr><td style="padding:8px 0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;">Organization</td><td style="padding:8px 0;font-size:15px;color:#ffffff;">${organization || '—'}</td></tr>
                <tr><td style="padding:8px 0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;">Role</td><td style="padding:8px 0;font-size:15px;color:#ffffff;">${role || '—'}</td></tr>
                <tr><td style="padding:8px 0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;">Score</td><td style="padding:8px 0;font-size:22px;color:#C4A35A;font-weight:700;">${score}/100</td></tr>
                <tr><td style="padding:8px 0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;">Maturity</td><td style="padding:8px 0;font-size:15px;color:#ffffff;">${maturity_level}</td></tr>
              </table>
              <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:28px;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:16px;">Full Report</div>
                ${report_html}
              </div>
            </div>
            <div style="padding:20px 40px;background:#0A0A0A;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.25);">
              Envisioned Flow™ · Biztech Consulting FZ-LLC · Dubai, UAE
            </div>
          </div>
        `,
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
