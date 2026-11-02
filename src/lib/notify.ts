import "server-only";
import type { BravenEvent } from "@/data/events";
import { buildIcs, eventLocation, formatEventDate, formatTimeRange, googleMapsDirectionsUrl } from "./calendar";

/**
 * Outbound notifications. Each channel is optional: with no credentials set it runs in
 * "demo" mode and just logs, so the site works end-to-end on a laptop.
 *
 *  SMS   → Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID)
 *          Reminders use Twilio's scheduled messages (SendAt) so no cron is needed.
 *  Email → Resend (RESEND_API_KEY, INVITE_FROM_EMAIL) with a METHOD:REQUEST .ics attached,
 *          which Gmail/Google Calendar treats as a real calendar invite.
 */

export type ChannelResult = { status: "sent" | "scheduled" | "demo" | "skipped" | "error"; detail?: string };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3200");

export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (raw.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return null;
}

async function twilioSend(to: string, body: string, sendAt?: Date): Promise<ChannelResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!sid || !token || !service) {
    console.log(`[sms:demo] → ${to}${sendAt ? ` @ ${sendAt.toISOString()}` : ""}\n${body}`);
    return { status: "demo" };
  }
  const form = new URLSearchParams({ To: to, MessagingServiceSid: service, Body: body });
  if (sendAt) {
    form.set("ScheduleType", "fixed");
    form.set("SendAt", sendAt.toISOString());
  }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  if (!res.ok) return { status: "error", detail: (await res.text()).slice(0, 300) };
  return { status: sendAt ? "scheduled" : "sent" };
}

/** Confirmation now + reminders 24h and 2h before (Twilio requires 15 min – 35 days lead). */
export async function sendRsvpTexts(e: BravenEvent, phone: string, firstName: string) {
  const to = normalizePhone(phone);
  if (!to) return { confirmation: { status: "skipped", detail: "invalid phone" } as ChannelResult, reminders: [] };

  const when = `${formatEventDate(e.start, { weekday: "short", month: "short", day: "numeric" })}, ${formatTimeRange(e)}`;
  const confirmation = await twilioSend(
    to,
    `Braven Hub: You're in, ${firstName}! ${e.title}\n${when}\n${e.venue}${e.room ? `, ${e.room}` : ""}\nDetails + map: ${SITE_URL}/events/${e.id}\nReply STOP to opt out.`,
  );

  const start = new Date(e.start).getTime();
  const now = Date.now();
  const reminders: ChannelResult[] = [];
  for (const [hoursBefore, label] of [
    [24, "tomorrow"],
    [2, "in 2 hours"],
  ] as const) {
    const at = new Date(start - hoursBefore * 3600_000);
    const lead = at.getTime() - now;
    if (lead < 15 * 60_000 || lead > 35 * 24 * 3600_000) {
      reminders.push({ status: "skipped", detail: `${hoursBefore}h reminder outside scheduling window` });
      continue;
    }
    reminders.push(
      await twilioSend(
        to,
        `Reminder: ${e.title} is ${label} (${formatTimeRange(e)}).\n📍 ${e.venue}${e.room ? `, ${e.room}` : ""}\nDirections: ${googleMapsDirectionsUrl(e)}`,
        at,
      ),
    );
  }
  return { confirmation, reminders };
}

export async function sendCalendarInvite(
  e: BravenEvent,
  attendee: { name: string; email: string },
  kind: "new" | "update" | "cancel" = "new",
): Promise<ChannelResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL;
  const ics = buildIcs(e, attendee, kind === "cancel" ? "CANCEL" : "REQUEST");
  const subjectPrefix = kind === "update" ? "Updated: " : kind === "cancel" ? "Cancelled: " : "Invitation: ";
  if (!key || !from) {
    console.log(`[email:demo] ${subjectPrefix}${e.title} → ${attendee.email} (ics ${ics.length} bytes)`);
    return { status: "demo" };
  }
  const html = `<div style="font-family:system-ui,sans-serif;color:#011936">
    <h2 style="margin:0 0 8px">${e.title}</h2>
    <p style="margin:0 0 4px">${formatEventDate(e.start, { weekday: "long", month: "long", day: "numeric" })} · ${formatTimeRange(e)}</p>
    <p style="margin:0 0 16px">${eventLocation(e)}</p>
    <p style="margin:0 0 16px;color:#5b6476">${e.directions}</p>
    <a href="${SITE_URL}/events/${e.id}" style="background:#3f5df5;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">View event + map</a>
  </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [attendee.email],
      subject: subjectPrefix + e.title,
      html,
      attachments: [
        {
          filename: "invite.ics",
          content: Buffer.from(ics).toString("base64"),
          content_type: `text/calendar; method=${kind === "cancel" ? "CANCEL" : "REQUEST"}; charset=UTF-8`,
        },
      ],
    }),
  });
  if (!res.ok) return { status: "error", detail: (await res.text()).slice(0, 300) };
  return { status: "sent" };
}
