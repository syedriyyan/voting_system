import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "SecureVote",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "2f5a60d1a55b5c8a9f9b8c9d1e2f3a4b", // Development fallback
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});
