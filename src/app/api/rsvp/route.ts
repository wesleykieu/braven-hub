import { NextResponse } from "next/server";
import { getEvent } from "@/data/events";
import { googleCalendarUrl } from "@/lib/calendar";
import { sendCalendarInvite, sendRsvpTexts, normalizePhone } from "@/lib/notify";
import { saveRsvp } from "@/lib/rsvp-store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { eventId, name, email, phone, smsOptIn } = body ?? {};
  const event = typeof eventId === "string" ? getEvent(eventId) : undefined;
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  if (smsOptIn && (!phone || !normalizePhone(phone)))
    return NextResponse.json({ error: "Please enter a valid US phone number for text reminders" }, { status: 400 });

  const attendee = { name: name.trim(), email: email.trim() };
  await saveRsvp({ eventId: event.id, ...attendee, phone, smsOptIn: !!smsOptIn, createdAt: new Date().toISOString() });

  const [emailResult, sms] = await Promise.all([
    sendCalendarInvite(event, attendee),
    smsOptIn && phone ? sendRsvpTexts(event, phone, attendee.name.split(" ")[0]) : Promise.resolve(null),
  ]);

  return NextResponse.json({
    ok: true,
    googleCalendarUrl: googleCalendarUrl(event),
    icsUrl: `/api/events/${event.id}/ics`,
    email: emailResult,
    sms,
  });
}
