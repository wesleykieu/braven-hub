"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, GraduationCap, Loader2, MapPin, Search, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { ALUMNI, type Alum, type Network, type OpenTo } from "@/data/alumni";
import { CAREER_FIELDS } from "@/data/fields";
import { Chip } from "@/components/personalize-sheet";
import { aiProfile, useProfile } from "@/components/profile-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const NETWORKS: (Network | "All")[] = ["All", "Braven Fellow", "SJSU Alum", "Leadership Coach"];
const OPEN_TO: OpenTo[] = ["Coffee chat", "Resume review", "Mock interview", "Referral", "Mentorship"];

export function AlumniBrowser() {
  const { profile, isPersonalized } = useProfile();
  const [q, setQ] = useState("");
  const [field, setField] = useState<string>("All");
  const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("All");
  const [openTo, setOpenTo] = useState<OpenTo | null>(null);
  const [selected, setSelected] = useState<Alum | null>(null);

  // ?field= from links (e.g. Jobs page) wins; otherwise default to the visitor's first interest.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("field");
    if (fromUrl) setField(fromUrl);
    else if (profile.fields[0] && field === "All") setField(profile.fields[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.fields]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALUMNI.filter(
      (a) =>
        (field === "All" || a.field === field) &&
        (network === "All" || a.networks.includes(network)) &&
        (!openTo || a.openTo.includes(openTo)) &&
        (!needle || [a.name, a.company, a.role, a.major, a.bio, a.location].join(" ").toLowerCase().includes(needle)),
    ).sort((a, b) => Number(b.major === profile.major) - Number(a.major === profile.major));
  }, [q, field, network, openTo, profile.major]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Company, role, major…"
              className="h-11 w-full rounded-full border bg-white pr-4 pl-10 text-sm outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10"
            />
          </div>
          <FilterGroup label="Career field">
            <Chip active={field === "All"} onClick={() => setField("All")}>
              All
            </Chip>
            {CAREER_FIELDS.map((f) => (
              <Chip key={f} active={field === f} onClick={() => setField(f)}>
                {f}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Network">
            {NETWORKS.map((n) => (
              <Chip key={n} active={network === n} onClick={() => setNetwork(n)}>
                {n}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Open to">
            {OPEN_TO.map((o) => (
              <Chip key={o} active={openTo === o} onClick={() => setOpenTo(openTo === o ? null : o)}>
                {o}
              </Chip>
            ))}
          </FilterGroup>
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            <strong className="text-brand-navy">{results.length}</strong> people
            {field !== "All" && (
              <>
                {" "}
                in <strong className="text-brand-navy">{field}</strong>
              </>
            )}
            {isPersonalized && profile.major && <> · {profile.major} alumni shown first</>}
          </p>
          <motion.div layout className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {results.map((a) => (
                <motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
                  <AlumCard alum={a} sameMajor={!!profile.major && a.major === profile.major} onConnect={() => setSelected(a)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {results.length === 0 && (
            <div className="rounded-3xl border border-dashed py-16 text-center text-muted-foreground">No one matches yet — try a broader field.</div>
          )}
          <p className="mt-8 text-xs text-muted-foreground">Sample profiles for this prototype. Contact details stay private — requests are brokered by the Braven team.</p>
        </div>
      </div>

      <ConnectDialog alum={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function Avatar({ name, hue, size = 48 }: { name: string; hue: number; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.34, background: `linear-gradient(135deg, hsl(${hue} 75% 60%), hsl(${hue + 35} 70% 42%))` }}
    >
      {initials}
    </span>
  );
}

function AlumCard({ alum: a, sameMajor, onConnect }: { alum: Alum; sameMajor: boolean; onConnect: () => void }) {
  return (
    <div className="group flex h-full flex-col rounded-3xl border bg-white p-5 transition-shadow hover:shadow-[0_20px_50px_rgb(1_25_54/0.08)]">
      <div className="flex items-start gap-4">
        <Avatar name={a.name} hue={a.hue} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <p className="font-semibold tracking-tight">{a.name}</p>
            {a.pronouns && <span className="text-xs text-muted-foreground">{a.pronouns}</span>}
          </div>
          <p className="truncate text-sm text-brand-navy/80">
            {a.role} · <span className="font-medium">{a.company}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {a.networks.map((n) => (
              <span
                key={n}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  n === "Braven Fellow" ? "bg-brand-blue/10 text-brand-blue" : n === "Leadership Coach" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800",
                )}
              >
                {n}
              </span>
            ))}
            {sameMajor && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">Your major</span>}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.bio}</p>
      <div className="mt-4 space-y-1 text-xs text-brand-navy/70">
        <p className="flex items-center gap-1.5">
          <GraduationCap className="size-3.5" /> {a.major} · &apos;{String(a.gradYear).slice(2)}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {a.location}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4 mt-4">
        <div className="flex flex-wrap gap-1">
          {a.openTo.slice(0, 3).map((o) => (
            <span key={o} className="rounded-full border px-2 py-0.5 text-[11px]">
              {o}
            </span>
          ))}
        </div>
        <button onClick={onConnect} className="shrink-0 rounded-full bg-brand-navy px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-blue">
          Connect
        </button>
      </div>
    </div>
  );
}

function ConnectDialog({ alum, onClose }: { alum: Alum | null; onClose: () => void }) {
  const { profile } = useProfile();
  const [reason, setReason] = useState<OpenTo>("Coffee chat");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (alum) {
      setReason(alum.openTo[0]);
      setMessage("");
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [alum, profile.name, profile.email]);

  async function draft() {
    if (!alum) return;
    setDrafting(true);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "connect", alum: alum.name, company: alum.company, role: alum.role, reason, profile: aiProfile({ ...profile, name }) }),
    });
    const data = await res.json();
    setMessage(data.text ?? "");
    setDrafting(false);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!alum) return;
    setSending(true);
    const res = await fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumId: alum.id, name, email, reason, message }),
    });
    setSending(false);
    if (res.ok) {
      toast.success(`Request sent! ${alum.name.split(" ")[0]} will reply to ${email}.`);
      onClose();
    } else toast.error((await res.json()).error ?? "Couldn't send");
  }

  return (
    <Dialog open={!!alum} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {alum && (
          <form onSubmit={send} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar name={alum.name} hue={alum.hue} size={44} />
                <div>
                  <DialogTitle className="text-base">Connect with {alum.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-1">
                    <Briefcase className="size-3" /> {alum.role} at {alum.company}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div>
              <Label className="mb-2 block">I&apos;d like a…</Label>
              <div className="flex flex-wrap gap-1.5">
                {alum.openTo.map((o) => (
                  <Chip key={o} active={reason === o} onClick={() => setReason(o)}>
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Your name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Your email</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Message</Label>
                <button type="button" onClick={draft} disabled={drafting} className="flex items-center gap-1 text-xs font-medium text-brand-blue disabled:opacity-50">
                  {drafting ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />} Draft with AI
                </button>
              </div>
              <Textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Introduce yourself and say what you'd love to learn…" />
            </div>
            <button disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Send request
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
