import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Onchain Radar - Track Wallets on Farcaster",
  description: "Track your friends, whales, and influencers onchain. Get instant Farcaster notifications when they trade, mint, or bridge.",
  openGraph: {
    title: "Onchain Radar",
    description: "Track wallets and get notified on Farcaster",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
