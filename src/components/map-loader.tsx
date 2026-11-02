"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so it only renders in the browser.
export const EventMap = dynamic(() => import("./event-map"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-muted" />,
});
