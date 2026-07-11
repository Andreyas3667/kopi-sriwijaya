export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-coffee-800">Tentang Platform</h1>
      <p className="mt-4 text-coffee-700">
        Platform <strong>UMKM Kopi Sumatera Selatan</strong> dikelola oleh Dinas Operasi UKM
        sebagai jembatan antara petani &amp; pelaku UMKM kopi dengan pembeli di seluruh Indonesia.
      </p>

      <ul className="mt-6 list-disc space-y-2 pl-5 text-coffee-700">
        <li>Peta interaktif menampilkan lokasi setiap UMKM beserta produknya.</li>
        <li>Pembeli memesan langsung melalui WhatsApp ke UMKM, lalu pengiriman dilakukan via ekspedisi.</li>
        <li>UMKM mengelola produk, stok, dan laporan penjualan dari dashboard masing-masing.</li>
        <li>Dinas memantau jumlah UMKM, sebaran wilayah, dan total penjualan se-Sumsel.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-coffee-800">Wilayah yang dikelola</h2>
      <p className="mt-2 text-coffee-700">
        Pagaralam, Lahat, Muara Enim, OKU Selatan, Empat Lawang, dan Palembang.
      </p>
    </div>
  );
}
