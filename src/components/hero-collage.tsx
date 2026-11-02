"use client";

import { motion } from "framer-motion";
import { BellRing, CalendarCheck2, Sparkles } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroCollage() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[500px]">
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ duration: 0.9, ease, delay: 0.1 }}
        className="absolute top-0 left-0 h-[68%] w-[68%] overflow-hidden rounded-[28px] border-4 border-white shadow-[0_30px_60px_rgb(1_25_54/0.18)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/home.jpg" alt="A Braven Fellow speaking at an event" className="size-full object-cover" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: 3 }}
        animate={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ duration: 0.9, ease, delay: 0.25 }}
        className="absolute right-0 bottom-0 h-[58%] w-[62%] overflow-hidden rounded-[28px] border-4 border-white shadow-[0_30px_60px_rgb(1_25_54/0.18)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/sjsu.jpeg" alt="Braven SJSU Fellows at a whiteboard" className="size-full object-cover" />
      </motion.div>

      {/* Floating UI chips */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.6 }}
        className="absolute top-[8%] right-[-2%] w-56 rounded-2xl border bg-white/95 p-3.5 shadow-xl backdrop-blur sm:right-[-6%]"
      >
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
            <CalendarCheck2 className="size-4" /> You&apos;re going!
          </div>
          <p className="mt-1.5 text-sm font-semibold">Mock Interview Night</p>
          <p className="text-xs text-muted-foreground">Added to Google Calendar</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.8 }}
        className="absolute bottom-[34%] left-[-4%] w-60 rounded-2xl bg-brand-navy p-3.5 text-white shadow-xl sm:left-[-10%]"
      >
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
          <div className="flex items-center gap-2 text-xs text-brand-sky">
            <BellRing className="size-3.5" /> Text · now
          </div>
          <p className="mt-1.5 text-[13px] leading-snug">Reminder: LinkedIn Launch is tomorrow, 5:30pm · Clark Hall 140 📍</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease, delay: 1 }}
        className="absolute bottom-[-3%] left-[6%] flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 text-xs font-medium shadow-lg"
      >
        <Sparkles className="size-3.5 text-brand-blue" /> Resume score <span className="text-brand-blue">72 → 91</span>
      </motion.div>
    </div>
  );
}
