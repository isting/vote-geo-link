import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "地域分流短链",
  description: "免费的地域识别推广短链，支持统一备用页和访问统计。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
