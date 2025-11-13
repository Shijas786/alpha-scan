"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Radar, Wallet, Bell, TrendingUp, Users } from "lucide-react";
import { WalletSearch } from "@/components/WalletSearch";
import { WalletCard } from "@/components/WalletCard";
import { useAppKit } from "@reown/appkit/react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [userFid, setUserFid] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      // In production, fetch user's Farcaster FID from their wallet
      // For now, we'll use a placeholder
      loadUserData();
    }
  }, [isConnected, address]);

  const loadUserData = async () => {
    // TODO: Fetch Farcaster user by wallet address
    // const user = await getUserByAddress(address);
    // setUserFid(user?.fid.toString());
    
    // Load user's subscriptions
    if (userFid) {
      try {
        const response = await fetch(`/api/watch?fid=${userFid}`);
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      } catch (error) {
        console.error("Error loading subscriptions:", error);
      }
    }
  };

  const handleFollowWallet = async (targetAddress: string) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const response = await fetch("/api/watch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          follower_fid: userFid || "guest",
          follower_address: address,
          target_address: targetAddress,
          threshold_usd: 500,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Successfully following wallet! You'll receive Farcaster notifications for significant activity.");
        loadUserData();
      } else {
        alert("Failed to follow wallet. Please try again.");
      }
    } catch (error) {
      console.error("Error following wallet:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Radar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Onchain Radar</h1>
              <p className="text-sm text-gray-600">Track wallets, stay informed</p>
            </div>
          </div>
          
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div className="text-xs text-gray-500">Connected</div>
              </div>
              <button
                onClick={() => open()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Wallet size={18} />
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {!isConnected ? (
          /* Hero Section - Not Connected */
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 inline-block p-4 bg-blue-100 rounded-full">
              <Radar size={64} className="text-blue-600" />
            </div>
            
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Never Miss a Move Onchain
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Track your friends, whales, and influencers. Get instant Farcaster notifications
              when they trade, mint, or bridge. Stay ahead of the curve.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={() => open()}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Wallet size={20} />
                Connect Wallet to Start
              </button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                  <Bell className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Alerts</h3>
                <p className="text-gray-600">
                  Get notified instantly on Farcaster when wallets you follow make significant moves
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  GPT-4 powered insights on wallet behavior, patterns, and strategies
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                  <Users className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Social Native</h3>
                <p className="text-gray-600">
                  Built for Farcaster - track friends and discover what winners are buying
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard - Connected */
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-gray-600">
                Search for any wallet to track their activity or view your followed wallets below
              </p>
            </div>

            {/* Search */}
            <div className="flex justify-center mb-12">
              <WalletSearch onSelectWallet={setSelectedWallet} />
            </div>

            {/* Selected Wallet Card */}
            {selectedWallet && (
              <div className="flex justify-center mb-12">
                <WalletCard
                  address={selectedWallet}
                  onClose={() => setSelectedWallet(null)}
                  onFollow={handleFollowWallet}
                />
              </div>
            )}

            {/* Subscriptions */}
            {subscriptions.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Your Followed Wallets</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedWallet(sub.target_address)}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded">
                          <Wallet size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {sub.target_name || `Wallet ${sub.target_address.slice(0, 6)}...`}
                          </div>
                          <div className="text-sm text-gray-600 font-mono">
                            {sub.target_address.slice(0, 10)}...{sub.target_address.slice(-8)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Threshold: ${sub.threshold_usd}+
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p className="mb-2">
            Built with ❤️ using Reown, Covalent, Farcaster, and Base
          </p>
          <p className="text-sm">
            Track wallets • Get notified • Stay ahead
          </p>
        </div>
      </footer>
    </div>
  );
}
