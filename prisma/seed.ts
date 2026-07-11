import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Role, OrderStatus } from "../src/lib/enums";

const prisma = new PrismaClient();

// Coordinates picked from the actual coffee-producing regencies in South Sumatera.
const REGIONS = [
  { name: "Pagaralam",   lat: -4.0218, lng: 103.2480, desc: "Dataran tinggi penghasil kopi Robusta dan Arabika." },
  { name: "Lahat",       lat: -3.7859, lng: 103.5430, desc: "Sentra kopi Robusta Bukit Barisan." },
  { name: "Muara Enim",  lat: -3.6500, lng: 103.7800, desc: "Wilayah perbukitan dengan kebun kopi rakyat." },
  { name: "OKU Selatan", lat: -4.6500, lng: 103.8500, desc: "Kopi semendo dengan cita rasa khas." },
  { name: "Empat Lawang",lat: -3.6000, lng: 103.0500, desc: "Daerah kopi tradisional Sumatera Selatan." },
  { name: "Palembang",   lat: -2.9909, lng: 104.7566, desc: "Pusat distribusi dan ritel kopi." },
];

async function main() {
  // Order matters: clear children first.
  await prisma.news.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.umkm.deleteMany();
  await prisma.user.deleteMany();
  await prisma.region.deleteMany();

  const regionRecords = await Promise.all(
    REGIONS.map((r) =>
      prisma.region.create({
        data: { name: r.name, description: r.desc },
      })
    )
  );
  const regionByName = Object.fromEntries(regionRecords.map((r) => [r.name, r]));

  const passwordHash = await bcrypt.hash("password", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Dinas Operasi UKM SumSel",
      email: "admin@kopi.id",
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: "Pembeli Demo",
      email: "buyer@kopi.id",
      password: passwordHash,
      role: Role.BUYER,
      phone: "6281234567890",
      address: "Jl. Sudirman No.1, Palembang",
    },
  });

  const sellers = [
    {
      ownerName: "Pak Sukirno",
      email: "sriwijaya@kopi.id",
      umkmName: "Kopi Sriwijaya",
      region: "Palembang",
      address: "Jl. Sudirman No.565, Kota Palembang",
      whatsapp: "6281909494793",
      lat: -2.9760, lng: 104.7754,
      desc: "UMKM Kopi adalah platform yang membantu petani dan pelaku usaha kopi di Sumatera Selatan untuk terhubung dengan pasar yang lebih luas.",
      products: [
        { name: "Kopi Robusta Sriwijaya 250g", price: 45000, stock: 80, desc: "Robusta dataran rendah, body tebal, aroma cokelat.",
          variety: "Robusta", processing: "Natural", roastLevel: "Medium-Dark", flavorNotes: "cokelat, karamel, kacang", weightGram: 250 },
        { name: "Kopi Arabika Premium 200g",   price: 75000, stock: 40, desc: "Arabika single-origin, fruity dan bersih.",
          variety: "Arabika", processing: "Washed", roastLevel: "Medium", flavorNotes: "buah-buahan, bunga, citrus", weightGram: 200 },
      ],
    },
    {
      ownerName: "Ibu Marlina",
      email: "pagaralam@kopi.id",
      umkmName: "Kopi Pagaralam Highland",
      region: "Pagaralam",
      address: "Jl. Kebun Kopi No.12, Pagaralam",
      whatsapp: "6281234567001",
      lat: -4.0218, lng: 103.2480,
      desc: "Petani kopi generasi ketiga di lereng Gunung Dempo.",
      products: [
        { name: "Arabika Dempo 200g", price: 85000, stock: 30, desc: "Honey process, manis seperti karamel.",
          variety: "Arabika", processing: "Honey", roastLevel: "Medium", flavorNotes: "karamel, brown sugar, almond", weightGram: 200 },
        { name: "Robusta Dempo 500g", price: 70000, stock: 50,
          variety: "Robusta", processing: "Natural", roastLevel: "Dark", flavorNotes: "dark chocolate, tembakau", weightGram: 500 },
        { name: "Kopi Bubuk Tradisional 250g", price: 35000, stock: 100,
          variety: "Robusta", processing: "Natural", roastLevel: "Dark", flavorNotes: "earthy, smoky", weightGram: 250 },
      ],
    },
    {
      ownerName: "Pak Hendra",
      email: "lahat@kopi.id",
      umkmName: "Kopi Bukit Lahat",
      region: "Lahat",
      address: "Desa Pajar Bulan, Lahat",
      whatsapp: "6281234567002",
      lat: -3.7859, lng: 103.5430,
      desc: "Kopi rakyat dari koperasi petani Bukit Barisan.",
      products: [
        { name: "Robusta Bukit Lahat 250g", price: 40000, stock: 120,
          variety: "Robusta", processing: "Natural", roastLevel: "Medium-Dark", flavorNotes: "cokelat susu, hazelnut", weightGram: 250 },
        { name: "Kopi Tubruk Klasik 500g", price: 65000, stock: 60,
          variety: "Robusta", processing: "Natural", roastLevel: "Dark", flavorNotes: "earthy, dark chocolate", weightGram: 500 },
      ],
    },
    {
      ownerName: "Ibu Salma",
      email: "semendo@kopi.id",
      umkmName: "Kopi Semendo Asli",
      region: "OKU Selatan",
      address: "Kec. Semendo Darat Laut, OKU Selatan",
      whatsapp: "6281234567003",
      lat: -4.6500, lng: 103.8500,
      desc: "Kopi semendo turun-temurun, diolah natural.",
      products: [
        { name: "Robusta Semendo 250g", price: 50000, stock: 0,
          variety: "Robusta", processing: "Natural", roastLevel: "Medium-Dark", flavorNotes: "cokelat, kacang, rempah", weightGram: 250 },
      ],
    },
    {
      ownerName: "Pak Bayu",
      email: "empatlawang@kopi.id",
      umkmName: "Kopi Empat Lawang Sejahtera",
      region: "Empat Lawang",
      address: "Tebing Tinggi, Empat Lawang",
      whatsapp: "6281234567004",
      lat: -3.6000, lng: 103.0500,
      desc: "Cita rasa earthy khas Empat Lawang.",
      products: [
        { name: "Robusta Empat Lawang 1kg", price: 130000, stock: 25,
          variety: "Robusta", processing: "Natural", roastLevel: "Dark", flavorNotes: "earthy, woody, dark chocolate", weightGram: 1000 },
        { name: "Kopi Arabika Robusta Blend 250g", price: 55000, stock: 40,
          variety: "Blend", processing: "Washed", roastLevel: "Medium", flavorNotes: "cokelat, sweet, citrus", weightGram: 250 },
      ],
    },
  ];

  for (const s of sellers) {
    const owner = await prisma.user.create({
      data: {
        name: s.ownerName,
        email: s.email,
        password: passwordHash,
        role: Role.UMKM,
        phone: s.whatsapp,
        address: s.address,
        regionId: regionByName[s.region].id,
      },
    });

    const umkm = await prisma.umkm.create({
      data: {
        name: s.umkmName,
        description: s.desc,
        address: s.address,
        whatsapp: s.whatsapp,
        latitude: s.lat,
        longitude: s.lng,
        regionId: regionByName[s.region].id,
        ownerId: owner.id,
        products: {
          create: s.products.map(({ desc, ...rest }) => ({
            name: rest.name,
            price: rest.price,
            stock: rest.stock,
            description: desc ?? null,
            variety: rest.variety ?? null,
            processing: rest.processing ?? null,
            roastLevel: rest.roastLevel ?? null,
            flavorNotes: rest.flavorNotes ?? null,
            weightGram: rest.weightGram ?? null,
          })),
        },
      },
      include: { products: true },
    });

    // Seed a handful of completed orders for the first UMKM so dashboards have data.
    if (s.umkmName === "Kopi Sriwijaya") {
      const buyer = await prisma.user.findUniqueOrThrow({ where: { email: "buyer@kopi.id" } });
      for (let i = 0; i < 3; i++) {
        const product = umkm.products[i % umkm.products.length];
        const qty = 1 + i;
        await prisma.order.create({
          data: {
            buyerId: buyer.id,
            umkmId: umkm.id,
            status: OrderStatus.COMPLETED,
            total: product.price * qty,
            items: {
              create: [{ productId: product.id, quantity: qty, unitPrice: product.price }],
            },
          },
        });
      }
    }
  }

  await prisma.news.createMany({
    data: [
      {
        title: "Pelatihan Roasting untuk UMKM Kopi se-Sumsel",
        slug:  "pelatihan-roasting-umkm-kopi-sumsel",
        excerpt: "Dinas Operasi UKM SumSel mengadakan pelatihan roasting gratis bagi UMKM kopi.",
        content:
          "Dalam rangka meningkatkan kualitas produk kopi UMKM Sumatera Selatan, " +
          "Dinas Operasi UKM mengadakan pelatihan roasting gratis bersama instruktur Q-grader. " +
          "Pendaftaran dapat dilakukan melalui platform ini dengan menghubungi admin.\n\n" +
          "Pelatihan akan diadakan secara bertahap di Pagaralam, Lahat, dan Palembang.",
        authorId: admin.id,
      },
      {
        title: "Festival Kopi Sumsel 2026: Open Booth bagi UMKM",
        slug:  "festival-kopi-sumsel-2026",
        excerpt: "Pendaftaran booth UMKM dibuka untuk Festival Kopi Sumsel 2026.",
        content:
          "Festival Kopi Sumsel 2026 akan dilaksanakan di Palembang Icon. " +
          "UMKM yang terdaftar pada platform ini berhak mendapatkan harga booth khusus.",
        authorId: admin.id,
      },
      {
        title: "Tips Pengiriman Kopi Lewat Ekspedisi",
        slug:  "tips-pengiriman-kopi-ekspedisi",
        excerpt: "Cara mengemas biji kopi agar aroma tetap terjaga selama pengiriman.",
        content:
          "Pengemasan vakum atau penggunaan valve one-way membantu menjaga kualitas biji kopi " +
          "saat dikirim lintas pulau. Pastikan juga label berat dan tanggal sangrai tertera jelas.",
        authorId: admin.id,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("  admin@kopi.id  / password   (ADMIN)");
  console.log("  buyer@kopi.id  / password   (BUYER)");
  console.log("  sriwijaya@kopi.id / password (UMKM)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
