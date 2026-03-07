import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Achievement Targetter",
  description: "Search Steam games and prioritize achievements by global rarity.",
  icons: {
    icon: "/crosshair.png",
  },
};

const themeScript = `
(() => {
  try {
    const saved = localStorage.getItem('theme') || 'system';
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = saved === 'system' ? (systemDark ? 'dark' : 'light') : saved;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-200 dark:bg-slate-950`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#e2e8f0_55%,#cbd5e1_100%)] dark:bg-[radial-gradient(circle_at_top,#111827_0%,#0b1220_55%,#020617_100%)] px-4 py-6 transition-colors">
          <div className="mx-auto w-full max-w-4xl">
            <Header />
            <main className="mt-4">{children}</main>
          </div>
          <div className="fixed bottom-4 left-4 z-50">
            <ThemeToggle />
          </div>
        </div>
      </body>
    </html>
  );
}
