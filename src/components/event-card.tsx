"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Check, MapPin } from "lucide-react";
import type { BravenEvent } from "@/data/events";
import { formatEventDate, formatTimeRange } from "@/lib/calendar";
import { useProfile } from "./profile-provider";

export function EventCard({ event, highlight }: { event: BravenEvent; highlight?: boolean }) {
  const { rsvps } = useProfile();
  const going = rsvps.includes(event.id);
  const month = formatEventDate(event.start, { month: "short" });
  const day = formatEventDate(event.start, { day: "numeric" });

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="h-full">
      <Link
        href={`/events/${event.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_1px_2px_rgb(1_25_54/0.04)] transition-shadow hover:shadow-[0_20px_50px_rgb(1_25_54/0.10)]"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.image} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex flex-col items-center rounded-2xl bg-white/95 px-3 py-1.5 text-brand-navy shadow-sm backdrop-blur">
            <span className="text-[10px] font-semibold tracking-widest text-brand-blue uppercase">{month}</span>
            <span className="text-xl leading-none font-semibold">{day}</span>
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5">
            {going && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Check className="size-3" /> Going
              </span>
            )}
            {highlight && !going && <span className="rounded-full bg-brand-blue px-2.5 py-1 text-[11px] font-semibold text-white">For you</span>}
          </div>
          <span className="absolute bottom-3 left-3 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">{event.kind}</span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-medium text-muted-foreground">{event.host}</p>
          <h3 className="mt-1 text-lg leading-snug font-semibold tracking-tight">{event.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.summary}</p>
          <div className="mt-auto space-y-1.5 pt-4 text-[13px] text-brand-navy/75">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-3.5 text-brand-blue" />
              {formatEventDate(event.start, { weekday: "short" })} · {formatTimeRange(event)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-3.5 text-brand-blue" />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm font-medium">
            <span className="text-brand-blue">{going ? "View details" : "RSVP"}</span>
            <ArrowUpRight className="size-4 text-brand-navy/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-blue" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
