import { NextRequest, NextResponse } from "next/server";
import { getWalletPortfolio, getWalletTransactions } from "@/lib/covalent";
import { analyzeWalletActivity } from "@/lib/radarAgent";
import { isValidAddress } from "@/lib/utils";

/**
 * GET - Get wallet details with AI analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const includeAnalysis = searchParams.get("analysis") === "true";

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Fetch portfolio and transactions
    const [portfolio, transactions] = await Promise.all([
      getWalletPortfolio(address),
      getWalletTransactions(address, 8453, 20),
    ]);

    let analysis = null;
    if (includeAnalysis) {
      analysis = await analyzeWalletActivity(address, transactions);
    }

    return NextResponse.json({
      success: true,
      portfolio,
      transactions,
      analysis,
    });
  } catch (error: any) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}

