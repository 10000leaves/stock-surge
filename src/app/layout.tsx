import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Surge",
  description: "5つの仮想企業の株価をリアルタイムでシミュレートし、ランダムに生成されるニュースイベントが株価に影響を与えるインタラクティブな株取引ゲームです",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="jp">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
