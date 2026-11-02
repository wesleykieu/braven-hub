import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Footprints, MapPin, Navigation, Users } from "lucide-react";
import { getEvent } from "@/data/events";
import { formatEventDate, formatTimeRange, googleMapsDirectionsUrl } from "@/lib/calendar";
import { FadeIn } from "@/components/motion";
import { EventMap } from "@/components/map-loader";
import { RsvpPanel } from "./rsvp-panel";
import { countFor } from "@/lib/rsvp-store";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const e = getEvent((await params).id);
  return { title: e ? `${e.title} — Braven Hub` : "Event" };
}

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();
  const going = await countFor(event.id);

  return (
    <article>
      <section className="relative h-[46vh] min-h-[340px] overflow-hidden bg-brand-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt="" className="absolute inset-0 size-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-brand-navy/10" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-10 text-white sm:px-6">
          <FadeIn>
            <Link href="/events" className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/20">
              <ArrowLeft className="size-3.5" /> All events
            </Link>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-brand-blue px-3 py-1">{event.kind}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">{event.host}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">{event.title}</h1>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-12">
          <FadeIn className="grid gap-3 sm:grid-cols-3">
            <Fact icon={CalendarDays} label="Date" value={formatEventDate(event.start, { weekday: "long", month: "long", day: "numeric" })} />
            <Fact icon={Clock} label="Time" value={formatTimeRange(event)} />
            <Fact icon={Users} label="Spots" value={`${Math.max(event.capacity - going, 0)} of ${event.capacity} left`} />
          </FadeIn>

          <FadeIn>
            <h2 className="text-xl font-semibold tracking-tight">About this event</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-brand-navy/80">{event.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {event.fields.map((f) => (
                <span key={f} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  {f}
                </span>
              ))}
            </div>
          </FadeIn>

          <FadeIn>
            <h2 className="text-xl font-semibold tracking-tight">Agenda</h2>
            <ol className="relative mt-5 space-y-5 border-l border-dashed border-brand-navy/20 pl-6">
              {event.agenda.map((a) => (
                <li key={a.time} className="relative">
                  <span className="absolute top-1 -left-[29px] size-2.5 rounded-full border-2 border-white bg-brand-blue ring-2 ring-brand-blue/20" />
                  <p className="text-xs font-semibold text-brand-blue">{a.time}</p>
                  <p className="font-medium">{a.item}</p>
                </li>
              ))}
            </ol>
          </FadeIn>

          <FadeIn id="map">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Getting there</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" /> {event.venue}
                  {event.room ? ` · ${event.room}` : ""}
                </p>
              </div>
              <a
                href={googleMapsDirectionsUrl(event)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy/90"
              >
                <Navigation className="size-3.5" /> Get directions
              </a>
            </div>
            <div className="mt-5 h-[360px] overflow-hidden rounded-3xl border">
              <EventMap events={[event]} activeId={event.id} />
            </div>
            <div className="mt-4 flex gap-3 rounded-2xl border bg-white p-4">
              <Footprints className="mt-0.5 size-5 shrink-0 text-brand-blue" />
              <div>
                <p className="text-sm font-semibold">Wayfinding</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{event.directions}</p>
                <p className="mt-2 text-xs text-muted-foreground">{event.address}</p>
              </div>
            </div>
          </FadeIn>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RsvpPanel event={event} going={going} />
        </aside>
      </div>
    </article>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <Icon className="size-4 text-brand-blue" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
