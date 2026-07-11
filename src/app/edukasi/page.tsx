import Link from "next/link";

export const metadata = {
  title: "Edukasi Kopi — Kopi Sriwijaya",
  description:
    "Pelajari varietas, proses, tingkat sangrai, profil aroma, dan metode seduh kopi Sumatera Selatan.",
};

const TOPICS = [
  {
    href: "/edukasi/varietas",
    icon: "🌱",
    title: "Varietas Kopi",
    desc: "Arabika, Robusta, Liberika — perbedaan rasa, tinggi tumbuh, dan karakter.",
  },
  {
    href: "/edukasi/proses",
    icon: "⚙️",
    title: "Proses Pasca-Panen",
    desc: "Natural, Honey, Washed, Wine, Anaerobic. Cara biji diolah menentukan rasa di cangkir.",
  },
  {
    href: "/edukasi/aroma",
    icon: "👃",
    title: "Profil Aroma",
    desc: "Cara membaca catatan rasa: cokelat, citrus, bunga, karamel — dari mana asalnya?",
  },
  {
    href: "/edukasi/seduh",
    icon: "☕",
    title: "Metode Seduh",
    desc: "Tubruk, V60, French Press, Aeropress, Espresso. Pilih sesuai karakter biji.",
  },
];

export default function EdukasiIndex() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl bg-gradient-to-br from-coffee-700 to-coffee-900 p-8 text-coffee-50 shadow">
        <h1 className="text-3xl font-bold">Mengenal Kopi Sumatera Selatan</h1>
        <p className="mt-2 max-w-2xl text-coffee-100">
          Dari lereng Bukit Barisan hingga cangkir Anda. Pahami varietas, proses pengolahan,
          aroma, dan cara menyeduh agar setiap pembelian terasa lebih bermakna.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <Link key={t.href} href={t.href}
            className="group rounded-xl border border-coffee-200 bg-white p-5 shadow-sm transition hover:border-coffee-400 hover:shadow">
            <div className="text-3xl">{t.icon}</div>
            <h2 className="mt-2 text-xl font-semibold text-coffee-800 group-hover:text-coffee-900">
              {t.title}
            </h2>
            <p className="mt-1 text-sm text-coffee-700">{t.desc}</p>
            <span className="mt-3 inline-block text-sm text-coffee-700 group-hover:underline">
              Baca selengkapnya →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-coffee-200 bg-coffee-50 p-5 text-sm text-coffee-700">
        <strong className="text-coffee-800">Tips:</strong> Setiap halaman produk di platform ini
        menampilkan varietas, proses, tingkat sangrai, dan catatan aroma — sehingga Anda bisa
        memilih kopi yang sesuai selera tanpa coba-coba.
      </div>
    </div>
  );
}
