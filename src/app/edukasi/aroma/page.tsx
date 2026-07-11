import { ArticleLayout, Card } from "@/components/edukasi/Article";

export const metadata = {
  title: "Profil Aroma Kopi — Edukasi",
  description: "Memahami catatan aroma: cokelat, citrus, bunga, karamel — dan cara mengenalinya.",
};

const FAMILIES = [
  { emoji: "🍫", name: "Cokelat & Kakao", notes: ["dark chocolate","cocoa","cokelat susu"], origin: "Khas Robusta gelap & wet-hulled. Asal: Maillard reaction saat sangrai medium-dark." },
  { emoji: "🍯", name: "Karamel & Manis", notes: ["karamel","brown sugar","madu","toffee"], origin: "Honey process & medium roast. Gula sederhana ter-karamelisasi." },
  { emoji: "🥜", name: "Kacang & Roasted", notes: ["almond","hazelnut","pecan","kenari"], origin: "Sangrai medium pada Arabika balanced." },
  { emoji: "🍋", name: "Citrus & Asam Cerah", notes: ["lemon","jeruk","grapefruit","apel hijau"], origin: "Arabika dataran tinggi, washed process, light roast." },
  { emoji: "🍓", name: "Berry & Buah Tropis", notes: ["stroberi","blueberry","markisa","mangga"], origin: "Natural & anaerobic process, Arabika light/medium roast." },
  { emoji: "🌸", name: "Bunga", notes: ["jasmine","melati","mawar","bergamot"], origin: "Arabika dataran sangat tinggi, washed, light roast." },
  { emoji: "🌿", name: "Earthy & Herbal", notes: ["tembakau","tanah basah","cedar","pine"], origin: "Wet-hulled Sumatra, dark roast Robusta." },
  { emoji: "🌶️", name: "Rempah", notes: ["kayu manis","cengkeh","kapulaga"], origin: "Robusta dataran tinggi, sangrai medium-dark." },
];

export default function AromaPage() {
  return (
    <ArticleLayout
      title="Profil Aroma Kopi"
      intro="Catatan aroma di label produk bukan tambahan rasa — itu deskripsi rasa alami yang muncul saat diseduh tanpa gula. Berikut delapan keluarga aroma utama."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {FAMILIES.map((f) => (
          <Card key={f.name} title={`${f.emoji} ${f.name}`}>
            <div className="flex flex-wrap gap-1 text-xs">
              {f.notes.map((n) => (
                <span key={n} className="rounded-full bg-coffee-100 px-2 py-0.5 text-coffee-800">
                  {n}
                </span>
              ))}
            </div>
            <p className="text-sm">{f.origin}</p>
          </Card>
        ))}
      </div>

      <Card title="Tips menemukan kopi yang Anda suka">
        <ul className="list-disc space-y-1 pl-5 text-coffee-700">
          <li>Suka kopi <strong>kuat & manis</strong>? Cari notes <em>cokelat + karamel</em>.</li>
          <li>Suka kopi <strong>ringan & segar</strong>? Cari notes <em>citrus / berry</em>.</li>
          <li>Penggemar <strong>kopi tubruk klasik</strong>? Pilih notes <em>earthy / rempah</em>.</li>
          <li>Mulai eksplorasi? Pilih satu kopi dari setiap kategori, bandingkan dalam satu minggu.</li>
        </ul>
      </Card>
    </ArticleLayout>
  );
}
