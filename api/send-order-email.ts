export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = req.body || {};
  const {
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    itemsSummary,
    totalAmountInr,
    upiReferenceUtr,
    isCancellation = false,
  } = payload;

  const resendApiKey =
    payload.resendApiKey ||
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    '';
  const adminEmail =
    payload.adminEmail ||
    process.env.VITE_ADMIN_NOTIFICATION_EMAIL ||
    'zentra.techofficial@gmail.com';

  if (!resendApiKey) {
    console.warn('[api/send-order-email] RESEND_API_KEY is not configured in environment variables.');
    res.status(200).json({
      success: false,
      warning: 'RESEND_API_KEY is not set in environment variables. Please add RESEND_API_KEY=re_... in .env to enable email delivery.',
    });
    return;
  }

  const results = { adminSent: false, customerSent: false, errors: [] as string[] };

  // 1. Email to Store Admin
  try {
    const adminSubject = isCancellation
      ? `❌ Order CANCELLED #${orderNumber} — ${customerName}`
      : `🛒 New Cardanova Order #${orderNumber} - ₹${totalAmountInr} (UTR: ${upiReferenceUtr || 'Pending'})`;

    const adminHtml = isCancellation ? `
      <!DOCTYPE html>
      <html>
      <body style="font-family:sans-serif;background:#FAF8F5;padding:24px;color:#112D15;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E0D8;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);padding:24px;">
          <div style="background:#dc2626;color:#fff;padding:12px 18px;border-radius:8px;font-size:16px;font-weight:700;">
            ❌ Order Cancelled by Customer — #${orderNumber}
          </div>
          <p style="margin-top:16px;"><strong>Customer:</strong> ${customerName} (${customerPhone})</p>
          ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
          <p><strong>Total Amount:</strong> ₹${totalAmountInr}</p>
          <p><strong>UPI Ref / UTR:</strong> ${upiReferenceUtr || 'Not provided'}</p>
          <p><strong>Delivery Address:</strong> ${shippingAddress}</p>
          <p><strong>Items:</strong></p>
          <pre style="background:#F7F5F0;padding:12px;border-radius:8px;font-size:13px;">${itemsSummary}</pre>
          <p style="color:#666;font-size:12px;">The customer marked this order as cancelled from the website checkout. If payment was made, please verify and process any necessary refund.</p>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; color: #112D15; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E5E0D8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #112D15; color: #FAF8F5; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; color: #C5A046; letter-spacing: 0.05em; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #FAF8F5; opacity: 0.85; }
          .content { padding: 24px; }
          .badge-box { background: #FBF7EE; border: 1px solid #C5A046; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
          .badge-title { font-size: 11px; text-transform: uppercase; color: #8A6E27; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 4px; }
          .badge-utr { font-family: monospace; font-size: 17px; font-weight: 700; color: #112D15; letter-spacing: 0.04em; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #112D15; border-bottom: 2px solid #E5E0D8; padding-bottom: 6px; margin: 20px 0 12px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
          .info-label { color: #666; }
          .info-val { font-weight: 600; color: #112D15; text-align: right; }
          .items-box { background: #F7F5F0; border-radius: 8px; padding: 12px 16px; font-size: 13px; font-family: monospace; line-height: 1.6; white-space: pre-wrap; color: #222; }
          .footer { background: #F3EFEA; padding: 16px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #E5E0D8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CARDANOVA SPICES — NEW ORDER</h1>
            <p>Order Reference: <strong>#${orderNumber}</strong></p>
          </div>
          <div class="content">
            <div class="badge-box">
              <div class="badge-title">UPI Reference / UTR Number</div>
              <div class="badge-utr">${upiReferenceUtr || 'NOT PROVIDED'}</div>
              <p style="margin:6px 0 0;font-size:11px;color:#777;">Verify this UTR & ₹${totalAmountInr} in your bank / UPI app (GPay / PhonePe / ICICI Bank) before dispatching.</p>
            </div>

            <div class="section-title">Customer & Shipping Details</div>
            <div class="info-row"><span class="info-label">Customer Name:</span><span class="info-val">${customerName}</span></div>
            <div class="info-row"><span class="info-label">Phone / WhatsApp:</span><span class="info-val">${customerPhone}</span></div>
            ${customerEmail ? `<div class="info-row"><span class="info-label">Email:</span><span class="info-val">${customerEmail}</span></div>` : ''}
            <div class="info-row"><span class="info-label">Shipping Address:</span><span class="info-val">${shippingAddress}</span></div>
            <div class="info-row"><span class="info-label">Amount Paid:</span><span class="info-val" style="color:#059669;font-size:16px;">₹${totalAmountInr}</span></div>

            <div class="section-title">Ordered Spice Packets</div>
            <div class="items-box">${itemsSummary}</div>
          </div>
          <div class="footer">
            Cardanova Spices LLP • Vandanmedu, Idukki District, Kerala - 685 533<br>
            Manage orders at your Cardanova Admin Portal.
          </div>
        </div>
      </body>
      </html>
    `;

    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cardanova Orders <onboarding@resend.dev>',
        to: [adminEmail],
        subject: adminSubject,
        html: adminHtml,
      }),
    });

    if (adminRes.ok) {
      results.adminSent = true;
    } else {
      const err = await adminRes.text();
      console.error('[send-order-email] Admin email error:', err);
      results.errors.push(`Admin email: ${err}`);
    }
  } catch (err: any) {
    console.error('[send-order-email] Admin email exception:', err);
    results.errors.push(`Admin email: ${err.message}`);
  }

  // 2. Email to Customer (if customer email was provided)
  if (customerEmail && customerEmail.includes('@')) {
    try {
      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; color: #112D15; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E5E0D8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: #112D15; color: #FAF8F5; padding: 28px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #C5A046; }
            .header p { margin: 8px 0 0; font-size: 13px; color: #FAF8F5; opacity: 0.9; }
            .content { padding: 24px; }
            .welcome { font-size: 16px; font-weight: 600; color: #112D15; margin-bottom: 8px; }
            .order-pill { background: #F3EFEA; border: 1px solid #C5A046; border-radius: 8px; padding: 14px 18px; margin: 16px 0; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #112D15; border-bottom: 2px solid #E5E0D8; padding-bottom: 6px; margin: 20px 0 12px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
            .info-label { color: #666; }
            .info-val { font-weight: 600; color: #112D15; }
            .items-box { background: #F7F5F0; border-radius: 8px; padding: 12px 16px; font-size: 13px; font-family: monospace; line-height: 1.6; white-space: pre-wrap; color: #222; }
            .support-box { background: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 14px; margin-top: 20px; text-align: center; font-size: 13px; color: #065F46; }
            .footer { background: #F3EFEA; padding: 16px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #E5E0D8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CARDANOVA SPICES</h1>
              <p>Fresh Single-Origin Green Cardamom • Idukki, Kerala</p>
            </div>
            <div class="content">
              <div class="welcome">Thank you for your order, ${customerName}!</div>
              <p style="font-size:13px;color:#555;line-height:1.5;margin-top:0;">
                We have received your UPI payment details. Your authentic GI-tagged Idukki cardamom order is now queued for careful packing and dispatch.
              </p>

              <div class="order-pill">
                <div style="font-size:11px;color:#8A6E27;font-weight:700;text-transform:uppercase;">Order Summary</div>
                <div style="font-size:15px;font-weight:700;margin-top:3px;">Order #${orderNumber}</div>
                <div style="font-size:13px;color:#555;margin-top:4px;">Amount: <strong>₹${totalAmountInr}</strong> | UPI Ref: <strong style="font-family:monospace;">${upiReferenceUtr || 'N/A'}</strong></div>
              </div>

              <div class="section-title">Delivery Address</div>
              <p style="font-size:13px;color:#333;margin:4px 0 16px;line-height:1.5;">${shippingAddress}</p>

              <div class="section-title">Items Ordered</div>
              <div class="items-box">${itemsSummary}</div>

              <div class="support-box">
                Need tracking updates or have questions? Contact us anytime on WhatsApp at <strong>+91 9656866090</strong> with Order #${orderNumber}.
              </div>
            </div>
            <div class="footer">
              Cardanova Spices LLP • Vandanmedu, Idukki District, Kerala - 685 533<br>
              Direct from the Plantation to Your Doorstep.
            </div>
          </div>
        </body>
        </html>
      `;

      const customerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Cardanova Spices <onboarding@resend.dev>',
          to: [customerEmail],
          subject: `🌿 Your Cardanova Spice Order #${orderNumber} is Confirmed!`,
          html: customerHtml,
        }),
      });

      if (customerRes.ok) {
        results.customerSent = true;
      } else {
        const err = await customerRes.text();
        console.error('[send-order-email] Customer email error:', err);
        results.errors.push(`Customer email: ${err}`);
      }
    } catch (err: any) {
      console.error('[send-order-email] Customer email exception:', err);
      results.errors.push(`Customer email: ${err.message}`);
    }
  }

  res.status(200).json({
    success: results.adminSent || results.customerSent,
    results,
  });
}
