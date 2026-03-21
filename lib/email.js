import nodemailer from 'nodemailer';
import { formatCurrency } from '@/lib/utils';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendTicketConfirmationEmail({ to, customerName, eventName, eventDate, eventVenue, tickets, orderNumber, totalAmount, qrCodeDataUrls }) {
  const formattedAmount = formatCurrency(totalAmount);
  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) : 'TBA';

  const ticketRows = tickets.map((ticket, i) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${ticket.categoryName}</strong>
        <br><span style="color: #6b7280; font-size: 13px;">Ticket #${ticket.ticketNumber}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <img src="cid:qr-${i}" alt="QR Code" width="150" height="150" style="border: 1px solid #e5e7eb; border-radius: 8px;" />
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Tickets</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #6d28d9 0%, #ec4899 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Your Tickets Are Confirmed!
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                ${eventName}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                Hey${customerName ? ` ${customerName}` : ''},
              </p>
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px;">
                Your tickets for <strong>${eventName}</strong> have been confirmed. Please present the QR code(s) below at the venue entrance.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Order</td>
                        <td style="color: #111827; font-size: 14px; text-align: right; padding-bottom: 8px;">#${orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Date</td>
                        <td style="color: #111827; font-size: 14px; text-align: right; padding-bottom: 8px;">${formattedDate}</td>
                      </tr>
                      ${eventVenue ? `<tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Venue</td>
                        <td style="color: #111827; font-size: 14px; text-align: right; padding-bottom: 8px;">${eventVenue}</td>
                      </tr>` : ''}
                      <tr>
                        <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 8px;"></td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Total</td>
                        <td style="color: #111827; font-size: 14px; text-align: right; font-weight: 600;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h2 style="color: #1f2937; font-size: 18px; margin: 24px 0 16px;">Your Tickets</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 13px; font-weight: 600;">TICKET</th>
                  <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 13px; font-weight: 600;">QR CODE</th>
                </tr>
                ${ticketRows}
              </table>
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">
                Each QR code is unique and can only be scanned once at entry. Please do not share your QR codes.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          Powered by <a href="https://tippytix.app" style="color: #6d28d9; text-decoration: none;">TippyTix</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const attachments = (qrCodeDataUrls || []).map((dataUrl, i) => ({
    filename: `ticket-qr-${i + 1}.png`,
    content: dataUrl.split(',')[1],
    encoding: 'base64',
    cid: `qr-${i}`,
  }));

  try {
    const info = await transporter.sendMail({
      from: `"TippyTix" <${process.env.EMAIL_FROM || 'noreply@tippytix.app'}>`,
      to,
      subject: `Your tickets for ${eventName} - Order #${orderNumber}`,
      html,
      attachments,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Failed to send ticket email:', {
      error: error.message,
      to,
    });
    return { success: false, error };
  }
}

export async function sendRefundConfirmationEmail({ to, customerName, eventName, orderNumber, refundAmount, originalAmount }) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6d28d9, #ec4899); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #fff; font-size: 22px;">Refund Processed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p>Hey${customerName ? ` ${customerName}` : ''},</p>
              <p>Your refund for <strong>${eventName}</strong> (Order #${orderNumber}) has been processed.</p>
              <table width="100%" style="background: #f9fafb; border-radius: 8px; margin: 20px 0;">
                <tr><td style="padding: 16px;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Original Amount: ${formatCurrency(originalAmount)}</p>
                  <p style="margin: 8px 0 0; color: #111827; font-size: 18px; font-weight: 600;">Refund: ${formatCurrency(refundAmount)}</p>
                </td></tr>
              </table>
              <p style="color: #6b7280; font-size: 14px;">Please allow 5-10 business days for the refund to appear on your statement.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"TippyTix" <${process.env.EMAIL_FROM || 'noreply@tippytix.app'}>`,
      to,
      subject: `Refund processed - ${eventName} (Order #${orderNumber})`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Failed to send refund email:', error.message);
    return { success: false, error };
  }
}
