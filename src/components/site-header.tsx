"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "./profile-provider";

const NAV = [
  { href: "/events", label: "Events" },
  { href: "/alumni", label: "Alumni" },
  { href: "/jobs", label: "Jobs" },
  { href: "/coach", label: "AI Coach" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isPersonalized, profile, setPersonalizeOpen } = useProfile();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border px-3 pl-5 transition-all duration-300",
          scrolled ? "border-border/80 bg-white/80 shadow-[0_8px_30px_rgb(1_25_54/0.08)] backdrop-blur-xl" : "border-transparent bg-white/40 backdrop-blur-sm",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Braven Hub home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/braven-navy.svg" alt="Braven" className="h-[18px] w-auto" />
          <span className="rounded-full bg-brand-navy px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">HUB</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className="relative rounded-full px-4 py-2 text-sm font-medium text-brand-navy/70 transition-colors hover:text-brand-navy">
                {active && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-brand-navy/[0.06]" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                )}
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPersonalizeOpen(true)}
            className="hidden items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-navy/90 sm:inline-flex"
          >
            <Sparkles className="size-4 text-brand-sky" />
            {isPersonalized ? `Hi, ${profile.name.split(" ")[0] || "there"}` : "Personalize"}
          </button>
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-6xl rounded-3xl border bg-white/95 p-2 shadow-xl backdrop-blur md:hidden"
          >
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-2xl px-4 py-3 text-base font-medium hover:bg-muted">
                {n.label}
              </Link>
            ))}
            <button onClick={() => setPersonalizeOpen(true)} className="mt-1 w-full rounded-2xl bg-brand-navy px-4 py-3 text-left text-base font-medium text-white">
              {isPersonalized ? "Edit my profile" : "Personalize (no login)"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
