import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "プロ野球 雨天中止予報",
  description:
    "プロ野球の試合の雨天中止確率を予測して表示するサービス。球場ごとに過去10年分の雨天中止データを分析して正確な中止予測をお届け。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  icons: {
    icon: "/logo/logo_square.png",
    apple: "/logo/logo_square.png",
    shortcut: "/logo/logo_square.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5663877092525351" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased raindrops-bg`}
      >
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
