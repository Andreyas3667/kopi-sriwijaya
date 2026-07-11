import { ArticleLayout, Card } from "@/components/edukasi/Article";

export const metadata = {
  title: "Varietas Kopi — Edukasi",
  description: "Mengenal Arabika, Robusta, dan Liberika dan karakteristiknya.",
};

export default function VarietasPage() {
  return (
    <ArticleLayout
      title="Varietas Kopi"
      intro="Sumatera Selatan menanam tiga varietas utama. Masing-masing tumbuh di ketinggian berbeda dan menghasilkan profil rasa yang khas."
    >
      <Card title="🌿 Arabika (Coffea arabica)">
        <p>Tumbuh ideal di <strong>1.000–2.000 mdpl</strong>. Karakter rasanya cenderung
          <em> kompleks, asam menyenangkan, fruity</em>, dengan kadar kafein sekitar 1,2%.</p>
        <p>Di Sumsel, Arabika ditanam di lereng Gunung Dempo (Pagaralam) dan beberapa
          dataran tinggi Lahat. Catatan rasa khas: <strong>karamel, brown sugar, citrus, bunga</strong>.</p>
      </Card>

      <Card title="🌳 Robusta (Coffea canephora)">
        <p>Tumbuh di <strong>400–800 mdpl</strong>, lebih tahan hama. Karakter rasa
          <em> body tebal, pahit, earthy</em>, kafein ~2,2% — dua kali lipat Arabika.</p>
        <p>Robusta adalah tulang punggung produksi kopi Sumsel: Lahat, Empat Lawang,
          OKU Selatan, Muara Enim. Cocok untuk kopi tubruk dan blend espresso.
          Catatan rasa khas: <strong>cokelat hitam, kacang, tembakau, rempah</strong>.</p>
      </Card>

      <Card title="🍃 Liberika & Excelsa">
        <p>Lebih jarang. Bijinya lebih besar dengan rasa <em>buah-fermentasi yang khas</em>.
          Kadang dijadikan <strong>blend</strong> untuk menambah dimensi rasa.</p>
      </Card>

      <Card title="Cara membaca label di platform ini">
        <p>Setiap produk menampilkan tag <strong>Varietas</strong>: Arabika, Robusta,
          Liberika, atau Blend. Pemula yang menyukai rasa <em>strong & nutty</em> bisa
          mulai dari Robusta. Yang ingin eksplorasi <em>aroma kompleks</em> mulailah dari
          Arabika single-origin.</p>
      </Card>
    </ArticleLayout>
  );
}
