"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, FileText, Loader2, Mail, Mic, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Markdown } from "@/components/markdown";
import { Chip } from "@/components/personalize-sheet";
import { aiProfile, useProfile } from "@/components/profile-provider";
import { JOBS } from "@/data/jobs";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "resume", label: "Resume review", icon: FileText },
  { id: "interview", label: "Mock interview", icon: Mic },
  { id: "cover", label: "Cover letter", icon: Mail },
  { id: "pitch", label: "Elevator pitch", icon: UserRound },
] as const;
type Tab = (typeof TABS)[number]["id"];

const QUESTIONS = {
  Behavioral: [
    "Tell me about a time you had to work with someone whose style was very different from yours.",
    "Describe a situation where you had to learn something quickly to get a job done.",
    "Tell me about a time you failed. What did you learn?",
    "Give an example of when you took initiative without being asked.",
    "Tell me about a time you had to manage competing priorities.",
  ],
  Intro: ["Tell me about yourself.", "Why are you interested in this role?", "Where do you see yourself in three years?"],
  "Role-specific": [
    "Walk me through a project you're proud of. What would you do differently?",
    "How would you explain a complex idea to someone outside your field?",
    "How do you prioritize when everything feels urgent?",
  ],
};

async function ask(payload: object) {
  const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data as { text: string; mode: string };
}

export function CoachStudio() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = (params.get("tab") as Tab) ?? "resume";
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === initial) ? initial : "resume");
  const job = JOBS.find((j) => j.id === params.get("job"));

  useEffect(() => {
    const t = params.get("tab") as Tab | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [params]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-full border bg-white p-1 sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              router.replace(`/coach?tab=${t.id}${job ? `&job=${job.id}` : ""}`, { scroll: false });
            }}
            className="relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          >
            {tab === t.id && <motion.span layoutId="coach-tab" className="absolute inset-0 rounded-full bg-brand-navy" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
            <t.icon className={cn("relative size-4", tab === t.id ? "text-white" : "text-muted-foreground")} />
            <span className={cn("relative", tab === t.id ? "text-white" : "text-brand-navy/70")}>{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === "resume" && <ResumeTool jobTarget={job ? `${job.title} at ${job.company}. ${job.summary} Skills: ${job.skills.join(", ")}` : ""} />}
          {tab === "interview" && <InterviewTool />}
          {tab === "cover" && <CoverTool job={job} />}
          {tab === "pitch" && <PitchTool />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl border bg-white p-6", className)}>{children}</div>;
}

function Output({ text, loading, empty, mode }: { text: string; loading: boolean; empty: string; mode?: string }) {
  return (
    <Panel className="relative min-h-[420px] bg-gradient-to-b from-[#f7f8ff] to-white">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-brand-blue" /> Coach feedback
        </p>
        <div className="flex items-center gap-2">
          {mode === "demo" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Offline coach</span>}
          {text && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(text);
                toast.success("Copied");
              }}
              className="flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs hover:bg-muted"
            >
              <Copy className="size-3" /> Copy
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[90, 75, 82, 60, 70].map((w, i) => (
            <motion.div key={i} className="h-3 rounded-full bg-brand-navy/10" style={{ width: `${w}%` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }} />
          ))}
        </div>
      ) : text ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Markdown text={text} className="text-[14px]" />
        </motion.div>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </Panel>
  );
}

function useRun() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function run(payload: object) {
    setLoading(true);
    try {
      const r = await ask(payload);
      setText(r.text);
      setMode(r.mode);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }
  return { text, mode, loading, run, setText };
}

const SAMPLE_RESUME = `Alex Rivera · alex.rivera@sjsu.edu · (408) 555-0123

EDUCATION
San José State University — B.S. Business Administration, May 2027
Braven Fellow, Leadership & Career Accelerator (Fall 2025)

EXPERIENCE
Shift Lead, Philz Coffee — San José, CA (2024–present)
- Responsible for opening the store and training new baristas
- Helped with inventory and ordering

Treasurer, Latinx Business Student Association (2025–present)
- Managed a $6,000 annual budget across 12 events
- Worked on sponsorship outreach to local businesses

SKILLS
Excel, Google Sheets, Canva, Spanish (fluent)`;

function ResumeTool({ jobTarget }: { jobTarget: string }) {
  const { profile } = useProfile();
  const [resume, setResume] = useState("");
  const [target, setTarget] = useState(jobTarget);
  const { text, mode, loading, run } = useRun();
  useEffect(() => setTarget(jobTarget), [jobTarget]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Paste your resume</Label>
          <button onClick={() => setResume(SAMPLE_RESUME)} className="text-xs font-medium text-brand-blue hover:underline">
            Use a sample
          </button>
        </div>
        <Textarea rows={14} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Copy everything from your resume doc and paste it here…" className="font-mono text-[13px]" />
        <div className="space-y-1.5">
          <Label>Target job (optional)</Label>
          <Textarea rows={3} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Paste a job description to tailor your feedback and keywords" />
        </div>
        <button
          disabled={loading || !resume.trim()}
          onClick={() => run({ task: "resume", resume, target, profile: aiProfile(profile) })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Review my resume
        </button>
      </Panel>
      <Output text={text} loading={loading} mode={mode} empty="Your score, what's working, what to fix first, and rewritten bullets will show up here." />
    </div>
  );
}

function InterviewTool() {
  const { profile } = useProfile();
  const [cat, setCat] = useState<keyof typeof QUESTIONS>("Behavioral");
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState("");
  const [role, setRole] = useState("");
  const { text, mode, loading, run, setText } = useRun();
  const question = QUESTIONS[cat][qi % QUESTIONS[cat].length];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel className="space-y-5">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(QUESTIONS) as (keyof typeof QUESTIONS)[]).map((c) => (
            <Chip
              key={c}
              active={cat === c}
              onClick={() => {
                setCat(c);
                setQi(0);
                setText("");
              }}
            >
              {c}
            </Chip>
          ))}
        </div>
        <div className="rounded-2xl bg-brand-navy p-5 text-white">
          <p className="text-xs font-medium tracking-widest text-brand-sky uppercase">Interviewer</p>
          <AnimatePresence mode="wait">
            <motion.p key={question} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-lg leading-snug font-medium">
              “{question}”
            </motion.p>
          </AnimatePresence>
          <button
            onClick={() => {
              setQi((i) => i + 1);
              setAnswer("");
              setText("");
            }}
            className="mt-4 flex items-center gap-1.5 text-xs text-white/70 hover:text-white"
          >
            <RefreshCw className="size-3" /> Different question
          </button>
        </div>
        <div className="space-y-1.5">
          <Label>Role you&apos;re practicing for (optional)</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Marketing Coordinator" />
        </div>
        <div className="space-y-1.5">
          <Label>Your answer</Label>
          <Textarea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type how you'd answer out loud. Tip: Situation → Task → Action → Result." />
          <p className="text-right text-[11px] text-muted-foreground">{answer.trim() ? answer.trim().split(/\s+/).length : 0} words</p>
        </div>
        <button
          disabled={loading || !answer.trim()}
          onClick={() => run({ task: "interview", question, answer, role, profile: aiProfile(profile) })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Mic className="size-4" />} Grade my answer
        </button>
      </Panel>
      <Output text={text} loading={loading} mode={mode} empty="You'll get a score, a STAR-method checklist, delivery notes and a stronger version of your answer." />
    </div>
  );
}

function CoverTool({ job }: { job?: (typeof JOBS)[number] }) {
  const { profile } = useProfile();
  const [role, setRole] = useState(job?.title ?? "");
  const [company, setCompany] = useState(job?.company ?? "");
  const [jd, setJd] = useState(job ? job.summary : "");
  const [bg, setBg] = useState("");
  const { text, mode, loading, run } = useRun();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Marketing Coordinator" />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Zoom" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Job description (optional)</Label>
          <Textarea rows={4} value={jd} onChange={(e) => setJd(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Your relevant experience</Label>
          <Textarea rows={5} value={bg} onChange={(e) => setBg(e.target.value)} placeholder="Shift lead at Philz — trained 8 new hires. Treasurer for LBSA, managed $6K budget…" />
        </div>
        <button
          disabled={loading || !role || !company}
          onClick={() => run({ task: "cover", job: role, company, jobDescription: jd, background: bg, profile: aiProfile(profile) })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Draft cover letter
        </button>
      </Panel>
      <Output text={text} loading={loading} mode={mode} empty="A tailored, under-300-word draft will appear here. Edit the [brackets] before sending." />
    </div>
  );
}

function PitchTool() {
  const { profile } = useProfile();
  const [exp, setExp] = useState("");
  const [goal, setGoal] = useState("");
  const { text, mode, loading, run } = useRun();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {profile.major ? (
            <>
              Using your profile: <strong className="text-brand-navy">{profile.major}</strong>
              {profile.gradYear ? `, class of ${profile.gradYear}` : ""}.
            </>
          ) : (
            "Tip: click Personalize to include your major automatically."
          )}
        </p>
        <div className="space-y-1.5">
          <Label>One thing you&apos;ve done that you&apos;re proud of</Label>
          <Textarea rows={4} value={exp} onChange={(e) => setExp(e.target.value)} placeholder="As LBSA treasurer I grew sponsorships 40% by pitching local businesses" />
        </div>
        <div className="space-y-1.5">
          <Label>What you&apos;re looking for</Label>
          <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="a summer 2027 finance internship" />
        </div>
        <button
          disabled={loading}
          onClick={() => run({ task: "pitch", experience: exp, goal, profile: aiProfile(profile) })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Build my pitch
        </button>
      </Panel>
      <Output text={text} loading={loading} mode={mode} empty="Your 30-second 'tell me about yourself' — perfect for mixers and the first interview question." />
    </div>
  );
}
