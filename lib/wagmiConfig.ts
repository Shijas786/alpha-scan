"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, mainnet } from "viem/chains";
import { cookieStorage, createStorage } from "wagmi";
import { QueryClient } from "@tanstack/react-query";

// Get project ID from environment
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
}

// Set up chains
export const networks = [base, mainnet];

// Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

// Create query client
export const queryClient = new QueryClient();

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "Onchain Radar",
    description: "Track wallets and get notified of their activity on Farcaster",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://onchain-radar.app",
    icons: ["https://onchain-radar.app/icon.png"],
  },
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

