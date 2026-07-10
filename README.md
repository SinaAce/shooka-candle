# 🕯️ Shooka Candle

> فروشگاه آنلاین شمع‌های دست‌ساز **شوکا** — نور و گرمای خانه شما

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## ✨ امکانات

| فروشگاه | پنل مدیریت |
|---------|------------|
| محصولات، سبد خرید، checkout | داشبورد تحلیلی + پیش‌بینی درآمد |
| پرداخت در محل / آنلاین / کارت‌به‌کارت | مدیریت محصولات، دسته‌ها، سفارشات |
| آپلود رسید + نوتیفیکیشن | بنر مناسبت، تخفیف سراسری، اطلاعیه‌ها |
| تم روشن/تاریک، RTL فارسی | تأیید رسید، آنالیز روزانه/ماهانه/سالانه |

---

## 🛠️ تکنولوژی‌ها

- **Next.js 16** — App Router
- **Prisma 7** + SQLite (محلی) / Turso (production)
- **NextAuth v5** — احراز هویت
- **Tailwind CSS v4** — UI شمع‌گونه
- **AWS S3** — آپلود تصاویر (production)

---

## 🚀 راه‌اندازی محلی

```bash
git clone <repo-url>
cd shooka-candle
npm install
cp .env.example .env
npm run setup
npm run dev
```

سایت: [http://localhost:3000](http://localhost:3000)

### ورود ادمین (بعد از seed)

| | |
|---|---|
| **ایمیل** | `admin@shooka-candle.ir` |
| **رمز** | `admin123` |

---

## ⚙️ متغیرهای محیطی

| متغیر | توضیح |
|-------|--------|
| `DATABASE_URL` | محلی: `file:./prisma/dev.db` — production: Turso |
| `AUTH_SECRET` | کلید امن NextAuth ([تولید](https://generate-secret.vercel.app/32)) |
| `NEXTAUTH_URL` | آدرس سایت (مثلاً `https://your-app.vercel.app`) |
| `AWS_*` | اختیاری — برای آپلود تصاویر در production |

---

## ☁️ Deploy روی Vercel

1. ریپو را به GitHub وصل کنید
2. در [Vercel](https://vercel.com) پروژه را Import کنید
3. **Database:** [Turso](https://turso.tech) بسازید و `DATABASE_URL` را ست کنید
4. Env vars را از `.env.example` کپی کنید
5. بعد از deploy اول:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

> برای آپلود تصاویر در production، AWS S3 را پیکربندی کنید.

---

## 📁 ساختار

```
src/
├── app/          # صفحات + API
├── components/   # UI، layout، admin
├── lib/          # auth, prisma, settings
└── generated/    # Prisma client (auto)
```

---

## 📸 اینستاگرام

[@shooka_candle](https://instagram.com/shooka_candle)

---

<p align="center">
  ساخته شده با ❤️ برای <strong>شوکا</strong>
</p>
