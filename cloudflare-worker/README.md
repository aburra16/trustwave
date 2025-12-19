# TrustWave Podcast Index Proxy

This Cloudflare Worker acts as a secure proxy for the Podcast Index API, solving CORS issues and keeping your API secret secure.

## Quick Setup

### 1. Create the Worker

```bash
npm create cloudflare@latest trustwave-pi-proxy
cd trustwave-pi-proxy
npm install
```

Choose **"Hello World Worker"** when prompted.

### 2. Replace the Worker Code

Copy the contents of `index.ts` from this directory to `src/index.ts` (or `worker.js`) in your new Worker project.

### 3. Add Your API Secrets

```bash
npx wrangler secret put PODCASTINDEX_KEY
# Enter: QR3MNNMGKTRHXAD9NKBL

npx wrangler secret put PODCASTINDEX_SECRET
# Enter: #$LTq8HngFFLZ8bRMqU^wSukj5E6tEPe$RKbsaRR
```

**Important**: Never hardcode secrets in the Worker code. Always use Wrangler secrets.

### 4. Test Locally

```bash
npm run dev
```

Try it:
```bash
curl "http://localhost:8787/search?q=bitcoin"
curl "http://localhost:8787/recent?max=10"
```

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

You'll get a URL like: `https://trustwave-pi-proxy.<your-subdomain>.workers.dev`

### 6. Update TrustWave Frontend

Create a `.env` file in the TrustWave project root:

```env
VITE_PI_PROXY_URL=https://trustwave-pi-proxy.<your-subdomain>.workers.dev
```

The frontend will automatically use this proxy URL instead of calling Podcast Index directly.

## Endpoints

The Worker provides these endpoints:

### `/search?q=term&max=20`
Search for podcasts/music by term.

**Example:**
```bash
curl "https://your-worker.workers.dev/search?q=bitcoin&max=20"
```

### `/recent?max=20`
Get recent episodes.

**Example:**
```bash
curl "https://your-worker.workers.dev/recent?max=20"
```

### `/episodes/byfeedid?id=123&max=10`
Get episodes for a specific feed ID.

**Example:**
```bash
curl "https://your-worker.workers.dev/episodes/byfeedid?id=920666&max=10"
```

### `/episodes/byid?id=123`
Get a specific episode by ID.

**Example:**
```bash
curl "https://your-worker.workers.dev/episodes/byid?id=16795090161"
```

## Security Notes

- **API secrets** are stored in Cloudflare Worker environment (not in code)
- **CORS headers** allow requests from any origin in dev (`*`), but you should restrict this to your domain in production
- **Authentication** happens server-side, so the secret never reaches the browser
- **Rate limiting** inherits from your Podcast Index account limits

## Production Hardening

1. **Restrict CORS origins** in the `corsHeaders()` function:
   ```ts
   "Access-Control-Allow-Origin": "https://trustwave.yourdomain.com"
   ```

2. **Add rate limiting** if needed (Cloudflare Workers has built-in options)

3. **Monitor usage** through Cloudflare dashboard

4. **Consider caching** responses to reduce API calls:
   ```ts
   const cache = caches.default;
   const cacheKey = new Request(url.toString(), request);
   let response = await cache.match(cacheKey);
   if (!response) {
     response = await fetchFromPodcastIndex();
     ctx.waitUntil(cache.put(cacheKey, response.clone()));
   }
   ```

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests/day
- 10ms CPU time per request

This should be more than enough for a personal/small-scale music app.
