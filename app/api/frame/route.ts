import { NextRequest, NextResponse } from "next/server";
import { getWalletPortfolio } from "@/lib/covalent";
import { analyzeWalletActivity } from "@/lib/radarAgent";
import { getWalletActivity } from "@/lib/supabaseClient";
import { formatUSD, shortenAddress } from "@/lib/utils";

/**
 * GET - Generate Farcaster Frame for a wallet
 * Frames use Open Graph meta tags for rendering in Warpcast
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return new NextResponse("Wallet address required", { status: 400 });
    }

    // Fetch wallet data
    const [portfolio, recentActivity] = await Promise.all([
      getWalletPortfolio(walletAddress),
      getWalletActivity(walletAddress, 10),
    ]);

    // Generate frame HTML
    const frameHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Onchain Radar - ${shortenAddress(walletAddress)}</title>
  
  <!-- Farcaster Frame Meta Tags -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/image?wallet=${walletAddress}" />
  <meta property="fc:frame:button:1" content="View Portfolio" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_BASE_URL}/?wallet=${walletAddress}" />
  <meta property="fc:frame:button:2" content="Follow Wallet" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/action" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Onchain Radar - ${shortenAddress(walletAddress)}" />
  <meta property="og:description" content="Portfolio: ${formatUSD(portfolio.total_balance_usd)} | ${recentActivity.length} recent transactions" />
</head>
<body>
  <div style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px;">
    <h1>📡 Onchain Radar</h1>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2>Wallet: ${shortenAddress(walletAddress)}</h2>
      <p><strong>Total Portfolio:</strong> ${formatUSD(portfolio.total_balance_usd)}</p>
      <p><strong>Tokens Held:</strong> ${portfolio.tokens.length}</p>
      <p><strong>Recent Activity:</strong> ${recentActivity.length} transactions</p>
    </div>
    
    <div style="margin-top: 30px;">
      <h3>Recent Transactions</h3>
      <ul style="list-style: none; padding: 0;">
        ${recentActivity.slice(0, 5).map(activity => `
          <li style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #e0e0e0;">
            <div><strong>${activity.tx_type.toUpperCase()}</strong></div>
            <div>Amount: ${formatUSD(activity.amount_usd)}</div>
            <div style="color: #666; font-size: 14px;">Chain: ${activity.chain}</div>
          </li>
        `).join('')}
      </ul>
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
      <p><strong>View this wallet in Onchain Radar</strong></p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/?wallet=${walletAddress}" 
         style="display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">
        Open Radar
      </a>
    </div>
  </div>
</body>
</html>
    `.trim();

    return new NextResponse(frameHtml, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error: any) {
    console.error("Error generating frame:", error);
    return new NextResponse("Failed to generate frame", { status: 500 });
  }
}

/**
 * POST - Handle frame button actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate frame message (Farcaster signature)
    // In production, validate using Neynar's validateFrameMessage
    
    const { buttonIndex, fid } = body.untrustedData || {};

    if (buttonIndex === 2) {
      // "Follow Wallet" button clicked
      return NextResponse.json({
        message: "Follow functionality would be implemented here",
        type: "message",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error handling frame action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}

