"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import type { BravenEvent, EventKind } from "@/data/events";
import { EventCard } from "@/components/event-card";
import { EventMap } from "@/components/map-loader";
import { Chip } from "@/components/personalize-sheet";
import { useProfile } from "@/components/profile-provider";
import { formatEventDate } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import Link from "next/link";

const KINDS: (EventKind | "All")[] = ["All", "Workshop", "Panel", "Mock Interviews", "Networking", "Site Visit"];

export function EventsBrowser({ events }: { events: BravenEvent[] }) {
  const { profile, rsvps, isPersonalized } = useProfile();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [forMe, setForMe] = useState(false);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [activeId, setActiveId] = useState<string | undefined>();

  const matches = (e: BravenEvent) => profile.fields.some((f) => e.fields.includes(f as never));
  const filtered = useMemo(
    () => events.filter((e) => (kind === "All" || e.kind === kind) && (!forMe || matches(e))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, kind, forMe, profile.fields],
  );
  const mine = events.filter((e) => rsvps.includes(e.id));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {mine.length > 0 && (
        <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5">
          <p className="text-sm font-semibold text-emerald-800">You&apos;re going to {mine.length} event{mine.length > 1 ? "s" : ""}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mine.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium hover:border-emerald-400">
                {formatEventDate(e.start, { month: "short", day: "numeric" })} · {e.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="sticky top-20 z-20 -mx-4 mb-8 flex flex-col gap-3 bg-background/80 px-4 py-3 backdrop-blur-md sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:border sm:bg-white/80 sm:px-2 sm:py-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {KINDS.map((k) => (
            <Chip key={k} active={kind === k} onClick={() => setKind(k)} className="shrink-0">
              {k}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isPersonalized && (
            <Chip active={forMe} onClick={() => setForMe((v) => !v)} className="shrink-0">
              ✨ For my interests
            </Chip>
          )}
          <div className="flex rounded-full border bg-muted/50 p-0.5">
            {(["grid", "map"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium", view === v ? "bg-white shadow-sm" : "text-muted-foreground")}
              >
                {v === "grid" ? <LayoutGrid className="size-3.5" /> : <MapIcon className="size-3.5" />}
                {v === "grid" ? "Grid" : "Map"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "map" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="h-[520px] overflow-hidden rounded-3xl border">
            <EventMap events={filtered} activeId={activeId} zoom={15} onSelect={setActiveId} />
          </div>
          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {filtered.map((e, i) => (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveId(e.id)}
                onKeyDown={(ev) => ev.key === "Enter" && setActiveId(e.id)}
                className={cn("flex w-full cursor-pointer gap-3 rounded-2xl border bg-white p-3 text-left transition", activeId === e.id && "border-brand-blue ring-2 ring-brand-blue/15")}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-navy text-xs font-semibold text-white">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{e.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatEventDate(e.start, { month: "short", day: "numeric" })} · {e.venue}
                  </span>
                  <Link href={`/events/${e.id}`} className="mt-1 inline-block text-xs font-medium text-brand-blue">
                    Details & RSVP →
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((e) => (
              <motion.div key={e.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                <EventCard event={e} highlight={isPersonalized && matches(e)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      {filtered.length === 0 && <p className="py-20 text-center text-muted-foreground">No events match those filters yet.</p>}
    </section>
  );
}
