/// Seeds the storefront catalog with a real, varied product lineup across
/// every category — actual released devices with accurate specs, and real
/// photos (Unsplash, free-to-use under the Unsplash License) rather than
/// placeholder boxes. Idempotent: upserts by slug/sku, safe to re-run.
///
/// Run with: npx tsx prisma/seed-catalog.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function unsplash(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
}

const categories = [
  { name: "Smartphones", slug: "smartphones", featured: true },
  { name: "Tablets", slug: "tablets", featured: true },
  { name: "Laptops", slug: "laptops", featured: true },
  { name: "Smartwatches", slug: "smartwatches", featured: false },
  { name: "Headphones & Earbuds", slug: "headphones-earbuds", featured: true },
  { name: "Accessories", slug: "accessories", featured: false },
] as const;

const brands = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Google", slug: "google" },
  { name: "Xiaomi", slug: "xiaomi" },
  { name: "Sony", slug: "sony" },
  { name: "JBL", slug: "jbl" },
] as const;

type SeedProduct = {
  name: string;
  brand: (typeof brands)[number]["name"];
  category: (typeof categories)[number]["slug"];
  sku: string;
  description: string;
  price: number;
  discountPrice?: number;
  flashSale?: boolean;
  quantity: number;
  warranty: string;
  ram?: string;
  storage?: string;
  processor?: string;
  battery?: string;
  camera?: string;
  display?: string;
  featured?: boolean;
  newArrival?: boolean;
  image: string;
};

const flashSaleEndsAt = new Date();
flashSaleEndsAt.setDate(flashSaleEndsAt.getDate() + 14);

const products: SeedProduct[] = [
  // --- Smartphones ---
  {
    name: "Apple iPhone 15 Pro Max",
    brand: "Apple",
    category: "smartphones",
    sku: "APL-IP15PM-256",
    description:
      "Apple's flagship with a titanium design, the A17 Pro chip, and a 5x telephoto camera. Built for pro-level photography and performance.",
    price: 1850000,
    quantity: 6,
    warranty: "1 Year Manufacturer Warranty",
    ram: "8GB",
    storage: "256GB",
    processor: "Apple A17 Pro",
    battery: "4441mAh",
    camera: "48MP + 12MP + 12MP Triple Camera",
    display: "6.7-inch Super Retina XDR OLED, 120Hz",
    featured: true,
    newArrival: true,
    image: unsplash("1511707171634-5f897ff02aa9"),
  },
  {
    name: "Apple iPhone 15",
    brand: "Apple",
    category: "smartphones",
    sku: "APL-IP15-128",
    description: "The latest iPhone with Dynamic Island, a 48MP main camera, and the powerful A16 Bionic chip.",
    price: 1150000,
    quantity: 14,
    warranty: "1 Year Manufacturer Warranty",
    ram: "6GB",
    storage: "128GB",
    processor: "Apple A16 Bionic",
    battery: "3349mAh",
    camera: "48MP + 12MP Dual Camera",
    display: "6.1-inch Super Retina XDR OLED",
    newArrival: true,
    image: unsplash("1580910051074-3eb694886505"),
  },
  {
    name: "Apple iPhone 14",
    brand: "Apple",
    category: "smartphones",
    sku: "APL-IP14-128",
    description: "A reliable all-rounder with an advanced dual-camera system and all-day battery life.",
    price: 950000,
    discountPrice: 850000,
    flashSale: true,
    quantity: 11,
    warranty: "1 Year Manufacturer Warranty",
    ram: "6GB",
    storage: "128GB",
    processor: "Apple A15 Bionic",
    battery: "3279mAh",
    camera: "12MP + 12MP Dual Camera",
    display: "6.1-inch Super Retina XDR OLED",
    image: unsplash("1592750475338-74b7b21085ab"),
  },
  {
    name: "Apple iPhone 13 mini",
    brand: "Apple",
    category: "smartphones",
    sku: "APL-IP13M-128",
    description: "Full iPhone 13 power in a compact, one-handed-friendly body.",
    price: 650000,
    quantity: 9,
    warranty: "1 Year Manufacturer Warranty",
    ram: "4GB",
    storage: "128GB",
    processor: "Apple A15 Bionic",
    battery: "2438mAh",
    camera: "12MP + 12MP Dual Camera",
    display: "5.4-inch Super Retina XDR OLED",
    image: unsplash("1616348436168-de43ad0db179"),
  },
  {
    name: "Apple iPhone SE (3rd Gen)",
    brand: "Apple",
    category: "smartphones",
    sku: "APL-IPSE3-64",
    description: "Classic compact design with Touch ID, paired with the same chip found in iPhone 13.",
    price: 450000,
    quantity: 18,
    warranty: "1 Year Manufacturer Warranty",
    ram: "4GB",
    storage: "64GB",
    processor: "Apple A15 Bionic",
    battery: "2018mAh",
    camera: "12MP Single Camera",
    display: "4.7-inch Retina HD LCD",
    image: unsplash("1585060544812-6b45742d762f"),
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "smartphones",
    sku: "SAM-S24U-256",
    description: "Samsung's most powerful phone with a built-in S Pen, a 200MP main camera, and Galaxy AI features.",
    price: 1650000,
    quantity: 8,
    warranty: "1 Year Manufacturer Warranty",
    ram: "12GB",
    storage: "256GB",
    processor: "Snapdragon 8 Gen 3 for Galaxy",
    battery: "5000mAh",
    camera: "200MP + 12MP + 50MP + 10MP Quad Camera",
    display: "6.8-inch QHD+ Dynamic AMOLED 2X, 120Hz",
    featured: true,
    image: unsplash("1598327105666-5b89351aff97"),
  },
  {
    name: "Google Pixel 8 Pro",
    brand: "Google",
    category: "smartphones",
    sku: "GGL-P8P-128",
    description: "Google's flagship with the Tensor G3 chip and industry-leading computational photography.",
    price: 1100000,
    quantity: 10,
    warranty: "1 Year Manufacturer Warranty",
    ram: "12GB",
    storage: "128GB",
    processor: "Google Tensor G3",
    battery: "5050mAh",
    camera: "50MP + 48MP + 48MP Triple Camera",
    display: "6.7-inch LTPO OLED, 120Hz",
    image: unsplash("1533228100845-08145b01de14"),
  },
  {
    name: "Xiaomi 14 Pro",
    brand: "Xiaomi",
    category: "smartphones",
    sku: "XMI-14PRO-256",
    description: "Flagship performance with Leica-tuned cameras and blazing-fast charging.",
    price: 980000,
    quantity: 12,
    warranty: "1 Year Manufacturer Warranty",
    ram: "12GB",
    storage: "256GB",
    processor: "Snapdragon 8 Gen 3",
    battery: "4880mAh",
    camera: "50MP Leica Triple Camera",
    display: "6.73-inch LTPO AMOLED, 120Hz",
    image: unsplash("1601784551446-20c9e07cdbdb"),
  },

  // --- Tablets ---
  {
    name: 'Apple iPad Pro 12.9" (M2)',
    brand: "Apple",
    category: "tablets",
    sku: "APL-IPADPRO-256",
    description: "The ultimate iPad experience with the Apple M2 chip and a stunning Liquid Retina XDR display.",
    price: 1450000,
    quantity: 7,
    warranty: "1 Year Manufacturer Warranty",
    ram: "8GB",
    storage: "256GB",
    processor: "Apple M2",
    battery: "10758mAh",
    camera: "12MP Wide + 10MP Ultra Wide",
    display: "12.9-inch Liquid Retina XDR",
    featured: true,
    image: unsplash("1544244015-0df4b3ffc6b0"),
  },
  {
    name: "Apple iPad Air (5th Gen)",
    brand: "Apple",
    category: "tablets",
    sku: "APL-IPADAIR5-64",
    description: "Serious performance in a thin, light design, powered by the Apple M1 chip.",
    price: 750000,
    quantity: 15,
    warranty: "1 Year Manufacturer Warranty",
    ram: "8GB",
    storage: "64GB",
    processor: "Apple M1",
    battery: "7606mAh",
    camera: "12MP Wide",
    display: "10.9-inch Liquid Retina",
    image: unsplash("1561154464-82e9adf32764"),
  },
  {
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    category: "tablets",
    sku: "SAM-TABS9-128",
    description: "A premium Android tablet with an included S Pen and IP68 water resistance.",
    price: 820000,
    quantity: 9,
    warranty: "1 Year Manufacturer Warranty",
    ram: "8GB",
    storage: "128GB",
    processor: "Snapdragon 8 Gen 2 for Galaxy",
    battery: "8400mAh",
    camera: "13MP + 8MP Dual Camera",
    display: "11-inch Dynamic AMOLED 2X, 120Hz",
    image: unsplash("1585790050230-5dd28404ccb9"),
  },
  {
    name: "Apple iPad (10th Gen)",
    brand: "Apple",
    category: "tablets",
    sku: "APL-IPAD10-64",
    description: "A colorful, versatile iPad for everyday tasks, entertainment, and creativity.",
    price: 480000,
    quantity: 20,
    warranty: "1 Year Manufacturer Warranty",
    ram: "4GB",
    storage: "64GB",
    processor: "Apple A14 Bionic",
    battery: "7606mAh",
    camera: "12MP Wide",
    display: "10.9-inch Liquid Retina",
    image: unsplash("1587033411391-5d9e51cce126"),
  },

  // --- Laptops ---
  {
    name: 'Apple MacBook Pro 14" (M3 Pro)',
    brand: "Apple",
    category: "laptops",
    sku: "APL-MBP14-512",
    description: "Serious pro performance in a portable body, with a stunning Liquid Retina XDR display.",
    price: 2850000,
    quantity: 5,
    warranty: "1 Year Manufacturer Warranty",
    ram: "18GB",
    storage: "512GB SSD",
    processor: "Apple M3 Pro (11-core CPU / 14-core GPU)",
    battery: "70Wh, up to 18 hours",
    camera: "1080p FaceTime HD",
    display: "14.2-inch Liquid Retina XDR",
    featured: true,
    newArrival: true,
    image: unsplash("1517336714731-489689fd1ca8"),
  },
  {
    name: 'Apple MacBook Air 13" (M2)',
    brand: "Apple",
    category: "laptops",
    sku: "APL-MBA13-256",
    description: "Strikingly thin design with the M2 chip, delivering fast, fanless performance.",
    price: 1350000,
    discountPrice: 1200000,
    flashSale: true,
    quantity: 13,
    warranty: "1 Year Manufacturer Warranty",
    ram: "8GB",
    storage: "256GB SSD",
    processor: "Apple M2 (8-core CPU / 8-core GPU)",
    battery: "52.6Wh, up to 18 hours",
    camera: "1080p FaceTime HD",
    display: "13.6-inch Liquid Retina",
    image: unsplash("1618410320928-25228d811631"),
  },
  {
    name: 'Apple MacBook Pro 16" (M3 Max)',
    brand: "Apple",
    category: "laptops",
    sku: "APL-MBP16-1TB",
    description: "The most powerful MacBook Pro ever, built for the most demanding pro workflows.",
    price: 4200000,
    quantity: 4,
    warranty: "1 Year Manufacturer Warranty",
    ram: "36GB",
    storage: "1TB SSD",
    processor: "Apple M3 Max (14-core CPU / 30-core GPU)",
    battery: "100Wh, up to 22 hours",
    camera: "1080p FaceTime HD",
    display: "16.2-inch Liquid Retina XDR",
    image: unsplash("1525547719571-a2d4ac8945e2"),
  },
  {
    name: "Samsung Galaxy Book4 Pro",
    brand: "Samsung",
    category: "laptops",
    sku: "SAM-GBOOK4P-512",
    description: "A sleek Windows ultrabook with a vivid AMOLED display and Intel's latest Core Ultra processor.",
    price: 1950000,
    quantity: 7,
    warranty: "1 Year Manufacturer Warranty",
    ram: "16GB",
    storage: "512GB SSD",
    processor: "Intel Core Ultra 7 155H",
    battery: "63Wh",
    camera: "1080p Webcam",
    display: "14-inch Dynamic AMOLED 2X 2.8K, 120Hz",
    newArrival: true,
    image: unsplash("1496181133206-80ce9b88a853"),
  },

  // --- Smartwatches ---
  {
    name: "Apple Watch Series 9 (45mm)",
    brand: "Apple",
    category: "smartwatches",
    sku: "APL-AWS9-45",
    description: "A brighter display, the S9 chip, and a new double-tap gesture for quick control.",
    price: 480000,
    quantity: 16,
    warranty: "1 Year Manufacturer Warranty",
    processor: "Apple S9 SiP",
    storage: "64GB",
    battery: "Up to 18 hours",
    display: "45mm Retina LTPO OLED, always-on",
    newArrival: true,
    image: unsplash("1544117519-31a4b719223d"),
  },
  {
    name: "Apple Watch Ultra 2",
    brand: "Apple",
    category: "smartwatches",
    sku: "APL-AWULT2-49",
    description: "The most rugged and capable Apple Watch, built for endurance sports and outdoor adventure.",
    price: 950000,
    quantity: 6,
    warranty: "1 Year Manufacturer Warranty",
    processor: "Apple S9 SiP",
    storage: "64GB",
    battery: "Up to 36 hours",
    display: "49mm Retina LTPO OLED, 3000 nits",
    featured: true,
    image: unsplash("1579586337278-3befd40fd17a"),
  },
  {
    name: "Apple Watch SE (2nd Gen, 40mm)",
    brand: "Apple",
    category: "smartwatches",
    sku: "APL-AWSE2-40",
    description: "The essential Apple Watch experience — activity tracking, notifications, and safety features.",
    price: 280000,
    quantity: 21,
    warranty: "1 Year Manufacturer Warranty",
    processor: "Apple S8 SiP",
    storage: "32GB",
    battery: "Up to 18 hours",
    display: "40mm Retina LCD",
    image: unsplash("1508685096489-7aacd43bd3b1"),
  },

  // --- Headphones & Earbuds ---
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "headphones-earbuds",
    sku: "SNY-WH1000XM5",
    description: "Industry-leading noise cancellation with exceptional sound quality and all-day comfort.",
    price: 380000,
    quantity: 10,
    warranty: "1 Year Manufacturer Warranty",
    battery: "Up to 30 hours",
    display: "N/A — Over-ear Headphones",
    image: unsplash("1546435770-a3e426bf472b"),
  },
  {
    name: "JBL Tune 760NC",
    brand: "JBL",
    category: "headphones-earbuds",
    sku: "JBL-T760NC",
    description: "Foldable over-ear headphones with active noise cancelling and JBL Pure Bass sound.",
    price: 65000,
    quantity: 24,
    warranty: "1 Year Manufacturer Warranty",
    battery: "Up to 50 hours",
    display: "N/A — Over-ear Headphones",
    image: unsplash("1505740420928-5e560c06d30e"),
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    brand: "Apple",
    category: "headphones-earbuds",
    sku: "APL-APP2-USBC",
    description: "Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio.",
    price: 250000,
    discountPrice: 220000,
    flashSale: true,
    quantity: 19,
    warranty: "1 Year Manufacturer Warranty",
    battery: "Up to 6 hours (30 with case)",
    display: "N/A — In-ear Earbuds",
    featured: true,
    image: unsplash("1592921870789-04563d55041c"),
  },
  {
    name: "Apple AirPods Max",
    brand: "Apple",
    category: "headphones-earbuds",
    sku: "APL-APMAX",
    description: "High-fidelity sound with Active Noise Cancellation in a premium over-ear design.",
    price: 480000,
    quantity: 8,
    warranty: "1 Year Manufacturer Warranty",
    battery: "Up to 20 hours",
    display: "N/A — Over-ear Headphones",
    newArrival: true,
    image: unsplash("1609081219090-a6d81d3085bf"),
  },
  {
    name: "Samsung Galaxy Buds2 Pro",
    brand: "Samsung",
    category: "headphones-earbuds",
    sku: "SAM-BUDS2PRO",
    description: "24-bit Hi-Fi sound with Intelligent Active Noise Cancellation, built for Galaxy devices.",
    price: 175000,
    quantity: 17,
    warranty: "1 Year Manufacturer Warranty",
    battery: "Up to 5 hours (18 with case)",
    display: "N/A — In-ear Earbuds",
    image: unsplash("1590658268037-6bf12165a8df"),
  },
  {
    name: "Sony WH-CH520",
    brand: "Sony",
    category: "headphones-earbuds",
    sku: "SNY-WHCH520",
    description: "Lightweight, budget-friendly wireless headphones with an impressively long battery life.",
    price: 35000,
    quantity: 30,
    warranty: "1 Year Manufacturer Warranty",
    battery: "Up to 50 hours",
    display: "N/A — Over-ear Headphones",
    image: unsplash("1583394838336-acd977736f90"),
  },

  // --- Accessories ---
  {
    name: "Apple 96W USB-C Power Adapter",
    brand: "Apple",
    category: "accessories",
    sku: "APL-96W-USBC",
    description: "Fast, efficient charging for MacBook Pro and MacBook Air via USB-C.",
    price: 45000,
    quantity: 26,
    warranty: "1 Year Manufacturer Warranty",
    image: unsplash("1583863788434-e58a36330cf0"),
  },
  {
    name: "Apple MagSafe Charger",
    brand: "Apple",
    category: "accessories",
    sku: "APL-MAGSAFE",
    description: "Wireless charging up to 15W with perfect magnetic alignment for iPhone 12 and later.",
    price: 28000,
    quantity: 22,
    warranty: "1 Year Manufacturer Warranty",
    image: unsplash("1615526675159-e248c3021d3f"),
  },
  {
    name: "Google Nest Mini (2nd Gen)",
    brand: "Google",
    category: "accessories",
    sku: "GGL-NESTMINI2",
    description: "A compact smart speaker with the Google Assistant built in, ready to help around the home.",
    price: 32000,
    quantity: 15,
    warranty: "1 Year Manufacturer Warranty",
    image: unsplash("1519558260268-cde7e03a0152"),
  },
];

async function main() {
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, featured: category.featured },
      create: { name: category.name, slug: category.slug, featured: category.featured },
    });
    categoryIds.set(category.slug, row.id);
  }
  console.log(`Categories: ${categoryIds.size}`);

  const brandIds = new Map<string, string>();
  for (const brand of brands) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name },
      create: { name: brand.name, slug: brand.slug },
    });
    brandIds.set(brand.name, row.id);
  }
  console.log(`Brands: ${brandIds.size}`);

  let created = 0;
  let updated = 0;

  for (const item of products) {
    const slug = slugify(item.name);
    const data = {
      name: item.name,
      slug,
      brandId: brandIds.get(item.brand) ?? null,
      categoryId: categoryIds.get(item.category) ?? null,
      sku: item.sku,
      description: item.description,
      price: item.price,
      discountPrice: item.discountPrice ?? null,
      flashSaleEndsAt: item.flashSale ? flashSaleEndsAt : null,
      quantity: item.quantity,
      condition: "NEW" as const,
      warranty: item.warranty,
      ram: item.ram ?? null,
      storage: item.storage ?? null,
      processor: item.processor ?? null,
      battery: item.battery ?? null,
      camera: item.camera ?? null,
      display: item.display ?? null,
      featured: item.featured ?? false,
      newArrival: item.newArrival ?? false,
      published: true,
    };

    const existing = await prisma.product.findUnique({ where: { slug } });
    const product = await prisma.product.upsert({
      where: { slug },
      update: data,
      create: data,
    });
    existing ? updated++ : created++;

    const hasImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!hasImage) {
      await prisma.productImage.create({
        data: { productId: product.id, url: item.image, position: 0 },
      });
    }
  }

  console.log(`Products: ${created} created, ${updated} updated (${products.length} total).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
