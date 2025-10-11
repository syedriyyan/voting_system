import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, localhost } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "SecureVote",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [
    sepolia,
    ...(process.env.NODE_ENV === "development" ? [localhost] : []),
  ],
  ssr: true,
});
