"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { PHOTOS } from "@/data/photos";

/** Continuously auto-scrolling photo reel. Pauses on hover/touch, resumes on its own. */
export function PhotoCarousel() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", dragFree: true }, [
    AutoScroll({ speed: 1, startDelay: 0, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: false }),
  ]);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const auto = embla?.plugins()?.autoScroll;
    if (!auto) return;
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    embla.on("autoScroll:play", onPlay).on("autoScroll:stop", onStop);
    return () => {
      embla.off("autoScroll:play", onPlay).off("autoScroll:stop", onStop);
    };
  }, [embla]);

  // Respect reduced-motion preferences.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) embla?.plugins()?.autoScroll?.stop();
  }, [embla]);

  const nudge = (dir: 1 | -1) => {
    if (!embla) return;
    const auto = embla.plugins().autoScroll;
    auto?.stop();
    if (dir === 1) embla.scrollNext();
    else embla.scrollPrev();
    setTimeout(() => auto?.play(), 1200);
  };

  const toggle = () => {
    const auto = embla?.plugins()?.autoScroll;
    if (!auto) return;
    if (auto.isPlaying()) auto.stop();
    else auto.play();
  };

  return (
    <div className="relative">
      <div ref={emblaRef} className="mask-fade-x overflow-hidden">
        <div className="flex touch-pan-y">
          {PHOTOS.map((p, i) => (
            <div key={p.src} className="min-w-0 flex-[0_0_78%] pl-4 sm:flex-[0_0_46%] lg:flex-[0_0_34%]">
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.caption}
                  draggable={false}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  loading={i < 4 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/0 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                  <p className="max-w-xs text-[15px] font-medium">{p.caption}</p>
                  <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">{p.tag}</span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <button onClick={toggle} className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-medium hover:bg-muted">
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? "Pause" : "Play"}
        </button>
        <div className="flex gap-2">
          <button onClick={() => nudge(-1)} className="grid size-10 place-items-center rounded-full border bg-white hover:bg-muted" aria-label="Previous">
            <ArrowLeft className="size-4" />
          </button>
          <button onClick={() => nudge(1)} className="grid size-10 place-items-center rounded-full border bg-white hover:bg-muted" aria-label="Next">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
