import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATELIER - Premium Clothing Store",
  description: "Modern, minimal clothing store providing premium organic apparel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
