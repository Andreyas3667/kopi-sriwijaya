import { ArticleLayout, Card } from "@/components/edukasi/Article";

export const metadata = {
  title: "Proses Pasca-Panen — Edukasi",
  description: "Natural, Honey, Washed, Wine, Anaerobic — bagaimana proses memengaruhi rasa.",
};

export default function ProsesPage() {
  return (
    <ArticleLayout
      title="Proses Pasca-Panen"
      intro="Setelah cherry kopi dipetik, ada banyak cara mengupas buahnya. Pilihan ini berdampak besar pada rasa akhir di cangkir."
    >
      <Card title="🌞 Natural / Dry Process">
        <p>Cherry dijemur utuh hingga kering, baru dikupas. Gula buahnya meresap ke dalam biji.</p>
        <p>Hasil: <strong>body tebal, manis, fruity</strong> seperti stroberi atau prune.
          Banyak Robusta Sumsel diolah natural karena alasan biaya & ketersediaan air.</p>
      </Card>

      <Card title="🍯 Honey Process">
        <p>Kulit dikupas, tapi <em>mucilage</em> (lendir manis) dibiarkan menempel saat dijemur.
          Variasi: yellow / red / black honey, tergantung berapa banyak mucilage tertinggal.</p>
        <p>Hasil: <strong>manis seperti karamel/madu, body sedang</strong>. Populer di
          Arabika premium Pagaralam.</p>
      </Card>

      <Card title="💧 Washed / Wet Process">
        <p>Mucilage dicuci sampai bersih dengan fermentasi air, baru dikeringkan.</p>
        <p>Hasil: <strong>bersih, asam terang, rasa kompleks</strong>. Cocok untuk
          single-origin Arabika yang ingin menonjolkan asal-usul.</p>
      </Card>

      <Card title="🍷 Wine & Anaerobic">
        <p>Fermentasi panjang (kadang dalam wadah kedap udara). Menghasilkan rasa
          <strong> buah fermentasi yang intens</strong> seperti anggur atau wine.
          Eksperimental, harga premium.</p>
      </Card>

      <Card title="🪣 Wet-Hulled / Giling Basah">
        <p>Khas Sumatera. Kulit tanduk dilepas saat biji masih basah, lalu dijemur.
          Hasil: <strong>body sangat tebal, earthy, herbal</strong> — ini yang membuat
          "Sumatra coffee" dikenal di dunia.</p>
      </Card>
    </ArticleLayout>
  );
}
