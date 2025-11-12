import OpenAI from "openai";
import { getWalletPortfolio, compareWallets, Transaction } from "./covalent";

// Lazy-load OpenAI client to avoid build-time initialization
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }
  return openaiClient;
}

export interface AgentAnalysis {
  summary: string;
  insights: string[];
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
}

/**
 * AI Agent to analyze wallet activity
 */
export async function analyzeWalletActivity(
  walletAddress: string,
  transactions: Transaction[]
): Promise<AgentAnalysis> {
  try {
    const portfolio = await getWalletPortfolio(walletAddress);
    
    const prompt = `
You are an onchain intelligence agent analyzing wallet activity on Base and Ethereum.

Wallet: ${walletAddress}
Total Portfolio Value: $${portfolio.total_balance_usd.toFixed(2)}
Token Count: ${portfolio.tokens.length}
Recent Transactions: ${transactions.length}

Top Holdings:
${portfolio.tokens.slice(0, 5).map(t => `- ${t.contract_ticker_symbol}: $${t.quote.toFixed(2)}`).join('\n')}

Recent Activity:
${transactions.slice(0, 10).map(tx => `- ${tx.block_signed_at}: ${tx.from_address === walletAddress.toLowerCase() ? 'Sent' : 'Received'} $${tx.value_quote?.toFixed(2) || 0}`).join('\n')}

Provide a concise analysis in JSON format:
{
  "summary": "2-3 sentence overview of wallet behavior",
  "insights": ["3-4 key observations about trading patterns, holdings, or activity"],
  "riskLevel": "low/medium/high based on diversification and activity",
  "recommendations": ["2-3 actionable insights for someone following this wallet"]
}
`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert blockchain analyst. Provide concise, actionable insights about wallet behavior. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: analysis.summary || "Analysis unavailable",
      insights: analysis.insights || [],
      riskLevel: analysis.riskLevel || "medium",
      recommendations: analysis.recommendations || [],
    };
  } catch (error) {
    console.error("Error analyzing wallet:", error);
    return {
      summary: "Unable to analyze wallet activity at this time.",
      insights: [],
      riskLevel: "medium",
      recommendations: [],
    };
  }
}

/**
 * Compare two wallets with AI insights
 */
export async function compareWalletsWithAI(
  address1: string,
  address2: string
): Promise<string> {
  try {
    const comparison = await compareWallets(address1, address2);
    
    const prompt = `
Compare these two wallets on Base/Ethereum:

Wallet A (${address1}):
- Total Value: $${comparison.wallet1.totalValue.toFixed(2)}
- Tokens: ${comparison.wallet1.tokenCount}
- Recent Transactions: ${comparison.wallet1.recentTxCount}

Wallet B (${address2}):
- Total Value: $${comparison.wallet2.totalValue.toFixed(2)}
- Tokens: ${comparison.wallet2.tokenCount}
- Recent Transactions: ${comparison.wallet2.recentTxCount}

Provide a 3-4 sentence comparison highlighting:
1. Which wallet is more active/successful
2. Key differences in strategy
3. What Wallet B could learn from Wallet A (or vice versa)
`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert blockchain analyst providing wallet comparisons. Be concise and actionable.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Comparison unavailable";
  } catch (error) {
    console.error("Error comparing wallets:", error);
    return "Unable to compare wallets at this time.";
  }
}

/**
 * Generate notification message for wallet activity
 */
export async function generateNotificationMessage(
  walletAddress: string,
  walletName: string | undefined,
  txType: string,
  amountUSD: number,
  chain: string
): Promise<string> {
  const displayName = walletName || `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  
  const emojis: Record<string, string> = {
    swap: "🔄",
    transfer: "💸",
    mint: "🎨",
    bridge: "🌉",
  };

  const emoji = emojis[txType] || "⚡";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountUSD);

  return `${emoji} ${displayName} just ${txType}ped ${formattedAmount} on ${chain.toUpperCase()}!\n\nCheck the details in Onchain Radar 📡`;
}

