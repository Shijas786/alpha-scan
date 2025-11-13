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
    
    // Calculate wallet metrics
    const totalValue = portfolio.total_balance_usd;
    const tokenCount = portfolio.tokens.length;
    const recentTxCount = transactions.length;
    const avgTxValue = transactions.length > 0 
      ? transactions.reduce((sum, tx) => sum + (tx.value_quote || 0), 0) / transactions.length 
      : 0;
    
    // Determine wallet type
    const largestHolding = portfolio.tokens[0]?.quote || 0;
    const diversificationRatio = tokenCount > 0 ? largestHolding / totalValue : 1;
    
    // Count transaction directions
    const sentCount = transactions.filter(tx => tx.from_address === walletAddress.toLowerCase()).length;
    const receivedCount = transactions.length - sentCount;
    
    const prompt = `
You are an expert blockchain analyst. Analyze this SPECIFIC wallet's unique characteristics.

WALLET ADDRESS: ${walletAddress}
TIMESTAMP: ${new Date().toISOString()}

KEY METRICS:
- Portfolio Value: $${totalValue.toFixed(2)}
- Token Holdings: ${tokenCount} different tokens
- Recent Transactions: ${recentTxCount} txs
- Average Transaction: $${avgTxValue.toFixed(2)}
- Sent/Received Ratio: ${sentCount}/${receivedCount}
- Diversification: ${(diversificationRatio * 100).toFixed(1)}% in largest holding

TOP HOLDINGS (Specific tokens owned):
${portfolio.tokens.slice(0, 5).map((t, i) => `${i + 1}. ${t.contract_ticker_symbol}: $${t.quote.toFixed(2)} (${((t.quote / totalValue) * 100).toFixed(1)}% of portfolio)`).join('\n')}

RECENT TRANSACTION HISTORY:
${transactions.slice(0, 10).map((tx, i) => {
  const direction = tx.from_address === walletAddress.toLowerCase() ? '📤 SENT' : '📥 RECEIVED';
  const value = tx.value_quote?.toFixed(2) || '0.00';
  const timeAgo = Math.floor((Date.now() - new Date(tx.block_signed_at).getTime()) / 3600000);
  return `${i + 1}. ${direction} $${value} (${timeAgo}h ago)`;
}).join('\n')}

IMPORTANT: Provide a UNIQUE analysis based on THIS SPECIFIC wallet's actual data above. 
- Reference the ACTUAL token names they hold
- Comment on their REAL transaction patterns
- Consider their ACTUAL portfolio size
- Be specific about what makes THIS wallet different

Return JSON format:
{
  "summary": "2-3 sentences describing THIS SPECIFIC wallet's unique strategy and holdings",
  "insights": ["3-4 observations about THIS wallet's actual behavior, mentioning specific tokens/amounts"],
  "riskLevel": "low/medium/high (based on diversification ratio: ${diversificationRatio.toFixed(2)})",
  "recommendations": ["2-3 specific suggestions based on THIS wallet's actual portfolio"]
}
`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert blockchain analyst. Provide SPECIFIC, DATA-DRIVEN insights unique to each wallet. Never give generic responses. Always mention actual token names, amounts, and patterns from the data provided. Respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8, // Increased for more varied responses
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
    // Return error with wallet-specific context
    return {
      summary: `Analysis unavailable for ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}. This could be due to API limits or the wallet having no recent activity.`,
      insights: [
        `Wallet: ${walletAddress}`,
        `Check if OpenAI API key is configured`,
        "Try again in a few moments"
      ],
      riskLevel: "medium",
      recommendations: ["Ensure API keys are properly configured in environment variables"],
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
    
    // Calculate metrics for better comparison
    const valueDiff = comparison.wallet1.totalValue - comparison.wallet2.totalValue;
    const activityDiff = comparison.wallet1.recentTxCount - comparison.wallet2.recentTxCount;
    const avgTx1 = comparison.wallet1.recentTxCount > 0 
      ? comparison.wallet1.totalValue / comparison.wallet1.recentTxCount 
      : 0;
    const avgTx2 = comparison.wallet2.recentTxCount > 0 
      ? comparison.wallet2.totalValue / comparison.wallet2.recentTxCount 
      : 0;
    
    const prompt = `
Compare these TWO SPECIFIC wallets. Be detailed and reference actual differences.

WALLET A: ${address1}
- Portfolio: $${comparison.wallet1.totalValue.toFixed(2)}
- Tokens Held: ${comparison.wallet1.tokenCount}
- Recent Activity: ${comparison.wallet1.recentTxCount} transactions
- Avg Transaction: $${avgTx1.toFixed(2)}

WALLET B: ${address2}
- Portfolio: $${comparison.wallet2.totalValue.toFixed(2)}
- Tokens Held: ${comparison.wallet2.tokenCount}
- Recent Activity: ${comparison.wallet2.recentTxCount} transactions
- Avg Transaction: $${avgTx2.toFixed(2)}

DIFFERENCES:
- Portfolio Gap: $${Math.abs(valueDiff).toFixed(2)} (${valueDiff > 0 ? 'A leads' : 'B leads'})
- Activity Gap: ${Math.abs(activityDiff)} transactions (${activityDiff > 0 ? 'A more active' : 'B more active'})

Provide a detailed 4-5 sentence comparison that:
1. States which wallet is financially larger and by how much
2. Compares their trading activity levels
3. Identifies different strategies (holder vs trader, diversified vs concentrated)
4. Gives specific actionable advice based on these ACTUAL numbers
`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert blockchain analyst. Compare wallets using SPECIFIC data points. Always reference actual dollar amounts, transaction counts, and percentages. Make comparisons concrete and actionable.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 400,
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

