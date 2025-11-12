# 🔌 Onchain Radar - API Documentation

Complete API reference for all endpoints.

---

## 🔐 Authentication

Most endpoints are public for reading data. Write operations require authentication.

For the poller endpoint, include the CRON_SECRET:

```bash
Authorization: Bearer YOUR_CRON_SECRET
```

---

## 📍 Endpoints

### 1. `/api/wallet` - Get Wallet Data

**Method**: `GET`

**Description**: Fetch wallet portfolio, transactions, and optional AI analysis.

**Query Parameters**:
- `address` (required): Ethereum wallet address
- `analysis` (optional): Set to `"true"` to include AI analysis

**Example Request**:
```bash
GET /api/wallet?address=0x1234...&analysis=true
```

**Response**:
```json
{
  "success": true,
  "portfolio": {
    "address": "0x1234...",
    "total_balance_usd": 50000,
    "tokens": [
      {
        "contract_ticker_symbol": "ETH",
        "quote": 30000,
        "balance": "10.5"
      }
    ]
  },
  "transactions": [...],
  "analysis": {
    "summary": "Active trader with focus on DeFi...",
    "insights": ["High transaction frequency", "..."],
    "riskLevel": "medium",
    "recommendations": ["Consider diversification", "..."]
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid address
- `500`: Server error

---

### 2. `/api/watch` - Manage Subscriptions

#### GET - List Subscriptions

**Method**: `GET`

**Description**: Get all active subscriptions for a user.

**Query Parameters**:
- `fid` (required): Farcaster FID

**Example Request**:
```bash
GET /api/watch?fid=12345
```

**Response**:
```json
{
  "subscriptions": [
    {
      "id": "uuid",
      "follower_fid": "12345",
      "target_address": "0xabc...",
      "target_name": "Vitalik.eth",
      "threshold_usd": 1000,
      "created_at": "2024-11-12T10:00:00Z"
    }
  ]
}
```

#### POST - Create Subscription

**Method**: `POST`

**Description**: Follow a new wallet.

**Request Body**:
```json
{
  "follower_fid": "12345",
  "follower_address": "0x...",
  "target_address": "0x...",
  "target_name": "Vitalik.eth",
  "threshold_usd": 1000,
  "threshold_tx_count": 1
}
```

**Response**:
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "follower_fid": "12345",
    "target_address": "0xabc...",
    "created_at": "2024-11-12T10:00:00Z"
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Missing fields or invalid address
- `500`: Server error

#### DELETE - Remove Subscription

**Method**: `DELETE`

**Description**: Unfollow a wallet.

**Query Parameters**:
- `id` (required): Subscription UUID

**Example Request**:
```bash
DELETE /api/watch?id=subscription-uuid
```

**Response**:
```json
{
  "success": true,
  "message": "Subscription removed"
}
```

---

### 3. `/api/compare` - Compare Wallets

**Method**: `POST`

**Description**: AI-powered comparison of two wallets.

**Request Body**:
```json
{
  "address1": "0x...",
  "address2": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "comparison": "Wallet A shows higher activity with 50+ transactions this week, primarily focused on DeFi protocols. Wallet B is more conservative with fewer but larger transactions. Wallet A's strategy appears more active trading while Wallet B follows a buy-and-hold approach..."
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid addresses
- `500`: Server error

---

### 4. `/api/notify` - Send Notification

**Method**: `POST`

**Description**: Send a Farcaster notification about wallet activity.

**Request Body**:
```json
{
  "signer_uuid": "neynar-signer-uuid",
  "recipient_username": "alice",
  "wallet_address": "0x...",
  "wallet_name": "Vitalik.eth",
  "tx_type": "swap",
  "amount_usd": 5000,
  "chain": "base",
  "subscription_id": "uuid",
  "activity_id": "uuid",
  "frame_url": "https://app.com/api/frame?wallet=0x..."
}
```

**Response**:
```json
{
  "success": true,
  "cast_hash": "0xabc123...",
  "message": "🔄 Vitalik.eth just swapped $5,000 on BASE!\n\nCheck the details in Onchain Radar 📡"
}
```

**Status Codes**:
- `200`: Success (even if notification fails - check success field)
- `400`: Missing required fields
- `500`: Server error

---

### 5. `/api/poller` - Activity Polling Job

**Method**: `POST`

**Description**: Check all active subscriptions for new wallet activity. Should be called by a cron job.

**Headers**:
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response**:
```json
{
  "success": true,
  "results": {
    "checked": 25,
    "newActivities": 3,
    "errors": 0
  }
}
```

**Method**: `GET`

**Description**: Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "service": "wallet-poller",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized (missing or invalid CRON_SECRET)
- `500`: Server error

---

### 6. `/api/frame` - Farcaster Frame

**Method**: `GET`

**Description**: Generate a Farcaster Frame (Open Graph HTML) for a wallet.

**Query Parameters**:
- `wallet` (required): Wallet address

**Example Request**:
```bash
GET /api/frame?wallet=0x1234...
```

**Response**: HTML page with Farcaster Frame meta tags

```html
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="..." />
  <meta property="fc:frame:button:1" content="View Portfolio" />
  ...
</head>
<body>
  <!-- Wallet data display -->
</body>
</html>
```

**Method**: `POST`

**Description**: Handle Farcaster Frame button interactions.

**Request Body**: Farcaster Frame message (signed)

**Response**:
```json
{
  "success": true
}
```

---

## 🔄 Rate Limits

Currently no rate limits enforced. For production:

- Public endpoints: 100 req/min per IP
- Authenticated endpoints: 1000 req/min per user
- Poller endpoint: 1 req/5min (enforced by cron)

---

## 🚨 Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Description of what went wrong"
}
```

Common error messages:
- `"Wallet address is required"`
- `"Invalid wallet address"`
- `"Missing required fields"`
- `"Unauthorized"`
- `"Failed to fetch wallet data"`

---

## 🧪 Testing with cURL

### Get wallet data
```bash
curl "http://localhost:3000/api/wallet?address=0x1234567890123456789012345678901234567890&analysis=true"
```

### Create subscription
```bash
curl -X POST http://localhost:3000/api/watch \
  -H "Content-Type: application/json" \
  -d '{
    "follower_fid": "12345",
    "follower_address": "0x1234567890123456789012345678901234567890",
    "target_address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "target_name": "Test Wallet",
    "threshold_usd": 500
  }'
```

### Compare wallets
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "address1": "0x1234567890123456789012345678901234567890",
    "address2": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  }'
```

### Trigger poller
```bash
curl -X POST http://localhost:3000/api/poller \
  -H "Authorization: Bearer your_cron_secret"
```

---

## 🔗 Integration Examples

### JavaScript/TypeScript

```typescript
// Fetch wallet data
async function getWallet(address: string) {
  const response = await fetch(
    `/api/wallet?address=${address}&analysis=true`
  );
  const data = await response.json();
  return data;
}

// Create subscription
async function followWallet(followerFid: string, followerAddress: string, targetAddress: string) {
  const response = await fetch('/api/watch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      follower_fid: followerFid,
      follower_address: followerAddress,
      target_address: targetAddress,
      threshold_usd: 500,
    }),
  });
  return response.json();
}
```

### Python

```python
import requests

# Get wallet data
def get_wallet(address):
    response = requests.get(
        f'http://localhost:3000/api/wallet',
        params={'address': address, 'analysis': 'true'}
    )
    return response.json()

# Create subscription
def follow_wallet(follower_fid, follower_address, target_address):
    response = requests.post(
        'http://localhost:3000/api/watch',
        json={
            'follower_fid': follower_fid,
            'follower_address': follower_address,
            'target_address': target_address,
            'threshold_usd': 500
        }
    )
    return response.json()
```

---

## 📊 Response Times

Typical response times (on Vercel):

- `/api/wallet` (no analysis): ~500ms
- `/api/wallet` (with analysis): ~2-3s (AI processing)
- `/api/watch` GET: ~100ms (database query)
- `/api/watch` POST: ~200ms (database insert)
- `/api/compare`: ~3-5s (AI processing)
- `/api/poller`: ~5-30s (depends on subscription count)
- `/api/frame`: ~1s (data fetching + HTML generation)

---

## 🔐 Security Best Practices

1. **Never expose API keys** in client-side code
2. **Validate all inputs** on the server
3. **Use HTTPS** in production
4. **Implement rate limiting** for public endpoints
5. **Rotate CRON_SECRET** periodically
6. **Enable Supabase RLS** for database security
7. **Monitor API usage** for anomalies

---

## 🐛 Troubleshooting

### "Failed to fetch wallet data"
- Check Covalent API key
- Verify address is valid
- Check Covalent API credits

### "OpenAI analysis failed"
- Verify OpenAI API key
- Check account has credits
- Review rate limits

### "Notification not sent"
- Verify Neynar API key
- Check signer UUID is valid
- Ensure recipient username exists

### "Poller not running"
- Verify vercel.json is in root
- Check CRON_SECRET is set
- Review Vercel cron logs

---

## 📚 Further Reading

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Covalent API Docs](https://www.covalenthq.com/docs/api/)
- [Neynar API Docs](https://docs.neynar.com/)
- [Farcaster Frames](https://docs.farcaster.xyz/learn/what-is-farcaster/frames)
- [Supabase API](https://supabase.com/docs/guides/api)

---

**Questions?** Open an issue or refer to the main README.md

