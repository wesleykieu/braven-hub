import "server-only";
import { upcomingEvents } from "@/data/events";
import { JOBS } from "@/data/jobs";
import { ALUMNI } from "@/data/alumni";
import { formatEventDate, formatTimeRange } from "@/lib/calendar";

export type ClientProfile = {
  name?: string;
  major?: string;
  gradYear?: number;
  fields?: string[];
  school?: string;
};

export function siteContext() {
  const events = upcomingEvents()
    .map(
      (e) =>
        `- [${e.title}](/events/${e.id}) — ${formatEventDate(e.start, { weekday: "short", month: "short", day: "numeric" })}, ${formatTimeRange(e)} @ ${e.venue}. ${e.kind}. Fields: ${e.fields.join(", ")}`,
    )
    .join("\n");
  const jobs = JOBS.slice(0, 18)
    .map((j) => `- ${j.title} @ ${j.company} (${j.level}, ${j.field}, ${j.location})`)
    .join("\n");
  const fields = [...new Set(ALUMNI.map((a) => a.field))].join(", ");
  return `SITE MAP (always link with markdown, relative paths):
- [Home](/) — overview + photo highlights from Braven events
- [Events](/events) — upcoming professional development events; RSVP gets a Google Calendar invite + text reminders; each event page has a map + walking directions
- [Alumni](/alumni) — search Braven Fellows, SJSU alumni and Leadership Coaches by career field and request a coffee chat, resume review, mock interview, or referral (alumni fields: ${fields})
- [Jobs](/jobs) — internships/new-grad roles ranked for the visitor's profile (major, interests, grad year)
- [AI Career Coach](/coach) — resume feedback (/coach?tab=resume), mock interview practice (/coach?tab=interview), cover letters (/coach?tab=cover), elevator pitch (/coach?tab=pitch)
- Personalize (top-right button) — no login; saves major/interests/phone on this device only

UPCOMING EVENTS:
${events}

SAMPLE JOBS:
${jobs}`;
}

export function profileLine(p?: ClientProfile) {
  if (!p || !Object.values(p).some(Boolean)) return "Visitor has not personalized yet.";
  return `Visitor profile: ${[
    p.name && `name ${p.name}`,
    p.school && `school ${p.school}`,
    p.major && `major ${p.major}`,
    p.gradYear && `graduating ${p.gradYear}`,
    p.fields?.length && `interested in ${p.fields.join(", ")}`,
  ]
    .filter(Boolean)
    .join("; ")}.`;
}
