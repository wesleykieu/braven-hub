import { PageHeader } from "@/components/motion";
import { EventsBrowser } from "./events-browser";
import { upcomingEvents } from "@/data/events";

export const metadata = { title: "Events — Braven Hub" };

export default function EventsPage() {
  return (
    <>
      <PageHeader eyebrow="Professional development" title="Events that move your" accent="career forward.">
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Workshops, alumni panels, mock interviews and mixers from Braven and the SJSU Career Center. RSVP to get a calendar invite and text reminders.
        </p>
      </PageHeader>
      <EventsBrowser events={upcomingEvents()} />
    </>
  );
}

export const revalidate = 3600;
