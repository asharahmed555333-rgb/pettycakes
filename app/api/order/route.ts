import { cakes } from '@/lib/cakes';

const MAX_BODY_LENGTH = 12_000;

function text(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
  })[character] || character);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_LENGTH) return Response.json({ message: 'That order is too large to send.' }, { status: 413 });
    const body = JSON.parse(raw) as Record<string, unknown>;

    if (text(body.website)) return Response.json({ message: 'Order received.' });

    const cakeId = text(body.cake, 60);
    const cake = cakes.find((item) => item.id === cakeId);
    const quantity = Number(body.quantity);
    const fullName = text(body.fullName, 100);
    const email = text(body.email, 160);
    const phone = text(body.phone, 40);
    const orderDate = text(body.orderDate, 20);
    const details = text(body.details, 1500);
    const today = new Date().toISOString().slice(0, 10);

    if (!cake || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !fullName || !isValidEmail(email) || !phone || !/^\d{4}-\d{2}-\d{2}$/.test(orderDate) || orderDate < today) {
      return Response.json({ message: 'Please check the required fields and try again.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.ORDER_NOTIFICATION_EMAIL;
    const sender = process.env.ORDER_FROM_EMAIL;
    if (!apiKey || !recipient || !sender) {
      return Response.json({ message: 'Ordering notifications are being configured. Please try again shortly.' }, { status: 503 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: `New PettyCakes order — ${cake.name} for ${fullName}`,
        html: `
          <div style="font-family:Arial,sans-serif;color:#222;line-height:1.6;max-width:640px">
            <h1 style="color:#e92269">New PettyCakes order</h1>
            <p><strong>Cake:</strong> ${escapeHtml(cake.name)}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Preferred date:</strong> ${escapeHtml(orderDate)}</p>
            <p><strong>Customer:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Customization:</strong><br>${escapeHtml(details || 'None provided').replace(/\n/g, '<br>')}</p>
          </div>`,
      }),
    });

    if (!response.ok) {
      console.error('Resend rejected order notification', response.status, await response.text());
      return Response.json({ message: 'We could not send your order right now. Please try again.' }, { status: 502 });
    }

    return Response.json({ message: 'Thank you! Your order has been sent to the PettyCakes team.' });
  } catch (error) {
    console.error('Order submission failed', error);
    return Response.json({ message: 'We could not send your order right now. Please try again.' }, { status: 500 });
  }
}
