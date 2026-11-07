export interface EmailOrderNotificationPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  itemsSummary: string;
  totalAmountInr: number;
  upiReferenceUtr?: string;
}

/**
 * Sends order notification emails to BOTH the store admin and the customer.
 * Dispatches via /api/send-order-email endpoint powered by Resend.
 */
export async function sendOrderNotificationEmail(order: EmailOrderNotificationPayload): Promise<boolean> {
  const adminEmail = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL || 'zentra.techofficial@gmail.com';

  // 1. Primary: Serverless / dev endpoint /api/send-order-email
  try {
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        adminEmail,
        resendApiKey,
        isCancellation: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('[emailNotificationService] Email delivered successfully:', data);
        return true;
      }
      if (data.warning) {
        console.warn('[emailNotificationService]', data.warning);
      }
    }
  } catch (err) {
    console.warn('[emailNotificationService] /api/send-order-email call failed, attempting direct fallback:', err);
  }

  // 2. Direct fallback (if client-side VITE_RESEND_API_KEY is defined)
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Cardanova Orders <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `🛒 New Cardanova Order #${order.orderNumber} - ₹${order.totalAmountInr} (UTR: ${order.upiReferenceUtr || 'Pending'})`,
          html: `
            <h2>New Cardanova Order #${order.orderNumber}</h2>
            <p><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</p>
            ${order.customerEmail ? `<p><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
            <p><strong>Total Amount:</strong> ₹${order.totalAmountInr}</p>
            <p><strong>UTR:</strong> ${order.upiReferenceUtr || 'Not entered'}</p>
            <p><strong>Address:</strong> ${order.shippingAddress}</p>
            <p><strong>Items:</strong></p>
            <pre>${order.itemsSummary}</pre>
          `,
        }),
      });
      if (response.ok) return true;
    } catch { /* best effort */ }
  }

  return false;
}

/**
 * Sends a cancellation notification email when a customer cancels an order.
 */
export async function sendCancellationEmail(order: EmailOrderNotificationPayload): Promise<boolean> {
  const adminEmail = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL || 'zentra.techofficial@gmail.com';

  try {
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        adminEmail,
        resendApiKey,
        isCancellation: true,
      }),
    });

    if (response.ok) {
      return true;
    }
  } catch (err) {
    console.warn('[emailNotificationService] Cancellation email endpoint failed:', err);
  }

  return false;
}
