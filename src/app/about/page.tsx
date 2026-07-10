import {
  INSTAGRAM_DISPLAY,
  INSTAGRAM_URL,
} from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <span className="text-5xl sm:text-6xl mb-4 block">🕯️</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
          درباره شوکا
        </h1>
        <p className="text-[var(--text-muted)] leading-relaxed text-sm sm:text-base">
          برند شوکا با عشق به هنر و زیبایی، شمع‌های دست‌ساز و تزئینی با کیفیت
          بالا تولید می‌کند.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-3">
            داستان ما
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-base">
            شوکا از یک علاقه ساده به شمع‌سازی شروع شد. ما معتقدیم هر شمع
            می‌تواند فضایی را گرم‌تر و لحظه‌ای را خاص‌تر کند. تمام محصولات ما
            با دست ساخته می‌شوند و از بهترین مواد اولیه استفاده می‌کنیم.
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-3">
            چرا شوکا؟
          </h2>
          <ul className="space-y-3 text-[var(--text-secondary)] text-sm sm:text-base">
            {[
              "شمع‌های ۱۰۰٪ دست‌ساز با کیفیت بالا",
              "رایحه‌های طبیعی و ماندگار",
              "بسته‌بندی زیبا و مناسب هدیه",
              "ارسال سریع به سراسر کشور",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-1">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <p className="text-[var(--text-muted)] mb-4">
            ما را در اینستاگرام دنبال کنید
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
          >
            {INSTAGRAM_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
}
