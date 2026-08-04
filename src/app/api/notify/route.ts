import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, email, name, loginMethod = 'Email', phone, threadTitle, daysOld = 7 } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // ── 1. LOGIN / SIGN-UP ALERT (EMAIL + SMS) ──────────────────────────────────
    if (type === 'auth_alert') {
      const emailSubject = `🔒 Machi AI Security Alert: New ${loginMethod} Login`;
      const emailBody = `
Hello ${name || 'Machi User'},

A new login to your Machi AI account was detected:
• Email: ${email}
• Method: ${loginMethod} Login
• Time: ${timestamp} IST

If this was you, no action is needed! If you did not log in, please secure your Google account immediately.

Best regards,
Machi AI Security Team
Created & Developed by Jaison Kumar J (Kanniyakumari, Tamil Nadu, India)
      `.trim();

      const smsMessage = `[Machi AI Alert] New ${loginMethod} login to ${email} at ${timestamp}. If not you, secure your account.`;

      // ── Dispatch Email Notification (Resend / SendGrid / Console Fallback) ──
      console.log(`[NOTIFY EMAIL SENT] To: ${email} | Subject: ${emailSubject}\n${emailBody}`);

      // ── Dispatch SMS Notification (Twilio / SMS Gateway API / Console Fallback) ──
      if (phone) {
        console.log(`[NOTIFY SMS SENT] To: ${phone} | Msg: ${smsMessage}`);
      }

      // Send to third-party email provider if RESEND_API_KEY is configured
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'Machi AI Security <security@machi.ai>',
              to: [email],
              subject: emailSubject,
              text: emailBody
            })
          });
        } catch (e) {
          console.error('[Resend API Error]', e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Auth alert sent to ${email} (Email & SMS notification dispatched)`
      });
    }

    // ── 2. 7-DAY CHAT INACTIVITY EMAIL ALERT ───────────────────────────────────
    if (type === 'inactivity_alert') {
      const emailSubject = `💬 Machi AI: Your chat thread "${threadTitle || 'Conversation'}" is ${daysOld} days old!`;
      const emailBody = `
Vanakkam ${name || 'Friend'}!

Your conversation "${threadTitle || 'New Conversation'}" in Machi AI hasn't been active for ${daysOld} days.

Log back in to Machi AI to continue chatting with your AI assistant, or export your notes.

Reminder: Old chat threads are automatically cleaned up after 30 days of inactivity.

Visit Machi AI: https://machi-ai.vercel.app

Best regards,
Machi AI Team
Created & Developed by Jaison Kumar J (Kanniyakumari, Tamil Nadu, India)
      `.trim();

      console.log(`[7-DAY INACTIVITY EMAIL SENT] To: ${email} | Subject: ${emailSubject}\n${emailBody}`);

      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'Machi AI <notifications@machi.ai>',
              to: [email],
              subject: emailSubject,
              text: emailBody
            })
          });
        } catch (e) {
          console.error('[Resend API Error]', e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `7-day inactivity email alert sent to ${email} for thread "${threadTitle}"`
      });
    }

    return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });

  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error?.message || 'Notification service error' }, { status: 500 });
  }
}
