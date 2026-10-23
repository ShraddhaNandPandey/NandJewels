import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "वृन्दोरा | VRUNDORA — Fashion & Demi-Fine Jewellery",
  description:
    "VRUNDORA (वृन्दोरा) is a luxury destination for demi-fine fashion, artificial & imitation jewellery. Shop hand-finished earrings, necklaces, rings, bracelets, bangles and curated collections.",
  keywords: [
    "VRUNDORA",
    "वृन्दोरा",
    "artificial jewellery",
    "fashion jewellery",
    "imitation jewellery",
    "demi fine jewellery",
    "earrings",
    "necklaces",
    "rings",
  ],
  authors: [{ name: "VRUNDORA" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/vrundora-emblem.png",
    apple: "/vrundora-emblem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
