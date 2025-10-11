"use client";

import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Shield, Vote, Lock, CheckCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">SecureVote</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/elections"
                className="hover:text-blue-400 transition"
              >
                Elections
              </Link>
              <Link href="/about" className="hover:text-blue-400 transition">
                About
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            The Future of Voting is Here
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            A privacy-preserving, verifiable blockchain voting system powered by
            Ethereum
          </p>

          {isConnected ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/voter/elections"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
              >
                Browse Elections
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/dashboard"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-lg transition"
              >
                Admin Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-gray-400">
                Connect your wallet to get started
              </p>
              <ConnectButton />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why SecureVote?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-blue-400" />}
              title="Blockchain Security"
              description="Votes are immutably stored on Ethereum, ensuring tamper-proof records"
            />
            <FeatureCard
              icon={<Lock className="w-12 h-12 text-cyan-400" />}
              title="End-to-End Encryption"
              description="RSA + AES encryption ensures voter privacy at every step"
            />
            <FeatureCard
              icon={<CheckCircle className="w-12 h-12 text-green-400" />}
              title="Verifiable Results"
              description="Every voter can independently verify their vote was counted"
            />
            <FeatureCard
              icon={<Vote className="w-12 h-12 text-purple-400" />}
              title="Anonymous Voting"
              description="Your vote is secret, but the process is transparent"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Register & Verify"
              description="Connect your wallet and verify your identity securely"
            />
            <StepCard
              number="2"
              title="Cast Your Vote"
              description="Select your candidate and submit your encrypted vote to the blockchain"
            />
            <StepCard
              number="3"
              title="Verify & Track"
              description="Get a receipt and verify your vote was recorded correctly"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="100%" label="Transparent" />
            <StatCard number="256-bit" label="Encryption" />
            <StatCard number="0" label="Single Point of Failure" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-4">Built with ❤️ for democratic transparency</p>
          <p className="text-sm">
            SecureVote © 2025 | Powered by Ethereum & Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative p-8 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
        {number}
      </div>
      <h3 className="text-2xl font-semibold mb-3 mt-4">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-8">
      <div className="text-5xl font-bold text-blue-400 mb-2">{number}</div>
      <div className="text-xl text-gray-300">{label}</div>
    </div>
  );
}
