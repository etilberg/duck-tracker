export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      email?: string;
      message?: string;
      website?: string; // honeypot — real users never fill this
    };

    // Honeypot: bots fill hidden fields, humans don't
    if (body.website) {
      // Return fake success so bots don't know they were caught
      return NextResponse.json({ ok: true });
    }

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let apiKey: string | undefined;
    try {
      const { env } = getRequestContext();
      apiKey = env.RESEND_API_KEY;
    } catch {
      apiKey = process.env.RESEND_API_KEY;
    }

    if (!apiKey) {
      console.warn('RESEND_API_KEY not set — skipping contact email');
      return NextResponse.json({ ok: true }); // don't expose config issues to callers
    }

    const resend = new Resend(apiKey);
    const replyEmail = body.email?.trim() || null;
    const fromLine = replyEmail ? `From: ${replyEmail}` : 'Sent anonymously (no email provided)';

    await resend.emails.send({
      from: 'QuackerTracks <noreply@quackertracks.com>',
      to: 'hello@quackertracks.com',
      reply_to: replyEmail ?? undefined,
      subject: '🦆 QuackerTracks contact form',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#374151">New message from QuackerTracks</h2>
          <p style="color:#6b7280;font-size:13px">${fromLine}</p>
          <div style="background:#f9fafb;border-left:4px solid #fbbf24;padding:16px;border-radius:0 8px 8px 0;margin:16px 0">
            <p style="margin:0;white-space:pre-wrap;color:#111">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          ${replyEmail ? `<p><a href="mailto:${replyEmail}" style="background:#fbbf24;color:#111;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Reply to ${replyEmail} →</a></p>` : ''}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="color:#9ca3af;font-size:12px">Sent via the contact form at quackertracks.com</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
