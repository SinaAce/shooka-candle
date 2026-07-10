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

### انتشار با GitHub Desktop (Private)

1. **GitHub Desktop** → File → **Add local repository**
2. مسیر: `C:\Users\ASUS\Projects\shooka-candle`
3. **Publish repository** → تیک **Keep this code private**
4. نام پیشنهادی: `shooka-candle` → **Publish**

بعد از publish، در Vercel ریپو را Connect کن (مرحله ۳ پایین).

---

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

## ☁️ Deploy روی Vercel (قدم‌به‌قدم)

### آیا Neon لازم است؟

**خیر.** این پروژه با **SQLite / LibSQL** کار می‌کند، نه PostgreSQL.

| سرویس | مناسب این پروژه؟ |
|--------|------------------|
| **Turso** | ✅ بله — پیشنهادی |
| Neon | ❌ خیر — PostgreSQL است |
| Supabase Postgres | ❌ نیاز به تغییر schema |

برای Vercel از **[Turso](https://turso.tech)** استفاده کنید (رایگان، سازگار با Prisma LibSQL adapter).

---

### مرحله ۱ — GitHub (Private)

```powershell
gh auth login
gh repo create shooka-candle --private --source=. --remote=origin --push --description "فروشگاه شمع شوکا"
```

---

### مرحله ۲ — Turso (دیتابیس production)

1. [turso.tech](https://turso.tech) → Create Database
2. `DATABASE_URL` = `libsql://YOUR-DB.turso.io?authToken=YOUR_TOKEN`

---

### مرحله ۳ — Vercel

1. [vercel.com](https://vercel.com) → Import ریپو
2. Env vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, SMTP (اختیاری), AWS S3 (توصیه‌شده)
3. Deploy

---

### مرحله ۴ — Schema و Seed (یک‌بار)

```powershell
# DATABASE_URL تورسو در .env
npx prisma db push
npx tsx prisma/seed.ts
```

ادمین: `admin@shooka-candle.ir` / `admin123`

> آپلود تصویر در production بدون S3 ذخیره نمی‌ماند.

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
