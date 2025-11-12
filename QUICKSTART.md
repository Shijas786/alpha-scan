# ⚡ Onchain Radar - Quick Start (5 Minutes)

Get up and running in 5 minutes!

---

## 1️⃣ Clone & Install (1 min)

```bash
cd onchain-radar
npm install
```

---

## 2️⃣ Get API Keys (3 min)

Open these links in new tabs and sign up (free tiers available):

| Service | Link | What to Copy |
|---------|------|-------------|
| **Reown** | [cloud.reown.com](https://cloud.reown.com/) | Project ID |
| **Covalent** | [covalenthq.com](https://www.covalenthq.com/) | API Key |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/) | API Key |
| **Neynar** | [neynar.com](https://neynar.com/) | API Key |
| **Supabase** | [supabase.com](https://supabase.com/) | URL + Anon Key |

---

## 3️⃣ Configure Environment (30 sec)

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys.

---

## 4️⃣ Set Up Database (30 sec)

1. Go to your Supabase project → **SQL Editor**
2. Copy contents of `supabase-schema.sql`
3. Paste and click **Run**

---

## 5️⃣ Run the App (10 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🎯 Test It

1. **Connect Wallet** - Click the connect button
2. **Search Wallet** - Enter any address (try `0x...`)
3. **View Analysis** - See AI-powered insights
4. **Follow Wallet** - Click to receive notifications

---

## 🚀 Deploy to Vercel (Optional)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Then:
# 1. Go to vercel.com
# 2. Import your repo
# 3. Add all environment variables
# 4. Deploy!
```

---

## 📚 Full Documentation

- **Detailed Setup**: See `SETUP_GUIDE.md`
- **Architecture & API**: See `README.md`
- **Database Schema**: See `supabase-schema.sql`

---

## 💡 Tips

- Start with a small Covalent free tier
- Add $5 to OpenAI for testing
- Use Neynar's free tier for Farcaster
- Supabase has a generous free tier

---

**Need help?** Check the guides or open an issue!

**Ready to ship?** See the deployment section in `SETUP_GUIDE.md`

