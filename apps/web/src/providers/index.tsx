"use client";

import { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "./wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [web3Enabled, setWeb3Enabled] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Check if we should disable Web3 due to project ID issues
    const testMode = localStorage.getItem("testMode") === "true";
    setWeb3Enabled(!testMode);
  }, []);

  // Temporary solution: if Web3 initialization fails, we can still render the app
  if (!mounted) return null;

  if (!web3Enabled) {
    // Render app without Web3 providers for testing purposes
    return <>{children}</>;
  }

  // Normal render with Web3 providers
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
