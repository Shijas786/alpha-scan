import { NextRequest, NextResponse } from "next/server";
import {
  getAllActiveSubscriptions,
  storeWalletActivity,
  updateSubscriptionLastChecked,
  getWalletActivity,
} from "@/lib/supabaseClient";
import { getWalletTransactions, analyzeTransaction } from "@/lib/covalent";

/**
 * POST - Poll watched wallets for new activity
 * This should be called by a cron job (e.g., Vercel Cron or external scheduler)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all active subscriptions
    const subscriptions = await getAllActiveSubscriptions();
    
    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscriptions",
        checked: 0,
      });
    }

    const results = {
      checked: 0,
      newActivities: 0,
      errors: 0,
    };

    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        const targetAddress = subscription.target_address;

        // Get recent transactions from Covalent (Base chain)
        const transactions = await getWalletTransactions(targetAddress, 8453, 10);
        
        // Get last stored activity to avoid duplicates
        const lastActivities = await getWalletActivity(targetAddress, 1);
        const lastTxHash = lastActivities[0]?.tx_hash;

        // Process new transactions
        for (const tx of transactions) {
          // Skip if we've already processed this transaction
          if (tx.tx_hash === lastTxHash) break;

          const analysis = analyzeTransaction(tx);

          // Check if this meets the subscription threshold
          const meetsThreshold =
            analysis.significant &&
            tx.value_quote >= (subscription.threshold_usd || 500);

          if (meetsThreshold) {
            // Store the activity
            await storeWalletActivity({
              wallet_address: targetAddress,
              tx_hash: tx.tx_hash,
              block_number: tx.block_height,
              timestamp: tx.block_signed_at,
              tx_type: analysis.type,
              amount_usd: tx.value_quote,
              chain: "base",
              metadata: {
                from: tx.from_address,
                to: tx.to_address,
                description: analysis.description,
              },
            });

            results.newActivities++;

            // TODO: Trigger notification
            // In a production app, you would queue this notification
            // or send it immediately via the /api/notify endpoint
          }
        }

        // Update last checked timestamp
        await updateSubscriptionLastChecked(subscription.id!);
        results.checked++;
      } catch (error) {
        console.error(
          `Error processing subscription ${subscription.id}:`,
          error
        );
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error in poller:", error);
    return NextResponse.json(
      { error: error.message || "Polling failed" },
      { status: 500 }
    );
  }
}

/**
 * GET - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "wallet-poller",
    timestamp: new Date().toISOString(),
  });
}

