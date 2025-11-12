# ✅ Deployment Checklist - Onchain Radar

Use this checklist before deploying to production.

---

## 🔐 Security

- [ ] All API keys are in environment variables (never in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] `CRON_SECRET` is a strong random string
- [ ] Supabase RLS policies are enabled
- [ ] API routes validate all user inputs
- [ ] HTTPS is enforced in production
- [ ] Rate limiting is configured
- [ ] CORS is properly configured

---

## 🗄️ Database

- [ ] Supabase project created
- [ ] Database schema deployed (`supabase-schema.sql`)
- [ ] All tables created successfully
- [ ] Indexes are in place
- [ ] RLS policies are active
- [ ] Connection tested from local environment
- [ ] Backup strategy configured

---

## 🔑 API Keys & Services

### Reown (WalletConnect)
- [ ] Project created at cloud.reown.com
- [ ] Project ID added to environment variables
- [ ] Production URL whitelisted

### Covalent
- [ ] Account created
- [ ] API key generated
- [ ] API credits available
- [ ] Rate limits understood

### OpenAI
- [ ] Account created
- [ ] API key generated
- [ ] Credits added to account
- [ ] Usage limits set

### Neynar
- [ ] Developer account created
- [ ] API key generated
- [ ] Signer created (for posting casts)
- [ ] Signer UUID saved

### Supabase
- [ ] Project created
- [ ] URL and keys saved
- [ ] Database schema deployed
- [ ] Connection string tested

---

## 🚀 Deployment

### Pre-Deployment
- [ ] All dependencies installed (`npm install`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Environment variables prepared

### Vercel Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account connected
- [ ] Project imported to Vercel
- [ ] All environment variables added
- [ ] `NEXT_PUBLIC_BASE_URL` updated to production URL
- [ ] Build settings reviewed

### Post-Deployment
- [ ] Deployment succeeded
- [ ] Site loads correctly
- [ ] Wallet connection works
- [ ] API routes respond
- [ ] Database queries work
- [ ] Cron job is scheduled

---

## 🧪 Testing

### Manual Tests
- [ ] Connect wallet successfully
- [ ] Search for wallet
- [ ] View wallet data
- [ ] AI analysis generates
- [ ] Follow wallet (subscription created)
- [ ] View subscriptions
- [ ] Unfollow wallet
- [ ] Frame renders correctly

### API Tests
```bash
# Test wallet endpoint
curl "https://your-app.vercel.app/api/wallet?address=0x...&analysis=true"

# Test watch endpoint
curl "https://your-app.vercel.app/api/watch?fid=12345"

# Test poller health
curl "https://your-app.vercel.app/api/poller"
```

- [ ] All API endpoints return 200
- [ ] Error handling works
- [ ] Response times acceptable

---

## 📊 Monitoring

- [ ] Vercel Analytics enabled
- [ ] Supabase logs reviewed
- [ ] Error tracking configured (Sentry, etc.)
- [ ] API usage monitoring set up
- [ ] Uptime monitoring configured
- [ ] Alerts configured for errors

---

## 🔄 Cron Job

- [ ] `vercel.json` in repository root
- [ ] Cron job visible in Vercel dashboard
- [ ] `CRON_SECRET` environment variable set
- [ ] Test poller manually first
- [ ] Verify cron runs successfully
- [ ] Check logs for execution

---

## 📱 Frontend

- [ ] UI loads on desktop
- [ ] UI loads on mobile
- [ ] Responsive design works
- [ ] Wallet modal works
- [ ] Loading states display
- [ ] Error states display
- [ ] Navigation works
- [ ] Forms submit correctly

---

## 🌐 Domain & DNS (Optional)

- [ ] Custom domain purchased
- [ ] DNS records configured
- [ ] Domain added to Vercel
- [ ] SSL certificate active
- [ ] Redirects configured
- [ ] Update `NEXT_PUBLIC_BASE_URL`

---

## 📚 Documentation

- [ ] README.md is complete
- [ ] SETUP_GUIDE.md is accurate
- [ ] API_DOCUMENTATION.md is up to date
- [ ] Environment variables documented
- [ ] Architecture diagram included
- [ ] Example usage provided

---

## 🎨 Branding (Optional)

- [ ] App icon/logo created
- [ ] Favicon added
- [ ] OG image created
- [ ] Meta tags configured
- [ ] Social media links
- [ ] Terms of service
- [ ] Privacy policy

---

## 🔒 Legal (Optional but Recommended)

- [ ] Terms of service drafted
- [ ] Privacy policy created
- [ ] Cookie consent banner
- [ ] Data retention policy
- [ ] GDPR compliance reviewed
- [ ] User data handling documented

---

## 🚨 Emergency Procedures

### If Something Goes Wrong

1. **Site Down**
   - Check Vercel deployment logs
   - Verify environment variables
   - Check Supabase status
   - Rollback to previous deployment

2. **Database Issues**
   - Check Supabase logs
   - Verify connection string
   - Check RLS policies
   - Review recent migrations

3. **API Failures**
   - Check API key validity
   - Verify service status
   - Review rate limits
   - Check error logs

4. **Cron Job Not Running**
   - Verify `vercel.json` syntax
   - Check CRON_SECRET
   - Review execution logs
   - Test endpoint manually

---

## 📞 Support Contacts

Keep these handy for emergencies:

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Reown Discord**: [discord.gg/reown](https://discord.gg/reown)
- **Covalent Discord**: [discord.gg/covalent](https://discord.gg/covalent)
- **Neynar Support**: support@neynar.com

---

## 🎯 Performance Targets

- **Homepage Load**: < 2s
- **API Response**: < 1s (no AI)
- **API Response**: < 3s (with AI)
- **Wallet Search**: < 2s
- **Database Query**: < 500ms
- **Uptime**: > 99.5%

---

## 📈 Launch Checklist

### Soft Launch
- [ ] Deploy to production
- [ ] Test with small group
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Monitor performance

### Public Launch
- [ ] Announce on Farcaster
- [ ] Post on Twitter/X
- [ ] Share in Base community
- [ ] Create demo video
- [ ] Write launch post
- [ ] Submit to directories

---

## 🔄 Post-Launch

### Week 1
- [ ] Monitor error rates
- [ ] Review API usage
- [ ] Check database performance
- [ ] Gather user feedback
- [ ] Fix critical issues

### Month 1
- [ ] Review analytics
- [ ] Optimize performance
- [ ] Add requested features
- [ ] Scale infrastructure
- [ ] Update documentation

---

## ✨ Optional Enhancements

- [ ] Add more chains
- [ ] Implement wallet comparison UI
- [ ] Add portfolio charts
- [ ] Create mobile app
- [ ] Add email notifications
- [ ] Implement user profiles
- [ ] Add social features
- [ ] Create analytics dashboard

---

## 📝 Final Notes

Before going live:

1. **Test everything** - Don't skip testing
2. **Backup data** - Have a backup plan
3. **Monitor closely** - Watch for issues
4. **Communicate** - Keep users informed
5. **Iterate** - Continuously improve

**Good luck with your launch!** 🚀

---

## ✅ Sign Off

Deployment completed by: _______________

Date: _______________

Verified by: _______________

Notes:
_______________________________________________________
_______________________________________________________
_______________________________________________________

