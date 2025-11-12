# 🚀 Onchain Radar - Complete Setup Guide

This guide will walk you through setting up **Onchain Radar** from scratch.

---

## 📋 Prerequisites

- Node.js 18+ (preferably 20+)
- npm or yarn
- GitHub account
- Accounts for: Reown, Covalent, OpenAI, Neynar, Supabase, Vercel

---

## 🔑 Step 1: Get API Keys

### 1.1 Reown (WalletConnect) Project ID

1. Go to [https://cloud.reown.com/](https://cloud.reown.com/)
2. Sign up or log in
3. Create a new project
4. Copy your **Project ID**
5. Save it as: `NEXT_PUBLIC_REOWN_PROJECT_ID`

### 1.2 Covalent API Key

1. Go to [https://www.covalenthq.com/](https://www.covalenthq.com/)
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Save it as: `COVALENT_API_KEY`

### 1.3 OpenAI API Key

1. Go to [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new secret key
5. Save it as: `OPENAI_API_KEY`
6. **Note**: Add credits to your account ($5-10 is enough for testing)

### 1.4 Neynar API Key

1. Go to [https://neynar.com/](https://neynar.com/)
2. Sign up for a developer account
3. Create a new app
4. Get your API key from the dashboard
5. Save it as: `NEYNAR_API_KEY`

**For posting casts (optional but recommended):**
1. In Neynar dashboard, create a signer
2. Copy the signer UUID
3. Save it as: `NEYNAR_SIGNER_UUID`

### 1.5 Supabase Configuration

1. Go to [https://supabase.com/](https://supabase.com/)
2. Create a new project
3. Wait for it to initialize (2-3 minutes)
4. Go to Settings → API
5. Copy:
   - **Project URL** → Save as `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🗄️ Step 2: Set Up Supabase Database

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click "Run"
5. Verify tables were created by going to **Table Editor**

You should see three tables:
- `wallet_subscriptions`
- `wallet_activities`
- `notifications`

---

## ⚙️ Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Fill in all the API keys you collected:

```env
# Reown
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id_here

# Covalent
COVALENT_API_KEY=your_covalent_api_key_here

# OpenAI
OPENAI_API_KEY=sk-...your_openai_key_here

# Neynar
NEYNAR_API_KEY=your_neynar_api_key_here
NEYNAR_SIGNER_UUID=your_neynar_signer_uuid_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cron (generate a random string)
CRON_SECRET=your_random_secret_here_use_openssl_rand
```

3. Generate a secure CRON_SECRET:

```bash
openssl rand -base64 32
```

---

## 📦 Step 4: Install Dependencies

```bash
npm install
```

If you see engine warnings about Node.js version, consider upgrading to Node 20:

```bash
# Using nvm
nvm install 20
nvm use 20
```

---

## 🚀 Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the Onchain Radar landing page!

---

## ✅ Step 6: Test the Application

### Test 1: Connect Wallet

1. Click "Connect Wallet"
2. Select your wallet (MetaMask, Coinbase Wallet, etc.)
3. Approve the connection
4. You should see your address in the header

### Test 2: Search for a Wallet

Try searching for a known wallet with activity on Base:

Example addresses:
- `0x0000000000000000000000000000000000000000` (test)
- Or use your own wallet address

### Test 3: View Wallet Data

1. Enter a wallet address
2. Click "Search"
3. You should see:
   - Portfolio balance
   - Token holdings
   - Recent transactions
   - AI analysis

### Test 4: Follow a Wallet

1. Click "Follow Wallet"
2. Check the browser console for the API response
3. (Optional) Check Supabase table editor to see the subscription

---

## 🔧 Step 7: Deploy to Vercel

### 7.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Onchain Radar"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 7.2 Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL
6. Click "Deploy"

### 7.3 Configure Cron Job

The `vercel.json` file is already configured to run the poller every 5 minutes.

Verify it's working:
1. Go to your Vercel project
2. Navigate to "Cron Jobs" in the settings
3. You should see the `/api/poller` job

---

## 🧪 Step 8: Test the Poller

### Option A: Test Locally

```bash
curl -X POST http://localhost:3000/api/poller \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option B: Test on Vercel

```bash
curl -X POST https://your-app.vercel.app/api/poller \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

You should get a response like:

```json
{
  "success": true,
  "results": {
    "checked": 0,
    "newActivities": 0,
    "errors": 0
  }
}
```

---

## 📊 Step 9: Monitor & Debug

### Check Supabase Data

1. Go to Supabase → Table Editor
2. Check `wallet_subscriptions` for your follows
3. Check `wallet_activities` for detected transactions
4. Check `notifications` for sent alerts

### Check Vercel Logs

1. Go to Vercel → Your Project → Functions
2. Click on any API route to see logs
3. Look for errors or warnings

### Test API Endpoints

```bash
# Get wallet data
curl "http://localhost:3000/api/wallet?address=0x...&analysis=true"

# Add subscription (requires auth in production)
curl -X POST http://localhost:3000/api/watch \
  -H "Content-Type: application/json" \
  -d '{
    "follower_fid": "test",
    "follower_address": "0x...",
    "target_address": "0x...",
    "threshold_usd": 500
  }'
```

---

## 🎯 Step 10: Customize & Extend

### Change Polling Frequency

Edit `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/poller",
    "schedule": "*/10 * * * *"  // Every 10 minutes
  }]
}
```

### Adjust Alert Thresholds

Edit the default in `/app/api/watch/route.ts`:

```typescript
threshold_usd = 1000,  // Changed from 500
```

### Add More Chains

Edit `/lib/covalent.ts` in the `getWalletPortfolio` function:

```typescript
const [baseBalances, ethBalances, optimismBalances] = await Promise.all([
  getTokenBalances(walletAddress, 8453),  // Base
  getTokenBalances(walletAddress, 1),     // Ethereum
  getTokenBalances(walletAddress, 10),    // Optimism
]);
```

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch wallet data"

**Solution**: Check your Covalent API key and ensure you have credits.

```bash
# Test Covalent API
curl "https://api.covalenthq.com/v1/8453/address/0x.../balances_v2/" \
  -H "Authorization: Bearer YOUR_COVALENT_KEY"
```

### Issue: AppKit not connecting

**Solution**: Verify your Reown Project ID is correct and the app URL is whitelisted.

### Issue: AI analysis not working

**Solution**: Check OpenAI API key and account credits.

### Issue: Cron job not running

**Solution**: 
1. Verify `vercel.json` is in the root
2. Redeploy after adding it
3. Check Vercel → Settings → Cron Jobs

---

## 🎉 You're All Set!

Your Onchain Radar is now live! Users can:

1. ✅ Connect their wallet
2. ✅ Search for any wallet
3. ✅ View AI-powered analysis
4. ✅ Follow wallets
5. ✅ Get notified on Farcaster (when fully integrated)

---

## 📚 Next Steps

- **Integrate Farcaster Auth**: Use Privy or Dynamic for Farcaster login
- **Enhance Notifications**: Implement full Warpcast notification flow
- **Add Frame Actions**: Make frames interactive
- **Build Analytics**: Add dashboard for tracking popular wallets
- **Mobile Optimization**: Improve responsive design

---

## 💬 Need Help?

- Check the main `README.md`
- Review API documentation
- Open an issue on GitHub
- Reach out on Farcaster

---

**Happy tracking! 📡**

