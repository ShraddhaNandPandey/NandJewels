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
  title: "श्रद्धानंद | Shraddhanand — Fashion & Demi-Fine Jewellery",
  description:
    "Shraddhanand (श्रद्धानंद) is a luxury destination for demi-fine fashion, artificial & imitation jewellery. Shop hand-finished earrings, necklaces, rings, bracelets, bangles and curated collections.",
  keywords: [
    "artificial jewellery",
    "fashion jewellery",
    "imitation jewellery",
    "demi fine jewellery",
    "earrings",
    "necklaces",
    "rings",
    "Shraddhanand",
    "श्रद्धानंद",
  ],
  authors: [{ name: "Shraddhanand" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
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
