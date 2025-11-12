"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Activity, Bell, Loader2, X } from "lucide-react";
import { formatUSD, shortenAddress } from "@/lib/utils";

interface WalletData {
  portfolio: {
    address: string;
    total_balance_usd: number;
    tokens: Array<{
      contract_ticker_symbol: string;
      quote: number;
    }>;
  };
  transactions: Array<{
    tx_hash: string;
    block_signed_at: string;
    value_quote: number;
    from_address: string;
  }>;
  analysis?: {
    summary: string;
    insights: string[];
    riskLevel: "low" | "medium" | "high";
    recommendations: string[];
  };
}

interface WalletCardProps {
  address: string;
  onClose: () => void;
  onFollow: (address: string) => void;
}

export function WalletCard({ address, onClose, onFollow }: WalletCardProps) {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [address]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wallet?address=${address}&analysis=true`);
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        console.error("Failed to fetch wallet data");
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setFollowing(true);
    onFollow(address);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin mr-2" />
          Loading wallet data...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
        <div className="text-center text-red-600">
          Failed to load wallet data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={24} />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Wallet size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{shortenAddress(address, 6)}</h2>
            <p className="text-gray-600 text-sm">{address}</p>
          </div>
        </div>
        
        <button
          onClick={handleFollow}
          disabled={following}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Bell size={18} />
          {following ? "Following" : "Follow Wallet"}
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Balance</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatUSD(data.portfolio.total_balance_usd)}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Tokens Held</div>
          <div className="text-2xl font-bold text-green-900">
            {data.portfolio.tokens.length}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Transactions</div>
          <div className="text-2xl font-bold text-purple-900">
            {data.transactions.length}
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {data.analysis && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={20} />
            AI Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Summary</span>
                <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(data.analysis.riskLevel)}`}>
                  {data.analysis.riskLevel} risk
                </span>
              </div>
              <p className="text-gray-700">{data.analysis.summary}</p>
            </div>

            {data.analysis.insights.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Insights</h4>
                <ul className="space-y-2">
                  {data.analysis.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {data.analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">→</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity size={20} />
          Recent Transactions
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.transactions.slice(0, 10).map((tx) => (
            <div key={tx.tx_hash} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-sm text-gray-600">
                    {shortenAddress(tx.tx_hash, 8)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.block_signed_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatUSD(tx.value_quote || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tx.from_address.toLowerCase() === address.toLowerCase() ? "Sent" : "Received"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

