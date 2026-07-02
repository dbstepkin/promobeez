export const config = { runtime: 'edge' };

const WEBHOOK = 'https://app.karhuno.com/webhook/pb-waitlist';

function emailHtml(data) {
  const firstName = (data.name || 'there').split(' ')[0];
  const isBusiness = data.type === 'business';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>You're on the Promobeez waitlist!</title>
</head>
<body style="margin:0;padding:0;background:#FDF9F3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF9F3;padding:40px 0;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td align="center" style="background:linear-gradient(135deg,#FFF8EC 0%,#FFF0F8 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;border:1px solid rgba(255,154,61,.18);border-bottom:none;">
            <!-- Bee logo -->
            <svg width="64" height="80" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <defs>
                <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#FFD84D"/>
                  <stop offset="1" stop-color="#FF9E1B"/>
                </linearGradient>
              </defs>
              <!-- antennae -->
              <path d="M28 22 C23 10 17 6 12 8" stroke="#100D1A" stroke-width="3.5" stroke-linecap="round" fill="none"/>
              <path d="M36 22 C41 10 47 6 52 8" stroke="#100D1A" stroke-width="3.5" stroke-linecap="round" fill="none"/>
              <circle cx="10" cy="7" r="5" fill="#FF5A3C"/>
              <circle cx="54" cy="7" r="5" fill="#FF5A3C"/>
              <!-- wings -->
              <ellipse cx="13" cy="40" rx="16" ry="10" fill="#fff" fill-opacity=".9" stroke="#100D1A" stroke-width="3"/>
              <ellipse cx="51" cy="40" rx="16" ry="10" fill="#fff" fill-opacity=".9" stroke="#100D1A" stroke-width="3"/>
              <!-- body -->
              <rect x="20" y="24" width="24" height="38" rx="12" fill="url(#b)" stroke="#100D1A" stroke-width="3.5"/>
              <!-- stripes -->
              <rect x="18" y="40" width="28" height="7" fill="#100D1A"/>
              <rect x="18" y="52" width="28" height="7" fill="#100D1A"/>
            </svg>
            <!-- Wordmark -->
            <div style="font-size:28px;font-weight:800;letter-spacing:-1px;color:#100D1A;line-height:1;">
              Promo<span style="color:#FF9E1B;">beez</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;border:1px solid rgba(255,154,61,.18);border-top:none;border-bottom:none;padding:40px 40px 32px;">
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#100D1A;line-height:1.2;">
              You're in, ${firstName}! 🐝
            </h1>
            <p style="margin:0 0 24px;font-size:16px;color:#4A4460;line-height:1.65;">
              ${isBusiness
                ? `We've added <strong>${data.business_name || 'your business'}</strong> to the Promobeez waitlist. We're building something special for local businesses and creators — no fees, no cash, just real barter collabs.`
                : `We've added your creator profile to the Promobeez waitlist. We're building the go-to place for local creators to land barter deals with businesses in their city.`
              }
            </p>

            <!-- Highlight box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#FFF8EC,#FFF0F8);border:1.5px solid rgba(255,154,61,.3);border-radius:14px;padding:20px 24px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#FF9E1B;letter-spacing:.8px;text-transform:uppercase;">What happens next</p>
                  <p style="margin:0;font-size:15px;color:#4A4460;line-height:1.6;">
                    We're launching in <strong style="color:#100D1A;">late August 2025</strong>. You'll be among the first to get access — we'll reach out personally before the public launch. 🚀
                  </p>
                </td>
              </tr>
            </table>

            <!-- 3 pills row -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td width="33%" align="center" style="padding:4px;">
                  <div style="background:#FFF1EC;border:1.5px solid #FFCABB;border-radius:12px;padding:12px 8px;font-size:13px;font-weight:700;color:#FF5A3C;text-align:center;">
                    🍕<br>Barter-first
                  </div>
                </td>
                <td width="33%" align="center" style="padding:4px;">
                  <div style="background:#F3F0FF;border:1.5px solid #D4CBFF;border-radius:12px;padding:12px 8px;font-size:13px;font-weight:700;color:#7C3AED;text-align:center;">
                    📍<br>Local audience
                  </div>
                </td>
                <td width="33%" align="center" style="padding:4px;">
                  <div style="background:#EDFDF7;border:1.5px solid #BBEDD9;border-radius:12px;padding:12px 8px;font-size:13px;font-weight:700;color:#0D9B6C;text-align:center;">
                    ✨<br>0% commission
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:15px;color:#4A4460;line-height:1.65;">
              Questions? Just reply to this email — we read every message.<br>
              <strong style="color:#100D1A;">— Dima & the Promobeez team</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="background:#F5F0E8;border:1px solid rgba(255,154,61,.18);border-top:none;border-radius:0 0 20px 20px;padding:24px 40px;">
            <p style="margin:0 0 6px;font-size:13px;color:#9990B0;">
              Made in Helsinki 🇫🇮 · <a href="https://promobeez.com" style="color:#FF9E1B;text-decoration:none;">promobeez.com</a>
            </p>
            <p style="margin:0;font-size:12px;color:#B8B0CC;">
              You're receiving this because you signed up at promobeez.com
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = data.email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Forward to webhook (fire-and-forget, don't fail user if this errors)
  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch { /* non-fatal */ }

  // 2. Send confirmation email via Resend
  const firstName = (data.name || 'there').split(' ')[0];
  const subject = data.type === 'business'
    ? `${firstName}, you're on the Promobeez waitlist! 🐝`
    : `${firstName}, your spot is saved! 🐝`;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Promobeez <team@promobeez.com>',
      to: [email],
      subject,
      html: emailHtml(data),
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error('Resend error:', err);
    // Still return success to user — they signed up, even if email failed
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
