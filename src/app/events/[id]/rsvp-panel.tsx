"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, CalendarPlus, Check, Download, Loader2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { BravenEvent } from "@/data/events";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/components/profile-provider";
import { formatEventDate, formatTimeRange } from "@/lib/calendar";

type Result = {
  googleCalendarUrl: string;
  icsUrl: string;
  email: { status: string };
  sms: { confirmation: { status: string }; reminders: { status: string }[] } | null;
};

export function RsvpPanel({ event, going }: { event: BravenEvent; going: number }) {
  const { profile, setProfile, rsvps, addRsvp } = useProfile();
  const already = rsvps.includes(event.id);
  const [form, setForm] = useState({ name: "", email: "", phone: "", smsOptIn: true });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    setForm({ name: profile.name, email: profile.email, phone: profile.phone, smsOptIn: profile.smsOptIn });
  }, [profile]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, ...form, smsOptIn: form.smsOptIn && !!form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      addRsvp(event.id);
      // Remember contact info on this device so the next RSVP is one tap.
      setProfile({ name: form.name, email: form.email, phone: form.phone, smsOptIn: form.smsOptIn });
      toast.success("You're in! See you there.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't RSVP — try again.");
    } finally {
      setLoading(false);
    }
  }

  const pct = Math.min(100, Math.round((going / event.capacity) * 100));

  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-[0_20px_60px_rgb(1_25_54/0.08)]">
      <div className="border-b bg-gradient-to-br from-[#eef1ff] to-white p-6">
        <p className="text-xs font-medium tracking-widest text-brand-blue uppercase">
          {formatEventDate(event.start, { weekday: "short", month: "short", day: "numeric" })}
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight">{formatTimeRange(event)}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-navy/10">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 4)}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-brand-blue" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {going} going · {Math.max(event.capacity - going, 0)} spots left
        </p>
      </div>

      <AnimatePresence mode="wait">
        {result || already ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="grid size-10 place-items-center rounded-full bg-emerald-500 text-white"
              >
                <Check className="size-5" />
              </motion.span>
              <div>
                <p className="font-semibold">You&apos;re going!</p>
                <p className="text-xs text-muted-foreground">We saved your spot.</p>
              </div>
            </div>

            {result && (
              <ul className="space-y-2 rounded-2xl bg-muted/50 p-4 text-[13px]">
                <Status icon={Mail} label={`Calendar invite → ${form.email}`} status={result.email.status} />
                {result.sms && (
                  <>
                    <Status icon={MessageSquare} label="Confirmation text" status={result.sms.confirmation.status} />
                    <Status
                      icon={BellRing}
                      label="Reminders (24h + 2h before)"
                      status={result.sms.reminders.some((r) => r.status === "scheduled") ? "scheduled" : result.sms.reminders[0]?.status ?? "skipped"}
                    />
                  </>
                )}
              </ul>
            )}

            <a
              href={result?.googleCalendarUrl ?? googleUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-5 py-3 text-sm font-medium text-white hover:bg-brand-navy/90"
            >
              <CalendarPlus className="size-4" /> Add to Google Calendar
            </a>
            <a
              href={`/api/events/${event.id}/ics`}
              className="flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" /> Apple / Outlook (.ics)
            </a>
            {!result && (
              <p className="text-center text-xs text-muted-foreground">You RSVP&apos;d from this device.</p>
            )}
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-6">
            <p className="font-semibold">RSVP — free, no account</p>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Rivera" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@sjsu.edu" />
              <p className="text-[11px] text-muted-foreground">We&apos;ll send a Google Calendar invite that updates if plans change.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile (optional)</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(408) 555-0123" />
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border bg-muted/40 p-3 text-[13px]">
              <input
                type="checkbox"
                checked={form.smsOptIn}
                onChange={(e) => setForm({ ...form, smsOptIn: e.target.checked })}
                className="mt-0.5 size-4 accent-[#3f5df5]"
              />
              <span>
                <span className="font-medium">Text me reminders</span>
                <span className="block text-muted-foreground">Day before + 2 hours before, with directions. Msg & data rates may apply. Reply STOP to opt out.</span>
              </span>
            </label>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgb(63_93_245/0.35)] transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {loading ? "Saving your spot…" : "RSVP"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Status({ icon: Icon, label, status }: { icon: React.ComponentType<{ className?: string }>; label: string; status: string }) {
  const map: Record<string, [string, string]> = {
    sent: ["Sent", "text-emerald-600"],
    scheduled: ["Scheduled", "text-emerald-600"],
    demo: ["Demo mode", "text-amber-600"],
    skipped: ["Skipped", "text-muted-foreground"],
    error: ["Failed", "text-red-600"],
  };
  const [text, color] = map[status] ?? [status, ""];
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-brand-blue" />
        <span className="truncate">{label}</span>
      </span>
      <span className={`shrink-0 text-xs font-medium ${color}`}>{text}</span>
    </li>
  );
}

function googleUrl(e: BravenEvent) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${stamp(e.start)}/${stamp(e.end)}`, location: `${e.venue}, ${e.address}`, details: e.summary });
  return `https://calendar.google.com/calendar/render?${p}`;
}
