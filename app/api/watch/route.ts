import { NextRequest, NextResponse } from "next/server";
import {
  addWalletSubscription,
  getUserSubscriptions,
  removeWalletSubscription,
  WalletSubscription,
} from "@/lib/supabaseClient";
import { isValidAddress } from "@/lib/utils";

/**
 * GET - Get all subscriptions for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const followerFid = searchParams.get("fid");

    if (!followerFid) {
      return NextResponse.json(
        { error: "Farcaster FID is required" },
        { status: 400 }
      );
    }

    const subscriptions = await getUserSubscriptions(followerFid);
    
    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

/**
 * POST - Add a new wallet subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      follower_fid,
      follower_address,
      target_address,
      target_name,
      threshold_usd = 500,
      threshold_tx_count = 1,
    } = body;

    // Validation
    if (!follower_fid || !follower_address || !target_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidAddress(follower_address) || !isValidAddress(target_address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription: WalletSubscription = {
      follower_fid,
      follower_address: follower_address.toLowerCase(),
      target_address: target_address.toLowerCase(),
      target_name,
      threshold_usd,
      threshold_tx_count,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const result = await addWalletSubscription(subscription);

    return NextResponse.json({
      success: true,
      subscription: result,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a wallet subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("id");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    await removeWalletSubscription(subscriptionId);

    return NextResponse.json({
      success: true,
      message: "Subscription removed",
    });
  } catch (error: any) {
    console.error("Error removing subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove subscription" },
      { status: 500 }
    );
  }
}

