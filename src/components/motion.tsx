"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function FadeIn({ delay = 0, y = 16, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease }}
      {...props}
    />
  );
}

export function Stagger({ children, className, gap = 0.06 }: { children: React.ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
      }}
      {...props}
    />
  );
}

export function PageHeader({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 pt-32 pb-12 sm:px-6 sm:pt-36">
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white/70 px-3 py-1 text-xs font-medium text-brand-blue shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand-blue" />
            {eyebrow}
          </span>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
            {title} {accent && <span className="font-serif font-normal italic text-brand-blue">{accent}</span>}
          </h1>
        </FadeIn>
        {children && <FadeIn delay={0.1}>{children}</FadeIn>}
      </div>
    </section>
  );
}
