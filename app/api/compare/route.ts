import { NextRequest, NextResponse } from "next/server";
import { compareWalletsWithAI } from "@/lib/radarAgent";
import { isValidAddress } from "@/lib/utils";

/**
 * POST - Compare two wallets with AI analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address1, address2 } = body;

    // Validation
    if (!address1 || !address2) {
      return NextResponse.json(
        { error: "Two wallet addresses are required" },
        { status: 400 }
      );
    }

    if (!isValidAddress(address1) || !isValidAddress(address2)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Perform AI-powered comparison
    const comparison = await compareWalletsWithAI(address1, address2);

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    console.error("Error comparing wallets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare wallets" },
      { status: 500 }
    );
  }
}

