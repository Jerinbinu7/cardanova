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

  // Dispatch via secure serverless endpoint /api/send-order-email (powered by RESEND_API_KEY on the server)
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        adminEmail,
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
    console.warn('[emailNotificationService] /api/send-order-email call failed:', err);
  }

  return false;
}

/**
 * Sends a cancellation notification email when a customer cancels an order.
 */
export async function sendCancellationEmail(order: EmailOrderNotificationPayload): Promise<boolean> {
  const adminEmail = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL || 'zentra.techofficial@gmail.com';

  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        adminEmail,
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
