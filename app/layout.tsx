import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORG Boiler | Multi-tenant Organization Management Platform",
  description: "A modern, open-source multi-tenant organization management platform built with Next.js, Prisma, and PostgreSQL. Create organizations, invite team members, and collaborate effectively.",
  keywords: ["organization management", "multi-tenant", "team collaboration", "Next.js", "Prisma", "PostgreSQL", "open-source", "SaaS", "subdomain routing"],
  authors: [{ name: "Huzaifa Saleem" }],
  creator: "Huzaifa Saleem",
  publisher: "Huzaifa Saleem",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://organization-boiler-plate.vercel.app/",
    title: "ORG Boiler | Multi-tenant Organization Management Platform",
    description: "A modern, open-source multi-tenant organization management platform built with Next.js, Prisma, and PostgreSQL.",
    siteName: "ORG Boiler",
    images: [
      {
        url: "/assets/banner.png",
        width: 1200,
        height: 630,
        alt: "ORG Boiler - Multi-tenant Organization Management Platform"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORG Boiler | Multi-tenant Organization Management Platform",
    description: "A modern, open-source multi-tenant organization management platform built with Next.js, Prisma, and PostgreSQL.",
    images: ["/assets/banner.png"],
    creator: "@huzaifasaleem"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL("https://organization-boiler-plate.vercel.app"),
};

import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
