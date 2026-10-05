import { Resend } from 'resend';
import type { Duck, Sighting } from './db';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://duck-tracker.pages.dev';

export async function notifyPreviousFinders(
  emails: string[],
  duck: Duck,
  newSighting: Sighting
): Promise<void> {
  if (emails.length === 0) return;

  const duckUrl = `${APP_URL}/duck/${duck.slug}`;
  const locationText = newSighting.location_label
    ? newSighting.location_label
    : newSighting.lat && newSighting.lng
    ? `${newSighting.lat.toFixed(4)}, ${newSighting.lng.toFixed(4)}`
    : 'an unknown location';

  const finderText = newSighting.finder_name
    ? `${newSighting.finder_name}`
    : 'Someone';

  const messageBlock = newSighting.message
    ? `<p>They left a note: <em>"${newSighting.message}"</em></p>`
    : '';

  const html = `
    <h2>🦆 Your duck was found again!</h2>
    <p>${finderText} just found <strong>${duck.name}</strong> at ${locationText}.</p>
    ${messageBlock}
    <p><a href="${duckUrl}">See the duck's full travel history →</a></p>
    <hr />
    <p style="color:#888;font-size:12px;">
      You're receiving this because you found this duck and left your email.
      You can view the duck's page to see its full journey.
    </p>
  `;

  try {
    await resend.emails.send({
      from: 'Duck Tracker <noreply@duck-tracker.pages.dev>',
      to: emails,
      subject: `🦆 ${duck.name} was found again!`,
      html,
    });
  } catch (err) {
    console.error('Failed to send email notifications:', err);
  }
}
