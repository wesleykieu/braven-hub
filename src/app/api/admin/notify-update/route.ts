import { NextResponse } from "next/server";
import { getEvent } from "@/data/events";
import { sendCalendarInvite } from "@/lib/notify";
import { rsvpsFor } from "@/lib/rsvp-store";

/**
 * When an event's time/place changes: bump `sequence` in src/data/events.ts, then call
 *   curl -X POST localhost:3200/api/admin/notify-update -H "x-admin-token: $ADMIN_TOKEN" \
 *        -d '{"eventId":"linkedin-launch","kind":"update"}'
 * Each attendee gets a re-sent invite with the same UID, so Google Calendar updates in place.
 */
export async function POST(req: Request) {
  if (!process.env.ADMIN_TOKEN || req.headers.get("x-admin-token") !== process.env.ADMIN_TOKEN)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { eventId, kind = "update" } = await req.json();
  const event = getEvent(eventId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const rsvps = await rsvpsFor(event.id);
  const results = await Promise.all(rsvps.map((r) => sendCalendarInvite(event, r, kind)));
  return NextResponse.json({ sent: results.length, results });
}
