import { Resend } from 'resend';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { Duck, Sighting } from './db';
import type { FinderWithToken } from './db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://duck-tracker.pages.dev';

export async function notifyPreviousFinders(
  finders: FinderWithToken[],
  duck: Duck,
  newSighting: Sighting
): Promise<void> {
  if (finders.length === 0) return;

  let apiKey: string | undefined;
  try {
    const { env } = getRequestContext();
    apiKey = env.RESEND_API_KEY;
  } catch {
    apiKey = process.env.RESEND_API_KEY;
  }

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email notifications');
    return;
  }
  const resend = new Resend(apiKey);

  const duckUrl = `${APP_URL}/duck/${duck.slug}`;
  const locationText = newSighting.location_label
    ? newSighting.location_label
    : newSighting.lat && newSighting.lng
    ? `${newSighting.lat.toFixed(4)}, ${newSighting.lng.toFixed(4)}`
    : 'an unknown location';

  const finderText = newSighting.finder_name ? newSighting.finder_name : 'Someone';
  const messageBlock = newSighting.message
    ? `<p>They left a note: <em>"${newSighting.message}"</em></p>`
    : '';

  // Send one email per recipient so each gets a unique unsubscribe link
  await Promise.allSettled(
    finders.map(({ email, sighting_id }) => {
      const unsubscribeUrl = `${APP_URL}/api/unsubscribe/${sighting_id}`;
      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#374151">🦆 Your duck was found again!</h2>
          <p>${finderText} just found <strong>${duck.name}</strong> at ${locationText}.</p>
          ${messageBlock}
          <p>
            <a href="${duckUrl}" style="background:#fbbf24;color:#111;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
              See ${duck.name}'s journey →
            </a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="color:#9ca3af;font-size:12px;line-height:1.6">
            You're getting this because you spotted this duck and left your email.
            We'll never sell it, share it, or use it for anything else — scout's honor. 🤞<br/>
            <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe from this duck's updates</a>
          </p>
        </div>
      `;

      return resend.emails.send({
        from: 'Duck Tracker <noreply@quackertracks.com>',
        to: email,
        subject: `🦆 ${duck.name} was found again!`,
        html,
      });
    })
  );
}
