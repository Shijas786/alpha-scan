"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { isValidAddress, shortenAddress } from "@/lib/utils";

interface WalletSearchProps {
  onSelectWallet: (address: string, name?: string) => void;
}

export function WalletSearch({ onSelectWallet }: WalletSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      // Check if it's a valid Ethereum address
      if (isValidAddress(query)) {
        onSelectWallet(query);
      } else {
        // TODO: Search for Farcaster user and get their verified wallet
        // For now, just show an error
        alert("Please enter a valid Ethereum address (0x...)");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter wallet address or @username..."
          className="w-full px-4 py-3 pl-12 pr-24 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </button>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        Search for any wallet address to track their onchain activity
      </div>
    </div>
  );
}

