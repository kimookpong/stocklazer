import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stocklazer : US Stock Analyzer",
  description:
    "US Stock Analyzer ค้นหาและวิเคราะห์ข้อมูลหุ้นอเมริกาแบบครบครัน พร้อมกราฟและข้อมูลทางการเงินที่ละเอียด",
  generator: "Hakim Mudor",
  keywords: [
    "หุ้น",
    "หุ้นอเมริกา",
    "การลงทุน",
    "วิเคราะห์หุ้น",
    "US Stock",
    "Stock Analysis",
    "Investment",
  ],
  authors: [{ name: "Hakim Mudor" }],
  creator: "Hakim Mudor",
  publisher: "Stocklazer",
  metadataBase: new URL("https://stocklazer.vercel.app"),
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://stocklazer.vercel.app",
    title: "Stocklazer : US Stock Analyzer",
    description:
      "US Stock Analyzer ค้นหาและวิเคราะห์ข้อมูลหุ้นอเมริกาแบบครบครัน พร้อมกราฟและข้อมูลทางการเงินที่ละเอียด",
    siteName: "Stocklazer",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Stocklazer - US Stock Analyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stocklazer : US Stock Analyzer",
    description: "วิเคราะห์หุ้นอเมริกาแบบครบครัน พร้อมกราฟและข้อมูลทางการเงิน",
    creator: "@stocklazer",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="canonical" href="https://stocklazer.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Stocklazer - US Stock Analyzer",
              description:
                "US Stock Analyzer ค้นหาและวิเคราะห์ข้อมูลหุ้นอเมริกาแบบครบครัน พร้อมกราฟและข้อมูลทางการเงินที่ละเอียด",
              url: "https://stocklazer.vercel.app",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Person",
                name: "Hakim Mudor",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
