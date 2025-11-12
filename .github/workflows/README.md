# GitHub Actions Workflows

## Wallet Activity Poller

This workflow automatically calls the `/api/poller` endpoint every 5 minutes to check for wallet activity.

### Setup Instructions

1. **Go to your GitHub repository settings:**
   ```
   https://github.com/Shijas786/alpha-scan/settings/secrets/actions
   ```

2. **Add these secrets:**

   | Secret Name | Value | Description |
   |-------------|-------|-------------|
   | `VERCEL_APP_URL` | `https://your-app.vercel.app` | Your production Vercel URL (without trailing slash) |
   | `CRON_SECRET` | `your_random_secret_here` | Same secret you set in Vercel env vars |

3. **Enable GitHub Actions:**
   - Go to: `https://github.com/Shijas786/alpha-scan/actions`
   - If prompted, enable GitHub Actions for your repository

4. **Test it manually:**
   - Go to Actions tab → "Wallet Activity Poller" → "Run workflow"
   - This lets you test before waiting for the schedule

### Schedule

- **Frequency:** Every 5 minutes
- **Cron expression:** `*/5 * * * *`
- **Cost:** FREE (GitHub Actions includes 2,000 minutes/month for free)

### Monitoring

- View execution logs in: `https://github.com/Shijas786/alpha-scan/actions`
- Each run shows:
  - HTTP response from poller
  - Success/failure status
  - Timestamp of execution

### Troubleshooting

**If the workflow fails:**

1. Check that `VERCEL_APP_URL` doesn't have a trailing slash
2. Verify `CRON_SECRET` matches what's in Vercel
3. Ensure your Vercel app is deployed and running
4. Check the workflow logs for error messages

**If nothing happens:**

1. Make sure GitHub Actions is enabled for your repo
2. Check that the workflow file is in `.github/workflows/`
3. Verify the cron schedule is valid

### Manual Trigger

You can always trigger the poller manually:

```bash
# Via GitHub Actions UI
Go to: Actions → Wallet Activity Poller → Run workflow

# Or via curl (from anywhere)
curl -X POST https://your-app.vercel.app/api/poller \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Adjusting Frequency

Edit `.github/workflows/wallet-poller.yml`:

```yaml
schedule:
  - cron: '*/10 * * * *'  # Every 10 minutes
  - cron: '0 * * * *'     # Every hour
  - cron: '*/1 * * * *'   # Every minute (use carefully!)
```

---

**Note:** With GitHub Actions free tier, you get 2,000 minutes/month. Running every 5 minutes uses ~15 seconds per run = ~75 seconds/hour = ~54,000 seconds/month = ~900 minutes/month. Plenty of room! ✅

