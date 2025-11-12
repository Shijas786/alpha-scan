import axios from "axios";

const COVALENT_API_KEY = process.env.COVALENT_API_KEY || "";
const COVALENT_BASE_URL = "https://api.covalenthq.com/v1";

export interface TokenBalance {
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  balance: string;
  quote: number; // USD value
  quote_rate: number; // Price per token
  logo_url?: string;
}

export interface Transaction {
  tx_hash: string;
  block_height: number;
  block_signed_at: string;
  from_address: string;
  to_address: string;
  value: string;
  value_quote: number;
  gas_spent: number;
  successful: boolean;
  log_events?: any[];
}

export interface WalletPortfolio {
  address: string;
  chain: string;
  total_balance_usd: number;
  tokens: TokenBalance[];
  last_updated: string;
}

/**
 * Get token balances for a wallet on a specific chain
 */
export async function getTokenBalances(
  walletAddress: string,
  chainId: number = 8453 // Base mainnet
): Promise<TokenBalance[]> {
  try {
    const url = `${COVALENT_BASE_URL}/${chainId}/address/${walletAddress}/balances_v2/`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${COVALENT_API_KEY}`,
      },
    });

    const items = response.data?.data?.items || [];
    
    return items
      .filter((item: any) => item.balance !== "0" && item.quote > 0.01)
      .map((item: any) => ({
        contract_name: item.contract_name,
        contract_ticker_symbol: item.contract_ticker_symbol,
        contract_address: item.contract_address,
        balance: item.balance,
        quote: item.quote,
        quote_rate: item.quote_rate,
        logo_url: item.logo_url,
      }));
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return [];
  }
}

/**
 * Get recent transactions for a wallet
 */
export async function getWalletTransactions(
  walletAddress: string,
  chainId: number = 8453,
  pageSize: number = 20
): Promise<Transaction[]> {
  try {
    const url = `${COVALENT_BASE_URL}/${chainId}/address/${walletAddress}/transactions_v3/`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${COVALENT_API_KEY}`,
      },
      params: {
        "page-size": pageSize,
      },
    });

    const items = response.data?.data?.items || [];
    
    return items.map((item: any) => ({
      tx_hash: item.tx_hash,
      block_height: item.block_height,
      block_signed_at: item.block_signed_at,
      from_address: item.from_address,
      to_address: item.to_address,
      value: item.value,
      value_quote: item.value_quote || 0,
      gas_spent: item.gas_spent,
      successful: item.successful,
      log_events: item.log_events,
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

/**
 * Get full wallet portfolio across Base and Ethereum
 */
export async function getWalletPortfolio(
  walletAddress: string
): Promise<WalletPortfolio> {
  try {
    // Fetch from Base (8453) and Ethereum (1)
    const [baseBalances, ethBalances] = await Promise.all([
      getTokenBalances(walletAddress, 8453),
      getTokenBalances(walletAddress, 1),
    ]);

    const allTokens = [...baseBalances, ...ethBalances];
    const totalBalance = allTokens.reduce((sum, token) => sum + token.quote, 0);

    return {
      address: walletAddress,
      chain: "multi",
      total_balance_usd: totalBalance,
      tokens: allTokens,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching wallet portfolio:", error);
    return {
      address: walletAddress,
      chain: "multi",
      total_balance_usd: 0,
      tokens: [],
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Analyze transaction for significant events
 */
export function analyzeTransaction(tx: Transaction): {
  type: string;
  significant: boolean;
  description: string;
} {
  const valueUSD = tx.value_quote || 0;
  
  // Determine transaction type based on logs
  let type = "transfer";
  const logs = tx.log_events || [];
  
  if (logs.some((log: any) => log.decoded?.name === "Swap")) {
    type = "swap";
  } else if (logs.some((log: any) => log.decoded?.name === "Mint")) {
    type = "mint";
  } else if (logs.some((log: any) => log.decoded?.name === "Bridge")) {
    type = "bridge";
  }

  const significant = valueUSD >= 100; // $100+ is significant
  
  const description = `${type} worth ${valueUSD.toFixed(2)} USD`;

  return { type, significant, description };
}

/**
 * Compare activity between two wallets
 */
export async function compareWallets(address1: string, address2: string) {
  const [portfolio1, portfolio2, txs1, txs2] = await Promise.all([
    getWalletPortfolio(address1),
    getWalletPortfolio(address2),
    getWalletTransactions(address1, 8453, 50),
    getWalletTransactions(address2, 8453, 50),
  ]);

  return {
    wallet1: {
      address: address1,
      totalValue: portfolio1.total_balance_usd,
      tokenCount: portfolio1.tokens.length,
      recentTxCount: txs1.length,
      transactions: txs1,
    },
    wallet2: {
      address: address2,
      totalValue: portfolio2.total_balance_usd,
      tokenCount: portfolio2.tokens.length,
      recentTxCount: txs2.length,
      transactions: txs2,
    },
  };
}

