# 📡 Onchain Radar - Project Summary

## 🎯 What Is This?

**Onchain Radar** is a Farcaster-native application that lets users track wallet activity and receive social notifications when followed wallets make significant onchain moves.

Think: "Get a Farcaster notification when your friend apes into a new token."

---

## 🏆 Key Innovation

**Social + Onchain Intelligence**

Most wallet trackers are isolated tools. Onchain Radar integrates directly into Farcaster's social layer, turning onchain activity into social notifications and conversations.

---

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Reown AppKit** for wallet connections (300+ wallets supported)
- **Wagmi + Viem** for blockchain interactions
- **React Query** for data fetching

### Backend APIs (Next.js API Routes)
- `/api/watch` - Manage wallet subscriptions
- `/api/wallet` - Fetch wallet data with AI analysis
- `/api/compare` - AI-powered wallet comparison
- `/api/notify` - Send Farcaster notifications
- `/api/poller` - Cron job for checking activity
- `/api/frame` - Farcaster Frame generation

### Data Layer
- **Covalent API** - Blockchain data (Base + Ethereum)
- **Supabase** - PostgreSQL database for subscriptions
- **OpenAI GPT-4o-mini** - AI analysis & insights

### Social Layer
- **Neynar API** - Farcaster integration
- **Farcaster Frames** - Interactive wallet cards
- **Warpcast Notifications** - Push alerts

---

## 📊 Architecture Overview

```
┌─────────────────┐
│  User (Wallet)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       Next.js Frontend              │
│  - Reown AppKit (Wallet Connect)    │
│  - React Components                 │
│  - Tailwind UI                      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       Next.js API Routes            │
│  - /api/watch (subscriptions)       │
│  - /api/wallet (data + AI)          │
│  - /api/poller (cron job)           │
│  - /api/frame (Farcaster)           │
└────┬───────────┬────────────────────┘
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│Supabase │  │External APIs │
│Database │  │              │
│         │  │ - Covalent   │
│- Subs   │  │ - OpenAI     │
│- Acts   │  │ - Neynar     │
│- Notifs │  └──────────────┘
└─────────┘
     ▲
     │
     ▼
┌─────────────────┐
│  Vercel Cron    │
│  (Every 5 min)  │
│  Checks activity│
└─────────────────┘
```

---

## 🔄 Core User Flow

1. **User connects wallet** via Reown AppKit
2. **Links Farcaster identity** (via Neynar)
3. **Searches for wallets** to follow (friends, whales, influencers)
4. **Sets alert thresholds** ($500, $1000, etc.)
5. **Backend polls Covalent** every 5 minutes for new activity
6. **AI analyzes** significant transactions
7. **Notification sent** to Farcaster via Neynar
8. **User sees alert** in Warpcast with interactive Frame

---

## 💡 Core Features

### ✅ Wallet Tracking
- Search any Ethereum/Base address
- View portfolio balance & holdings
- See recent transaction history
- Track multiple wallets simultaneously

### ✅ AI-Powered Analysis
- GPT-4 analyzes wallet behavior
- Identifies trading patterns
- Risk assessment (low/medium/high)
- Actionable recommendations
- Wallet comparison feature

### ✅ Farcaster Integration
- Social notifications for activity
- Interactive Farcaster Frames
- Link wallet to Farcaster identity
- Share insights in casts

### ✅ Smart Alerts
- Customizable USD thresholds
- Filter by transaction types
- Avoid spam with smart detection
- Batched notifications

---

## 📁 Project Structure

```
/onchain-radar
├─ /app
│  ├─ /api
│  │  ├─ /compare        → Compare wallets with AI
│  │  ├─ /frame          → Farcaster Frame generation
│  │  ├─ /notify         → Send Farcaster notifications
│  │  ├─ /poller         → Cron job for activity polling
│  │  ├─ /wallet         → Fetch wallet data + analysis
│  │  └─ /watch          → Manage subscriptions
│  ├─ layout.tsx         → Root layout with providers
│  ├─ page.tsx           → Main dashboard
│  └─ globals.css        → Global styles
│
├─ /components
│  ├─ Providers.tsx      → Wagmi + React Query setup
│  ├─ WalletCard.tsx     → Display wallet details
│  └─ WalletSearch.tsx   → Search input component
│
├─ /lib
│  ├─ covalent.ts        → Covalent API integration
│  ├─ farcaster.ts       → Neynar/Farcaster functions
│  ├─ radarAgent.ts      → AI analysis with GPT-4
│  ├─ supabaseClient.ts  → Database operations
│  ├─ utils.ts           → Helper functions
│  └─ wagmiConfig.ts     → Reown AppKit config
│
├─ supabase-schema.sql   → Database schema
├─ vercel.json           → Cron job configuration
├─ .env.example          → Environment variables template
├─ README.md             → Full documentation
├─ SETUP_GUIDE.md        → Step-by-step setup
├─ QUICKSTART.md         → 5-minute quick start
└─ package.json          → Dependencies
```

---

## 🔑 Environment Variables

Required for full functionality:

```bash
# Wallet Connection
NEXT_PUBLIC_REOWN_PROJECT_ID=...

# Blockchain Data
COVALENT_API_KEY=...

# AI Analysis
OPENAI_API_KEY=...

# Farcaster
NEYNAR_API_KEY=...
NEYNAR_SIGNER_UUID=...

# Database
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# App
NEXT_PUBLIC_BASE_URL=...
CRON_SECRET=...
```

---

## 🗄️ Database Schema

### Tables

1. **wallet_subscriptions**
   - Stores which users are following which wallets
   - Includes alert thresholds and preferences

2. **wallet_activities**
   - Historical record of significant transactions
   - Indexed for fast querying

3. **notifications**
   - Log of sent Farcaster notifications
   - Tracks delivery status

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Vercel automatically:**
- Builds Next.js app
- Deploys API routes as serverless functions
- Runs cron job every 5 minutes (via `vercel.json`)

---

## 🎯 Use Cases

### For Investors
- Track whale wallets
- Get early signals on new positions
- Learn from successful traders

### For Friends
- See when your friends buy/sell
- Discover new projects together
- Coordinate airdrops

### For Researchers
- Monitor protocol activity
- Track VC wallets
- Analyze trading patterns

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Multi-chain support (Arbitrum, Optimism, Polygon)
- [ ] Portfolio leaderboards
- [ ] Copy-trading features
- [ ] Mobile app (React Native)

### Phase 3
- [ ] Token-gated communities
- [ ] Trading competitions
- [ ] Social trading graph
- [ ] Advanced analytics dashboard

### Phase 4
- [ ] On-chain reputation scores
- [ ] Smart contract integration
- [ ] DAO governance
- [ ] Revenue sharing model

---

## 🏅 Why This Can Win

1. **Unique Value Prop**: First truly social onchain tracker
2. **Network Effects**: More users = more valuable (social graph)
3. **Timing**: Base ecosystem is booming, Farcaster growing
4. **Technical Excellence**: Clean code, scalable architecture
5. **Deep Integration**: Reown + Covalent + Neynar official tools
6. **Memetic Power**: "Be the first to know when friends ape"

---

## 📈 Metrics to Track

- **Wallets tracked**: Total unique wallets being followed
- **Active users**: Daily/weekly active users
- **Notifications sent**: Volume of Farcaster alerts
- **Response rate**: Users clicking through from notifications
- **Retention**: Week-over-week user retention

---

## 🛡️ Security Considerations

- ✅ Row-level security in Supabase
- ✅ API key validation
- ✅ CRON_SECRET for job authentication
- ✅ Input validation on all endpoints
- ✅ Rate limiting (implement in production)
- ✅ No private key storage

---

## 🧪 Testing

### Manual Testing
```bash
# Test wallet data
curl "http://localhost:3000/api/wallet?address=0x...&analysis=true"

# Test subscription
curl -X POST http://localhost:3000/api/watch \
  -H "Content-Type: application/json" \
  -d '{"follower_fid":"test","follower_address":"0x...","target_address":"0x..."}'

# Test poller
curl -X POST http://localhost:3000/api/poller \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Automated Tests (Future)
- Unit tests for lib functions
- API route integration tests
- E2E tests with Playwright

---

## 📚 Documentation

- **README.md** - Full technical documentation
- **SETUP_GUIDE.md** - Step-by-step setup instructions
- **QUICKSTART.md** - 5-minute quick start
- **PROJECT_SUMMARY.md** - This file (high-level overview)

---

## 🤝 Contributing

Contributions welcome! Focus areas:
- Additional chain integrations
- UI/UX improvements
- Performance optimizations
- Mobile responsiveness
- Testing coverage

---

## 📞 Support & Resources

- **Reown Docs**: [docs.reown.com](https://docs.reown.com/)
- **Covalent Docs**: [covalenthq.com/docs](https://www.covalenthq.com/docs/)
- **Neynar Docs**: [docs.neynar.com](https://docs.neynar.com/)
- **Farcaster**: [docs.farcaster.xyz](https://docs.farcaster.xyz/)
- **Base**: [docs.base.org](https://docs.base.org/)

---

## 🎉 Summary

**Onchain Radar** bridges onchain intelligence with social connectivity, creating a new category of "social wallet tracking." By integrating Reown's wallet infrastructure, Covalent's blockchain data, and Farcaster's social layer, it delivers a unique and compelling user experience that didn't exist before.

**Perfect for hackathons, perfect for users, perfect for the future of onchain social.**

---

Built with ❤️ for the Base + Farcaster ecosystem 🔵💜

