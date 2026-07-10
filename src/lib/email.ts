import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@shooka-candle.ir";
  const transporter = getTransporter();

  const subject = "بازیابی رمز عبور — شوکا";
  const html = `
    <div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:1.8;color:#444">
      <h2 style="color:#92400e">بازیابی رمز عبور</h2>
      <p>درخواست تغییر رمز عبور حساب شما در فروشگاه شوکا ثبت شد.</p>
      <p>برای تنظیم رمز جدید روی لینک زیر کلیک کنید (اعتبار ۱ ساعت):</p>
      <p><a href="${resetUrl}" style="color:#b45309">${resetUrl}</a></p>
      <p style="font-size:12px;color:#888">اگر این درخواست از طرف شما نبوده، این ایمیل را نادیده بگیرید.</p>
    </div>
  `;

  if (!transporter) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email] SMTP not configured. Reset link:", resetUrl);
      return;
    }
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  await transporter.sendMail({ from, to, subject, html });
}
