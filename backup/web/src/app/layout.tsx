import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SecureVote - Blockchain Voting System",
  description: "A Privacy-Preserving, Verifiable Blockchain Voting System",
  keywords: ["blockchain", "voting", "ethereum", "web3", "democracy"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
