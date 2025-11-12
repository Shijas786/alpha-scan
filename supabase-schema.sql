-- Onchain Radar - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: wallet_subscriptions
-- Stores user subscriptions to watch specific wallets
-- =====================================================
CREATE TABLE IF NOT EXISTS wallet_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_fid TEXT NOT NULL,
  follower_address TEXT NOT NULL,
  target_address TEXT NOT NULL,
  target_name TEXT,
  threshold_usd NUMERIC DEFAULT 500,
  threshold_tx_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ,
  
  -- Prevent duplicate subscriptions
  UNIQUE(follower_address, target_address)
);

-- =====================================================
-- TABLE: wallet_activities
-- Stores significant wallet transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS wallet_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  block_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  tx_type TEXT NOT NULL, -- 'swap', 'transfer', 'mint', 'bridge'
  token_in TEXT,
  token_out TEXT,
  amount_usd NUMERIC NOT NULL,
  chain TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: notifications
-- Tracks sent Farcaster notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES wallet_subscriptions(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES wallet_activities(id) ON DELETE CASCADE,
  cast_hash TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_follower 
  ON wallet_subscriptions(follower_fid) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_target 
  ON wallet_subscriptions(target_address) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
  ON wallet_subscriptions(is_active, last_checked);

CREATE INDEX IF NOT EXISTS idx_activities_wallet 
  ON wallet_activities(wallet_address);

CREATE INDEX IF NOT EXISTS idx_activities_timestamp 
  ON wallet_activities(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activities_wallet_timestamp 
  ON wallet_activities(wallet_address, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_subscription 
  ON notifications(subscription_id);

CREATE INDEX IF NOT EXISTS idx_notifications_activity 
  ON notifications(activity_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE wallet_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON wallet_subscriptions
  FOR SELECT
  USING (follower_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Allow users to create their own subscriptions
CREATE POLICY "Users can create their own subscriptions"
  ON wallet_subscriptions
  FOR INSERT
  WITH CHECK (follower_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Allow users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON wallet_subscriptions
  FOR UPDATE
  USING (follower_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Allow all users to read wallet activities (public data)
CREATE POLICY "Anyone can view wallet activities"
  ON wallet_activities
  FOR SELECT
  USING (true);

-- Only backend can insert activities (via service role key)
CREATE POLICY "Service can insert activities"
  ON wallet_activities
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM wallet_subscriptions 
      WHERE follower_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get active subscriptions that need checking
CREATE OR REPLACE FUNCTION get_subscriptions_to_check(check_interval_minutes INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  follower_fid TEXT,
  follower_address TEXT,
  target_address TEXT,
  target_name TEXT,
  threshold_usd NUMERIC,
  threshold_tx_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.follower_fid,
    s.follower_address,
    s.target_address,
    s.target_name,
    s.threshold_usd,
    s.threshold_tx_count
  FROM wallet_subscriptions s
  WHERE s.is_active = true
    AND (
      s.last_checked IS NULL 
      OR s.last_checked < NOW() - (check_interval_minutes || ' minutes')::INTERVAL
    )
  ORDER BY s.last_checked ASC NULLS FIRST
  LIMIT 100; -- Process up to 100 subscriptions per run
END;
$$ LANGUAGE plpgsql;

-- Function to get recent activity for a wallet
CREATE OR REPLACE FUNCTION get_recent_wallet_activity(
  wallet_addr TEXT,
  hours_ago INTEGER DEFAULT 24
)
RETURNS TABLE (
  tx_hash TEXT,
  timestamp TIMESTAMPTZ,
  tx_type TEXT,
  amount_usd NUMERIC,
  chain TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.tx_hash,
    a.timestamp,
    a.tx_type,
    a.amount_usd,
    a.chain
  FROM wallet_activities a
  WHERE a.wallet_address = LOWER(wallet_addr)
    AND a.timestamp > NOW() - (hours_ago || ' hours')::INTERVAL
  ORDER BY a.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO wallet_subscriptions (follower_fid, follower_address, target_address, target_name, threshold_usd)
VALUES 
  ('12345', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'Vitalik.eth', 1000),
  ('12345', '0x1234567890123456789012345678901234567890', '0x9876543210987654321098765432109876543210', 'Whale Wallet', 5000);
*/

-- =====================================================
-- VIEWS (Optional - for analytics)
-- =====================================================

-- View: Most followed wallets
CREATE OR REPLACE VIEW most_followed_wallets AS
SELECT 
  target_address,
  target_name,
  COUNT(*) as follower_count,
  AVG(threshold_usd) as avg_threshold
FROM wallet_subscriptions
WHERE is_active = true
GROUP BY target_address, target_name
ORDER BY follower_count DESC;

-- View: Most active wallets (by transaction volume)
CREATE OR REPLACE VIEW most_active_wallets AS
SELECT 
  wallet_address,
  COUNT(*) as tx_count,
  SUM(amount_usd) as total_volume_usd,
  MAX(timestamp) as last_activity
FROM wallet_activities
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY wallet_address
ORDER BY total_volume_usd DESC;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Your database is now ready for Onchain Radar!
-- Remember to set up your environment variables in .env.local

