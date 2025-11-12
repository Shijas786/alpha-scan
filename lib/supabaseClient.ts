import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-load Supabase client to avoid build-time initialization
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// Legacy export - call getSupabaseClient() to get the client
export const supabase = getSupabaseClient;

/**
 * Database Types
 */
export interface WalletSubscription {
  id?: string;
  follower_fid: string; // Farcaster FID
  follower_address: string; // Follower's wallet address
  target_address: string; // Wallet being watched
  target_name?: string; // Optional display name
  threshold_usd?: number; // Alert threshold in USD
  threshold_tx_count?: number; // Alert threshold for tx count
  created_at?: string;
  last_checked?: string;
  is_active?: boolean;
}

export interface WalletActivity {
  id?: string;
  wallet_address: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
  tx_type: string; // 'swap', 'transfer', 'mint', 'bridge'
  token_in?: string;
  token_out?: string;
  amount_usd: number;
  chain: string; // 'base', 'ethereum'
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface Notification {
  id?: string;
  subscription_id: string;
  activity_id: string;
  sent_at?: string;
  cast_hash?: string; // Farcaster cast hash
  status: "pending" | "sent" | "failed";
}

/**
 * Add a new wallet subscription
 */
export async function addWalletSubscription(
  subscription: WalletSubscription
) {
  const { data, error} = await getSupabaseClient()
    .from("wallet_subscriptions")
    .insert(subscription)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all active subscriptions for a user
 */
export async function getUserSubscriptions(followerFid: string) {
  const { data, error } = await getSupabaseClient()
    .from("wallet_subscriptions")
    .select("*")
    .eq("follower_fid", followerFid)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as WalletSubscription[];
}

/**
 * Get all active subscriptions (for polling)
 */
export async function getAllActiveSubscriptions() {
  const { data, error } = await getSupabaseClient()
    .from("wallet_subscriptions")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;
  return data as WalletSubscription[];
}

/**
 * Remove a subscription
 */
export async function removeWalletSubscription(id: string) {
  const { error } = await getSupabaseClient()
    .from("wallet_subscriptions")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Store wallet activity
 */
export async function storeWalletActivity(activity: WalletActivity) {
  const { data, error } = await getSupabaseClient()
    .from("wallet_activities")
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get recent activity for a wallet
 */
export async function getWalletActivity(
  walletAddress: string,
  limit: number = 20
) {
  const { data, error } = await getSupabaseClient()
    .from("wallet_activities")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as WalletActivity[];
}

/**
 * Store notification record
 */
export async function storeNotification(notification: Notification) {
  const { data, error } = await getSupabaseClient()
    .from("notifications")
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update subscription last checked time
 */
export async function updateSubscriptionLastChecked(id: string) {
  const { error } = await getSupabaseClient()
    .from("wallet_subscriptions")
    .update({ last_checked: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

