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
 * Sends an email notification to the admin via Webhook / EmailJS / Resend endpoint.
 * Defaults to using Webhook endpoint or direct HTTP notification service.
 */
export async function sendOrderNotificationEmail(order: EmailOrderNotificationPayload): Promise<boolean> {
  const adminEmail = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL || 'zentra.techofficial@gmail.com';
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

  // 1. First try Resend API
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [adminEmail],
          subject: `🛒 New Cardanova Order #${order.orderNumber} - ₹${order.totalAmountInr}`,
          html: `
            <h2>New Cardanova Order #${order.orderNumber}</h2>
            <p><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmountInr}</p>
            <p><strong>UTR:</strong> ${order.upiReferenceUtr || 'Not entered'}</p>
            <p><strong>Address:</strong> ${order.shippingAddress}</p>
            <p><strong>Items:</strong></p>
            <pre>${order.itemsSummary}</pre>
          `,
        }),
      });
      if (response.ok) return true;
    } catch {
      // fallback to FormSubmit endpoint below
    }
  }

  // 2. Fallback: FormSubmit instant delivery endpoint (No domain verification needed)
  try {
    const formData = new FormData();
    formData.append('_subject', `🛒 New Cardanova Order #${order.orderNumber} - ₹${order.totalAmountInr}`);
    formData.append('Order Number', order.orderNumber);
    formData.append('Customer Name', order.customerName);
    formData.append('Customer Phone', order.customerPhone);
    formData.append('Amount Paid', `₹${order.totalAmountInr}`);
    formData.append('UPI UTR Reference', order.upiReferenceUtr || 'Not entered');
    formData.append('Shipping Address', order.shippingAddress);
    formData.append('Items Summary', order.itemsSummary);
    formData.append('_captcha', 'false');

    await fetch(`https://formsubmit.co/ajax/${adminEmail}`, {
      method: 'POST',
      body: formData,
    });
    return true;
  } catch (err) {
    console.error('[emailNotificationService] Email delivery failed:', err);
    return false;
  }
}
