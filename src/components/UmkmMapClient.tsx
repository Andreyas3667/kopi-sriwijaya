"use client";

import dynamic from "next/dynamic";
import type { MapUmkm } from "./UmkmMap";

const UmkmMap = dynamic(() => import("./UmkmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-xl border border-coffee-200 bg-coffee-100 text-coffee-700">
      Memuat peta…
    </div>
  ),
});

export function UmkmMapClient({ umkms }: { umkms: MapUmkm[] }) {
  return <UmkmMap umkms={umkms} />;
}
