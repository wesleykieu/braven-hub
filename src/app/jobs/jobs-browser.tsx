"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bookmark, Building2, Check, Clock, FileText, MapPin, Sparkles, Wallet } from "lucide-react";
import { JOBS, type JobLevel } from "@/data/jobs";
import { Chip } from "@/components/personalize-sheet";
import { useProfile } from "@/components/profile-provider";
import { rankJobs, type JobMatch } from "@/lib/match";
import { cn } from "@/lib/utils";

const LEVELS: (JobLevel | "All")[] = ["All", "Internship", "New Grad", "Fellowship", "Part-time"];

export function JobsBrowser() {
  const { profile, isPersonalized, setPersonalizeOpen, savedJobs, toggleSavedJob } = useProfile();
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  const ranked = useMemo(() => rankJobs(JOBS, profile), [profile]);
  const list = ranked.filter(
    (m) => (level === "All" || m.job.level === level) && (!remoteOnly || m.job.remote) && (!savedOnly || savedJobs.includes(m.job.id)),
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {!isPersonalized && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-brand-navy p-6 text-white sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-sky" />
            <div>
              <p className="font-semibold">Get a ranked list in 20 seconds</p>
              <p className="text-sm text-white/65">Tell us your major, interests and grad year — no account, saved only on this device.</p>
            </div>
          </div>
          <button onClick={() => setPersonalizeOpen(true)} className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-brand-navy">
            Personalize
          </button>
        </motion.div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        {LEVELS.map((l) => (
          <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
            {l}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <Chip active={remoteOnly} onClick={() => setRemoteOnly((v) => !v)}>
          Remote / hybrid
        </Chip>
        <Chip active={savedOnly} onClick={() => setSavedOnly((v) => !v)}>
          Saved ({savedJobs.length})
        </Chip>
      </div>

      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {list.map((m, i) => (
            <motion.div key={m.job.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03 } }} exit={{ opacity: 0 }}>
              <JobRow match={m} personalized={isPersonalized} saved={savedJobs.includes(m.job.id)} onSave={() => toggleSavedJob(m.job.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-16 text-center text-muted-foreground">Nothing here yet.</p>}
      <p className="mt-8 text-xs text-muted-foreground">Sample listings for the prototype — connect Handshake or Braven&apos;s employer-partner feed for live roles.</p>
    </section>
  );
}

function JobRow({ match: { job, score, reasons }, personalized, saved, onSave }: { match: JobMatch; personalized: boolean; saved: boolean; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const days = Math.max(0, Math.round((Date.now() - +new Date(job.posted)) / 86400000));
  const tone = score >= 80 ? "text-emerald-600 bg-emerald-50 ring-emerald-200" : score >= 60 ? "text-brand-blue bg-brand-blue/5 ring-brand-blue/20" : "text-muted-foreground bg-muted ring-border";

  return (
    <div className="rounded-3xl border bg-white transition-shadow hover:shadow-[0_16px_40px_rgb(1_25_54/0.07)]">
      <div className="flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-center" onClick={() => setOpen((v) => !v)}>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-lg font-semibold text-brand-navy">{job.company[0]}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold tracking-tight">{job.title}</p>
            {job.bravenPartner && <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] font-medium text-brand-blue">Braven partner</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3.5" />
              {job.pay}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {days === 0 ? "Today" : `${days}d ago`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border px-2.5 py-1 text-xs font-medium">{job.level}</span>
          {personalized && <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", tone)}>{score}% match</span>}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className={cn("grid size-9 place-items-center rounded-full border transition", saved ? "border-brand-navy bg-brand-navy text-white" : "hover:bg-muted")}
            aria-label={saved ? "Unsave" : "Save"}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid gap-6 border-t px-5 py-5 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm text-brand-navy/80">{job.summary}</p>
                {personalized && reasons.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {reasons.map((r) => (
                      <li key={r} className="flex items-center gap-2 text-[13px]">
                        <Check className="size-3.5 text-emerald-600" /> {r}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                {job.deadline && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Apply by {new Date(job.deadline + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:w-56">
                <a href={job.applyUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-full bg-brand-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-navy/90">
                  Apply on Handshake <ArrowUpRight className="size-4" />
                </a>
                <Link
                  href={`/coach?tab=resume&job=${job.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <FileText className="size-4" /> Tailor my resume
                </Link>
                <Link href={`/alumni?field=${encodeURIComponent(job.field)}`} className="text-center text-xs font-medium text-brand-blue hover:underline">
                  Find alumni in {job.field} →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
