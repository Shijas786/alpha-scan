import { NextRequest, NextResponse } from "next/server";
import { sendNotificationCast } from "@/lib/farcaster";
import { generateNotificationMessage } from "@/lib/radarAgent";
import { storeNotification } from "@/lib/supabaseClient";

/**
 * POST - Send a notification via Farcaster
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      signer_uuid,
      recipient_username,
      wallet_address,
      wallet_name,
      tx_type,
      amount_usd,
      chain,
      subscription_id,
      activity_id,
      frame_url,
    } = body;

    // Validation
    if (!signer_uuid || !recipient_username || !wallet_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate notification message using AI
    const message = await generateNotificationMessage(
      wallet_address,
      wallet_name,
      tx_type,
      amount_usd,
      chain
    );

    // Send cast via Neynar
    const result = await sendNotificationCast(
      signer_uuid,
      recipient_username,
      message,
      frame_url
    );

    // Store notification record
    if (subscription_id && activity_id) {
      await storeNotification({
        subscription_id,
        activity_id,
        cast_hash: result.hash,
        status: result.success ? "sent" : "failed",
        sent_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: result.success,
      cast_hash: result.hash,
      message,
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}

