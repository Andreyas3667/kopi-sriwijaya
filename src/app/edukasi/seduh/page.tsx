import { ArticleLayout, Card } from "@/components/edukasi/Article";

export const metadata = {
  title: "Metode Seduh — Edukasi",
  description: "Tubruk, V60, French Press, Aeropress, Espresso — pilih sesuai karakter biji.",
};

export default function SeduhPage() {
  return (
    <ArticleLayout
      title="Metode Seduh Kopi"
      intro="Biji yang sama bisa berasa berbeda tergantung cara menyeduh. Pilih metode sesuai karakter kopi & alat yang Anda punya."
    >
      <Card title="☕ Tubruk (Tradisional Indonesia)">
        <p><strong>Rasio:</strong> 1 sdm bubuk : 150 ml air panas (~92°C). Aduk, tunggu 4 menit, ampas mengendap.</p>
        <p><strong>Cocok untuk:</strong> Robusta dark roast, kopi tradisional. Body tebal, sederhana, no-fuss.</p>
      </Card>

      <Card title="🌀 V60 / Pour Over">
        <p><strong>Rasio:</strong> 15g bubuk : 250ml air, suhu 92–94°C, total waktu 2:30–3:00 menit.</p>
        <p>Bloom 30 detik dengan 30g air, lalu tuang melingkar pelan-pelan.</p>
        <p><strong>Cocok untuk:</strong> Arabika single-origin, washed/honey. Hasil bersih, asam terang menonjol.</p>
      </Card>

      <Card title="🥄 French Press">
        <p><strong>Rasio:</strong> 30g bubuk kasar : 500ml air ~93°C. Aduk, tutup, tunggu 4 menit, tekan pelan.</p>
        <p><strong>Cocok untuk:</strong> Natural process, blend, atau Robusta yang ingin body penuh.</p>
      </Card>

      <Card title="🚀 Aeropress">
        <p>Cepat (1–2 menit), portabel. Banyak resep — coba <em>inverted method</em>: bubuk halus,
          steep 1 menit, tekan 30 detik. Bisa jadi pseudo-espresso.</p>
        <p><strong>Cocok untuk:</strong> hampir semua biji. Eksperimen rasio bebas.</p>
      </Card>

      <Card title="⚡ Espresso">
        <p>Butuh mesin & grinder presisi. <strong>18g in : 36g out dalam 25–30 detik.</strong></p>
        <p><strong>Cocok untuk:</strong> blend Robusta+Arabika untuk crema tebal & body penuh.
          Banyak UMKM Sumsel menjual blend khusus espresso.</p>
      </Card>

      <Card title="Aturan emas">
        <ul className="list-disc space-y-1 pl-5 text-coffee-700">
          <li><strong>Giling sesaat sebelum seduh.</strong> Aroma berkurang drastis 15 menit setelah digiling.</li>
          <li>Air bersih, tidak terlalu mendidih (90–94°C).</li>
          <li>Konsumsi biji dalam <strong>2–4 minggu</strong> setelah tanggal sangrai (lihat label).</li>
          <li>Simpan di wadah kedap udara, jauh dari sinar matahari & freezer.</li>
        </ul>
      </Card>
    </ArticleLayout>
  );
}
