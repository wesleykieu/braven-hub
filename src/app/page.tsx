import Link from "next/link";
import { ArrowRight, BellRing, Briefcase, CalendarCheck, FileText, MapPinned, MessageSquareText, Users } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { PhotoCarousel } from "@/components/photo-carousel";
import { EventCard } from "@/components/event-card";
import { HeroCollage } from "@/components/hero-collage";
import { upcomingEvents } from "@/data/events";

const STATS = [
  { value: "2,000+", label: "SJSU students have completed the Braven Accelerator" },
  { value: "86%", label: "of 2023 SJSU Fellows employed or in grad school" },
  { value: "+$9.1K", label: "higher mean starting salary for 2024 Braven grads" },
  { value: "2013", label: "Braven's first pilot — 17 students at San José State" },
];

const EMPLOYERS = ["Google", "LinkedIn", "Adobe", "Cisco", "Salesforce", "Kaiser Permanente", "PwC", "Deloitte", "NVIDIA", "PayPal", "City of San José", "Intuit"];

export default function Home() {
  const events = upcomingEvents().slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(63_93_245/0.22),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-32 pb-16 sm:px-6 sm:pt-40 lg:grid-cols-[1.1fr_1fr] lg:pb-24">
          <div>
            <FadeIn>
              <Link
                href="/events"
                className="group inline-flex items-center gap-2 rounded-full border bg-white/80 py-1 pr-3 pl-1 text-xs font-medium shadow-sm backdrop-blur"
              >
                <span className="rounded-full bg-brand-blue px-2 py-0.5 text-white">New</span>
                {upcomingEvents().length} events this season at SJSU
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeIn>
            <FadeIn delay={0.06}>
              <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-7xl">
                Your career starts with your <span className="font-serif font-normal tracking-[-0.02em] text-brand-blue italic">people.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Braven Hub brings Braven Fellows and San José State students everything to land a strong first job — events, alumni, matched jobs and an AI coach. No login, ever.
              </p>
            </FadeIn>
            <FadeIn delay={0.18} className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="group inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgb(1_25_54/0.25)] transition hover:bg-brand-navy/90">
                Browse events
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/coach" className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-medium transition hover:bg-muted">
                Try the AI coach
              </Link>
            </FadeIn>
            <FadeIn delay={0.24} className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[228, 330, 160, 30].map((h, i) => (
                  <span key={i} className="grid size-8 place-items-center rounded-full border-2 border-white text-[11px] font-semibold text-white" style={{ background: `hsl(${h} 70% 55%)` }}>
                    {["DR", "TO", "KL", "TW"][i]}
                  </span>
                ))}
              </div>
              <span>
                <strong className="text-brand-navy">12K+ Fellows</strong> in the Braven network
              </span>
            </FadeIn>
          </div>
          <HeroCollage />
        </div>
      </section>

      {/* EMPLOYER MARQUEE */}
      <section className="border-y bg-white py-6">
        <p className="mb-4 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">Fellows and coaches from</p>
        <div className="mask-fade-x overflow-hidden">
          <div className="animate-marquee flex w-max gap-14 pr-14">
            {[...EMPLOYERS, ...EMPLOYERS].map((e, i) => (
              <span key={i} className="text-lg font-semibold tracking-tight whitespace-nowrap text-brand-navy/35">
                {e}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PHOTO CAROUSEL */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto mb-10 flex max-w-6xl flex-col justify-between gap-4 px-4 sm:flex-row sm:items-end sm:px-6">
          <FadeIn>
            <p className="text-sm font-medium text-brand-blue">Moments</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Life at <span className="font-serif font-normal italic">Braven</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="max-w-sm text-muted-foreground">Panels, learning labs, mixers and capstones — from SJSU to Braven communities across the country.</p>
          </FadeIn>
        </div>
        <PhotoCarousel />
      </section>

      {/* FEATURES BENTO */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <FadeIn className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-brand-blue">Everything in one place</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">From first coffee chat to first offer.</h2>
        </FadeIn>
        <Stagger className="grid gap-4 md:grid-cols-6">
          <Bento className="md:col-span-4" href="/events" icon={CalendarCheck} title="RSVP in one tap" text="Professional development events from Braven and the SJSU Career Center. RSVP and you'll get a Google Calendar invite that updates if anything changes.">
            <div className="mt-6 flex flex-wrap gap-2">
              {["Workshops", "Alumni panels", "Mock interviews", "Site visits", "Mixers"].map((t) => (
                <span key={t} className="rounded-full border bg-white px-3 py-1 text-xs font-medium">
                  {t}
                </span>
              ))}
            </div>
          </Bento>
          <Bento className="md:col-span-2" href="/events" icon={BellRing} title="Text reminders" text="A confirmation text now, then reminders the day before and 2 hours before — with directions." dark />
          <Bento className="md:col-span-2" href="/events/linkedin-launch" icon={MapPinned} title="Never get lost" text="Every event has a live map plus walking & parking notes for campus buildings." />
          <Bento className="md:col-span-4" href="/alumni" icon={Users} title="Alumni who say yes" text="Search Braven Fellows, SJSU alumni and Leadership Coaches by the career you want. See who's open to a coffee chat, resume review, mock interview or referral.">
            <div className="mt-6 flex -space-x-2">
              {[228, 210, 265, 190, 12, 330, 160, 145].map((h, i) => (
                <span key={i} className="size-9 rounded-full border-2 border-white" style={{ background: `linear-gradient(135deg, hsl(${h} 75% 60%), hsl(${h + 30} 70% 45%))` }} />
              ))}
              <span className="grid size-9 place-items-center rounded-full border-2 border-white bg-brand-navy text-[11px] font-semibold text-white">+</span>
            </div>
          </Bento>
          <Bento className="md:col-span-3" href="/jobs" icon={Briefcase} title="Jobs matched to you" text="Tell us your major and interests — we rank internships and new-grad roles by fit and explain why." />
          <Bento className="md:col-span-3" href="/coach" icon={FileText} title="AI resume & interview coach" text="Instant resume scoring and bullet rewrites, STAR-method mock interviews, cover letters and elevator pitches." accent />
        </Stagger>
      </section>

      {/* STATS */}
      <section className="relative overflow-hidden bg-brand-navy py-20 text-white sm:py-28">
        <div className="bg-grid-dark mask-fade-y pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-40 -bottom-40 size-[36rem] rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="max-w-2xl">
            <p className="text-sm font-medium text-brand-sky">Why it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Go together, <span className="font-serif font-normal italic text-brand-sky">go further.</span>
            </h2>
          </FadeIn>
          <Stagger className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.value} className="bg-brand-navy p-7">
                <p className="text-4xl font-semibold tracking-tight sm:text-5xl">{s.value}</p>
                <p className="mt-3 text-sm text-white/60">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-4 text-xs text-white/35">Source: Braven and SJSU published outcomes (self-reported).</p>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <FadeIn>
            <p className="text-sm font-medium text-brand-blue">Coming up</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Save your seat.</h2>
          </FadeIn>
          <Link href="/events" className="hidden items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-blue sm:inline-flex">
            All events <ArrowRight className="size-4" />
          </Link>
        </div>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {events.map((e) => (
            <StaggerItem key={e.id}>
              <EventCard event={e} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-blue to-[#2a3fc4] px-6 py-14 text-white sm:px-14 sm:py-20">
            <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-xl">
                <MessageSquareText className="size-8 text-white/70" />
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Not sure where to start?</h2>
                <p className="mt-4 text-white/75">Ask Bravo, our AI guide — it knows every event, alum and job on the hub. Tap the button in the corner.</p>
              </div>
              <Link href="/coach" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-navy shadow-lg hover:bg-white/90">
                Open AI Coach
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}

function Bento({
  className,
  href,
  icon: Icon,
  title,
  text,
  children,
  dark,
  accent,
}: {
  className?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  children?: React.ReactNode;
  dark?: boolean;
  accent?: boolean;
}) {
  return (
    <StaggerItem className={className}>
      <Link
        href={href}
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgb(1_25_54/0.10)] ${
          dark ? "border-brand-navy bg-brand-navy text-white" : accent ? "border-brand-blue/20 bg-gradient-to-br from-[#eef1ff] to-white" : "bg-white"
        }`}
      >
        <span className={`grid size-11 place-items-center rounded-2xl ${dark ? "bg-white/10" : "bg-brand-blue/10"}`}>
          <Icon className={`size-5 ${dark ? "text-brand-sky" : "text-brand-blue"}`} />
        </span>
        <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
        <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-white/65" : "text-muted-foreground"}`}>{text}</p>
        {children}
        <ArrowRight className={`absolute top-7 right-7 size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 ${dark ? "text-white" : "text-brand-blue"}`} />
      </Link>
    </StaggerItem>
  );
}

export const revalidate = 3600;
