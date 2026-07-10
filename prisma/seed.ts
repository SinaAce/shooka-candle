import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { getLibSqlConfig } from "../src/lib/db-config";

const adapter = new PrismaLibSql(getLibSqlConfig());
const prisma = new PrismaClient({ adapter });

const productImages: Record<string, string> = {
  "sham-lavender": "/images/gallery/candle-5.jpg",
  "sham-vanilla-caramel": "/images/gallery/candle-6.jpg",
  "sham-rose-pink": "/images/gallery/candle-7.jpg",
  "sham-cactus-green": "/images/gallery/candle-8.jpg",
  "set-hadiye-3": "/images/gallery/candle-9.jpg",
  "sham-votive-set-6": "/images/gallery/candle-10.jpg",
};

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@shooka-candle.ir" },
    update: {},
    create: {
      name: "مدیر شوکا",
      email: "admin@shooka-candle.ir",
      password: adminPassword,
      role: "ADMIN",
      phone: "09120000000",
      cart: { create: {} },
    },
  });
  console.log("✅ Admin user:", admin.email);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "sham-aromatic" },
      update: {},
      create: {
        name: "شمع معطر",
        slug: "sham-aromatic",
        description: "شمع‌های معطر با رایحه‌های طبیعی",
      },
    }),
    prisma.category.upsert({
      where: { slug: "sham-tazini" },
      update: {},
      create: {
        name: "شمع تزئینی",
        slug: "sham-tazini",
        description: "شمع‌های تزئینی و هنری",
      },
    }),
    prisma.category.upsert({
      where: { slug: "set-hadiye" },
      update: {},
      create: {
        name: "ست هدیه",
        slug: "set-hadiye",
        description: "ست‌های هدیه شمع",
      },
    }),
    prisma.category.upsert({
      where: { slug: "sham-votive" },
      update: {},
      create: {
        name: "شمع وotive",
        slug: "sham-votive",
        description: "شمع‌های کوچک votive",
      },
    }),
  ]);
  console.log("✅ Categories:", categories.length);

  const products = [
    {
      name: "شمع لاوندر آرامش‌بخش",
      slug: "sham-lavender",
      description:
        "شمع دست‌ساز با رایحه لاوندر طبیعی. مناسب برای ایجاد فضای آرام و ریلکسیشن.",
      price: 185000,
      comparePrice: 220000,
      stock: 25,
      featured: true,
      scent: "لاوندر",
      burnTime: "۴۰ ساعت",
      weight: "۲۰۰ گرم",
      categoryId: categories[0].id,
    },
    {
      name: "شمع وانیل کارامل",
      slug: "sham-vanilla-caramel",
      description: "ترکیب دلنشین وانیل و کارامل که فضا را گرم و دلپذیر می‌کند.",
      price: 195000,
      stock: 20,
      featured: true,
      scent: "وانیل و کارامل",
      burnTime: "۴۵ ساعت",
      weight: "۲۵۰ گرم",
      categoryId: categories[0].id,
    },
    {
      name: "شمع گل رز صورتی",
      slug: "sham-rose-pink",
      description: "شمع تزئینی به شکل گل رز با رایحه گل رز طبیعی.",
      price: 250000,
      comparePrice: 290000,
      stock: 15,
      featured: true,
      scent: "گل رز",
      burnTime: "۳۵ ساعت",
      weight: "۱۸۰ گرم",
      categoryId: categories[1].id,
    },
    {
      name: "شمع کاکتوس سبز",
      slug: "sham-cactus-green",
      description: "شمع تزئینی به شکل کاکتوس با رایحه اکالیptus.",
      price: 165000,
      stock: 30,
      featured: false,
      scent: "اکالیptus",
      burnTime: "۳۰ ساعت",
      weight: "۱۵۰ گرم",
      categoryId: categories[1].id,
    },
    {
      name: "ست هدیه سه‌تایی",
      slug: "set-hadiye-3",
      description: "ست شامل سه شمع کوچک با رایحه‌های لاوندر، وانیل و گل رز.",
      price: 420000,
      comparePrice: 480000,
      stock: 10,
      featured: true,
      scent: "مختلط",
      burnTime: "۲۵ ساعت هرکدام",
      weight: "۳×۱۰۰ گرم",
      categoryId: categories[2].id,
    },
    {
      name: "شمع votive مجموعه ۶تایی",
      slug: "sham-votive-set-6",
      description: "مجموعه ۶ عددی شمع votive با رایحه‌های متنوع.",
      price: 320000,
      stock: 18,
      featured: false,
      scent: "مختلط",
      burnTime: "۱۵ ساعت هرکدام",
      weight: "۶×۵۰ گرم",
      categoryId: categories[3].id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { description: product.description },
      create: product,
    });

    const imageUrl = productImages[product.slug];
    if (imageUrl) {
      const existingImage = await prisma.productImage.findFirst({
        where: { productId: created.id },
      });
      if (existingImage) {
        await prisma.productImage.update({
          where: { id: existingImage.id },
          data: { url: imageUrl, alt: product.name },
        });
      } else {
        await prisma.productImage.create({
          data: {
            url: imageUrl,
            alt: product.name,
            order: 0,
            productId: created.id,
          },
        });
      }
    }
  }
  console.log("✅ Products:", products.length);

  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  console.log("✅ Site settings initialized");

  const { generateProductSlug, isAsciiSlug } = await import("../src/lib/utils");
  for (const product of await prisma.product.findMany()) {
    if (!isAsciiSlug(product.slug)) {
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: generateProductSlug(product.name, product.id) },
      });
      console.log(`✅ Fixed slug: ${product.name}`);
    }
  }

  const galleryUrls = {
    HERO: [
      "/images/gallery/candle-1.jpg",
      "/images/gallery/candle-2.png",
      "/images/gallery/candle-3.png",
      "/images/gallery/candle-4.png",
      "/images/gallery/candle-11.jpg",
      "/images/gallery/candle-12.jpg",
      "/images/gallery/candle-13.jpg",
      "/images/gallery/candle-14.jpg",
      "/images/gallery/candle-15.jpg",
      "/images/gallery/candle-16.jpg",
    ],
    PAGE: [
      "/images/gallery/candle-2.png",
      "/images/gallery/candle-3.png",
      "/images/gallery/candle-4.png",
      "/images/gallery/candle-5.jpg",
      "/images/gallery/candle-6.jpg",
      "/images/gallery/candle-7.jpg",
      "/images/gallery/candle-8.jpg",
      "/images/gallery/candle-11.jpg",
      "/images/gallery/candle-12.jpg",
      "/images/gallery/candle-13.jpg",
      "/images/gallery/candle-14.jpg",
      "/images/gallery/candle-15.jpg",
      "/images/gallery/candle-17.jpg",
      "/images/gallery/candle-18.jpg",
      "/images/gallery/candle-19.jpg",
      "/images/gallery/candle-20.jpg",
    ],
  } as const;

  for (const [type, urls] of Object.entries(galleryUrls) as [
    "HERO" | "PAGE",
    readonly string[],
  ][]) {
    const count = await prisma.galleryImage.count({ where: { type } });
    if (count === 0) {
      for (let i = 0; i < urls.length; i++) {
        await prisma.galleryImage.create({
          data: {
            url: urls[i],
            alt: type === "HERO" ? `اسلاید ${i + 1}` : `گالری ${i + 1}`,
            order: i,
            type,
          },
        });
      }
      console.log(`✅ Gallery ${type} seeded (${urls.length} images)`);
    }
  }

  console.log("\n🎉 Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
