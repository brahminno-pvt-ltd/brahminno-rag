import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brahminno — Document Intelligence",
  description: "Chat with your documents using AI. Upload PDFs, DOCX, TXT and get grounded answers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased">{children}</body>
    </html>
  );
}
