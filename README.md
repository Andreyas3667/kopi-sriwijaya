# Kopi Sriwijaya — Platform UMKM Kopi Sumatera Selatan

Platform yang menghubungkan **UMKM Kopi** di Sumatera Selatan dengan **pembeli** di seluruh Indonesia, dijembatani oleh **Dinas Operasi UKM** (admin).

Versi modern dari aplikasi Laravel `KerjaPraktik_DinasOperasi_UKM_SumSel/umkm` — domain & alur bisnis sama, kode lebih ringkas, type-safe, dan tidak butuh setup PHP/MySQL untuk berjalan lokal.

---

## Alur Pembeli (publik / login)

1. Buka beranda → lihat **peta interaktif** (Leaflet) dengan pin tiap UMKM kopi + **berita terbaru** di bawahnya.
2. Klik pin → ringkasan UMKM → **Lihat Detail**.
3. Di halaman detail, pilih produk + jumlah, isi nama/alamat → **Pesan via WhatsApp**.
4. Pesanan tersimpan di database (status `PENDING`) **dan** browser membuka `wa.me/<no-umkm>` dengan pesan otomatis berisi rincian + total.
5. UMKM/admin memverifikasi pesanan → pengiriman lewat ekspedisi.
6. Pembeli yang login dapat membuka `/profile/pesanan` untuk melihat riwayat pesanan, status realtime, dan menghubungi ulang UMKM.

## Peran & Hak Akses

| Role  | Akses |
|-------|-------|
| **BUYER**  | Peta, berita, detail UMKM, form pesan WhatsApp. Boleh tanpa login (anonymous → "Guest Buyer"). Login mendapat halaman profil + riwayat pesanan. |
| **UMKM**   | `/dashboard` — chart pendapatan/status, CRUD produk + alert stok rendah, verifikasi pesanan masuk, edit profil UMKM (lokasi, kontak), export PDF/Excel/CSV laporan penjualan sendiri. |
| **ADMIN**  | `/admin` — chart se-Sumsel (pendapatan bulanan, sebaran wilayah, status, top produk), kelola seluruh UMKM, wilayah, semua pesanan, manajemen pengguna (reset password, ganti role), CRUD berita, export PDF/Excel/CSV. |

## Fitur Lengkap

### Beranda / Publik
- **Hero section** dengan ringkasan & call-to-action
- Peta Leaflet dengan ikon UMKM dan popup detail
- **Pencarian & filter wilayah** pada daftar UMKM (live, client-side)
- 3 berita terbaru (preview ke `/berita`)
- Halaman berita: list (`/berita`) + detail (`/berita/[slug]`)
- **Edukasi Kopi**: `/edukasi` (varietas, proses pasca-panen, profil aroma, metode seduh)

### Pemesanan & Stok
- Form pesan dengan kalkulasi total realtime
- Validasi stok di **server-side** (saat pesan dibuat **dan** saat status diubah ke COMPLETED)
- Pembuatan order DB + redirect WhatsApp dengan template pesan profesional
- **Stok otomatis berkurang** ketika pesanan ditandai COMPLETED (transaksi Prisma atomik)
- **Badge "Stok Habis" / "Stok terbatas"** di kartu produk; produk OOS otomatis hilang dari form pesan
- **Banner peringatan stok** di dashboard UMKM jika ada produk habis/rendah

### Produk dengan metadata kopi
- Setiap produk dapat dilengkapi: **varietas** (Arabika/Robusta/Liberika/Blend), **proses** (Natural/Honey/Washed/Wine/Anaerobic/Wet-hulled), **tingkat sangrai** (Light → Dark), **catatan aroma** (cokelat, citrus, dll), **berat (gram)**, dan **foto upload**
- Tampil sebagai tag berwarna di halaman detail UMKM
- Membantu pembeli memilih kopi sesuai selera

### Upload gambar
- API `/api/upload` (multipart, ADMIN/UMKM only, max 5MB jpg/png/webp/gif)
- Reusable `<ImageUpload>`: file picker + preview + opsi tempel URL
- Digunakan untuk: foto produk, cover berita, foto/logo UMKM
- File disimpan di `public/uploads/`

### Dashboard (admin & UMKM)
- **Chart bar**: pendapatan bulanan
- **Chart donut**: sebaran wilayah / status pesanan
- **Top produk** terlaris dengan jumlah & pendapatan
- **Period filter** preset (Bulan ini, 3/6/12 bulan, YTD, 1/2 tahun, Semua) + rentang custom
- Kartu ringkasan (UMKM, produk, pesanan, pendapatan)
- Alert stok rendah (≤5) untuk UMKM dan badge di list admin

### Export laporan
- **PDF** (landscape, A4) via `@react-pdf/renderer` — server-side, tanpa headless browser
- **Excel** (.xlsx multi-sheet) via `exceljs` — kolom rapi + sheet "Ringkasan"
- **CSV** untuk integrasi cepat
- Otomatis menghormati filter periode/status/wilayah; UMKM hanya melihat datanya sendiri

### Admin (Dinas)
- Manajemen UMKM (cari, filter wilayah, tambah satu-per-satu **atau bulk via CSV** dengan template download)
- Manajemen wilayah (tambah, hapus dengan proteksi referensi)
- Manajemen pengguna (cari, filter role, reset password, ganti role, hapus dengan proteksi admin terakhir)
- Pesanan: filter wilayah & status, ubah status (server menolak COMPLETED jika stok kurang), export
- **Berita** CRUD (judul → slug otomatis, draf vs terbit, cover dengan upload langsung)

### UMKM
- Dashboard ringkas + chart + **banner stok rendah/habis**
- CRUD produk dengan validasi stok/harga + metadata kopi (varietas, proses, sangrai, aroma, berat) + upload foto
- Verifikasi pesanan (PENDING → CONFIRMED → COMPLETED → stok otomatis berkurang, dengan re-check)
- Edit profil UMKM (lokasi lat/lng, kontak WA, deskripsi, foto/logo upload)

### Pembeli (login)
- Profil (nama, telepon, alamat) → otomatis prefill di form pemesanan berikutnya
- Riwayat pesanan dengan filter status
- Tombol "Hubungi UMKM" mengembalikan ke chat WhatsApp dengan referensi nomor pesanan

### SEO & Discoverability
- `metadataBase` + Open Graph + Twitter Card di root layout
- `generateMetadata` per halaman (UMKM detail, edukasi, dll)
- Auto-generated `/sitemap.xml` (UMKM, berita, edukasi)
- `/robots.txt` (allow publik, disallow `/admin`, `/dashboard`, `/profile`, `/api`)

---

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** dengan palette `coffee-*`
- **Prisma** + **SQLite** (file `prisma/dev.db`) — di production gampang di-switch ke MySQL/Postgres
- **NextAuth** (Credentials provider, JWT session, role-based middleware)
- **Leaflet** (vanilla, bukan react-leaflet — menghindari double-init di StrictMode/HMR)
- **Recharts** untuk chart bar/donut
- **@react-pdf/renderer** untuk export PDF (Node runtime)
- **exceljs** untuk export Excel
- **Zod** untuk validasi input API

## Setup Lokal

```bash
cd kopi-sriwijaya
cp .env.example .env
npm install
npx prisma generate     # generate Prisma client (postinstall biasanya otomatis)
npm run db:reset        # buat schema + isi data dummy (wilayah, UMKM, berita, contoh order)
npm run dev             # http://localhost:3000
```

> Setelah mengubah `prisma/schema.prisma`, jalankan `npx prisma generate` lalu
> restart `npm run dev` agar Next memuat client yang baru.

### Bulk import UMKM (admin)

1. Login sebagai admin → **Admin → Daftar UMKM → "⬆ Bulk CSV"**
2. Klik **"⬇ Download template CSV"** untuk mendapat contoh format
3. Isi/edit CSV di Excel/LibreOffice, simpan sebagai CSV (UTF-8)
4. Upload — laporan per-baris akan ditampilkan

### Akun demo (password semua: `password`)

| Email                | Role  |
|----------------------|-------|
| admin@kopi.id        | ADMIN |
| sriwijaya@kopi.id    | UMKM  |
| pagaralam@kopi.id    | UMKM  |
| lahat@kopi.id        | UMKM  |
| semendo@kopi.id      | UMKM  |
| empatlawang@kopi.id  | UMKM  |
| buyer@kopi.id        | BUYER |

---

## Struktur

```
src/
├── app/
│   ├── page.tsx              # Beranda + peta + berita preview
│   ├── about/page.tsx
│   ├── login/, register/
│   ├── berita/page.tsx, [slug]/page.tsx     # publik
│   ├── umkm/[id]/page.tsx                   # detail UMKM + form pesan
│   ├── profile/                             # area buyer login
│   │   ├── page.tsx                         # edit profil
│   │   └── pesanan/page.tsx                 # riwayat pesanan
│   ├── dashboard/                           # area UMKM
│   │   ├── page.tsx                         # ringkasan + chart
│   │   ├── produk/                          # CRUD
│   │   ├── pesanan/                         # verifikasi
│   │   └── profile/                         # profil UMKM
│   ├── admin/                               # area Dinas
│   │   ├── page.tsx                         # ringkasan + chart se-Sumsel
│   │   ├── umkm/, umkm/baru/                # kelola
│   │   ├── wilayah/                         # CRUD
│   │   ├── pesanan/                         # semua pesanan
│   │   ├── users/                           # manajemen pengguna
│   │   └── news/, news/baru/, news/[id]/    # berita CRUD
│   └── api/                                 # route handlers (REST)
│       ├── auth/[...nextauth]/, register/, profile/, profile/me/
│       ├── orders/, orders/[id]/
│       ├── exports/orders/{csv,xlsx,pdf}/   # export terpadu
│       ├── products/, products/[id]/
│       ├── umkm/, umkm/[id]/
│       ├── regions/, regions/[id]/
│       ├── users/[id]/                      # admin: reset/ubah role/hapus
│       └── news/, news/[id]/
├── components/                              # UI: Navbar, Sidebar, Map, OrderForm,
│                                            # ProductForm, PeriodFilter, ExportButtons,
│                                            # charts/RevenueBarChart, charts/DonutChart, …
├── lib/
│   ├── prisma.ts, auth.ts, dashboard.ts
│   ├── enums.ts                             # Role / OrderStatus const
│   ├── period.ts                            # parse preset → from/to
│   ├── analytics.ts                         # bundle dashboard data
│   ├── exportScope.ts                       # auth+filter resolver untuk export
│   ├── format.ts                            # rupiah & tanggal id-ID
│   ├── slug.ts                              # uniqueSlug untuk berita
│   └── whatsapp.ts                          # builder pesan wa.me
├── middleware.ts                            # proteksi /admin & /dashboard
└── types/next-auth.d.ts                     # augmentasi tipe Session
```

## Pemetaan ke Aplikasi Laravel Lama

| Laravel (lama)                         | Next.js (baru)                        |
|----------------------------------------|---------------------------------------|
| `MapsController@index` + `maps.blade`  | `app/page.tsx` + `components/UmkmMap` |
| `UMKMController@detail`                | `app/umkm/[id]/page.tsx`              |
| `UMKMController@transaksi` (POST)      | `app/api/orders/route.ts`             |
| `PenjualanController@verifikasi`       | `api/orders/[id]/route.ts` (PATCH)    |
| `PenjualanController@exportExcel/Pdf`  | `api/exports/orders/{xlsx,pdf,csv}/`  |
| `ProdukController` (umkm)              | `api/products/[id]/` + `app/dashboard/produk/*` |
| `AdminWilayahController` (resource)    | `api/regions/*` + `app/admin/wilayah` |
| `users` table + `RoleMiddleware`       | `User.role` + `src/middleware.ts`     |
| (tidak ada di lama) Berita             | `News` model + `app/admin/news`, `app/berita` |
| (tidak ada di lama) Manajemen pengguna | `app/admin/users` + `api/users/[id]`  |
| (tidak ada di lama) Riwayat pembeli    | `app/profile/pesanan`                 |

## Keamanan

- Password di-hash dengan **bcrypt** (10 rounds)
- Semua route mutating divalidasi dengan **Zod**
- Otorisasi diperiksa server-side: ADMIN bebas, UMKM hanya datanya sendiri (cek `umkm.ownerId === session.user.id`), BUYER tidak bisa memodifikasi
- Middleware menolak `/admin/*` & `/dashboard/*` untuk role yang salah
- Endpoint `/api/users/[id]` mencegah penghapusan/penurunan admin terakhir agar sistem tidak terkunci

---

## Deploy ke Hostinger

Hostinger menawarkan beberapa jenis paket. **Penting:** paket *Web Hosting / Premium Web Hosting* (yang murah) hanya mendukung PHP/Apache — **tidak bisa menjalankan Next.js**. Pilih salah satu yang cocok:

| Paket Hostinger                | Cocok untuk Next.js? | Catatan |
|--------------------------------|----------------------|---------|
| Web Hosting / Premium / Business | ❌ | PHP only. Tidak bisa. |
| **Cloud Hosting** (Startup/Pro/Global) | ✅ via "Application Hosting" / Node.js panel | Termudah; ada wizard Node.js. |
| **VPS** (KVM 1/2/4/…)          | ✅ | Kontrol penuh, perlu setup manual. Direkomendasikan untuk produksi. |

### Opsi A — VPS (rekomendasi untuk traffic serius)

1. Buat VPS Ubuntu 22.04 LTS di Hostinger (KVM 2 sudah cukup untuk awal).
2. SSH masuk:
   ```bash
   apt update && apt install -y curl git nginx
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   npm i -g pm2
   ```
3. Clone repo & install:
   ```bash
   git clone <url-repo-anda> /var/www/kopi-sriwijaya
   cd /var/www/kopi-sriwijaya
   npm ci
   ```
4. Buat `.env` (lihat bagian "Production env" di bawah).
5. Pakai **MySQL** Hostinger (atau Postgres external) — lihat "Pindah ke MySQL/Postgres".
6. Build & run:
   ```bash
   npx prisma generate
   npx prisma db push        # atau: npx prisma migrate deploy (lihat bawah)
   npm run db:seed           # opsional: hanya untuk first-run
   npm run build
   pm2 start npm --name kopi -- start
   pm2 save && pm2 startup
   ```
7. Reverse proxy nginx ke `localhost:3000`:
   ```nginx
   server {
     listen 80;
     server_name domain-anda.com;
     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```
8. Aktifkan SSL (gratis Let's Encrypt):
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d domain-anda.com
   ```

### Opsi B — Cloud Hosting (paling cepat, klik-klik)

1. Aktifkan paket Cloud Hosting → buka **hPanel → Advanced → Node.js**.
2. *Create Application*:
   - Node.js version: **20.x**
   - Startup file: `node_modules/next/dist/bin/next` dengan argument `start`
   - Root: folder upload kode
3. Upload sumber kode (Git deploy atau File Manager / SFTP).
4. Di Terminal panel:
   ```bash
   npm ci
   npx prisma generate
   npx prisma db push
   npm run build
   ```
5. *Restart* aplikasi dari panel. Domain otomatis di-route oleh Hostinger.

### Pindah ke MySQL / MariaDB (production)

SQLite cukup untuk dev tetapi bukan ide bagus di shared/cloud (file bisa hilang antar redeploy, tidak konkurensi-aman).

1. Buat database MySQL di hPanel Hostinger → catat host, port, user, pass, db.
2. Edit `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
   *(Tidak perlu menambah enum kembali — implementasi `Role`/`OrderStatus` saat ini lewat string sudah portabel.)*
3. Set di `.env`:
   ```
   DATABASE_URL="mysql://USER:PASS@HOST:3306/DBNAME"
   ```
4. Jalankan:
   ```bash
   npx prisma db push       # atau: npx prisma migrate deploy
   npm run db:seed          # hanya saat pertama kali
   ```

### Production env (`.env` di server)

```
DATABASE_URL="mysql://user:pass@hostinger-host:3306/dbname"
NEXTAUTH_URL="https://domain-anda.com"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NODE_ENV="production"
```

### Catatan deployment penting

- **Build memori**: Next + recharts butuh ~1GB RAM saat `npm run build`. Paket VPS KVM 1 (1GB RAM) kemungkinan butuh swap; KVM 2 lebih nyaman.
- **Migrasi schema** di production: jangan pakai `prisma db push` setelah live — gunakan `prisma migrate dev` saat dev untuk membuat file migration, lalu `prisma migrate deploy` di server.
- **Persistensi `public/uploads/`**: di **VPS**, folder ini tetap aman (file di disk). Di **Cloud Hosting yang re-deploy ke container baru** atau saat `npm run build` ulang, file lama bisa hilang. Solusi production:
  1. Mount folder uploads sebagai volume terpisah (VPS), **atau**
  2. Pindah ke object storage (S3, Cloudinary, UploadThing) — ganti implementasi `src/app/api/upload/route.ts`.
- **Backup DB**: kalau pakai SQLite (tidak disarankan untuk prod), backup file `prisma/dev.db`. Kalau MySQL, pakai cron `mysqldump`.
- **Domain**: arahkan A record domain ke IP VPS, atau gunakan domain bawaan Hostinger di Cloud Hosting.
- **NEXTAUTH_URL** menentukan canonical URL untuk sitemap & metadata Open Graph — set ke domain produksi sebelum build.

## Ide pengembangan lanjutan (belum dibuat)

Hal-hal yang bisa ditambah nanti untuk memaksimalkan platform:

- **Rating & ulasan pembeli** untuk pesanan COMPLETED → naikkan trust ke pembeli baru
- **Halaman per-wilayah** `/wilayah/[name]` (semua UMKM + peta zoom regional + statistik)
- **Halaman per-produk** `/produk/[id]` (SEO indeks + sharing tiap produk)
- **Notifikasi email/WhatsApp** ke UMKM saat ada pesanan baru (gunakan Resend/SendGrid; webhook WhatsApp Business API)
- **Wishlist / favorit** untuk pembeli
- **Voucher / promo wilayah** yang dikelola Dinas
- **Sertifikasi & badge** (mis. organic, fair-trade, halal) sebagai filter
- **Multi-bahasa** (id/en) untuk pasar ekspor
- **PWA / offline cache** agar UMKM bisa update produk saat sinyal lemah
- **Image optimization** lewat `next/image` + CDN (sekarang pakai `<img>` plain biar gampang)
- **Object storage** sebagai pengganti `public/uploads/` (S3, Cloudinary)
- **Audit log admin** (siapa mengubah apa, kapan)

## Lisensi

Kode contoh untuk Kerja Praktik di Dinas Operasi UKM Sumatera Selatan.
