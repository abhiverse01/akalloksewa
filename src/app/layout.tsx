import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AkalLoksewa — Nepal's Most Powerful Loksewa Preparation Platform",
  description:
    "Join 50,000+ aspirants preparing for Nepal's Public Service Commission (Loksewa) exams. Practice smarter, score higher.",
  keywords: [
    "Loksewa",
    "Nepal",
    "PSC",
    "Public Service Commission",
    "civil service",
    "exam preparation",
    "practice questions",
    "mock test",
    "निजामती सेवा",
    "लोकसेवा आयोग",
  ],
  authors: [{ name: "Abhishek Shah", url: "https://abhishekshah.vercel.app" }],
  creator: "Abhishek Shah",
  publisher: "AkalLoksewa",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-192.png",
    other: [
      { rel: "icon", type: "image/png", sizes: "192x192", url: "/logo-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", url: "/logo-512.png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://akalloksewa.vercel.app"),
  openGraph: {
    title: "AkalLoksewa — Crack Loksewa. Not just practice, actual preparation.",
    description: "75,000+ questions across 17 subjects. Smart ingestor. Deep analytics.",
    type: "website",
    locale: "en_US",
    url: "https://akalloksewa.vercel.app",
    siteName: "AkalLoksewa",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "AkalLoksewa Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "AkalLoksewa — Nepal's Most Powerful Loksewa Preparation Platform",
    description: "75,000+ questions across 17 subjects. Smart ingestor. Deep analytics.",
    images: ["/logo-512.png"],
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AkalLoksewa" />
      </head>
      <body
        className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}
        style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
