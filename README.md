# 📡 Onchain Radar

**A Farcaster-native wallet tracker that notifies you when wallets you follow make significant onchain moves.**

Built for the Base + Farcaster ecosystem using Reown (WalletConnect), Covalent, Neynar, and GPT-4.

---

## 🚀 Features

- **🔍 Wallet Tracking**: Search and track any Ethereum/Base wallet
- **🔔 Farcaster Notifications**: Get notified in Warpcast when followed wallets trade, mint, or bridge
- **🤖 AI-Powered Analysis**: GPT-4 analyzes wallet behavior and provides insights
- **📊 Portfolio Overview**: See real-time token balances and transaction history
- **🎯 Custom Thresholds**: Set USD thresholds for notifications
- **🖼️ Farcaster Frames**: Interactive frames for wallet insights

---

## 🏗️ Architecture

```
/onchain-radar
├─ /app
│  ├─ /api
│  │  ├─ /watch          → Add/remove wallet subscriptions
│  │  ├─ /compare        → AI-powered wallet comparison
│  │  ├─ /notify         → Send Farcaster notifications
│  │  ├─ /poller         → Polling job for checking activity
│  │  ├─ /frame          → Farcaster Frame endpoints
│  │  ├─ /wallet         → Fetch wallet data with analysis
│  ├─ page.tsx           → Main UI
│  ├─ layout.tsx         → App layout with providers
├─ /lib
│  ├─ wagmiConfig.ts     → Reown AppKit configuration
│  ├─ supabaseClient.ts  → Supabase client & database functions
│  ├─ covalent.ts        → Covalent API integration
│  ├─ radarAgent.ts      → AI agent for wallet analysis
│  ├─ farcaster.ts       → Neynar/Farcaster integration
│  ├─ utils.ts           → Utility functions
├─ /components
│  ├─ Providers.tsx      → Wagmi & React Query providers
│  ├─ WalletSearch.tsx   → Search for wallets
│  ├─ WalletCard.tsx     → Display wallet data & analysis
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Wallet** | Reown AppKit (WalletConnect v3), Wagmi, Viem |
| **Blockchain Data** | Covalent API (Base + Ethereum) |
| **AI** | OpenAI GPT-4o-mini |
| **Social** | Neynar API (Farcaster) |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Vercel (with Cron Jobs) |

---

## 📦 Installation

### 1. Clone the repository

```bash
cd onchain-radar
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

**Required API Keys:**

- **Reown Project ID**: Get from [Reown Cloud](https://cloud.reown.com/)
- **Covalent API Key**: Get from [Covalent](https://www.covalenthq.com/)
- **OpenAI API Key**: Get from [OpenAI](https://platform.openai.com/)
- **Neynar API Key**: Get from [Neynar](https://neynar.com/)
- **Supabase**: Create a project at [Supabase](https://supabase.com/)

### 4. Set up Supabase Database

Run the following SQL in your Supabase SQL Editor:

```sql
-- Wallet Subscriptions Table
CREATE TABLE wallet_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_fid TEXT NOT NULL,
  follower_address TEXT NOT NULL,
  target_address TEXT NOT NULL,
  target_name TEXT,
  threshold_usd NUMERIC DEFAULT 500,
  threshold_tx_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ
);

-- Wallet Activities Table
CREATE TABLE wallet_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  block_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  tx_type TEXT NOT NULL,
  token_in TEXT,
  token_out TEXT,
  amount_usd NUMERIC NOT NULL,
  chain TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES wallet_subscriptions(id),
  activity_id UUID REFERENCES wallet_activities(id),
  cast_hash TEXT,
  status TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_follower ON wallet_subscriptions(follower_fid);
CREATE INDEX idx_subscriptions_target ON wallet_subscriptions(target_address);
CREATE INDEX idx_activities_wallet ON wallet_activities(wallet_address);
CREATE INDEX idx_activities_timestamp ON wallet_activities(timestamp DESC);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 Setting Up the Poller (Cron Job)

The poller checks for new wallet activity periodically. On Vercel:

1. Create a file `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/poller",
    "schedule": "*/5 * * * *"
  }]
}
```

2. Add `CRON_SECRET` to your environment variables
3. Deploy to Vercel

The poller will run every 5 minutes and check all active subscriptions.

---

## 📖 Usage

### 1. Connect Wallet

Click "Connect Wallet" and connect using Reown AppKit (supports 300+ wallets).

### 2. Search for Wallets

Enter any Ethereum/Base address to view:
- Portfolio value and tokens
- Recent transactions
- AI-powered analysis

### 3. Follow Wallets

Click "Follow Wallet" to receive notifications when they:
- Swap tokens
- Mint NFTs
- Bridge funds
- Make large transfers

### 4. Receive Notifications

Get notified on Farcaster when followed wallets meet your thresholds!

---

## 🎯 API Endpoints

### `POST /api/watch`
Add a wallet subscription

```json
{
  "follower_fid": "12345",
  "follower_address": "0x...",
  "target_address": "0x...",
  "threshold_usd": 500
}
```

### `GET /api/wallet?address=0x...&analysis=true`
Get wallet data with AI analysis

### `POST /api/compare`
Compare two wallets with AI

```json
{
  "address1": "0x...",
  "address2": "0x..."
}
```

### `POST /api/notify`
Send Farcaster notification

### `POST /api/poller`
Poll wallets for activity (secured with CRON_SECRET)

### `GET /api/frame?wallet=0x...`
Generate Farcaster Frame for a wallet

---

## 🧠 AI Agent Features

The Radar Agent uses GPT-4o-mini to:

- **Analyze Portfolios**: Evaluate diversification, risk, and holdings
- **Detect Patterns**: Identify trading strategies and behaviors
- **Generate Insights**: Provide actionable recommendations
- **Compare Wallets**: Benchmark performance against other wallets
- **Create Notifications**: Generate human-readable activity messages

---

## 🎨 Customization

### Adjust Notification Thresholds

In `/lib/covalent.ts`, modify the threshold logic:

```typescript
const meetsThreshold = 
  analysis.significant && 
  tx.value_quote >= (subscription.threshold_usd || 500);
```

### Change Polling Frequency

Update `vercel.json` cron schedule:

```json
"schedule": "*/10 * * * *"  // Every 10 minutes
```

### Add More Chains

In `/lib/covalent.ts`, add chains to portfolio fetching:

```typescript
const [baseBalances, ethBalances, optimismBalances] = await Promise.all([
  getTokenBalances(walletAddress, 8453),  // Base
  getTokenBalances(walletAddress, 1),     // Ethereum
  getTokenBalances(walletAddress, 10),    // Optimism
]);
```

---

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Set up serverless functions
- Configure cron jobs (with `vercel.json`)

---

## 🔐 Security Notes

- Never commit `.env.local` or API keys
- Use `CRON_SECRET` to secure the poller endpoint
- Implement rate limiting for API routes in production
- Validate all user inputs
- Use Supabase Row Level Security (RLS) policies

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for your own applications.

---

## 🙏 Acknowledgments

Built with:
- [Reown (WalletConnect)](https://reown.com/)
- [Covalent](https://www.covalenthq.com/)
- [Neynar](https://neynar.com/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [Base](https://base.org/)
- [Farcaster](https://farcaster.xyz/)

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Reach out on Farcaster
- Check the [Reown Docs](https://docs.reown.com/)
- Check the [Covalent Docs](https://www.covalenthq.com/docs/)

---

**Built for the Base + Farcaster Ecosystem** 🔵💜
