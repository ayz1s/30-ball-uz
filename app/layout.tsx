import type { Metadata } from "next";
import { Geist } from "next/font/google";
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
        <ThemeSync />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
