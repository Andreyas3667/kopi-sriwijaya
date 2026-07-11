"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

// Driven imperatively (vanilla Leaflet, not react-leaflet) so we control init
// and cleanup precisely. React 18 StrictMode + Next.js HMR re-run effects, and
// react-leaflet's `MapContainer` will throw "Map container is already
// initialized" the second time around. The mapRef guard + map.remove() on
// cleanup makes the lifecycle safe.

export type MapUmkm = {
  id: number;
  name: string;
  address: string;
  description: string | null;
  latitude: number;
  longitude: number;
  region: { name: string };
  productCount: number;
};

const coffeeIcon = L.divIcon({
  className: "",
  html: `<div style="
    background:#6b4530;
    color:#faf6f1;
    border-radius:9999px;
    width:32px;height:32px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(0,0,0,.25);
    font-size:18px;
  ">☕</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function UmkmMap({ umkms }: { umkms: MapUmkm[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([-3.319437, 103.914399], 7);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    for (const u of umkms) {
      L.marker([u.latitude, u.longitude], { icon: coffeeIcon })
        .addTo(map)
        .bindPopup(buildPopup(u));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [umkms]);

  return (
    <div
      ref={containerRef}
      className="h-[520px] w-full rounded-xl border border-coffee-200 shadow-sm"
    />
  );
}

function buildPopup(u: MapUmkm): string {
  const desc = u.description
    ? `<p style="color:#6b4530;margin:4px 0 0">${escapeHtml(u.description)}</p>`
    : "";
  return `
    <div style="min-width:200px">
      <div style="font-weight:600;color:#523427">${escapeHtml(u.name)}</div>
      <div style="color:#6b4530">${escapeHtml(u.address)}</div>
      <div style="font-size:12px;color:#855838">${escapeHtml(u.region.name)} • ${u.productCount} produk</div>
      ${desc}
      <a href="/umkm/${u.id}"
         style="display:inline-block;margin-top:8px;background:#6b4530;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:500;text-decoration:none">
        Lihat Detail &amp; Pesan
      </a>
    </div>
  `;
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return s.replace(/[&<>"']/g, (c) => map[c]);
}
