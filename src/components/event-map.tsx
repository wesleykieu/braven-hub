"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { BravenEvent } from "@/data/events";

function pin(active: boolean, label?: string) {
  return L.divIcon({
    className: "braven-pin",
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42],
    html: `<div style="position:relative;width:40px;height:48px;">
      ${active ? '<span style="position:absolute;left:4px;top:4px;width:32px;height:32px;border-radius:999px;background:#3f5df5;opacity:.35;animation:ping 1.6s cubic-bezier(0,0,.2,1) infinite"></span>' : ""}
      <div style="position:absolute;left:4px;top:2px;width:32px;height:32px;border-radius:999px 999px 999px 4px;transform:rotate(-45deg);background:${active ? "#3f5df5" : "#011936"};box-shadow:0 6px 16px rgba(1,25,54,.35);border:3px solid #fff"></div>
      <span style="position:absolute;left:0;top:9px;width:40px;text-align:center;color:#fff;font:600 11px system-ui">${label ?? ""}</span>
    </div>
    <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
  });
}

function FitBounds({ events }: { events: BravenEvent[] }) {
  const map = useMap();
  useEffect(() => {
    if (events.length > 1) {
      map.fitBounds(L.latLngBounds(events.map((e) => [e.lat, e.lng])), { padding: [40, 40], maxZoom: 16 });
    }
  }, [events, map]);
  return null;
}

export default function EventMap({
  events,
  activeId,
  zoom = 17,
  onSelect,
}: {
  events: BravenEvent[];
  activeId?: string;
  zoom?: number;
  onSelect?: (id: string) => void;
}) {
  const center = events.find((e) => e.id === activeId) ?? events[0];
  if (!center) return null;
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className="size-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {events.length > 1 && <FitBounds events={events} />}
      {events.map((e, i) => (
        <Marker
          key={e.id}
          position={[e.lat, e.lng]}
          icon={pin(e.id === activeId || events.length === 1, events.length > 1 ? String(i + 1) : "")}
          eventHandlers={{ click: () => onSelect?.(e.id) }}
        >
          <Popup>
            <strong>{e.title}</strong>
            <br />
            {e.venue}
            {e.room ? ` · ${e.room}` : ""}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
