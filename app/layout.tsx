import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { ThemeSync } from "@/components/theme-sync";
import { getAppConfig } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: getAppConfig().name.ru,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {/* Официальный скрипт Telegram: без него window.Telegram.WebApp иногда
            появляется с задержкой, и проверка "мы внутри Telegram" на первом
            рендере ложно уходит в браузерную заглушку (см. раздел 8 ТЗ). */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <ThemeSync />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
