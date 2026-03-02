import { Resend } from 'resend';
import { config } from '../config.js';
import type { Order, OrderItem } from './shopHelpers.js';

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!config.resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(config.resendApiKey);
  }
  return resend;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function buildItemsHtml(items: OrderItem[]): string {
  return items
    .map((item) => {
      const snap = item.product_snapshot;
      const variant = [snap.size, snap.color].filter(Boolean).join(' / ');
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">
            ${snap.name}${variant ? ` <span style="color:#888;font-size:13px;">(${variant})</span>` : ''}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.unit_price_cents)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.unit_price_cents * item.quantity)}</td>
        </tr>`;
    })
    .join('');
}

function buildOrderEmailHtml(order: Order): string {
  const addr = order.shipping_address;
  const items = order.order_items || [];

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Inter,Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Show Stoppers Academy</h1>
      <p style="color:#fecaca;margin:8px 0 0;font-size:15px;">Order Confirmation</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="font-size:16px;color:#111;">Hi ${order.customer_name},</p>
      <p style="color:#444;line-height:1.6;">
        Thank you for your order! We've received your purchase and will start preparing it for shipment.
        You'll receive another email once your order ships with tracking information.
      </p>

      <div style="background:#fef2f2;border-radius:8px;padding:16px 20px;margin:24px 0;">
        <p style="margin:0;font-size:13px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Order ID</p>
        <p style="margin:4px 0 0;font-size:14px;font-family:monospace;color:#dc2626;">${order.id}</p>
      </div>

      <!-- Items table -->
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;font-weight:600;">Item</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;font-weight:600;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;font-weight:600;">Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;font-weight:600;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsHtml(items)}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top:2px solid #f0f0f0;padding-top:16px;text-align:right;">
        <p style="margin:4px 0;color:#555;font-size:14px;">Subtotal: <strong>${formatCents(order.subtotal_cents)}</strong></p>
        ${order.discount_cents > 0 ? `<p style="margin:4px 0;color:#16a34a;font-size:14px;">Discount: <strong>-${formatCents(order.discount_cents)}</strong></p>` : ''}
        <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#111;">Total: ${formatCents(order.total_cents)}</p>
      </div>

      <!-- Shipping address -->
      <div style="margin-top:28px;padding:20px;background:#f9fafb;border-radius:8px;">
        <p style="margin:0 0 8px;font-weight:600;color:#111;">Shipping To:</p>
        <p style="margin:0;color:#555;line-height:1.7;font-size:14px;">
          ${order.customer_name}<br>
          ${addr.line1}${addr.line2 ? '<br>' + addr.line2 : ''}<br>
          ${addr.city}, ${addr.state} ${addr.postal_code}<br>
          ${addr.country}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:13px;color:#888;">
        Questions? Email us at <a href="mailto:info@showstoppersacademy.org" style="color:#dc2626;">info@showstoppersacademy.org</a>
      </p>
      <p style="margin:6px 0 0;font-size:12px;color:#aaa;">Show Stoppers Academy</p>
    </div>
  </div>
</body>
</html>`;
}

function buildAdminNotificationHtml(order: Order): string {
  const addr = order.shipping_address;
  const items = order.order_items || [];

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;padding:20px;">
  <h2 style="color:#dc2626;">New Shop Order Received</h2>
  <p><strong>Order ID:</strong> ${order.id}</p>
  <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
  <p><strong>Total:</strong> $${(order.total_cents / 100).toFixed(2)}</p>
  <p><strong>Ship to:</strong><br>
    ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}<br>
    ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country}
  </p>
  <h3>Items:</h3>
  <ul>
    ${items
      .map((item) => {
        const snap = item.product_snapshot;
        const variant = [snap.size, snap.color].filter(Boolean).join(' / ');
        return `<li>${snap.name}${variant ? ` (${variant})` : ''} × ${item.quantity} @ $${(item.unit_price_cents / 100).toFixed(2)}</li>`;
      })
      .join('')}
  </ul>
  <p style="margin-top:20px;">
    <a href="https://showstoppersacademy.org/shop-admin.html" style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
      View in Admin Dashboard
    </a>
  </p>
</body>
</html>`;
}

export async function sendOrderConfirmation(order: Order): Promise<void> {
  if (!config.resendApiKey) {
    console.warn('Email not sent: RESEND_API_KEY not configured');
    return;
  }

  try {
    await getResend().emails.send({
      from: 'Show Stoppers Academy <orders@showstoppersacademy.org>',
      to: order.customer_email,
      subject: `Order Confirmation #${order.id.slice(0, 8).toUpperCase()}`,
      html: buildOrderEmailHtml(order),
    });
    console.log(`Order confirmation sent to ${order.customer_email}`);
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }
}

export async function sendAdminOrderAlert(order: Order): Promise<void> {
  if (!config.resendApiKey || !config.adminEmail) {
    console.warn('Admin alert not sent: RESEND_API_KEY or ADMIN_EMAIL not configured');
    return;
  }

  try {
    await getResend().emails.send({
      from: 'Show Stoppers Academy Shop <orders@showstoppersacademy.org>',
      to: config.adminEmail,
      subject: `New Order: ${order.customer_name} — $${(order.total_cents / 100).toFixed(2)}`,
      html: buildAdminNotificationHtml(order),
    });
    console.log(`Admin order alert sent to ${config.adminEmail}`);
  } catch (err) {
    console.error('Failed to send admin order alert:', err);
  }
}
