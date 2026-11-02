import type { BravenEvent } from "@/data/events";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3200";

function toUtcStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Fold lines at 75 octets per RFC 5545. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function eventLocation(e: BravenEvent) {
  return [e.venue, e.room, e.address].filter(Boolean).join(", ");
}

/** Prefilled "Add to Google Calendar" link — works with no login on our side. */
export function googleCalendarUrl(e: BravenEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${toUtcStamp(e.start)}/${toUtcStamp(e.end)}`,
    details: `${e.summary}\n\nDirections: ${e.directions}\n\nEvent page: ${SITE_URL}/events/${e.id}`,
    location: eventLocation(e),
    ctz: "America/Los_Angeles",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Calendar invite (iCalendar). The UID is stable per event+attendee, so when an event
 * changes we bump `sequence` and re-send — Google Calendar updates the existing entry
 * instead of creating a duplicate. METHOD:CANCEL removes it.
 */
export function buildIcs(
  e: BravenEvent,
  attendee?: { name: string; email: string },
  method: "REQUEST" | "PUBLISH" | "CANCEL" = attendee ? "REQUEST" : "PUBLISH",
) {
  const uid = `${e.id}${attendee ? "-" + attendee.email.toLowerCase() : ""}@bravenhub`;
  const organizerEmail = process.env.INVITE_FROM_EMAIL ?? "events@bravenhub.org";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Braven Hub//Events//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SEQUENCE:${e.sequence}`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(e.start)}`,
    `DTEND:${toUtcStamp(e.end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(`${e.summary}\n\nDirections: ${e.directions}\n\n${SITE_URL}/events/${e.id}`)}`,
    `LOCATION:${escapeIcs(eventLocation(e))}`,
    `GEO:${e.lat};${e.lng}`,
    `URL:${SITE_URL}/events/${e.id}`,
    `ORGANIZER;CN=Braven Hub:mailto:${organizerEmail}`,
    ...(attendee
      ? [`ATTENDEE;CN=${escapeIcs(attendee.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${attendee.email}`]
      : []),
    `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(e.title)} starts in 1 hour`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleMapsDirectionsUrl(e: BravenEvent) {
  return `https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}`;
}

export function formatEventDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", ...opts }).format(new Date(iso));
}

export function formatTimeRange(e: BravenEvent) {
  const t = (iso: string) => formatEventDate(iso, { hour: "numeric", minute: "2-digit" });
  return `${t(e.start)} – ${t(e.end)} PT`;
}
